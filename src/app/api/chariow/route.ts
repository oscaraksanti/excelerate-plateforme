import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { lienAppel } from "@/lib/appel";
import { courrielAchat } from "@/lib/courriel";
import { nomComplet } from "@/lib/formats";
import { clientAdmin } from "@/lib/supabase/admin";

/* ══════════════════════════════════════════════════════════════════
   Le point d'entrée des paiements Chariow — un « Pulse ».

   Trois règles, dans cet ordre, et aucune n'est facultative :

   1. PROUVER que ça vient de Chariow. Signature HMAC-SHA256 du corps
      BRUT, comparée en temps constant. Sans ça, n'importe qui s'offre
      la masterclass avec une requête à trois lignes.

   2. NE TRAITER QUE CE QUI EST PAYÉ. Chariow envoie aussi
      « abandoned.sale » et « failed.sale » sur le même point d'entrée.
      La version précédente les acceptait toutes : un panier abandonné
      ouvrait les accès.

   3. NE TRAITER QU'UNE FOIS. Chariow réessaie cinq fois si on ne
      répond pas 2xx en moins de trente secondes, avec le même
      « x-pulse-delivery-id ». C'est lui la clé, pas la référence de
      commande.
   ══════════════════════════════════════════════════════════════════ */

/** Seul événement qui ouvre un accès. */
const EVENEMENT_PAYE = "successful.sale";

/**
 * Statuts qui CONTREDISENT l'événement.
 *
 * On a d'abord fait l'inverse — une liste de statuts acceptés — et ça
 * a bloqué un vrai paiement le 22 septembre : Chariow envoie
 * « successful.sale » avec un statut de vente « awaiting_payment »,
 * parce que la commission est prélevée mais le versement pas encore
 * fait. Le statut décrit le reversement au marchand, pas l'argent du
 * client.
 *
 * L'événement fait foi : c'est le contrat documenté, et les paniers
 * abandonnés comme les échecs ont leurs propres événements. On ne
 * garde donc qu'un démenti explicite.
 */
const STATUTS_DEMENTIS = new Set([
  "failed", "abandoned", "cancelled", "canceled", "refunded", "chargeback",
]);

function egalConstant(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * La signature porte sur le corps BRUT, jamais sur une version
 * re-sérialisée : JSON.stringify réordonne et ré-échappe, et le
 * condensat ne tombe plus juste.
 */
function signatureValide(corps: string, entetes: Headers, secret: string) {
  const recu = entetes.get("x-chariow-signature");
  if (!recu) return false;
  const propre = recu.replace(/^sha256=/i, "").trim();
  const hex = createHmac("sha256", secret).update(corps, "utf8").digest("hex");
  const b64 = createHmac("sha256", secret).update(corps, "utf8").digest("base64");
  return egalConstant(propre, hex) || egalConstant(propre, b64);
}

/** Va chercher une valeur à plusieurs endroits plausibles de la charge. */
function pioche(objet: unknown, chemins: string[]): string | null {
  for (const chemin of chemins) {
    let courant: unknown = objet;
    for (const morceau of chemin.split(".")) {
      if (courant && typeof courant === "object" && morceau in courant) {
        courant = (courant as Record<string, unknown>)[morceau];
      } else {
        courant = undefined;
        break;
      }
    }
    if (typeof courant === "string" && courant.trim()) return courant.trim();
    if (typeof courant === "number") return String(courant);
  }
  return null;
}

export async function POST(requete: NextRequest) {
  const secret = process.env.CHARIOW_WEBHOOK_SECRET;
  const corps = await requete.text();

  if (!secret) {
    console.error("[pulse] CHARIOW_WEBHOOK_SECRET absente — notification refusée");
    return NextResponse.json({ erreur: "Point d'entrée non configuré" }, { status: 503 });
  }

  //  Une clé dans l'adresse reste acceptée : elle dépanne si le Pulse
  //  n'est pas encore configuré côté Chariow. La signature prime.
  const cleUrl = requete.nextUrl.searchParams.get("cle");
  const autorise =
    signatureValide(corps, requete.headers, secret) ||
    (cleUrl !== null && egalConstant(cleUrl, secret));

  if (!autorise) {
    console.warn("[pulse] notification sans preuve d'authenticité — refusée");
    return NextResponse.json({ erreur: "Signature invalide" }, { status: 401 });
  }

  const evenement = requete.headers.get("x-pulse-event") ?? "inconnu";
  const livraison =
    requete.headers.get("x-pulse-delivery-id") ?? `sans-id-${Date.now()}`;

  let charge: unknown;
  try {
    charge = JSON.parse(corps);
  } catch {
    return NextResponse.json({ erreur: "Corps illisible" }, { status: 400 });
  }

  const admin = clientAdmin();

  //  Le journal fait office de verrou : la clé primaire refuse la
  //  seconde tentative, et on répond 200 pour que Chariow cesse.
  const { error: dejaVu } = await admin
    .from("pulses")
    .insert({ livraison_id: livraison, evenement, charge_utile: charge });

  if (dejaVu) {
    if (dejaVu.code === "23505") {
      return NextResponse.json({ ok: true, deja: true });
    }
    console.error("[pulse] journal indisponible", dejaVu.message);
    //  On refuse plutôt que de risquer un double traitement : Chariow
    //  réessaiera.
    return NextResponse.json({ erreur: "Journal indisponible" }, { status: 503 });
  }

  const conclure = async (motif: string, traite: boolean) => {
    await admin.from("pulses").update({ traite, motif }).eq("livraison_id", livraison);
  };

  if (evenement !== EVENEMENT_PAYE) {
    await conclure(`événement ignoré : ${evenement}`, false);
    return NextResponse.json({ ok: true, ignore: evenement });
  }

  //  L'événement dit « vendu ». On ne le contredit que si le statut
  //  le dément franchement — pas parce qu'il dit autre chose.
  const statut = (
    pioche(charge, ["status", "sale.status", "data.status", "payment.status"]) ?? ""
  ).toLowerCase();
  if (statut && STATUTS_DEMENTIS.has(statut)) {
    await conclure(`statut démenti : ${statut}`, false);
    return NextResponse.json({ ok: true, ignore: statut });
  }

  const email = pioche(charge, [
    "customer.email", "data.customer.email", "sale.customer.email",
    "email", "customer_email", "buyer_email", "data.email", "order.email",
  ]);

  const refProduit = pioche(charge, [
    "product.id", "data.product.id", "sale.product.id",
    "product_id", "data.product_id", "prd",
  ]);

  const refCommande = pioche(charge, [
    "id", "data.id", "sale.id",
    "order_id", "transaction_id", "reference", "data.order_id",
  ]);

  const montant = pioche(charge, [
    "amount.value", "data.amount.value", "sale.amount.value",
    "payment.amount.value", "amount", "total", "data.amount",
  ]);

  const nom = pioche(charge, [
    "customer.first_name", "data.customer.first_name",
    "customer.name", "data.customer.name",
  ]);

  //  Le nom ENTIER porté par le paiement. C'est souvent le seul
  //  endroit où on l'a : à l'inscription beaucoup n'ont tapé qu'un
  //  prénom, et un certificat ne peut pas être établi là-dessus.
  const nomPaiement =
    pioche(charge, ["customer.name", "data.customer.name", "sale.customer.name"]) ??
    [
      pioche(charge, ["customer.first_name", "data.customer.first_name"]),
      pioche(charge, ["customer.last_name", "data.customer.last_name"]),
    ]
      .filter(Boolean)
      .join(" ");

  if (!email || !refCommande) {
    console.error("[pulse] champs manquants", {
      email: Boolean(email), refCommande: Boolean(refCommande),
    });
    await conclure("champs manquants — voir charge_utile", false);
    //  202 : on a bien reçu, on ne redemande pas. Le journal garde
    //  tout, l'accès se règle à la main.
    return NextResponse.json({ erreur: "Champs manquants", recu: true }, { status: 202 });
  }

  //  Quel produit ? La table fait foi, jamais la notification — et
  //  un produit qu'elle ne connaît pas n'ouvre RIEN.
  //
  //  La version précédente retombait sur la masterclass par défaut.
  //  C'était une porte grande ouverte : la boutique Chariow vend dix
  //  produits, dont six étrangers à cette plateforme, et le Pulse se
  //  déclenche pour tous. Acheter « Introduction au marketing
  //  digital » à 1 $ aurait ouvert la formation Excel à 37 $.
  //
  //  On journalise et on répond 200 — la vente existe, elle n'est
  //  simplement pas la nôtre. Chariow n'a pas à réessayer.
  if (!refProduit) {
    await conclure("aucune référence produit — voir charge_utile", false);
    return NextResponse.json({ erreur: "Produit absent", recu: true }, { status: 202 });
  }

  const { data: fiche } = await admin
    .from("produits")
    .select("produit, montant, titre")
    .eq("ref", refProduit)
    .maybeSingle();

  if (!fiche) {
    console.warn(`[pulse] produit étranger à la plateforme : ${refProduit} — aucun accès ouvert`);
    await conclure(`produit non reconnu : ${refProduit} — aucun accès ouvert`, false);
    return NextResponse.json({ ok: true, ignore: "produit inconnu" });
  }

  const produit = fiche.produit;
  const montantAttendu: number | null = fiche.montant;
  const titre = fiche.titre;

  const { data: profil } = await admin
    .from("profils")
    .select("id, nom")
    .ilike("email", email)
    .maybeSingle();

  //  On complète le nom, jamais on ne l'écrase : un nom déjà complet
  //  est celui que la personne a choisi d'afficher.
  if (profil && !nomComplet(profil.nom) && nomComplet(nomPaiement)) {
    const propre = nomPaiement.trim().replace(/\s+/g, " ");
    const { error: echec } = await admin
      .from("profils")
      .update({ nom: propre })
      .eq("id", profil.id);
    if (echec) console.error("[pulse] nom non complété", echec.message);
    else {
      profil.nom = propre;
      console.info(`[pulse] nom complété pour ${email}`);
    }
  }

  const { error } = await admin.from("achats").insert({
    profil_id: profil?.id ?? null,
    email: email.toLowerCase(),
    produit,
    montant: montant ? Number(montant) : montantAttendu,
    chariow_ref: refCommande,
    charge_utile: charge,
  });

  if (error) {
    //  23505 : cette commande était déjà enregistrée par un autre
    //  chemin. L'accès est donc ouvert — on ne le compte pas deux fois
    //  et on ne renvoie pas de courriel.
    if (error.code === "23505") {
      await conclure("commande déjà enregistrée", true);
      return NextResponse.json({ ok: true, deja: true });
    }
    console.error("[pulse] enregistrement impossible", error.message);
    await conclure(`enregistrement impossible : ${error.message}`, false);
    return NextResponse.json({ erreur: "Enregistrement impossible" }, { status: 500 });
  }

  //  Le courriel ne peut pas faire échouer le Pulse : l'accès est
  //  ouvert, c'est le seul point qui compte. Un envoi raté se voit
  //  dans le journal Resend.
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://excelai.oscaraksanti.com";
  try {
    await courrielAchat({
      a: email,
      appel: produit === "coaching97" ? await lienAppel() : null,
      prenom: (profil?.nom ?? nom ?? "").trim().split(/\s+/)[0] ?? "",
      produit,
      offre: titre,
      montant: `${montant ?? montantAttendu ?? "—"} $`,
      reference: refCommande,
      ouvert: Boolean(profil),
      lien: profil ? `${site}/modules` : `${site}/connexion`,
    });
  } catch (err) {
    console.error("[pulse] confirmation non envoyée", err);
  }

  await conclure(`${produit} ouvert pour ${email}`, true);
  console.info(`[pulse] ${produit} enregistré pour ${email}${profil ? "" : " (compte à créer)"}`);
  return NextResponse.json({ ok: true, rattache: Boolean(profil) });
}

/** Réponse à une visite dans un navigateur : sert à vérifier l'adresse. */
export function GET() {
  return NextResponse.json({
    point: "chariow",
    configure: Boolean(process.env.CHARIOW_WEBHOOK_SECRET),
  });
}

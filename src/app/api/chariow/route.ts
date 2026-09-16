import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { clientAdmin } from "@/lib/supabase/admin";

/* ══════════════════════════════════════════════════════════════════
   Le point d'entrée des paiements Chariow.

   Règle absolue : on n'ouvre jamais un accès sans preuve que la
   notification vient bien de Chariow. Sans cette preuve, n'importe qui
   pourrait s'offrir la masterclass avec une requête à trois lignes.

   Deux preuves acceptées, selon ce que Chariow sait faire :
     - une signature HMAC-SHA256 du corps, dans un en-tête
     - une clé dans l'adresse : /api/chariow?cle=…
   Les deux se comparent au même secret, en temps constant.
   ══════════════════════════════════════════════════════════════════ */

const EN_TETES_SIGNATURE = [
  "x-chariow-signature",
  "x-webhook-signature",
  "x-signature",
  "signature",
];

function egalConstant(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function signatureValide(corps: string, entetes: Headers, secret: string) {
  const attendu = createHmac("sha256", secret).update(corps, "utf8");
  const hex = attendu.digest("hex");
  const b64 = createHmac("sha256", secret).update(corps, "utf8").digest("base64");

  for (const nom of EN_TETES_SIGNATURE) {
    const recu = entetes.get(nom);
    if (!recu) continue;
    // Certains services préfixent « sha256= ».
    const propre = recu.replace(/^sha256=/i, "").trim();
    if (egalConstant(propre, hex) || egalConstant(propre, b64)) return true;
  }
  return false;
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
    // Refus franc plutôt qu'une porte ouverte : c'est de l'argent.
    console.error("[chariow] CHARIOW_WEBHOOK_SECRET absente — notification refusée");
    return NextResponse.json(
      { erreur: "Point d'entrée non configuré" },
      { status: 503 },
    );
  }

  const cleUrl = requete.nextUrl.searchParams.get("cle");
  const autorise =
    (cleUrl !== null && egalConstant(cleUrl, secret)) ||
    signatureValide(corps, requete.headers, secret);

  if (!autorise) {
    console.warn("[chariow] notification sans preuve d'authenticité — refusée");
    return NextResponse.json({ erreur: "Signature invalide" }, { status: 401 });
  }

  let charge: unknown;
  try {
    charge = JSON.parse(corps);
  } catch {
    return NextResponse.json({ erreur: "Corps illisible" }, { status: 400 });
  }

  const email = pioche(charge, [
    "email", "customer_email", "buyer_email", "customer.email",
    "data.email", "data.customer_email", "data.customer.email", "order.email",
  ]);

  const refProduit = pioche(charge, [
    "product_id", "product.id", "product_ref", "prd",
    "data.product_id", "data.product.id", "items.0.product_id",
  ]);

  const refCommande = pioche(charge, [
    "id", "order_id", "transaction_id", "reference", "ref",
    "data.id", "data.order_id", "data.reference",
  ]);

  const montant = pioche(charge, ["amount", "total", "price", "data.amount", "data.total"]);

  const admin = clientAdmin();

  if (!email || !refCommande) {
    // On garde la trace : c'est elle qui permettra d'ajuster les champs
    // sans rejouer un paiement.
    console.error("[chariow] champs manquants", { email: Boolean(email), refCommande: Boolean(refCommande) });
    await admin.from("achats").insert({
      email: email ?? "inconnu@chariow",
      produit: "masterclass37",
      chariow_ref: `incomplet-${Date.now()}`,
      charge_utile: charge,
    });
    return NextResponse.json({ erreur: "Champs manquants", recu: true }, { status: 202 });
  }

  // Quel produit ? La table fait foi, pas la notification.
  let produit = "masterclass37";
  let montantAttendu: number | null = null;
  if (refProduit) {
    const { data } = await admin
      .from("produits")
      .select("produit, montant")
      .eq("ref", refProduit)
      .maybeSingle();
    if (data) {
      produit = data.produit;
      montantAttendu = data.montant;
    }
  }

  // Le profil existe-t-il déjà ? Sinon l'achat attend, et se rattachera
  // tout seul à la première connexion avec cette adresse.
  const { data: profil } = await admin
    .from("profils")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  const { error } = await admin.from("achats").insert({
    profil_id: profil?.id ?? null,
    email: email.toLowerCase(),
    produit,
    montant: montant ? Number(montant) : montantAttendu,
    chariow_ref: refCommande,
    charge_utile: charge,
  });

  if (error) {
    // 23505 : cette commande est déjà enregistrée. Chariow renvoie
    // parfois deux fois la même notification — on répond « d'accord »
    // pour qu'il cesse de réessayer, sans rien compter deux fois.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, deja: true });
    }
    console.error("[chariow] enregistrement impossible", error.message);
    return NextResponse.json({ erreur: "Enregistrement impossible" }, { status: 500 });
  }

  console.info(`[chariow] ${produit} enregistré pour ${email}${profil ? "" : " (compte à créer)"}`);
  return NextResponse.json({ ok: true, rattache: Boolean(profil) });
}

/** Réponse à une visite dans un navigateur : sert à vérifier l'adresse. */
export function GET() {
  return NextResponse.json({
    point: "chariow",
    configure: Boolean(process.env.CHARIOW_WEBHOOK_SECRET),
  });
}

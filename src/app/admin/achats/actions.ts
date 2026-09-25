"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/admin";
import { lienAppel } from "@/lib/appel";
import { courrielAchat } from "@/lib/courriel";
import { nomComplet } from "@/lib/formats";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";

export async function basculerProduit(donnees: FormData) {
  await exigerAdmin();
  const ref = String(donnees.get("ref") ?? "");
  const actif = String(donnees.get("actif") ?? "") === "1";
  if (!ref) return;

  const supabase = await clientServeur();
  await supabase.from("produits").update({ actif }).eq("ref", ref);

  revalidatePath("/admin/achats");
  revalidatePath("/offres");
}

/* ══════════════════════════════════════════════════════════════════
   Un paiement reçu hors Chariow.

   Western Union, Airtel Money, Orange Money, espèces : à Kinshasa et
   à Abidjan, une vente sur quatre arrive comme ça. Jusqu'ici chacune
   demandait une migration écrite à la main.

   La vente est enregistrée exactement comme une vente du Pulse —
   même table, même produit, même courriel — mais sa référence dit
   d'où vient l'argent, pour que l'écart avec le relevé Chariow
   s'explique au lieu de ressembler à une erreur.
   ══════════════════════════════════════════════════════════════════ */

export type EtatDirect = { ok: boolean; message: string };

const MONTANTS: Record<string, number> = {
  certificat27: 27,
  masterclass37: 37,
  coaching97: 97,
  equipe: 497,
};

const TITRES: Record<string, string> = {
  certificat27: "Le certificat Fondations",
  masterclass37: "La masterclass complète",
  coaching97: "Le cercle",
  equipe: "Équipe",
};

function glisser(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);
}

export async function enregistrerPaiementDirect(
  _p: EtatDirect,
  d: FormData,
): Promise<EtatDirect> {
  await exigerAdmin();

  const email = String(d.get("email") ?? "").trim().toLowerCase();
  const produit = String(d.get("produit") ?? "");
  const moyen = String(d.get("moyen") ?? "").trim();
  const nom = String(d.get("nom") ?? "").trim().replace(/\s+/g, " ");
  const envoyer = d.get("envoyer") === "on";
  const montantBrut = String(d.get("montant") ?? "").replace(",", ".");
  const montant = montantBrut ? Number(montantBrut) : MONTANTS[produit];

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, message: "Cette adresse n'a pas l'air d'une adresse." };
  }
  if (!MONTANTS[produit]) {
    return { ok: false, message: "Choisis l'offre qui a été payée." };
  }
  if (!moyen) {
    return { ok: false, message: "Dis par quel moyen l'argent est arrivé — c'est ce qui rendra le rapprochement lisible." };
  }
  if (!Number.isFinite(montant) || montant < 0) {
    return { ok: false, message: "Montant illisible." };
  }

  const admin = clientAdmin();

  const { data: profil } = await admin
    .from("profils")
    .select("id, nom")
    .ilike("email", email)
    .maybeSingle();

  const jour = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const ref = `direct-${glisser(moyen)}-${glisser(email.split("@")[0])}-${jour}`;

  const { error } = await admin.from("achats").insert({
    profil_id: profil?.id ?? null,
    email,
    produit,
    montant,
    chariow_ref: ref,
    charge_utile: {
      origine: "paiement direct",
      moyen,
      saisi_par: "administration",
      note: `réglé hors Chariow ; accès identique à une vente du Pulse`,
    },
  });

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? `Un paiement ${moyen} est déjà enregistré aujourd'hui pour cette adresse (${ref}).`
          : `Échec : ${error.message}`,
    };
  }

  //  On complète le nom, on ne l'écrase jamais : il partira sur le
  //  certificat, et un prénom seul le bloque.
  let nomPose = false;
  if (profil && nom && nomComplet(nom) && !nomComplet(profil.nom)) {
    const { error: echec } = await admin
      .from("profils")
      .update({ nom })
      .eq("id", profil.id);
    nomPose = !echec;
  }

  let parti = false;
  if (envoyer) {
    try {
      parti = await courrielAchat({
        a: email,
        prenom: ((nomPose ? nom : profil?.nom) ?? nom ?? "").trim().split(/\s+/)[0] ?? "",
        produit,
        offre: TITRES[produit] ?? produit,
        montant: `${montant} $`,
        reference: ref,
        ouvert: Boolean(profil),
        appel: produit === "coaching97" ? await lienAppel() : null,
        lien: profil
          ? `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/modules`
          : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/connexion`,
      });
    } catch (e) {
      console.error("[paiement direct] courriel non envoyé", e);
    }
  }

  revalidatePath("/admin/achats");
  revalidatePath("/admin/certificats");

  const ou = profil
    ? "son accès est ouvert"
    : "aucun compte à cette adresse — l'accès s'ouvrira à sa première connexion";
  const courriel = envoyer
    ? parti
      ? ", courriel envoyé"
      : ", mais le courriel n'est pas parti"
    : "";

  return {
    ok: true,
    message: `Paiement enregistré (${ref}) : ${ou}${courriel}.${nomPose ? " Nom complété." : ""}`,
  };
}

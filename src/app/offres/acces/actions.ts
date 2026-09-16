"use server";

import { revalidatePath } from "next/cache";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";

export type EtatAcces = { ok: boolean; message: string };

/**
 * Rattacher un achat fait avec une autre adresse.
 *
 * On exige l'adresse ET la reference de commande : la seule adresse
 * suffirait a reclamer l'achat de quelqu'un d'autre. La reference, elle,
 * ne figure que sur le recu de l'acheteur.
 */
export async function reclamerAchat(
  _precedent: EtatAcces,
  donnees: FormData,
): Promise<EtatAcces> {
  const email = String(donnees.get("email") ?? "").trim().toLowerCase();
  const reference = String(donnees.get("reference") ?? "").trim();

  if (!email || !reference) {
    return { ok: false, message: "Il faut l'adresse de paiement et la référence de commande." };
  }

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Session expirée. Reconnecte-toi." };

  const admin = clientAdmin();
  const { data: achat } = await admin
    .from("achats")
    .select("id, profil_id, produit, email")
    .eq("chariow_ref", reference)
    .maybeSingle();

  if (!achat || achat.email.toLowerCase() !== email) {
    return {
      ok: false,
      message:
        "Aucun paiement ne correspond à cette adresse et cette référence. Vérifie ton reçu — et si le doute persiste, écris à Oscar, il regardera lui-même.",
    };
  }

  if (achat.profil_id && achat.profil_id !== auth.user.id) {
    return {
      ok: false,
      message: "Ce paiement est déjà rattaché à un autre compte. Écris à Oscar.",
    };
  }

  if (achat.profil_id === auth.user.id) {
    return { ok: true, message: "Ce paiement est déjà rattaché à ton compte." };
  }

  const { error } = await admin
    .from("achats")
    .update({ profil_id: auth.user.id })
    .eq("id", achat.id);

  if (error) {
    return { ok: false, message: "Le rattachement a échoué. Réessaie dans un instant." };
  }

  revalidatePath("/offres");
  revalidatePath("/modules");
  return {
    ok: true,
    message: "C'est bon : ton accès est ouvert. Va voir les modules.",
  };
}

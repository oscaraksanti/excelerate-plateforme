"use server";

import { revalidatePath } from "next/cache";
import { nomComplet } from "@/lib/formats";
import { clientServeur } from "@/lib/supabase/serveur";
import { normaliserTelephone } from "@/lib/telephone";

export type EtatProfil = { ok: boolean; message: string };

export async function enregistrerProfil(
  _precedent: EtatProfil,
  donnees: FormData,
): Promise<EtatProfil> {
  const nom = String(donnees.get("nom") ?? "").trim().replace(/\s+/g, " ");
  const telBrut = String(donnees.get("telephone") ?? "").trim();

  if (!nomComplet(nom)) {
    return {
      ok: false,
      message:
        "Indique ton nom complet — prénom et nom — tel qu'il doit apparaître sur le certificat.",
    };
  }
  if (nom.length > 80) {
    return { ok: false, message: "Ce nom est trop long (80 caractères au maximum)." };
  }

  const telephone = telBrut ? normaliserTelephone(telBrut) : null;
  if (telephone && (telephone.length < 9 || telephone.length > 17)) {
    return { ok: false, message: "Ce numéro ne semble pas complet." };
  }

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Session expirée. Reconnecte-toi." };

  const { error } = await supabase
    .from("profils")
    .update({ nom, telephone })
    .eq("id", auth.user.id);

  if (error) {
    return { ok: false, message: "L'enregistrement a échoué. Réessaie dans un instant." };
  }

  revalidatePath("/profil");
  revalidatePath("/tableau-de-bord");
  return {
    ok: true,
    message: telephone
      ? `Enregistré. Numéro retenu : ${telephone}`
      : "Enregistré.",
  };
}

/**
 * Enregistrer la photo qui vient d'etre deposee.
 *
 * Le fichier est deja dans le seau — il y est alle directement depuis
 * le navigateur. On ne fait ici que verifier qu'il est bien dans le
 * dossier de cette personne, et ranger le chemin.
 */
export async function enregistrerPhoto(chemin: string): Promise<EtatProfil> {
  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Session expirée. Reconnecte-toi." };

  if (!chemin.startsWith(`${auth.user.id}/`)) {
    return { ok: false, message: "Dépôt refusé." };
  }

  const { error } = await supabase
    .from("profils")
    .update({ avatar: chemin })
    .eq("id", auth.user.id);

  if (error) return { ok: false, message: "L'enregistrement a échoué." };

  revalidatePath("/mon-parcours");
  revalidatePath("/tableau-de-bord", "layout");
  return { ok: true, message: "Photo enregistrée." };
}

/** Retirer sa photo : on retombe sur les initiales. */
export async function retirerPhoto(): Promise<EtatProfil> {
  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Session expirée." };

  await supabase.from("profils").update({ avatar: null }).eq("id", auth.user.id);

  revalidatePath("/mon-parcours");
  revalidatePath("/tableau-de-bord", "layout");
  return { ok: true, message: "Photo retirée." };
}

/** Oublier un appareil reconnu, depuis son profil. */
export async function oublierAppareil(donnees: FormData) {
  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  const id = String(donnees.get("id") ?? "");
  if (!id) return;

  const { revoquerAppareil } = await import("@/lib/appareil");
  await revoquerAppareil(id, auth.user.id);
  revalidatePath("/mon-parcours");
}

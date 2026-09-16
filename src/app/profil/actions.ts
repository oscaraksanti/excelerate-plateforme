"use server";

import { revalidatePath } from "next/cache";
import { clientServeur } from "@/lib/supabase/serveur";
import { normaliserTelephone } from "@/lib/telephone";

export type EtatProfil = { ok: boolean; message: string };

export async function enregistrerProfil(
  _precedent: EtatProfil,
  donnees: FormData,
): Promise<EtatProfil> {
  const nom = String(donnees.get("nom") ?? "").trim().replace(/\s+/g, " ");
  const telBrut = String(donnees.get("telephone") ?? "").trim();

  if (nom.length < 2) {
    return { ok: false, message: "Indique ton nom complet, tel qu'il doit apparaître sur le certificat." };
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

"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/admin";
import { envoyerAvisCertificat } from "@/lib/certificats";
import { clientServeur } from "@/lib/supabase/serveur";

export type Etat = { ok: boolean; message: string };

export async function delivrer(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();

  const ids = d.getAll("profil_id").map(String).filter(Boolean);
  const niveau = String(d.get("niveau") ?? "fondamentaux");
  if (ids.length === 0) return { ok: false, message: "Personne n'est sélectionné." };

  const supabase = await clientServeur();
  let poses = 0;
  const soucis: string[] = [];

  for (const id of ids) {
    const { data: code, error } = await supabase.rpc("delivrer_certificat", {
      p_profil: id,
      p_niveau: niveau,
    });
    if (error) {
      soucis.push(error.message);
      continue;
    }
    poses += 1;

    // Le courriel ne doit jamais faire échouer la délivrance.
    if (code) await envoyerAvisCertificat(code as string);
  }

  revalidatePath("/admin/certificats");
  revalidatePath("/admin");

  if (poses === 0) {
    return {
      ok: false,
      message: soucis[0]?.includes("nom")
        ? "Ces personnes n'ont pas renseigné leur nom : impossible d'établir un certificat."
        : "Aucun certificat n'a pu être délivré.",
    };
  }

  return {
    ok: true,
    message:
      soucis.length > 0
        ? `${poses} certificat(s) délivré(s). ${soucis.length} en échec — souvent un nom manquant.`
        : `${poses} certificat${poses > 1 ? "s" : ""} délivré${poses > 1 ? "s" : ""}.`,
  };
}

export async function revoquer(d: FormData) {
  await exigerAdmin();
  const code = String(d.get("code") ?? "");
  const motif = String(d.get("motif") ?? "").trim();
  if (!code) return;

  //  Jusqu'au 24 septembre, cette mise à jour ne touchait aucune
  //  ligne : la table n'avait pas de politique d'écriture, et la page
  //  se rafraîchissait comme si le retrait avait eu lieu. La
  //  migration 0036 a posé la politique manquante.
  const supabase = await clientServeur();
  const { error, count } = await supabase
    .from("certificats")
    .update(
      { revoque_le: new Date().toISOString(), revoque_motif: motif || null },
      { count: "exact" },
    )
    .eq("code", code);

  if (error || count === 0) {
    console.error("[certificat] révocation sans effet", error?.message ?? code);
  }

  revalidatePath("/admin/certificats");
  revalidatePath("/admin/apprenants");
}

/** Remettre en vigueur un certificat retiré par erreur. */
export async function retablir(d: FormData) {
  await exigerAdmin();
  const code = String(d.get("code") ?? "");
  if (!code) return;

  const supabase = await clientServeur();
  await supabase
    .from("certificats")
    .update({ revoque_le: null, revoque_motif: null })
    .eq("code", code);

  revalidatePath("/admin/certificats");
  revalidatePath("/admin/apprenants");
}

/** Renvoyer l'avis — le courriel se perd, le certificat reste. */
export async function renvoyerAvis(d: FormData) {
  await exigerAdmin();
  const code = String(d.get("code") ?? "");
  if (!code) return;

  await envoyerAvisCertificat(code);
  revalidatePath("/admin/certificats");
  revalidatePath("/admin/apprenants");
}

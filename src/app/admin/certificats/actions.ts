"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/admin";
import { courrielCertificat } from "@/lib/courriel";
import { clientAdmin } from "@/lib/supabase/admin";
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

  const admin = clientAdmin();

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
    try {
      const { data: profil } = await admin
        .from("profils")
        .select("email, nom")
        .eq("id", id)
        .maybeSingle();
      const { data: cert } = await admin
        .from("certificats")
        .select("mention")
        .eq("code", code as string)
        .maybeSingle();

      if (profil?.email && code) {
        await courrielCertificat({
          a: profil.email,
          prenom: (profil.nom ?? "").split(" ")[0] ?? "",
          code: code as string,
          mention: cert?.mention ?? "Excelerate IA",
        });
      }
    } catch (e) {
      console.error("[certificat] courriel non envoyé", e);
    }
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
  if (!code) return;

  const supabase = await clientServeur();
  await supabase
    .from("certificats")
    .update({ revoque_le: new Date().toISOString() })
    .eq("code", code);

  revalidatePath("/admin/certificats");
}

"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/admin";
import { courrielRelanceCorrections } from "@/lib/courriel";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";

/**
 * Replacer les copies mal loties dans les files de ceux qui ont
 * encore de la place. Sans effet quand tout le monde est servi.
 */
export async function repartir(donnees: FormData) {
  await exigerAdmin();
  const tpId = String(donnees.get("tp_id") ?? "").trim();
  const supabase = await clientServeur();

  if (tpId) {
    await supabase.rpc("repartir_copies", { p_tp: tpId });
  } else {
    const { data } = await supabase.from("tps").select("id").eq("publie", true);
    for (const t of (data as { id: string }[]) ?? []) {
      await supabase.rpc("repartir_copies", { p_tp: t.id });
    }
  }

  revalidatePath("/admin/corrections");
}

/** Rendre au pot commun les copies reservees et jamais lues. */
export async function liberer(donnees: FormData) {
  await exigerAdmin();
  const heures = Number(donnees.get("heures") ?? 48);
  const supabase = await clientServeur();

  const { data } = await supabase.from("tps").select("id").eq("publie", true);
  for (const t of (data as { id: string }[]) ?? []) {
    await supabase.rpc("liberer_attributions", {
      p_tp: t.id,
      p_heures: Number.isFinite(heures) ? heures : 48,
    });
    await supabase.rpc("repartir_copies", { p_tp: t.id });
  }

  revalidatePath("/admin/corrections");
}

/**
 * Prendre soi-meme une copie en souffrance.
 *
 * C'est ce qu'Oscar a promis aux premiers acheteurs : corriger leurs
 * travaux personnellement. La fonction accepte l'admin sans exiger
 * qu'il ait depose sa propre copie.
 */
export async function corrigerMoiMeme(donnees: FormData) {
  await exigerAdmin();
  const tpId = String(donnees.get("tp_id") ?? "").trim();
  if (!tpId) return;

  const supabase = await clientServeur();
  await supabase.rpc("attribuer_une_de_plus", { p_tp: tpId });

  revalidatePath("/admin/corrections");
  revalidatePath("/corrections");
}

/**
 * Relancer une seule personne.
 *
 * Le bouton de la page Apprenants relance tout le monde d'un coup ;
 * ici on vise celui qui bloque, et lui seul. Deux personnes gardant
 * six copies reservees sans les ouvrir suffisent a figer les notes
 * d'un TP entier.
 */
export async function relancerUn(donnees: FormData) {
  await exigerAdmin();
  const profilId = String(donnees.get("profil_id") ?? "").trim();
  if (!profilId) return;

  const admin = clientAdmin();
  const { data: gens } = await admin
    .from("profils")
    .select("email, nom")
    .eq("id", profilId)
    .maybeSingle();

  if (!gens?.email) return;

  const supabase = await clientServeur();
  const { data } = await supabase.rpc("a_relancer");
  const ligne = (data as { profil_id: string; restant: number }[] | null)?.find(
    (g) => g.profil_id === profilId,
  );
  if (!ligne) return; // Il n'a plus rien a corriger : rien a envoyer.

  await courrielRelanceCorrections({
    a: gens.email,
    prenom: (gens.nom ?? "").split(" ")[0] ?? "",
    restant: ligne.restant,
  });

  revalidatePath("/admin/corrections");
}

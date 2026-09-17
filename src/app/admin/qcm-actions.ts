"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/admin";
import { clientServeur } from "@/lib/supabase/serveur";

export type Etat = { ok: boolean; message: string };

function texte(d: FormData, cle: string) {
  return String(d.get(cle) ?? "").trim();
}

const GENRES = ["concept", "pepite", "diagnostic", "outil", "verif_ia", "piege"];

/**
 * Enregistre une question et sa cle.
 *
 * L'enonce et la bonne reponse vivent dans deux tables : c'est ce qui
 * garantit qu'aucune lecture cote apprenant ne peut reveler la reponse.
 */
export async function enregistrerQuestion(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();

  const id = texte(d, "id");
  const moduleId = texte(d, "module_id");
  const enonce = texte(d, "enonce");
  const bonne = texte(d, "bonne").toLowerCase();

  if (enonce.length < 5) return { ok: false, message: "L'énoncé est vide." };

  const propositions = ["a", "b", "c", "d"]
    .map((cle) => ({ cle, texte: texte(d, `prop_${cle}`) }))
    .filter((p) => p.texte.length > 0);

  if (propositions.length < 2) {
    return { ok: false, message: "Il faut au moins deux propositions." };
  }
  if (!propositions.some((p) => p.cle === bonne)) {
    return { ok: false, message: "La bonne réponse ne désigne aucune proposition." };
  }

  const genre = texte(d, "genre");
  const champs = {
    module_id: moduleId,
    numero: Number(texte(d, "numero")) || 1,
    genre: GENRES.includes(genre) ? genre : "concept",
    enonce,
    propositions,
    publie: d.get("publie") === "on",
  };

  const supabase = await clientServeur();

  let questionId = id;
  if (id) {
    const { error } = await supabase.from("questions").update(champs).eq("id", id);
    if (error) return { ok: false, message: `Échec : ${error.message}` };
  } else {
    const { data, error } = await supabase
      .from("questions")
      .insert(champs)
      .select("id")
      .single();
    if (error || !data) {
      return { ok: false, message: `Échec : ${error?.message ?? "insertion"}` };
    }
    questionId = data.id;
  }

  const { error: errCle } = await supabase.from("questions_cle").upsert(
    { question_id: questionId, bonne, explication: texte(d, "explication") },
    { onConflict: "question_id" },
  );
  if (errCle) return { ok: false, message: `Échec de la clé : ${errCle.message}` };

  revalidatePath(`/admin/modules/${moduleId}/qcm`);
  revalidatePath("/modules");
  return { ok: true, message: "Question enregistrée." };
}

export async function supprimerQuestion(d: FormData) {
  await exigerAdmin();
  const id = texte(d, "id");
  const moduleId = texte(d, "module_id");
  if (!id) return;

  const supabase = await clientServeur();
  await supabase.from("questions").delete().eq("id", id);
  revalidatePath(`/admin/modules/${moduleId}/qcm`);
}

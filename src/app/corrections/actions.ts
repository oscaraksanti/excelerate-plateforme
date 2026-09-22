"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { criteresDe } from "@/lib/pairs";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";

export type EtatCorrection = { ok: boolean; message: string };

/**
 * Demande des copies a corriger.
 *
 * C'est la base qui attribue : les moins corrigees d'abord, jamais la
 * sienne, jamais deux fois la meme, et la copie temoin en premier. Le
 * navigateur ne choisit rien.
 */
export async function demanderFile(donnees: FormData) {
  const tpId = String(donnees.get("tp_id") ?? "").trim();
  const retour = String(donnees.get("chemin_page") ?? "/modules");
  if (!tpId) return;

  const supabase = await clientServeur();
  await supabase.rpc("attribuer_copies", { p_tp: tpId });

  revalidatePath(retour);
}

export async function enregistrerCorrection(
  _precedent: EtatCorrection,
  donnees: FormData,
): Promise<EtatCorrection> {
  const attributionId = String(donnees.get("attribution_id") ?? "").trim();
  const commentaire = String(donnees.get("commentaire") ?? "").trim();
  if (!attributionId) return { ok: false, message: "Envoi incomplet." };

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Session expirée. Reconnecte-toi." };

  //  On relit l'attribution : elle porte la copie, et elle prouve le
  //  droit. Avec les droits complets, parce que la copie d'un pair est
  //  illisible sous les regles d'acces — et on n'en tire que `tp_id`.
  const admin = clientAdmin();
  const { data: attribution } = await admin
    .from("attributions")
    .select("id, copie_id, correcteur_id, statut, copies(tp_id)")
    .eq("id", attributionId)
    .maybeSingle();

  if (!attribution || attribution.correcteur_id !== auth.user.id) {
    return { ok: false, message: "Cette copie ne t'est pas attribuée." };
  }
  if (attribution.statut === "faite") {
    return { ok: false, message: "Tu as déjà corrigé cette copie." };
  }

  // Les criteres viennent du TP, pas du formulaire : personne ne peut
  // inventer un sixieme critere pour gonfler le total.
  const tpId = (attribution.copies as unknown as { tp_id: string } | null)?.tp_id;

  const { data: tp } = await supabase
    .from("tps")
    .select("criteres")
    .eq("id", tpId ?? "")
    .maybeSingle();

  const criteres = criteresDe(tp?.criteres);
  if (criteres.length === 0) {
    return { ok: false, message: "Ce travail n'a pas de grille de correction." };
  }

  const notes: Record<string, number> = {};
  let somme = 0;
  for (const c of criteres) {
    const brut = donnees.get(`note_${c.cle}`);
    const n = Number(brut);
    if (brut === null || !Number.isInteger(n) || n < 0 || n > 4) {
      return {
        ok: false,
        message: `Il manque une note pour « ${c.titre} ».`,
      };
    }
    notes[c.cle] = n;
    somme += n;
  }

  // Chaque critère se note de 0 à 4. Six critères donnaient donc un
  // total sur 24, injecté tel quel dans une note finale sur 20 : une
  // copie exemplaire partout sortait à 21,6/20. On ramène sur 20 ici,
  // une fois, et le nombre de critères cesse d'avoir un effet sur
  // l'échelle — ce qui permet au capstone d'en avoir sept.
  const total = Math.round((somme / (4 * criteres.length)) * 20 * 100) / 100;

  if (commentaire.length < 15) {
    return {
      ok: false,
      message:
        "Écris au moins une phrase à l'auteur. Une note sans explication n'apprend rien à personne — et c'est la moitié de l'intérêt de l'exercice.",
    };
  }

  const { error } = await supabase.from("corrections").insert({
    attribution_id: attributionId,
    copie_id: attribution.copie_id,
    correcteur_id: auth.user.id,
    notes,
    total,
    commentaire: commentaire.slice(0, 4000),
  });

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "Tu as déjà corrigé cette copie."
          : "L'enregistrement a échoué. Réessaie dans un instant.",
    };
  }

  revalidatePath("/corrections");
  redirect("/corrections?fait=1");
}

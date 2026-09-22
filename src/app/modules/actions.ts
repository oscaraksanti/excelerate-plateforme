"use server";

import { revalidatePath } from "next/cache";
import { clientServeur } from "@/lib/supabase/serveur";

export type EtatSimple = { ok: boolean; message: string };

/** Enregistre le passage sur une lecon. Silencieux : jamais bloquant. */
export async function noterPassage(leconId: string) {
  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  await supabase
    .from("progression")
    .upsert(
      { profil_id: auth.user.id, lecon_id: leconId, vue_le: new Date().toISOString() },
      { onConflict: "profil_id,lecon_id", ignoreDuplicates: false },
    );
}

export async function basculerTerminee(donnees: FormData) {
  const leconId = String(donnees.get("lecon_id") ?? "");
  const chemin = String(donnees.get("chemin") ?? "/modules");
  const terminee = String(donnees.get("terminee") ?? "") === "1";
  if (!leconId) return;

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  await supabase.from("progression").upsert(
    {
      profil_id: auth.user.id,
      lecon_id: leconId,
      terminee,
      vue_le: new Date().toISOString(),
    },
    { onConflict: "profil_id,lecon_id" },
  );

  revalidatePath(chemin);
  revalidatePath("/modules");
}

export async function publierCommentaire(
  _precedent: EtatSimple,
  donnees: FormData,
): Promise<EtatSimple> {
  const leconId = String(donnees.get("lecon_id") ?? "");
  const chemin = String(donnees.get("chemin") ?? "/modules");
  const corps = String(donnees.get("corps") ?? "").trim();
  const repondA = String(donnees.get("parent_id") ?? "").trim();

  if (corps.length < 2) {
    return { ok: false, message: "Ton message est vide." };
  }
  if (corps.length > 4000) {
    return { ok: false, message: "Ton message dépasse 4 000 caractères." };
  }

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Session expirée. Reconnecte-toi." };

  let parentId: string | null = null;
  if (repondA) {
    //  Le parent doit exister ET appartenir à cette leçon. Sans ce
    //  contrôle, un identifiant recopié à la main accrocherait une
    //  réponse sous le fil d'une leçon qu'on n'a pas le droit de voir.
    const { data: parent } = await supabase
      .from("commentaires")
      .select("id, lecon_id, parent_id")
      .eq("id", repondA)
      .maybeSingle();

    if (!parent || parent.lecon_id !== leconId) {
      return { ok: false, message: "Ce message n'existe plus." };
    }
    //  Deux niveaux, pas davantage : répondre à une réponse rejoint le
    //  même fil. Au-delà, ça devient illisible sur un téléphone.
    parentId = parent.parent_id ?? parent.id;
  }

  const { error } = await supabase
    .from("commentaires")
    .insert({ lecon_id: leconId, profil_id: auth.user.id, corps, parent_id: parentId });

  if (error) {
    return { ok: false, message: "L'envoi a échoué. Réessaie dans un instant." };
  }

  revalidatePath(chemin);
  return { ok: true, message: "" };
}

/* ── Le fil de discussion ─────────────────────────────────────────── */

/**
 * « Utile », posé ou retiré.
 *
 * Un vote par personne et par message : la clé primaire de la table le
 * garantit, on n'a donc pas à s'en méfier ici.
 */
export async function basculerUtile(donnees: FormData) {
  const id = String(donnees.get("commentaire_id") ?? "").trim();
  const chemin = String(donnees.get("chemin") ?? "/modules");
  if (!id) return;

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  const { data: deja } = await supabase
    .from("votes_utiles")
    .select("commentaire_id")
    .eq("commentaire_id", id)
    .eq("profil_id", auth.user.id)
    .maybeSingle();

  if (deja) {
    await supabase
      .from("votes_utiles")
      .delete()
      .eq("commentaire_id", id)
      .eq("profil_id", auth.user.id);
  } else {
    await supabase
      .from("votes_utiles")
      .insert({ commentaire_id: id, profil_id: auth.user.id });
  }

  revalidatePath(chemin);
}

/**
 * Désigne — ou retire — la réponse qui a résolu la question.
 *
 * Qui a le droit : l'auteur du fil, et l'instructeur. Ce n'est pas
 * vérifié ici mais par la règle « commentaires : je modifie les miens »,
 * qui est le seul endroit où cette question se tranche.
 */
export async function accepterReponse(donnees: FormData) {
  const reponseId = String(donnees.get("reponse_id") ?? "").trim();
  const filId = String(donnees.get("fil_id") ?? "").trim();
  const chemin = String(donnees.get("chemin") ?? "/modules");
  if (!filId) return;

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  //  La réponse doit appartenir à CE fil. Sans ce contrôle, on
  //  désignerait comme solution un message venu d'ailleurs — et il
  //  s'afficherait en tête d'une question qu'il ne concerne pas.
  if (reponseId) {
    const { data: r } = await supabase
      .from("commentaires")
      .select("id, parent_id")
      .eq("id", reponseId)
      .maybeSingle();
    if (!r || r.parent_id !== filId) return;
  }

  await supabase
    .from("commentaires")
    .update({ reponse_acceptee: reponseId || null })
    .eq("id", filId);

  revalidatePath(chemin);
}

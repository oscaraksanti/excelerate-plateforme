"use server";

import { revalidatePath } from "next/cache";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";
import { courrielNouvelleQuestion, courrielReponseAuFil } from "@/lib/courriel";

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

  //  La capture, s'il y en a une. L'interface redimensionne avant
  //  d'envoyer ; ces contrôles sont le dernier rempart, pas le premier.
  let image: string | null = null;
  const jointe = donnees.get("capture");
  if (jointe instanceof File && jointe.size > 0) {
    if (!jointe.type.startsWith("image/")) {
      return { ok: false, message: "Seules les images sont acceptées." };
    }
    if (jointe.size > 5_000_000) {
      return { ok: false, message: "Cette image dépasse 5 Mo." };
    }
    const ext = (jointe.type.split("/")[1] ?? "webp").replace("jpeg", "jpg");
    const chemin = `${leconId}/${crypto.randomUUID()}.${ext}`;
    const { error: envoi } = await clientAdmin()
      .storage.from("captures")
      .upload(chemin, jointe, { contentType: jointe.type, upsert: false });
    if (envoi) {
      return { ok: false, message: "L'image n'est pas passée. Réessaie." };
    }
    image = chemin;
  }

  const { error } = await supabase
    .from("commentaires")
    .insert({ lecon_id: leconId, profil_id: auth.user.id, corps, parent_id: parentId, image });

  if (error) {
    return { ok: false, message: "L'envoi a échoué. Réessaie dans un instant." };
  }

  await prevenir({ leconId, chemin, parentId, corps, auteurId: auth.user.id });

  revalidatePath(chemin);
  return { ok: true, message: "" };
}

/* ── Les alertes du fil ───────────────────────────────────────────── */

const HEURE = 3_600_000;

function extrait(texte: string) {
  const t = texte.replace(/\s+/g, " ").trim();
  return t.length > 220 ? `${t.slice(0, 220)}…` : t;
}

/** « Aïcha Mbala » → « Aïcha M. », comme dans le fil. */
function nomDUsage(nom: string | null) {
  const t = (nom ?? "").trim();
  if (!t) return "Un participant";
  const [prenom, suite] = t.split(/\s+/);
  return suite ? `${prenom} ${suite[0].toUpperCase()}.` : prenom;
}

/**
 * Prévient qui doit l'être, et personne d'autre.
 *
 * Deux destinataires possibles : l'instructeur quand une question
 * arrive — une question répondue dans la journée fait un forum vivant,
 * répondue au bout de trois jours elle n'en fait plus — et l'auteur du
 * fil quand on lui répond.
 *
 * Passe par les droits de service : lire l'adresse de quelqu'un
 * d'autre est interdit aux apprenants, et ce doit le rester.
 *
 * Ne lève jamais. Un courriel qui ne part pas ne doit pas empêcher un
 * message d'être publié.
 */
async function prevenir(o: {
  leconId: string;
  chemin: string;
  parentId: string | null;
  corps: string;
  auteurId: string;
}) {
  try {
    const admin = clientAdmin();
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://excelai.oscaraksanti.com";
    const lien = `${site}${o.chemin}`;

    const [{ data: lecon }, { data: moi }] = await Promise.all([
      admin.from("lecons").select("titre").eq("id", o.leconId).maybeSingle(),
      admin.from("profils").select("nom").eq("id", o.auteurId).maybeSingle(),
    ]);
    const titreLecon = lecon?.titre ?? "une leçon";
    const signataire = nomDUsage(moi?.nom ?? null);

    if (!o.parentId) {
      //  Une question : c'est l'instructeur qu'on prévient.
      const { data: admins } = await admin
        .from("profils")
        .select("email")
        .eq("role", "admin");
      for (const a of admins ?? []) {
        if (!a.email) continue;
        await courrielNouvelleQuestion({
          a: a.email,
          auteur: signataire,
          lecon: titreLecon,
          extrait: extrait(o.corps),
          lien,
        });
      }
      return;
    }

    //  Une réponse : c'est l'auteur du fil.
    const { data: fil } = await admin
      .from("commentaires")
      .select("id, profil_id, alerte_le, profils(nom, email)")
      .eq("id", o.parentId)
      .maybeSingle();
    if (!fil) return;

    //  Se répondre à soi-même ne se notifie pas.
    if (fil.profil_id === o.auteurId) return;

    //  Une alerte par heure et par fil : dix réponses ne font pas dix
    //  courriels.
    if (fil.alerte_le && Date.now() - new Date(fil.alerte_le).getTime() < HEURE) {
      return;
    }

    const destinataire = fil.profils as unknown as
      | { nom: string | null; email: string | null }
      | null;
    if (!destinataire?.email) return;

    const parti = await courrielReponseAuFil({
      a: destinataire.email,
      prenom: (destinataire.nom ?? "").trim().split(/\s+/)[0] ?? "",
      auteurReponse: signataire,
      lecon: titreLecon,
      extrait: extrait(o.corps),
      lien,
    });

    if (parti) {
      await admin
        .from("commentaires")
        .update({ alerte_le: new Date().toISOString() })
        .eq("id", fil.id);
    }
  } catch (err) {
    console.error("[fil] alerte impossible", err);
  }
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

/**
 * Modifie son propre message.
 *
 * Le droit n'est pas vérifié ici mais par « commentaires : je modifie
 * les miens » : la base est le seul endroit où cette question se
 * tranche. `retirer_image` existe pour un cas précis et pressant —
 * quelqu'un qui s'aperçoit que sa capture montrait une donnée
 * confidentielle doit pouvoir l'enlever lui-même, tout de suite.
 */
export async function modifierMessage(
  _precedent: EtatSimple,
  donnees: FormData,
): Promise<EtatSimple> {
  const id = String(donnees.get("message_id") ?? "").trim();
  const chemin = String(donnees.get("chemin") ?? "/modules");
  const corps = String(donnees.get("corps") ?? "").trim();
  const retirerImage = donnees.get("retirer_image") === "on";
  if (!id) return { ok: false, message: "Message introuvable." };

  if (corps.length < 2) return { ok: false, message: "Ton message est vide." };
  if (corps.length > 4000) {
    return { ok: false, message: "Ton message dépasse 4 000 caractères." };
  }

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Session expirée. Reconnecte-toi." };

  const champs: { corps: string; image?: null } = { corps };

  if (retirerImage) {
    const { data: avant } = await supabase
      .from("commentaires")
      .select("image, profil_id")
      .eq("id", id)
      .maybeSingle();
    //  On n'efface le fichier que si la ligne nous appartient : sinon
    //  la mise à jour va échouer juste après, et on aurait détruit
    //  l'image de quelqu'un d'autre pour rien.
    if (avant?.image && avant.profil_id === auth.user.id) {
      await clientAdmin().storage.from("captures").remove([avant.image]);
    }
    champs.image = null;
  }

  const { error } = await supabase
    .from("commentaires")
    .update(champs)
    .eq("id", id);

  if (error) {
    return { ok: false, message: "La modification a échoué. Réessaie." };
  }

  revalidatePath(chemin);
  return { ok: true, message: "" };
}

/**
 * Supprime son propre message.
 *
 * Refusé si des réponses y pendent : effacer une question emporterait
 * le travail de ceux qui ont pris le temps d'y répondre. Dans ce cas
 * l'interface propose de modifier — le texte peut être vidé de ce
 * qu'on regrette, et la capture retirée.
 */
export async function supprimerMessage(donnees: FormData) {
  const id = String(donnees.get("message_id") ?? "").trim();
  const chemin = String(donnees.get("chemin") ?? "/modules");
  if (!id) return;

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  const { data: message } = await supabase
    .from("commentaires")
    .select("id, image, profil_id, parent_id")
    .eq("id", id)
    .maybeSingle();
  if (!message) return;

  if (!message.parent_id) {
    const { count } = await supabase
      .from("commentaires")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", id);
    if ((count ?? 0) > 0) return;
  }

  const { error } = await supabase.from("commentaires").delete().eq("id", id);
  if (error) return;

  //  La ligne est partie, donc la règle a jugé que c'était bien le
  //  nôtre. On peut retirer le fichier sans risque.
  if (message.image) {
    await clientAdmin().storage.from("captures").remove([message.image]);
  }

  revalidatePath(chemin);
}

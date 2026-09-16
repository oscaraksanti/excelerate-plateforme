"use server";

import { revalidatePath } from "next/cache";
import { analyser, ClasseurInvalide, ouvrirClasseur } from "@/lib/correcteur";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";

export type EtatDepot = { ok: boolean; message: string };

/**
 * Enregistre une copie et la corrige immediatement.
 *
 * Le fichier est deja dans l'espace prive : il y est alle directement
 * depuis le navigateur, sans passer par ce serveur. On ne fait ici que
 * le relire, le comparer au corrige, et ranger la note.
 */
export async function deposerCopie(
  _precedent: EtatDepot,
  donnees: FormData,
): Promise<EtatDepot> {
  const tpId = String(donnees.get("tp_id") ?? "").trim();
  const chemin = String(donnees.get("chemin") ?? "").trim();
  const nomFichier = String(donnees.get("nom_fichier") ?? "").trim();
  const retour = String(donnees.get("chemin_page") ?? "/modules");

  if (!tpId || !chemin) return { ok: false, message: "Envoi incomplet." };

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Session expirée. Reconnecte-toi." };

  // Le chemin vient du navigateur : on verifie qu'il designe bien le
  // dossier de cette personne. Sans ce controle, on pourrait faire noter
  // la copie de quelqu'un d'autre.
  if (!chemin.startsWith(`${auth.user.id}/`)) {
    return { ok: false, message: "Dépôt refusé." };
  }

  // Le TP est-il ouvert ? On relit les dates cote serveur : celles
  // affichees dans la page ne font pas foi.
  const { data: tp } = await supabase
    .from("tps")
    .select("id, ouvre_le, ferme_le, publie")
    .eq("id", tpId)
    .maybeSingle();

  if (!tp || !tp.publie) return { ok: false, message: "Ce travail n'est pas ouvert." };

  const maintenant = Date.now();
  if (tp.ouvre_le && new Date(tp.ouvre_le).getTime() > maintenant) {
    return { ok: false, message: "Ce travail n'est pas encore ouvert." };
  }
  if (tp.ferme_le && new Date(tp.ferme_le).getTime() < maintenant) {
    return { ok: false, message: "Les dépôts sont clos pour ce travail." };
  }

  const admin = clientAdmin();

  const { data: corrige } = await admin
    .from("corriges")
    .select("chemin")
    .eq("tp_id", tpId)
    .maybeSingle();

  const { data: brut, error: errLecture } = await admin.storage
    .from("depots")
    .download(chemin);

  if (errLecture || !brut) {
    return {
      ok: false,
      message: "Ton fichier n'a pas pu être relu. Réessaie le dépôt.",
    };
  }

  let note: number | null = null;
  let detail: unknown = null;

  try {
    const copieClasseur = ouvrirClasseur(Buffer.from(await brut.arrayBuffer()));

    if (corrige?.chemin) {
      const { data: refBrut } = await admin.storage
        .from("corriges")
        .download(corrige.chemin);

      if (refBrut) {
        const refClasseur = ouvrirClasseur(Buffer.from(await refBrut.arrayBuffer()));
        const resultat = analyser(refClasseur, copieClasseur);
        note = resultat.sur20;
        detail = resultat;
      }
    }
  } catch (e) {
    // Le fichier reste dans le stockage mais rien n'est enregistre :
    // la personne peut corriger et redeposer.
    await admin.storage.from("depots").remove([chemin]);
    return {
      ok: false,
      message:
        e instanceof ClasseurInvalide
          ? e.message
          : "Ce fichier n'a pas pu être lu. Réenregistre-le depuis Excel au format .xlsx.",
    };
  }

  const { error } = await admin.from("copies").upsert(
    {
      tp_id: tpId,
      profil_id: auth.user.id,
      chemin,
      nom_fichier: nomFichier || null,
      note_machine: note,
      detail_machine: detail,
      depose_le: new Date().toISOString(),
    },
    { onConflict: "tp_id,profil_id" },
  );

  if (error) {
    return { ok: false, message: "L'enregistrement a échoué. Réessaie dans un instant." };
  }

  revalidatePath(retour);
  return {
    ok: true,
    message:
      note === null
        ? "Copie déposée. La note arrivera dès que le corrigé sera en ligne."
        : `Copie déposée et corrigée : ${String(note).replace(".", ",")} / 20.`,
  };
}

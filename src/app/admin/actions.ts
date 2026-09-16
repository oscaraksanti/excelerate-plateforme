"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerAdmin } from "@/lib/admin";
import { extraireIdYouTube } from "@/lib/markdown";
import { clientServeur } from "@/lib/supabase/serveur";

export type Etat = { ok: boolean; message: string };

function texte(d: FormData, cle: string) {
  return String(d.get(cle) ?? "").trim();
}

function entier(d: FormData, cle: string): number | null {
  const v = texte(d, cle);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/* ── Modules ────────────────────────────────────────────────────── */

export async function enregistrerModule(
  _p: Etat,
  d: FormData,
): Promise<Etat> {
  await exigerAdmin();

  const id = texte(d, "id");
  const titre = texte(d, "titre");
  if (titre.length < 2) {
    return { ok: false, message: "Donne un titre au module." };
  }

  const champs = {
    titre,
    resume: texte(d, "resume"),
    acces: texte(d, "acces") === "gratuit" ? "gratuit" : "paye",
    publie: d.get("publie") === "on",
  };

  const supabase = await clientServeur();
  const { error } = await supabase.from("modules").update(champs).eq("id", id);

  if (error) return { ok: false, message: `Échec : ${error.message}` };

  revalidatePath("/admin");
  revalidatePath(`/admin/modules/${id}`);
  revalidatePath("/modules");
  return { ok: true, message: "Module enregistré." };
}

/* ── Leçons ─────────────────────────────────────────────────────── */

export async function creerLecon(d: FormData) {
  await exigerAdmin();

  const moduleId = texte(d, "module_id");
  const titre = texte(d, "titre") || "Nouvelle leçon";
  const supabase = await clientServeur();

  // Le numéro suivant, sans trou : on lit le dernier et on ajoute 1.
  const { data: dernieres } = await supabase
    .from("lecons")
    .select("numero")
    .eq("module_id", moduleId)
    .order("numero", { ascending: false })
    .limit(1);

  const numero = (dernieres?.[0]?.numero ?? 0) + 1;

  const { data, error } = await supabase
    .from("lecons")
    .insert({ module_id: moduleId, numero, titre, publie: false })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/admin/modules/${moduleId}?probleme=creation`);
  }

  revalidatePath(`/admin/modules/${moduleId}`);
  redirect(`/admin/lecons/${data.id}`);
}

export async function enregistrerLecon(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();

  const id = texte(d, "id");
  const titre = texte(d, "titre");
  if (titre.length < 2) return { ok: false, message: "Donne un titre à la leçon." };

  const numero = entier(d, "numero");
  if (!numero || numero < 1) {
    return { ok: false, message: "Le numéro d'ordre doit être un entier positif." };
  }

  // On accepte une adresse YouTube complète aussi bien qu'un identifiant nu.
  const saisieVideo = texte(d, "video");
  let videoId: string | null = null;
  if (saisieVideo) {
    videoId = extraireIdYouTube(saisieVideo);
    if (!videoId) {
      return {
        ok: false,
        message:
          "Cette adresse YouTube n'est pas reconnue. Colle le lien complet de la vidéo, ou son identifiant de 11 caractères.",
      };
    }
  }

  const champs = {
    titre,
    numero,
    video_source: videoId ? "youtube" : null,
    video_id: videoId,
    duree_min: entier(d, "duree_min"),
    corps_md: String(d.get("corps_md") ?? ""),
    publie: d.get("publie") === "on",
  };

  const supabase = await clientServeur();
  const { data, error } = await supabase
    .from("lecons")
    .update(champs)
    .eq("id", id)
    .select("module_id")
    .single();

  if (error) {
    const collision = error.code === "23505";
    return {
      ok: false,
      message: collision
        ? `Le numéro ${numero} est déjà pris par une autre leçon de ce module.`
        : `Échec : ${error.message}`,
    };
  }

  revalidatePath(`/admin/lecons/${id}`);
  revalidatePath(`/admin/modules/${data.module_id}`);
  revalidatePath("/modules", "layout");
  return { ok: true, message: "Leçon enregistrée." };
}

export async function supprimerLecon(d: FormData) {
  await exigerAdmin();
  const id = texte(d, "id");
  const moduleId = texte(d, "module_id");

  const supabase = await clientServeur();
  await supabase.from("lecons").delete().eq("id", id);

  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath("/modules", "layout");
  redirect(`/admin/modules/${moduleId}`);
}

/* ── Ressources ─────────────────────────────────────────────────── */

/** Le fichier est déjà dans le stockage : on n'enregistre que sa fiche. */
export async function rattacherRessource(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();

  const leconId = texte(d, "lecon_id");
  const nom = texte(d, "nom");
  const chemin = texte(d, "chemin");
  const taille = entier(d, "taille");

  if (!leconId || !nom || !chemin) {
    return { ok: false, message: "Envoi incomplet." };
  }

  const supabase = await clientServeur();
  const { error } = await supabase
    .from("ressources")
    .insert({ lecon_id: leconId, nom, chemin, taille_octets: taille });

  if (error) return { ok: false, message: `Échec : ${error.message}` };

  revalidatePath(`/admin/lecons/${leconId}`);
  revalidatePath("/modules", "layout");
  return { ok: true, message: `« ${nom} » ajouté.` };
}

export async function detacherRessource(d: FormData) {
  await exigerAdmin();
  const id = texte(d, "id");
  const leconId = texte(d, "lecon_id");
  const chemin = texte(d, "chemin");

  const supabase = await clientServeur();
  await supabase.from("ressources").delete().eq("id", id);
  if (chemin) await supabase.storage.from("ressources").remove([chemin]);

  revalidatePath(`/admin/lecons/${leconId}`);
  revalidatePath("/modules", "layout");
}

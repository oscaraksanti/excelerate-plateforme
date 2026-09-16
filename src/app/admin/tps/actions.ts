"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerAdmin } from "@/lib/admin";
import { analyser, ClasseurInvalide, ouvrirClasseur } from "@/lib/correcteur";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";

export type Etat = { ok: boolean; message: string };

function texte(d: FormData, cle: string) {
  return String(d.get(cle) ?? "").trim();
}

function horodatage(d: FormData, cle: string): string | null {
  const v = texte(d, cle);
  if (!v) return null;
  const t = new Date(v);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
}

export async function creerTp(d: FormData) {
  await exigerAdmin();

  const moduleId = texte(d, "module_id");
  const titre = texte(d, "titre") || "Travail pratique";

  const supabase = await clientServeur();
  const { data: dernier } = await supabase
    .from("tps")
    .select("numero")
    .eq("module_id", moduleId)
    .order("numero", { ascending: false })
    .limit(1);

  const numero = (dernier?.[0]?.numero ?? 0) + 1;

  const { data, error } = await supabase
    .from("tps")
    .insert({ module_id: moduleId, numero, titre, publie: false })
    .select("id")
    .single();

  if (error || !data) redirect(`/admin/modules/${moduleId}`);

  revalidatePath(`/admin/modules/${moduleId}`);
  redirect(`/admin/tps/${data.id}`);
}

export async function enregistrerTp(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();

  const id = texte(d, "id");
  const titre = texte(d, "titre");
  if (titre.length < 2) return { ok: false, message: "Donne un titre au travail pratique." };

  const requises = Number(texte(d, "corrections_requises") || "3");
  if (!Number.isInteger(requises) || requises < 1 || requises > 10) {
    return { ok: false, message: "Le nombre de corrections doit être compris entre 1 et 10." };
  }

  const ouvre = horodatage(d, "ouvre_le");
  const ferme = horodatage(d, "ferme_le");
  if (ouvre && ferme && new Date(ferme) <= new Date(ouvre)) {
    return { ok: false, message: "La fermeture doit être postérieure à l'ouverture." };
  }

  const supabase = await clientServeur();
  const { data, error } = await supabase
    .from("tps")
    .update({
      titre,
      enonce_md: String(d.get("enonce_md") ?? ""),
      corrections_requises: requises,
      ouvre_le: ouvre,
      ferme_le: ferme,
      publie: d.get("publie") === "on",
    })
    .eq("id", id)
    .select("module_id")
    .single();

  if (error) return { ok: false, message: `Échec : ${error.message}` };

  revalidatePath(`/admin/tps/${id}`);
  revalidatePath(`/admin/modules/${data.module_id}`);
  revalidatePath("/modules", "layout");
  return { ok: true, message: "Travail pratique enregistré." };
}

/** Le fichier de depart : public, telecharge par les apprenants. */
export async function rattacherDepart(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();
  const id = texte(d, "id");
  const chemin = texte(d, "chemin");
  if (!id || !chemin) return { ok: false, message: "Envoi incomplet." };

  const supabase = await clientServeur();
  const { error } = await supabase.from("tps").update({ fichier_depart: chemin }).eq("id", id);
  if (error) return { ok: false, message: `Échec : ${error.message}` };

  revalidatePath(`/admin/tps/${id}`);
  revalidatePath("/modules", "layout");
  return { ok: true, message: "Classeur de départ enregistré." };
}

/**
 * Le corrige vient d'etre depose dans l'espace prive. On l'ouvre, on en
 * deduit la grille, et on range le tout. Si le classeur est illisible,
 * on le dit avant qu'un seul apprenant ne depose quoi que ce soit.
 */
export async function rattacherCorrige(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();

  const tpId = texte(d, "tp_id");
  const chemin = texte(d, "chemin");
  if (!tpId || !chemin) return { ok: false, message: "Envoi incomplet." };

  const admin = clientAdmin();
  const { data: fichier, error: err } = await admin.storage.from("corriges").download(chemin);
  if (err || !fichier) {
    return { ok: false, message: "Le fichier n'a pas pu être relu depuis le stockage." };
  }

  let apercu: { total: number; cellules: number; feuilles: number; noms: number };
  try {
    const classeur = ouvrirClasseur(Buffer.from(await fichier.arrayBuffer()));
    const vide = analyser(classeur, { SheetNames: [], Sheets: {} });
    apercu = {
      total: vide.total,
      cellules: vide.lignes.filter((l) => l.genre === "cellule").length,
      feuilles: vide.lignes.filter((l) => l.genre === "feuille").length,
      noms: vide.lignes.filter((l) => l.genre === "nom").length,
    };
  } catch (e) {
    await admin.storage.from("corriges").remove([chemin]);
    return {
      ok: false,
      message:
        e instanceof ClasseurInvalide
          ? e.message
          : "Ce classeur n'a pas pu être analysé.",
    };
  }

  if (apercu.cellules === 0) {
    await admin.storage.from("corriges").remove([chemin]);
    return {
      ok: false,
      message:
        "Ce corrigé ne contient aucune formule : il n'y a donc rien à noter. Vérifie que tu as bien déposé le classeur corrigé, et non le classeur de départ.",
    };
  }

  const { error } = await admin
    .from("corriges")
    .upsert(
      { tp_id: tpId, chemin, grille: apercu, maj_le: new Date().toISOString() },
      { onConflict: "tp_id" },
    );

  if (error) return { ok: false, message: `Échec : ${error.message}` };

  revalidatePath(`/admin/tps/${tpId}`);
  return {
    ok: true,
    message: `Corrigé analysé : ${apercu.total} points sur ${apercu.cellules} cellule${apercu.cellules > 1 ? "s" : ""} à produire, ${apercu.feuilles} feuille${apercu.feuilles > 1 ? "s" : ""}${apercu.noms ? `, ${apercu.noms} plage nommée${apercu.noms > 1 ? "s" : ""}` : ""}.`,
  };
}

export async function supprimerTp(d: FormData) {
  await exigerAdmin();
  const id = texte(d, "id");
  const moduleId = texte(d, "module_id");

  const supabase = await clientServeur();
  await supabase.from("tps").delete().eq("id", id);

  revalidatePath(`/admin/modules/${moduleId}`);
  redirect(`/admin/modules/${moduleId}`);
}

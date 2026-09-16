import { clientServeur } from "@/lib/supabase/serveur";

export type Tp = {
  id: string;
  module_id: string;
  numero: number;
  titre: string;
  enonce_md: string;
  fichier_depart: string | null;
  criteres: unknown;
  corrections_requises: number;
  ouvre_le: string | null;
  ferme_le: string | null;
  publie: boolean;
};

export type Copie = {
  id: string;
  tp_id: string;
  profil_id: string;
  chemin: string;
  nom_fichier: string | null;
  note_machine: number | null;
  detail_machine: unknown;
  note_pairs: number | null;
  note_finale: number | null;
  depose_le: string;
};

const CHAMPS_TP =
  "id, module_id, numero, titre, enonce_md, fichier_depart, criteres, corrections_requises, ouvre_le, ferme_le, publie";

export async function listerTps(moduleId: string): Promise<Tp[]> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("tps")
    .select(CHAMPS_TP)
    .eq("module_id", moduleId)
    .order("numero");
  return (data as Tp[]) ?? [];
}

export async function lireTp(moduleId: string, numero: number): Promise<Tp | null> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("tps")
    .select(CHAMPS_TP)
    .eq("module_id", moduleId)
    .eq("numero", numero)
    .maybeSingle();
  return (data as Tp | null) ?? null;
}

export async function lireTpParId(id: string): Promise<Tp | null> {
  const supabase = await clientServeur();
  const { data } = await supabase.from("tps").select(CHAMPS_TP).eq("id", id).maybeSingle();
  return (data as Tp | null) ?? null;
}

/** Ma copie pour ce TP, s'il y en a une. */
export async function maCopie(tpId: string): Promise<Copie | null> {
  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data } = await supabase
    .from("copies")
    .select(
      "id, tp_id, profil_id, chemin, nom_fichier, note_machine, detail_machine, note_pairs, note_finale, depose_le",
    )
    .eq("tp_id", tpId)
    .eq("profil_id", auth.user.id)
    .maybeSingle();
  return (data as Copie | null) ?? null;
}

/** Le corrige, cote administration uniquement. */
export async function lireCorrige(tpId: string) {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("corriges")
    .select("tp_id, chemin, grille, maj_le")
    .eq("tp_id", tpId)
    .maybeSingle();
  return data as { tp_id: string; chemin: string; grille: unknown; maj_le: string } | null;
}

export { etatTp, formaterDate, pourChampDate } from "@/lib/formats";

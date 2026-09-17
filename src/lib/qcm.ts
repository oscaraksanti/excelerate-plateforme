import "server-only";
import { clientServeur } from "@/lib/supabase/serveur";

export type { Proposition, EntreeQcm, Genre } from "@/lib/formats";
import type { EntreeQcm } from "@/lib/formats";

/** Le QCM d'un module, tel que la personne connectee le voit. */
export async function monQcm(moduleId: string): Promise<EntreeQcm[]> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("mon_qcm", { p_module: moduleId });
  return (data as EntreeQcm[]) ?? [];
}

export type StatQcm = {
  module_numero: number;
  question_id: string;
  numero: number;
  genre: string;
  enonce: string;
  reponses: number;
  reussite: number | null;
};

export async function statsQcm(): Promise<StatQcm[]> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("stats_qcm");
  return (data as StatQcm[]) ?? [];
}

export type QuestionAdmin = {
  id: string;
  module_id: string;
  numero: number;
  genre: string;
  enonce: string;
  propositions: { cle: string; texte: string }[];
  publie: boolean;
  bonne: string;
  explication: string;
};

/** Les questions d'un module avec leur cle — administration seulement. */
export async function questionsDuModule(moduleId: string): Promise<QuestionAdmin[]> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("questions")
    .select("id, module_id, numero, genre, enonce, propositions, publie, questions_cle(bonne, explication)")
    .eq("module_id", moduleId)
    .order("numero");

  type Brut = Omit<QuestionAdmin, "bonne" | "explication"> & {
    questions_cle: { bonne: string; explication: string } | null;
  };

  return ((data as unknown as Brut[]) ?? []).map((q) => ({
    id: q.id,
    module_id: q.module_id,
    numero: q.numero,
    genre: q.genre,
    enonce: q.enonce,
    propositions: q.propositions ?? [],
    publie: q.publie,
    bonne: q.questions_cle?.bonne ?? "",
    explication: q.questions_cle?.explication ?? "",
  }));
}

import { clientServeur } from "@/lib/supabase/serveur";

export { BAREME, criteresDe } from "@/lib/formats";
export type { Critere } from "@/lib/formats";

export type EntreeFile = {
  attribution_id: string;
  copie_id: string;
  depose_le: string;
  statut: "en_attente" | "faite" | "expiree";
  est_temoin: boolean;
};

export type Avancement = { faites: number; requises: number; attribuees: number };

export async function maFile(tpId: string): Promise<EntreeFile[]> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("ma_file", { p_tp: tpId });
  return (data as EntreeFile[]) ?? [];
}

export async function monAvancement(tpId: string): Promise<Avancement> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("mon_avancement", { p_tp: tpId });
  const l = Array.isArray(data) ? data[0] : data;
  return {
    faites: l?.faites ?? 0,
    requises: l?.requises ?? 3,
    attribuees: l?.attribuees ?? 0,
  };
}

export async function verrouLeve(tpId: string): Promise<boolean> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("verrou_leve", { p_tp: tpId });
  return Boolean(data);
}

/** Les corrections recues sur ma copie — la base ne les rend que si le verrou est leve. */
export async function corrections_recues(copieId: string) {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("corrections")
    .select("id, notes, total, commentaire, faite_le")
    .eq("copie_id", copieId)
    .order("faite_le");
  return (
    (data as {
      id: string;
      notes: Record<string, number>;
      total: number;
      commentaire: string | null;
      faite_le: string;
    }[]) ?? []
  );
}

export type EtatCopie = { recues: number; en_lecture: number; definitive: boolean };

/** Ou en est MA copie : qui l'a lue, qui la lit. Sans nommer personne. */
export async function etatDeMaCopie(tpId: string): Promise<EtatCopie> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("etat_de_ma_copie", { p_tp: tpId });
  const l = Array.isArray(data) ? data[0] : data;
  return {
    recues: l?.recues ?? 0,
    en_lecture: l?.en_lecture ?? 0,
    definitive: Boolean(l?.definitive),
  };
}

/** Combien de copies attendent encore un deuxieme lecteur, et me sont prenables. */
export async function copiesEnSouffrance(tpId: string): Promise<number> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("copies_en_souffrance", { p_tp: tpId });
  return Number(data ?? 0);
}

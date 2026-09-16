import { clientServeur } from "@/lib/supabase/serveur";

export type Metriques = {
  inscrits: number; importes: number; connectes: number; actifs_7j: number;
  lecons_vues: number; lecons_finies: number; copies: number; corrections: number;
  commentaires: number; ventes: number; ca_brut: number; certificats: number;
  modules_publies: number; lecons_publiees: number;
};

const VIDE: Metriques = {
  inscrits: 0, importes: 0, connectes: 0, actifs_7j: 0, lecons_vues: 0,
  lecons_finies: 0, copies: 0, corrections: 0, commentaires: 0, ventes: 0,
  ca_brut: 0, certificats: 0, modules_publies: 0, lecons_publiees: 0,
};

export async function lireMetriques(): Promise<Metriques> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("metriques");
  return { ...VIDE, ...((data as Partial<Metriques>) ?? {}) };
}

export type Apprenant = {
  id: string; email: string | null; nom: string; telephone: string | null;
  role: string; origine: string; cree_le: string;
  lecons_vues: number; copies: number; corrections: number; a_paye: boolean;
};

export async function listerApprenants(recherche = "", limite = 200): Promise<Apprenant[]> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("apprenants", {
    p_recherche: recherche || null,
    p_limite: limite,
  });
  return (data as Apprenant[]) ?? [];
}

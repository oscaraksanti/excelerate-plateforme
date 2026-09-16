import { clientServeur } from "@/lib/supabase/serveur";

export type { Direct } from "@/lib/formats";
import type { Direct } from "@/lib/formats";

const DEFAUT: Direct = {
  actif: false,
  titre: "",
  lien: "",
  debut_le: null,
  duree_min: 120,
};

export async function lireDirect(): Promise<Direct> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("reglages")
    .select("valeur")
    .eq("cle", "direct")
    .maybeSingle();
  return { ...DEFAUT, ...((data?.valeur as Partial<Direct>) ?? {}) };
}

export { formaterDebut, etatDirect } from "@/lib/formats";

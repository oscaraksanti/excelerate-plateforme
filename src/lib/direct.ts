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


export type DirectPublic = { actif: boolean; titre: string; debut_le: string | null };

export async function lireDirectPublic(): Promise<DirectPublic> {
  const { clientAdmin } = await import("@/lib/supabase/admin");
  try {
    const { data } = await clientAdmin()
      .from("reglages").select("valeur").eq("cle", "direct").maybeSingle();
    const v = (data?.valeur ?? {}) as Partial<Direct>;
    //  On ne recopie que trois champs. Le lien reste dans la base.
    return {
      actif: Boolean(v.actif),
      titre: String(v.titre ?? ""),
      debut_le: v.debut_le ?? null,
    };
  } catch {
    return { actif: false, titre: "", debut_le: null };
  }
}

export { formaterDebut, etatDirect } from "@/lib/formats";

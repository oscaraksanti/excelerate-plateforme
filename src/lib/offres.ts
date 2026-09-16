import { clientServeur } from "@/lib/supabase/serveur";

export type Produit = {
  ref: string;
  produit: "certificat27" | "masterclass37" | "coaching97" | "equipe";
  titre: string;
  accroche: string;
  detail: string;
  montant: number | null;
  lien: string | null;
  ordre: number;
  phare: boolean;
  actif: boolean;
};

export type Conditions = {
  tps_rendus: number;
  tps_total: number;
  corrections: number;
  corrections_dues: number;
  moyenne: number | null;
};

export async function listerProduits(): Promise<Produit[]> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("produits")
    .select("ref, produit, titre, accroche, detail, montant, lien, ordre, phare, actif")
    .order("ordre");
  return (data as Produit[]) ?? [];
}

export async function mesConditions(): Promise<Conditions> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("mes_conditions");
  const l = Array.isArray(data) ? data[0] : data;
  return {
    tps_rendus: l?.tps_rendus ?? 0,
    tps_total: l?.tps_total ?? 0,
    corrections: l?.corrections ?? 0,
    corrections_dues: l?.corrections_dues ?? 0,
    moyenne: l?.moyenne ?? null,
  };
}

export async function mesAchats() {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("achats")
    .select("produit, montant, paye_le")
    .order("paye_le", { ascending: false });
  return (data as { produit: string; montant: number | null; paye_le: string }[]) ?? [];
}

/** Les trois conditions du certificat sont-elles remplies ? */
export function certificatMerite(c: Conditions) {
  return (
    c.tps_total > 0 &&
    c.tps_rendus >= c.tps_total &&
    c.corrections >= c.corrections_dues &&
    (c.moyenne ?? 0) >= 12
  );
}

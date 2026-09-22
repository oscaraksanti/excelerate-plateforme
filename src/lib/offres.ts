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
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  //  Le filtre est explicite, et il doit l'être : la règle d'accès dit
  //  « les miens OU je suis administrateur ». Sans ce `eq`, Oscar
  //  reçoit les achats de tout le monde comme s'ils étaient les siens
  //  — sa page de paiement lui répondrait « c'est déjà à toi », et sa
  //  page de remerciement lui montrerait l'achat d'un autre.
  const { data } = await supabase
    .from("achats")
    .select("produit, montant, paye_le")
    .eq("profil_id", auth.user.id)
    .order("paye_le", { ascending: false });
  return (data as { produit: string; montant: number | null; paye_le: string }[]) ?? [];
}

/**
 * Le dernier achat de cette heure-ci, s'il y en a un.
 *
 * La page de remerciement ne sait pas quel produit vient d'être payé :
 * la redirection ne le dit pas, et on ne veut pas qu'elle le dise —
 * ce serait une affirmation venue du navigateur. On prend donc le plus
 * récent, à condition qu'il soit vraiment récent.
 */
export async function achatRecent(fenetreMs = 60 * 60 * 1000) {
  const achats = await mesAchats();
  const limite = Date.now() - fenetreMs;
  return achats.find((a) => new Date(a.paye_le).getTime() > limite) ?? null;
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

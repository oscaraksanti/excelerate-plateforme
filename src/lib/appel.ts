import { clientAdmin } from "@/lib/supabase/admin";

export type Appel = { lien: string; actif: boolean; duree_min: number };

const DEFAUT: Appel = { lien: "", actif: false, duree_min: 30 };

/**
 * Le rendez-vous privé du cercle (97 $).
 *
 * Lu avec les droits complets : il sert aussi depuis le webhook, où il
 * n'y a personne de connecté. Ne leve jamais — un reglage manquant ne
 * doit pas faire echouer l'enregistrement d'un paiement.
 */
export async function lireAppel(): Promise<Appel> {
  try {
    const { data } = await clientAdmin()
      .from("reglages")
      .select("valeur")
      .eq("cle", "appel_cercle")
      .maybeSingle();
    return { ...DEFAUT, ...((data?.valeur as Partial<Appel>) ?? {}) };
  } catch {
    return DEFAUT;
  }
}

/** Le lien a mettre dans un courriel ou une page, ou rien s'il est eteint. */
export async function lienAppel(): Promise<string | null> {
  const a = await lireAppel();
  return a.actif && a.lien ? a.lien : null;
}

export type Groupe = { lien: string; actif: boolean; nom: string };

const GROUPE_DEFAUT: Groupe = { lien: "", actif: false, nom: "WhatsApp" };

/**
 * Le groupe prive des acheteurs.
 *
 * Meme logique que le rendez-vous : lu avec les droits complets parce
 * qu'il sert depuis le webhook, ou personne n'est connecte, et ne leve
 * jamais — un reglage manquant ne doit pas faire echouer un paiement.
 */
export async function lireGroupe(): Promise<Groupe> {
  try {
    const { data } = await clientAdmin()
      .from("reglages")
      .select("valeur")
      .eq("cle", "groupe_prive")
      .maybeSingle();
    return { ...GROUPE_DEFAUT, ...((data?.valeur as Partial<Groupe>) ?? {}) };
  } catch {
    return GROUPE_DEFAUT;
  }
}

/** Le lien a glisser dans un courriel, ou rien s'il est eteint. */
export async function lienGroupe(): Promise<string | null> {
  const g = await lireGroupe();
  return g.actif && g.lien ? g.lien : null;
}

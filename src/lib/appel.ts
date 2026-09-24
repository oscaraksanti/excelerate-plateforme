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

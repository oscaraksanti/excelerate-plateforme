import "server-only";

export type Places = { total: number; prises: number; restantes: number };

/**
 * Les places bonus encore libres.
 *
 * Annoncer « les dix premiers » sans compteur, c'est de la rareté
 * fausse — et ce public en a déjà vu cent. Ce nombre-ci est compté
 * dans la table des achats, à chaque affichage.
 *
 * Ne lève jamais : un compteur en panne ne doit pas emporter la page
 * d'accueil le soir du lancement. Il disparaît, la page reste.
 */
export async function placesBonus(): Promise<Places | null> {
  try {
    const { clientAdmin } = await import("@/lib/supabase/admin");
    const { data, error } = await clientAdmin().rpc("places_restantes");
    if (error) return null;
    const l = (Array.isArray(data) ? data[0] : data) as Places | undefined;
    if (!l) return null;
    return {
      total: Number(l.total ?? 0),
      prises: Number(l.prises ?? 0),
      restantes: Number(l.restantes ?? 0),
    };
  } catch {
    return null;
  }
}

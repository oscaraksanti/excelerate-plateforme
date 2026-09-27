import "server-only";
import { clientAdmin } from "@/lib/supabase/admin";

/**
 * Combien de personnes ont deja un compte.
 *
 * La page d'accueil n'a aucune preuve sociale vivante : la seule
 * chiffree est une video YouTube. Un compteur reel, arrondi vers le
 * bas, en est une — et il se refait tout seul, contrairement a un
 * nombre ecrit en dur qui vieillit mal.
 *
 * Arrondi a la dizaine inferieure : personne n'a besoin de l'unite, et
 * un nombre rond se retient. Ne leve jamais.
 */
export async function nombreApprenants(): Promise<number | null> {
  try {
    const { count } = await clientAdmin()
      .from("profils")
      .select("id", { count: "exact", head: true })
      .eq("role", "apprenant");

    if (!count || count < 50) return null;
    return Math.floor(count / 10) * 10;
  } catch {
    return null;
  }
}

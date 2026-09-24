import "server-only";
import { lireFiche, type Fiche } from "@/lib/fiche";
import { clientServeur } from "@/lib/supabase/serveur";

/**
 * Mon propre dossier.
 *
 * Même lecture que la fiche d'administration, mais verrouillée sur
 * l'identité de l'appelant : on ne passe jamais d'identifiant venu du
 * navigateur. C'est la seule raison pour laquelle on peut se permettre
 * les droits complets ici.
 *
 * La page, elle, doit encore respecter le verrou des pairs : la fiche
 * rend la note même quand les corrections ne sont pas faites, et ce
 * serait contourner la règle que de l'afficher.
 */
export async function monParcours(): Promise<Fiche | null> {
  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  return lireFiche(auth.user.id);
}

export type { Fiche, TravauxTp, Certificat } from "@/lib/fiche";

import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { clientServeur } from "@/lib/supabase/serveur";

/**
 * Arrivee du lien recu par email.
 *
 * On utilise `token_hash` plutot que le flux PKCE : c'est le seul qui
 * fonctionne quand la personne demande le lien sur son ordinateur et
 * l'ouvre sur son telephone — ce qui sera le cas de beaucoup.
 */
export async function GET(requete: NextRequest) {
  const parametres = requete.nextUrl.searchParams;
  const jeton = parametres.get("token_hash");
  const type = parametres.get("type") as EmailOtpType | null;
  const suite = parametres.get("suite") ?? "/tableau-de-bord";

  const versConnexion = (raison: string) =>
    NextResponse.redirect(new URL(`/connexion?probleme=${raison}`, requete.url));

  if (!jeton || !type) return versConnexion("lien-incomplet");

  const supabase = await clientServeur();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: jeton });

  if (error) return versConnexion("lien-expire");

  // Chemin relatif uniquement : empeche une redirection vers un site tiers.
  const destination = suite.startsWith("/") && !suite.startsWith("//")
    ? suite
    : "/tableau-de-bord";

  return NextResponse.redirect(new URL(destination, requete.url));
}

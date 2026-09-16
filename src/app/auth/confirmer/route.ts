import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { clientServeur } from "@/lib/supabase/serveur";

const TYPES_CONNUS: EmailOtpType[] = [
  "email",
  "signup",
  "magiclink",
  "recovery",
  "invite",
  "email_change",
];

/**
 * Arrivee du lien recu par email.
 *
 * Trois formes possibles selon le gabarit et le parcours :
 *
 *  1. token_hash + type  — la bonne. Fonctionne meme si la personne
 *     demande le lien sur son ordinateur et l'ouvre sur son telephone.
 *  2. token_hash seul    — gabarit ou le type a saute. On retombe sur
 *     "email", qui couvre inscription et reconnexion.
 *  3. code               — gabarit Supabase par defaut, flux PKCE. Ne
 *     marche que sur l'appareil qui a demande le lien, d'ou le message
 *     d'erreur specifique quand il echoue.
 *
 * On traite les trois : un seul gabarit mal recopie ne doit pas bloquer
 * quelqu'un a la porte un dimanche soir.
 */
export async function GET(requete: NextRequest) {
  const parametres = requete.nextUrl.searchParams;
  const jeton = parametres.get("token_hash");
  const typeBrut = parametres.get("type");
  const code = parametres.get("code");
  // La destination vient du cookie pose au moment de la demande ; le
  // parametre d'URL reste accepte pour les anciens liens en circulation.
  const magasin = await cookies();
  const suite =
    parametres.get("suite") ?? magasin.get("suite")?.value ?? "/tableau-de-bord";
  magasin.delete("suite");

  // Chemin relatif uniquement : empeche une redirection vers un site tiers.
  const destination =
    suite.startsWith("/") && !suite.startsWith("//") ? suite : "/tableau-de-bord";

  const echec = (raison: string) =>
    NextResponse.redirect(new URL(`/connexion?probleme=${raison}`, requete.url));

  const supabase = await clientServeur();

  if (jeton) {
    const type = (
      typeBrut && (TYPES_CONNUS as string[]).includes(typeBrut) ? typeBrut : "email"
    ) as EmailOtpType;

    const { error } = await supabase.auth.verifyOtp({ type, token_hash: jeton });
    if (error) return echec("lien-expire");
    return NextResponse.redirect(new URL(destination, requete.url));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return echec("autre-appareil");
    return NextResponse.redirect(new URL(destination, requete.url));
  }

  return echec("lien-incomplet");
}

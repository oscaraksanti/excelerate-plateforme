import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { adresseDeLAppareil, COOKIE_APPAREIL } from "@/lib/appareil";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";

/**
 * Rouvrir une session en silence, sur un navigateur déjà reconnu.
 *
 * Le proxy envoie ici quand il ne trouve pas de session mais qu'un
 * jeton d'appareil traîne. On fabrique un lien de connexion côté
 * serveur — `generateLink` ne poste aucun courriel, il rend juste le
 * jeton — et on le consomme immédiatement. La personne ne voit rien :
 * elle était sur /modules, elle arrive sur /modules.
 *
 * Si le jeton ne vaut plus rien, on l'efface et on renvoie vers la
 * connexion normale. Jamais de boucle : cette route ne redirige que
 * vers des chemins ouverts ou vers la destination demandée.
 */
export async function GET(requete: NextRequest) {
  const suiteBrute = requete.nextUrl.searchParams.get("suite") ?? "/tableau-de-bord";
  const suite =
    suiteBrute.startsWith("/")
    && !suiteBrute.startsWith("//")
    && !suiteBrute.startsWith("/auth")
      ? suiteBrute
      : "/tableau-de-bord";

  const magasin = await cookies();
  const jeton = magasin.get(COOKIE_APPAREIL)?.value ?? "";

  const abandonner = async (raison: string) => {
    magasin.delete(COOKIE_APPAREIL);
    const vers = new URL("/connexion", requete.url);
    vers.searchParams.set("suite", suite);
    if (raison) vers.searchParams.set("probleme", raison);
    return NextResponse.redirect(vers);
  };

  const email = await adresseDeLAppareil(jeton);
  if (!email) return abandonner("");

  try {
    //  generateLink n'envoie rien : c'est toute la raison d'être de
    //  cette route. Le jeton produit est consommé dans la foulée.
    const { data, error } = await clientAdmin().auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    const hache = data?.properties?.hashed_token;
    if (error || !hache) {
      console.error("[reprise] lien non fabriqué", error?.message);
      return abandonner("");
    }

    const supabase = await clientServeur();
    const { error: echec } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: hache,
    });

    if (echec) {
      console.error("[reprise] session non rouverte", echec.message);
      return abandonner("");
    }
  } catch (e) {
    console.error("[reprise] incident", e);
    return abandonner("");
  }

  return NextResponse.redirect(new URL(suite, requete.url));
}

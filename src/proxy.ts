import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Chemins accessibles sans compte.
 *
 * `/api/chariow` en fait partie : c'est Chariow qui l'appelle, pas un
 * navigateur connecte. Sans cette ligne, la notification de paiement
 * recevrait une redirection vers la page de connexion, et aucun acces
 * ne s'ouvrirait jamais. Ce point d'entree se defend tout seul, par
 * signature.
 */
const OUVERTS = [
  "/",
  "/connexion",
  "/auth",
  "/c",
  "/api/chariow",
  "/mentions-legales",
  "/confidentialite",
  "/cgv",
];

function estOuvert(chemin: string) {
  return OUVERTS.some((o) => chemin === o || chemin.startsWith(`${o}/`));
}

export async function proxy(request: NextRequest) {
  // La reponse est construite d'abord : Supabase y depose les cookies
  // de session rafraichis.
  let reponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(aPoser) {
          aPoser.forEach(({ name, value }) => request.cookies.set(name, value));
          reponse = NextResponse.next({ request });
          aPoser.forEach(({ name, value, options }) =>
            reponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims valide la session aupres de Supabase. Ne pas le remplacer
  // par getSession() : celui-la fait confiance au cookie sans verifier.
  const { data } = await supabase.auth.getClaims();
  const connecte = Boolean(data?.claims);

  const chemin = request.nextUrl.pathname;

  if (!connecte && !estOuvert(chemin)) {
    const versConnexion = request.nextUrl.clone();
    versConnexion.pathname = "/connexion";
    versConnexion.searchParams.set("suite", chemin);
    return NextResponse.redirect(versConnexion);
  }

  if (connecte && chemin === "/connexion") {
    const versAccueil = request.nextUrl.clone();
    versAccueil.pathname = "/tableau-de-bord";
    versAccueil.search = "";
    return NextResponse.redirect(versAccueil);
  }

  return reponse;
}

export const config = {
  // Tout sauf les fichiers statiques, les images et le favicon : sans
  // cette exclusion, la logique d'authentification bloquerait le CSS.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.png|apple-icon.png|opengraph-image.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};

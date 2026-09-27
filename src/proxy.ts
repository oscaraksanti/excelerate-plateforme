import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**  Le nom du cookie, recopie ici : `@/lib/appareil` importe
 *  `server-only` et le client d'administration, qui n'ont rien a
 *  faire dans le proxy. */
const COOKIE_APPAREIL = "appareil";

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
  "/lecons",
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
  //
  // L'appel peut echouer pour une raison qui n'a rien a voir avec la
  // personne — reseau, Supabase qui tousse. Avant, ca la renvoyait a
  // la page de connexion comme si elle n'existait pas. On distingue
  // desormais « pas de session » de « on n'a pas pu savoir ».
  let connecte = false;
  let incertain = false;
  try {
    const { data, error } = await supabase.auth.getClaims();
    connecte = Boolean(data?.claims);
    incertain = Boolean(error) && !data;
  } catch {
    incertain = true;
  }

  const chemin = request.nextUrl.pathname;

  if (!connecte && !estOuvert(chemin)) {
    //  Un doute technique ne doit pas deconnecter quelqu'un : on laisse
    //  passer, la page relira l'identite avec ses propres droits.
    if (incertain) return reponse;

    //  Ce navigateur a deja ete reconnu : on rouvre la session sans
    //  courriel. C'est la raison d'etre de /auth/reprise.
    if (request.cookies.get(COOKIE_APPAREIL)?.value) {
      const versReprise = request.nextUrl.clone();
      versReprise.pathname = "/auth/reprise";
      versReprise.search = "";
      versReprise.searchParams.set("suite", chemin);
      return NextResponse.redirect(versReprise);
    }

    const versConnexion = request.nextUrl.clone();
    versConnexion.pathname = "/connexion";
    versConnexion.searchParams.set("suite", chemin);
    return NextResponse.redirect(versConnexion);
  }

  if (!connecte && chemin === "/connexion"
      && request.cookies.get(COOKIE_APPAREIL)?.value
      && !request.nextUrl.searchParams.has("probleme")) {
    //  Il a un appareil reconnu : inutile de lui montrer un formulaire.
    const versReprise = request.nextUrl.clone();
    versReprise.pathname = "/auth/reprise";
    const suite = request.nextUrl.searchParams.get("suite") ?? "/tableau-de-bord";
    versReprise.search = "";
    versReprise.searchParams.set("suite", suite);
    return NextResponse.redirect(versReprise);
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

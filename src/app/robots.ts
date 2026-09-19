import type { MetadataRoute } from "next";
import { SITE } from "./layout";

/**
 * Ce qui s'explore, et ce qui ne s'explore pas.
 *
 * Tout ce qui est derrière l'authentification renvoie de toute façon
 * une redirection vers la connexion — un robot n'y verrait rien. On le
 * dit quand même : ça évite le gaspillage de budget d'exploration, et
 * ça empêche qu'une URL de session traîne dans l'index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/auth/",
          "/c/",            // les certificats sont nominatifs
          "/connexion",
          "/corrections",
          "/deconnexion",
          "/modules",
          "/offres",
          "/profil",
          "/tableau-de-bord",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}

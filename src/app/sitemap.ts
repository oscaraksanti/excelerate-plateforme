import type { MetadataRoute } from "next";
import { lireModule, sommaireModule } from "@/lib/donnees";
import { SITE } from "./layout";

/**
 * Le plan du site.
 *
 * Les leçons des modules 0 et 1 sont en accès libre depuis la
 * migration 0042 : ce sont les seules pages de contenu que Google peut
 * lire, et les seules qu'on lui annonce. Tout le reste vit derrière un
 * compte et n'a rien à faire ici.
 *
 * La liste vient de la base, pas d'une énumération écrite à la main :
 * le jour où une leçon repasse en accès restreint, elle disparaît du
 * plan toute seule.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maj = new Date();

  const fixes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: maj, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/cgv`, lastModified: maj, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/mentions-legales`, lastModified: maj, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/confidentialite`, lastModified: maj, changeFrequency: "yearly", priority: 0.2 },
  ];

  const lecons: MetadataRoute.Sitemap = [];
  try {
    for (const numero of [0, 1]) {
      const m = await lireModule(numero);
      if (!m) continue;
      const sommaire = await sommaireModule(m.id);
      for (const l of sommaire) {
        if (l.verrouille) continue;
        lecons.push({
          url: `${SITE}/lecons/${numero}/${l.numero}`,
          lastModified: maj,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch {
    //  Un plan de site amputé vaut mieux qu'un plan de site en erreur.
  }

  return [...fixes, ...lecons];
}

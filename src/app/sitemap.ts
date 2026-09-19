import type { MetadataRoute } from "next";
import { SITE } from "./layout";

/**
 * Le plan du site — les seules pages publiques.
 *
 * Le contenu des leçons vit derrière un compte : il n'a rien à faire
 * ici, et l'annoncer ferait perdre son temps au robot.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const maj = new Date();
  return [
    { url: `${SITE}/`, lastModified: maj, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/cgv`, lastModified: maj, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/mentions-legales`, lastModified: maj, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/confidentialite`, lastModified: maj, changeFrequency: "yearly", priority: 0.2 },
  ];
}

import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

/**
 * Rend le markdown d'une lecon en HTML.
 *
 * Seul « < » est neutralise. Aucune balise ne peut donc s'ouvrir, et
 * rien d'ecrit a la main ne s'execute — c'est plus simple et plus sur
 * qu'un nettoyeur, sans dependance lourde cote serveur.
 *
 * « > » est volontairement laisse intact : l'echapper casserait les
 * citations markdown, et seul le chevron ouvrant permet d'injecter du
 * HTML. Un chevron fermant isole est inoffensif.
 */
export function rendreMarkdown(source: string): string {
  if (!source?.trim()) return "";
  return marked.parse(source.replace(/</g, "&lt;"), { async: false });
}

/** Accepte une adresse YouTube complete ou un identifiant nu. */
export function extraireIdYouTube(saisie: string): string | null {
  const t = saisie.trim();
  if (!t) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
  const motifs = [
    /(?:youtube\.com\/watch\?[^#]*\bv=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/(?:embed|live|shorts)\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const m of motifs) {
    const r = t.match(m);
    if (r) return r[1];
  }
  return null;
}

/** « 95 » -> « 1 h 35 » */
export function formaterDuree(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const r = minutes % 60;
  return r ? `${h} h ${String(r).padStart(2, "0")}` : `${h} h`;
}

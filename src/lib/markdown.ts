import { Marked } from "marked";

function echapper(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Le moteur markdown des lecons.
 *
 * Le HTML brut n'est pas execute : il est echappe, donc AFFICHE tel
 * quel. `<script>` se lit, ne s'execute pas ; `<une mesure>` — de la
 * prose, pas une balise — reste visible.
 *
 * La version precedente echappait « < » AVANT d'appeler marked. Ca
 * paraissait plus simple, mais marked re-echappe le « & » a
 * l'interieur des blocs de code : « A1<>B1 » devenait « A1&amp;lt;>B1 »
 * et s'affichait « A1&lt;>B1 ». Toutes les formules contenant <, <=
 * ou <> etaient donc fausses a l'ecran, et recopiees fausses dans
 * Excel. On laisse desormais marked echapper lui-meme, une seule fois,
 * et on neutralise le HTML la ou il apparait.
 */
const moteur = new Marked({ gfm: true, breaks: true });

moteur.use({
  renderer: {
    html({ text }) {
      return echapper(text);
    },
  },
});

/** Rend le markdown d'une lecon en HTML. */
export function rendreMarkdown(source: string): string {
  if (!source?.trim()) return "";
  return moteur.parse(source, { async: false }) as string;
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

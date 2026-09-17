/**
 * Formatages purs, sans acces a la base.
 * Ce fichier est importable depuis un composant client ; `donnees.ts`
 * ne l'est pas, puisqu'il ouvre une connexion cote serveur.
 */

export function formaterTaille(octets: number | null): string {
  if (!octets) return "";
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

export function formaterDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format attendu par un champ datetime-local. */
export function pourChampDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** L'etat d'un TP a l'instant present. */
export function etatTp(tp: {
  ouvre_le: string | null;
  ferme_le: string | null;
}): "a_venir" | "ouvert" | "ferme" {
  const maintenant = Date.now();
  if (tp.ouvre_le && new Date(tp.ouvre_le).getTime() > maintenant) return "a_venir";
  if (tp.ferme_le && new Date(tp.ferme_le).getTime() < maintenant) return "ferme";
  return "ouvert";
}

/* ── Bareme de la correction entre pairs ───────────────────────────
   Tout ce qui suit est pur : importable depuis un composant client.
   Regle du projet : rien de ce qui touche a la base ne descend ici. */

export type Critere = { cle: string; titre: string; aide: string };

export const BAREME = [
  { note: 0, mot: "absent" },
  { note: 1, mot: "insuffisant" },
  { note: 2, mot: "correct" },
  { note: 3, mot: "bien" },
  { note: 4, mot: "exemplaire" },
];

export function criteresDe(brut: unknown): Critere[] {
  if (!Array.isArray(brut)) return [];
  return brut.filter(
    (c): c is Critere =>
      typeof c === "object" && c !== null && "cle" in c && "titre" in c,
  );
}

/* ── Le direct ─────────────────────────────────────────────────── */

export type Direct = {
  actif: boolean;
  titre: string;
  lien: string;
  debut_le: string | null;
  duree_min: number;
};

export function formaterDebut(iso: string | null): string {
  if (!iso) return "date non définie";
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Trois moments : avant (compte a rebours), pendant (le direct tourne),
 * apres (on n'affiche plus rien). La duree evite d'avoir a eteindre le
 * bandeau a la main a 21 h.
 */
export function etatDirect(d: Direct, maintenant = Date.now()) {
  if (!d.actif || !d.debut_le) return "eteint" as const;
  const debut = new Date(d.debut_le).getTime();
  const fin = debut + Math.max(15, d.duree_min) * 60_000;
  if (maintenant < debut) return "avant" as const;
  if (maintenant <= fin) return "pendant" as const;
  return "termine" as const;
}

/* ── Le QCM ─────────────────────────────────────────────────────────── */

export type Proposition = { cle: string; texte: string };

export type Genre =
  | "concept" | "pepite" | "diagnostic" | "outil" | "verif_ia" | "piege";

export type EntreeQcm = {
  id: string;
  numero: number;
  genre: Genre;
  enonce: string;
  propositions: Proposition[];
  mon_choix: string | null;
  deja_repondu: boolean;
  bonne: string | null;
  explication: string | null;
};

/** Le libelle affiche a cote d'une question. */
export const GENRES: Record<Genre, string> = {
  concept: "Concept",
  pepite: "Pépite",
  diagnostic: "Diagnostic",
  outil: "Choix d'outil",
  verif_ia: "Vérification IA",
  piege: "Piège",
};

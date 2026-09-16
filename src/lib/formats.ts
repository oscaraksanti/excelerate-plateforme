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

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

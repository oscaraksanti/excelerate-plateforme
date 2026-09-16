/**
 * Remet un numero au format international.
 * « 0971601855 » saisi depuis la RDC devient « +243971601855 ».
 * Sans ca, une bonne partie de la liste WhatsApp est inutilisable.
 */
export function normaliserTelephone(brut: string, indicatifDefaut = "243") {
  const nettoye = brut.replace(/[^\d+]/g, "");
  if (!nettoye) return null;
  if (nettoye.startsWith("+")) return "+" + nettoye.slice(1).replace(/\D/g, "");
  if (nettoye.startsWith("00")) return "+" + nettoye.slice(2);
  if (nettoye.startsWith("0")) return `+${indicatifDefaut}${nettoye.slice(1)}`;
  if (nettoye.startsWith(indicatifDefaut)) return `+${nettoye}`;
  return `+${indicatifDefaut}${nettoye}`;
}

/**
 * Remet un numero au format international.
 *
 * Le piege : supposer un pays. L'audience est panafricaine — Cote
 * d'Ivoire, Cameroun, Senegal, Benin, Tchad, Togo, Burkina, Guinee — et
 * beaucoup de numeros arrivent deja internationaux, mais sans le « + ».
 * Prefixer l'indicatif du formateur a ces numeros-la les detruit.
 *
 * C'est donc la LONGUEUR qui decide, pas le pays : un numero d'abonne
 * local tient en neuf chiffres au plus. Au-dela, les premiers chiffres
 * sont deja un indicatif pays.
 */
export function normaliserTelephone(brut: string, indicatifDefaut = "243") {
  const t = String(brut ?? "").trim();
  if (!t) return null;

  const explicite = t.startsWith("+");
  const chiffres = t.replace(/\D/g, "");
  if (!chiffres) return null;

  // Déjà écrit en international : on ne touche à rien.
  if (explicite) return "+" + chiffres;
  if (chiffres.startsWith("00")) return "+" + chiffres.slice(2);

  // Zéro initial : c'est une écriture locale, on remplace le zéro.
  if (chiffres.startsWith("0")) return `+${indicatifDefaut}${chiffres.slice(1)}`;

  // Ni « + » ni zéro : local sans son zéro, ou international nu.
  return chiffres.length <= 9
    ? `+${indicatifDefaut}${chiffres}`
    : "+" + chiffres;
}

/** Un numero exploitable sur WhatsApp : 8 a 15 chiffres, indicatif compris. */
export function telephonePlausible(numero: string | null): boolean {
  if (!numero) return false;
  const n = numero.replace(/\D/g, "").length;
  return n >= 8 && n <= 15;
}

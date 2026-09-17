import * as XLSX from "xlsx";

/* ══════════════════════════════════════════════════════════════════
   Correction automatique d'un classeur.

   Principe : la grille se deduit du corrige. Chaque cellule qui porte
   une formule dans le corrige est une cellule que l'apprenant devait
   produire, et vaut deux points — un pour la bonne methode, un pour le
   bon resultat. Les donnees sources ne sont jamais notees.
   ══════════════════════════════════════════════════════════════════ */

/** Tolerance sur les nombres : sinon la moitie de la classe echoue sur un arrondi. */
const TOLERANCE = 0.01;

/** Au-dela, on refuse : un classeur de TP ne pese pas dix megaoctets. */
export const TAILLE_MAX = 10 * 1024 * 1024;

/** Les noms de fonctions sont stockes en anglais dans le fichier. */
const FR: Record<string, string> = {
  XLOOKUP: "RECHERCHEX", VLOOKUP: "RECHERCHEV", HLOOKUP: "RECHERCHEH", LOOKUP: "RECHERCHE",
  FILTER: "FILTRE", SORT: "TRIER", SORTBY: "TRIERPAR", UNIQUE: "UNIQUE", SEQUENCE: "SEQUENCE",
  LET: "LET", LAMBDA: "LAMBDA", XMATCH: "EQUIVX", MATCH: "EQUIV", INDEX: "INDEX",
  SUM: "SOMME", SUMIF: "SOMME.SI", SUMIFS: "SOMME.SI.ENS", SUMPRODUCT: "SOMMEPROD",
  COUNT: "NB", COUNTA: "NBVAL", COUNTIF: "NB.SI", COUNTIFS: "NB.SI.ENS",
  AVERAGE: "MOYENNE", AVERAGEIF: "MOYENNE.SI", AVERAGEIFS: "MOYENNE.SI.ENS",
  MAX: "MAX", MIN: "MIN", MEDIAN: "MEDIANE", LARGE: "GRANDE.VALEUR", SMALL: "PETITE.VALEUR",
  ROUND: "ARRONDI", ROUNDUP: "ARRONDI.SUP", ROUNDDOWN: "ARRONDI.INF",
  IF: "SI", IFS: "SI.CONDITIONS", IFERROR: "SIERREUR", IFNA: "SI.NON.DISP", SWITCH: "SI.MULTIPLE",
  AND: "ET", OR: "OU", NOT: "NON",
  TEXT: "TEXTE", TEXTJOIN: "JOINDRE.TEXTE", CONCAT: "CONCAT", CONCATENATE: "CONCATENER",
  LEFT: "GAUCHE", RIGHT: "DROITE", MID: "STXT", LEN: "NBCAR", TRIM: "SUPPRESPACE",
  PROPER: "NOMPROPRE", UPPER: "MAJUSCULE", LOWER: "MINUSCULE", SUBSTITUTE: "SUBSTITUE",
  TEXTSPLIT: "FRACTIONNER.TEXTE", TEXTBEFORE: "TEXTE.AVANT", TEXTAFTER: "TEXTE.APRES",
  TODAY: "AUJOURDHUI", NOW: "MAINTENANT", YEAR: "ANNEE", MONTH: "MOIS", DAY: "JOUR",
  EOMONTH: "FIN.MOIS", DATEDIF: "DATEDIF", NETWORKDAYS: "NB.JOURS.OUVRES", WEEKDAY: "JOURSEM",
  TAKE: "PRENDRE", DROP: "EXCLURE", HSTACK: "ASSEMB.H", VSTACK: "ASSEMB.V",
  CHOOSECOLS: "CHOISIRCOLS", CHOOSEROWS: "CHOISIRLIGNES",
};

export function fr(nom: string): string {
  return FR[nom] ?? nom;
}

/** Les fonctions employees par une formule, prefixes techniques retires. */
export function fonctions(formule: string | undefined): string[] {
  if (!formule) return [];
  const nettoye = String(formule)
    .replace(/"[^"]*"/g, '""')
    .replace(/_xlfn\._xlws\./gi, "")
    .replace(/_xlfn\./gi, "")
    .replace(/_xlws\./gi, "")
    .toUpperCase();

  const vus = new Set<string>();
  const motif = /([A-Z][A-Z0-9_.]*)\s*\(/g;
  let trouve: RegExpExecArray | null;
  while ((trouve = motif.exec(nettoye)) !== null) vus.add(trouve[1]);
  return [...vus];
}

function normaliserTexte(v: unknown): string {
  return String(v).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function memeValeur(a: unknown, b: unknown): boolean {
  if (a === undefined || a === null || b === undefined || b === null) return false;
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= TOLERANCE;
  if (typeof a === "boolean" || typeof b === "boolean") return a === b;
  return normaliserTexte(a) === normaliserTexte(b);
}

export type LigneGrille = {
  genre: "feuille" | "nom" | "cellule";
  ou: string;
  attFn: string;
  renFn: string;
  attVal: string | number | boolean | null;
  renVal: string | number | boolean | null;
  structurel: boolean;
  methode: boolean | null;
  resultat: boolean | null;
  obtenu: number;
  total: number;
};

export type Resultat = {
  lignes: LigneGrille[];
  obtenu: number;
  total: number;
  sur20: number;
  axes: { nom: string; obtenu: number; total: number }[];
};

export class ClasseurInvalide extends Error {}

/**
 * Ouvre un classeur, ou explique pourquoi c'est impossible.
 *
 * SheetJS ne leve pas toujours : un fichier texte ou vide se lit sans
 * erreur et rend un classeur sans feuille. On verifie donc la signature
 * ZIP puis le contenu, au lieu de se fier a l'absence d'exception.
 */
export function ouvrirClasseur(donnees: Buffer | Uint8Array): XLSX.WorkBook {
  const octets = Buffer.from(donnees);

  if (octets.length === 0) {
    throw new ClasseurInvalide("Le fichier est vide.");
  }
  if (octets.length > TAILLE_MAX) {
    throw new ClasseurInvalide("Le fichier dépasse 10 Mo.");
  }
  // Un .xlsx est une archive ZIP : elle commence toujours par « PK ».
  if (!(octets[0] === 0x50 && octets[1] === 0x4b)) {
    throw new ClasseurInvalide(
      "Ce fichier n'est pas un classeur Excel. Enregistre-le au format .xlsx, pas .csv ni .ods.",
    );
  }

  let classeur: XLSX.WorkBook;
  try {
    classeur = XLSX.read(octets, { type: "buffer", cellFormula: true, cellNF: false });
  } catch (err) {
    const m = err instanceof Error ? err.message : "";
    throw new ClasseurInvalide(
      /encrypt|password/i.test(m)
        ? "Ce classeur est protégé par mot de passe. Retire la protection avant de le déposer."
        : "Ce classeur n'a pas pu être ouvert. Il est peut-être endommagé — réenregistre-le depuis Excel.",
    );
  }

  if (!classeur.SheetNames?.length) {
    throw new ClasseurInvalide(
      "Ce classeur ne contient aucune feuille lisible. Réenregistre-le depuis Excel au format .xlsx.",
    );
  }
  return classeur;
}

function afficher(v: unknown): string | number | boolean | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "number" || typeof v === "boolean") return v;
  return String(v);
}

/** Compare une copie au corrige et rend la grille detaillee. */
export function analyser(ref: XLSX.WorkBook, copie: XLSX.WorkBook): Resultat {
  const lignes: LigneGrille[] = [];

  // 1. Les feuilles attendues
  for (const nom of ref.SheetNames) {
    const present = copie.SheetNames.includes(nom);
    lignes.push({
      genre: "feuille", ou: `Feuille « ${nom} »`,
      attFn: "—", renFn: present ? "présente" : "absente",
      attVal: null, renVal: null, structurel: true,
      methode: present, resultat: null,
      obtenu: present ? 1 : 0, total: 1,
    });
  }

  // 2. Les plages nommees
  const nomsCopie = new Set(
    (copie.Workbook?.Names ?? []).map((n) => normaliserTexte(n.Name)),
  );
  for (const n of ref.Workbook?.Names ?? []) {
    if (/^_xlnm\./i.test(n.Name)) continue;
    const present = nomsCopie.has(normaliserTexte(n.Name));
    lignes.push({
      genre: "nom", ou: `Plage nommée « ${n.Name} »`,
      attFn: "—", renFn: present ? "présente" : "absente",
      attVal: null, renVal: null, structurel: true,
      methode: present, resultat: null,
      obtenu: present ? 1 : 0, total: 1,
    });
  }

  // 3. Les cellules a produire : celles qui portent une formule au corrige
  for (const nomFeuille of ref.SheetNames) {
    const feuilleRef = ref.Sheets[nomFeuille] ?? {};
    const feuilleCopie = copie.Sheets[nomFeuille] ?? {};

    for (const adresse of Object.keys(feuilleRef).sort()) {
      if (adresse.startsWith("!")) continue;
      const celluleRef = feuilleRef[adresse] as XLSX.CellObject | undefined;
      if (!celluleRef?.f) continue;

      const celluleCopie = feuilleCopie[adresse] as XLSX.CellObject | undefined;
      const fnsRef = fonctions(celluleRef.f);
      const fnsCopie = fonctions(celluleCopie?.f);

      // Certaines bonnes reponses n'appellent aucune fonction : « =B5/TauxUSD »
      // est exactement ce qu'on enseigne — une division qui pointe vers la
      // cellule de taux nommee. Exiger une fonction la rendrait impossible a
      // reussir. Dans ce cas, la methode, c'est d'avoir calcule plutot que
      // d'avoir tape le chiffre : il suffit qu'une formule soit presente.
      const okMethode =
        fnsRef.length > 0
          ? fnsRef.every((x) => fnsCopie.includes(x))
          : Boolean(celluleCopie?.f);

      const okValeur = celluleCopie ? memeValeur(celluleRef.v, celluleCopie.v) : false;

      lignes.push({
        genre: "cellule",
        ou: `${nomFeuille}!${adresse}`,
        attFn: fnsRef.map(fr).join(" · ") || "une formule",
        renFn: fnsCopie.length
          ? fnsCopie.map(fr).join(" · ")
          : celluleCopie
            ? "valeur saisie à la main"
            : "cellule vide",
        attVal: afficher(celluleRef.v),
        renVal: afficher(celluleCopie?.v),
        structurel: false,
        methode: okMethode,
        resultat: okValeur,
        obtenu: (okMethode ? 1 : 0) + (okValeur ? 1 : 0),
        total: 2,
      });
    }
  }

  let obtenu = 0, total = 0, mO = 0, mT = 0, rO = 0, rT = 0, sO = 0, sT = 0;
  for (const l of lignes) {
    obtenu += l.obtenu;
    total += l.total;
    if (l.structurel) { sO += l.obtenu; sT += l.total; }
    else {
      mT += 1; if (l.methode) mO += 1;
      rT += 1; if (l.resultat) rO += 1;
    }
  }

  return {
    lignes, obtenu, total,
    sur20: total ? Math.round((obtenu / total) * 20 * 10) / 10 : 0,
    axes: [
      { nom: "La bonne méthode", obtenu: mO, total: mT },
      { nom: "Le bon résultat", obtenu: rO, total: rT },
      { nom: "La structure du classeur", obtenu: sO, total: sT },
    ],
  };
}

/** Combien de points la grille deduite du corrige contient-elle ? */
export function apercuGrille(ref: XLSX.WorkBook) {
  const vide = analyser(ref, { SheetNames: [], Sheets: {} } as XLSX.WorkBook);
  return {
    total: vide.total,
    cellules: vide.lignes.filter((l) => l.genre === "cellule").length,
    feuilles: vide.lignes.filter((l) => l.genre === "feuille").length,
    noms: vide.lignes.filter((l) => l.genre === "nom").length,
  };
}

# GLOSSAIRE FR ↔ EN
### Les fonctions du programme, dans les deux langues

> **À quoi ça sert :** l'IA répond presque toujours en anglais. `=XLOOKUP(` dans un Excel français renvoie `#NOM?`.
> C'est le **risque n° 2** du programme. Le bloc **E** de C.L.E.A.R. le prévient ; ce glossaire le répare.
> À afficher à l'écran dans chaque leçon IA, et à fournir en PDF dans le Kit.

---

## Recherche et référence

| Français | English | Module |
|---|---|:--:|
| `RECHERCHEX` | `XLOOKUP` | M1 |
| `EQUIVX` | `XMATCH` | M4 |
| `RECHERCHEV` | `VLOOKUP` | M1, M4 |
| `RECHERCHEH` | `HLOOKUP` | M4 |
| `INDEX` | `INDEX` | M4 |
| `EQUIV` | `MATCH` | M4 |
| `DECALER` | `OFFSET` | M4 |
| `INDIRECT` | `INDIRECT` | M3 |
| `CHOISIR` | `CHOOSE` | M4 |
| `LIREDONNEESTABCROISDYNAMIQUE` | `GETPIVOTDATA` | M5 |

## Matrices dynamiques

| Français | English | Version |
|---|---|:--:|
| `FILTRE` | `FILTER` | 2021+ |
| `TRIER` | `SORT` | 2021+ |
| `TRIERPAR` | `SORTBY` | 2021+ |
| `UNIQUE` | `UNIQUE` | 2021+ |
| `SEQUENCE` | `SEQUENCE` | 2021+ |
| `NBSI.ENS` sur matrice | — | — |
| `ASSEMB.V` | `VSTACK` | **2024+** |
| `ASSEMB.H` | `HSTACK` | **2024+** |
| `PRENDRE` | `TAKE` | **2024+** |
| `EXCLURE` | `DROP` | **2024+** |
| `CHOISIRCOLS` | `CHOOSECOLS` | **2024+** |
| `ENCOL` | `TOCOL` | **2024+** |
| `GROUPER.PAR` | `GROUPBY` | M365 |

## Logique

| Français | English |
|---|---|
| `SI` | `IF` |
| `SI.CONDITIONS` | `IFS` |
| `SI.MULTIPLE` | `SWITCH` |
| `ET` / `OU` / `NON` / `OUX` | `AND` / `OR` / `NOT` / `XOR` |
| `SIERREUR` | `IFERROR` |
| `SI.NON.DISP` | `IFNA` |
| `ESTNUM` / `ESTTEXTE` / `ESTVIDE` | `ISNUMBER` / `ISTEXT` / `ISBLANK` |
| `ESTERREUR` / `ESTNA` | `ISERROR` / `ISNA` |

## Statistiques et agrégation

| Français | English |
|---|---|
| `SOMME` | `SUM` |
| `MOYENNE` | `AVERAGE` |
| `NB` / `NBVAL` / `NB.VIDE` | `COUNT` / `COUNTA` / `COUNTBLANK` |
| `NB.SI` / `NB.SI.ENS` | `COUNTIF` / `COUNTIFS` |
| `SOMME.SI` / `SOMME.SI.ENS` | `SUMIF` / `SUMIFS` |
| `MOYENNE.SI.ENS` | `AVERAGEIFS` |
| `MAX.SI.ENS` / `MIN.SI.ENS` | `MAXIFS` / `MINIFS` |
| `SOMMEPROD` | `SUMPRODUCT` |
| `SOUS.TOTAL` | `SUBTOTAL` |
| `AGREGAT` | `AGGREGATE` |
| `MEDIANE` / `ECARTYPE.STANDARD` | `MEDIAN` / `STDEV.S` |
| `GRANDE.VALEUR` / `PETITE.VALEUR` | `LARGE` / `SMALL` |
| `RANG` / `CENTILE.INCLURE` | `RANK` / `PERCENTILE.INC` |

## Texte

| Français | English |
|---|---|
| `GAUCHE` / `DROITE` / `STXT` | `LEFT` / `RIGHT` / `MID` |
| `NBCAR` | `LEN` |
| `CHERCHE` *(ignore la casse)* | `SEARCH` |
| `TROUVE` *(respecte la casse)* | `FIND` |
| `SUBSTITUE` | `SUBSTITUTE` |
| `REMPLACER` | `REPLACE` |
| `SUPPRESPACE` | `TRIM` |
| `EPURAGE` | `CLEAN` |
| `MAJUSCULE` / `MINUSCULE` / `NOMPROPRE` | `UPPER` / `LOWER` / `PROPER` |
| `CONCAT` / `JOINDRE.TEXTE` | `CONCAT` / `TEXTJOIN` |
| `TEXTE` | `TEXT` |
| `CNUM` / `CTXT` | `VALUE` / `FIXED` |
| `EXACT` | `EXACT` |
| `CAR` / `CODE` | `CHAR` / `CODE` |
| `FRACTIONNER.TEXTE` | `TEXTSPLIT` *(2024+)* |
| `TEXTE.AVANT` / `TEXTE.APRÈS` | `TEXTBEFORE` / `TEXTAFTER` *(2024+)* |

## Dates et heures

| Français | English |
|---|---|
| `AUJOURDHUI` / `MAINTENANT` | `TODAY` / `NOW` |
| `DATE` / `ANNEE` / `MOIS` / `JOUR` | `DATE` / `YEAR` / `MONTH` / `DAY` |
| `JOURSEM` | `WEEKDAY` |
| `NO.SEMAINE.ISO` | `ISOWEEKNUM` |
| `FIN.MOIS` | `EOMONTH` |
| `MOIS.DECALER` | `EDATE` |
| `NB.JOURS.OUVRES.INTL` | `NETWORKDAYS.INTL` |
| `SERIE.JOUR.OUVRE.INTL` | `WORKDAY.INTL` |
| **`DATEDIF`** *(absente de tous les menus)* | `DATEDIF` |
| `FRACTION.ANNEE` | `YEARFRAC` |
| `DATEVAL` / `TEMPSVAL` | `DATEVALUE` / `TIMEVALUE` |

## Mathématiques et arrondi

| Français | English |
|---|---|
| `ARRONDI` / `ARRONDI.SUP` / `ARRONDI.INF` | `ROUND` / `ROUNDUP` / `ROUNDDOWN` |
| `ENT` / `TRONQUE` | `INT` / `TRUNC` |
| `MOD` | `MOD` |
| `ABS` / `SIGNE` | `ABS` / `SIGN` |
| `PLAFOND.MATH` / `PLANCHER.MATH` | `CEILING.MATH` / `FLOOR.MATH` |
| `ALEA` / `ALEA.ENTRE.BORNES` | `RAND` / `RANDBETWEEN` |
| `CONVERT` | `CONVERT` |

## Finance *(module 9)*

| Français | English |
|---|---|
| `VAN` | `NPV` |
| `TRI` / `TRIM` | `IRR` / `MIRR` |
| `VPM` | `PMT` |
| `VA` / `VC` | `PV` / `FV` |
| `NPM` / `TAUX` | `NPER` / `RATE` |
| `AMORLIN` / `DDB` | `SLN` / `DDB` |

## Divers

| Français | English |
|---|---|
| `LET` | `LET` |
| `LAMBDA` | `LAMBDA` *(2024+)* |
| `TRANSPOSE` | `TRANSPOSE` |
| `LIGNE` / `COLONNE` | `ROW` / `COLUMN` |
| `LIGNES` / `COLONNES` | `ROWS` / `COLUMNS` |
| `ADRESSE` | `ADDRESS` |
| `CELLULE` / `TYPE.ERREUR` | `CELL` / `ERROR.TYPE` |
| `FORMULETEXTE` | `FORMULATEXT` |

---

## Les pièges de traduction qui coûtent le plus cher

| Le piège | Ce qui se passe |
|---|---|
| **Le séparateur d'arguments** | L'IA écrit `=SI(A1>0,"oui","non")`. En français il faut `;`. **C'est l'erreur n° 1, dans 7 cas sur 10.** |
| **La décimale** | `0.5` en anglais, `0,5` en français. Une formule juste devient `#VALEUR!`. |
| `CHERCHE` vs `TROUVE` | `SEARCH` ignore la casse, `FIND` la respecte. L'inverse de ce que les noms français laissent croire. |
| `NOMPROPRE` | `PROPER` met une majuscule après chaque espace — y compris dans « Jean-pierre » → « Jean-Pierre », mais aussi « N'djamena » → « N'Djamena ». Vérifier. |
| **Les noms de mois et de jours** | `TEXTE(A1;"mmmm")` dépend de la langue d'Excel, pas de la formule. |

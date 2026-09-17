# MATRICE DE COMPATIBILITÉ

> ⚠️ **Base de travail. À vérifier sur des installations réelles avant tout tournage.**
> Microsoft déplace ces lignes régulièrement. Afficher la date de dernière vérification, réviser tous les 6 mois.
> **Dernière vérification : à faire — jeudi 17 septembre 2026.**

---

## 1. Le tableau

| Fonctionnalité | 2016 | 2019 | 2021 | **2024** | M365 | Web | Mac |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| `SOMME.SI.ENS`, `NB.SI.ENS` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `SOMMEPROD` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tableaux structurés (`Ctrl+L`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `SI.CONDITIONS`, `JOINDRE.TEXTE`, `CONCAT`, `MAX.SI.ENS` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **`RECHERCHEX`, `EQUIVX`** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Matrices dynamiques** (`FILTRE`, `TRIER`, `UNIQUE`, `SEQUENCE`) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **`LET`** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `LAMBDA` + `PARLIGNE`/`MAP`/`REDUCE`/`SCAN` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `ASSEMB.V`/`ASSEMB.H`, `PRENDRE`/`EXCLURE`, `CHOISIRCOLS` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `FRACTIONNER.TEXTE`, `TEXTE.AVANT`/`TEXTE.APRÈS` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `GROUPER.PAR` / `TABLEAU.CROISE.PAR` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Fonctions REGEX | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Cases à cocher natives | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Copilot dans Excel** | ❌ | ❌ | ❌ | ❌ | ✅ *(licence)* | ✅ | ✅ |
| **Python in Excel (`=PY`)** | ❌ | ❌ | ❌ | ❌ | ✅ | partiel | ✅ |
| Power Query | ✅ | ✅ | ✅ | ✅ | ✅ | **très limité** | limité |
| Power Pivot / DAX | selon édition | selon édition | selon édition | selon édition | ✅ | ❌ | ❌ |
| Solveur / Utilitaire d'analyse | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| VBA / macros | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | limité |
| Office Scripts | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## 2. Ce que ça implique pour ce programme

### 🔴 La ligne qui décide de tout

**`RECHERCHEX`, `FILTRE`, `TRIER`, `UNIQUE` et `LET` n'existent ni en 2016 ni en 2019.**

Or le module 1 — le premier soir, celui qui décide si les gens reviennent — est **entièrement bâti dessus**, parce que c'est ce qui a été vendu aux 1 837 inscrits.

**Les trois parades, annoncées le dimanche 20 et rappelées lundi à 19 h 05 :**

| Parade | Ce qu'on y gagne | Ce qu'on y perd |
|---|---|---|
| **Office 2024** — distribué aux inscrits | Tout le programme, c'est la version de référence | Rien. C'est la voie normale. |
| **Excel pour le web** — gratuit, compte Microsoft | `RECHERCHEX`, matrices dynamiques, tableaux structurés, TCD | **Power Query quasi inexistant** → insuffisant pour le soir 3 et le module 7. Pas de Power Pivot, pas de VBA. |
| **Google Sheets** — gratuit | `XLOOKUP`, `FILTER`, `SORT`, `UNIQUE`, `QUERY`, fonctions personnalisées | Tout est en anglais. Pas de Power Query ni de TCD Excel. |

> **Ce qui se dit à l'écran, dimanche :** « Si tu es en 2016 ou 2019, tu ne pourras pas taper la formule de lundi soir. Tu as trois options, elles sont toutes gratuites, et on les règle **ce soir**, pas lundi à 19 h 15. »

### Les trois pièges à ne jamais commettre

**1. `LAMBDA`, `ASSEMB.V` et `FRACTIONNER.TEXTE` n'existent pas en 2021.**
Toute leçon qui les utilise porte l'encart **« ⚠️ Excel 2024 et 365 uniquement »** et fournit l'alternative :

| 2024+ | Alternative 2021 |
|---|---|
| `LAMBDA` | `LET` + noms définis, ou colonne intermédiaire |
| `ASSEMB.V` | Copier-coller, ou Power Query « Ajouter des requêtes » |
| `FRACTIONNER.TEXTE` | Texte en colonnes, ou `GAUCHE`/`STXT`/`CHERCHE` |
| `TEXTE.AVANT` / `TEXTE.APRÈS` | `GAUCHE(A1;CHERCHE("-";A1)-1)` |

**2. `=PY()` n'existe ni en 2021 ni en 2024.** Leçon bonus informative, jamais un module.

**3. Copilot dans Excel n'existe pas sur les versions cibles.** Même si Microsoft y propose des modèles Anthropic ou OpenAI selon la licence, cela ne concerne que Microsoft 365. **Ne pas le vendre — le retourner en argument :**

> « Microsoft réserve l'IA à l'abonnement. Nous, on la branche par l'extérieur. Ça marche avec la licence que vous avez déjà. »

### Mac

Pas de Power Pivot, Power Query limité, VBA bridé. **Les modules 8 et 10 sont dégradés sur Mac.** Deux options : exclure Mac de la promesse, ou fournir une fiche d'écarts. Vu la part réelle de Mac dans le public, **une mention honnête suffit** — mais elle doit exister avant la vente.

---

## 3. La procédure de vérification, à faire une fois

Sur une machine réelle par version disponible :

1. Taper `=RECHERCHEX(` — l'autocomplétion la propose-t-elle ?
2. Taper `=UNIQUE(A1:A10)` — déborde-t-elle, ou renvoie-t-elle `#NOM?` ?
3. `Données > Obtenir des données` — Power Query est-il présent ?
4. `Fichier > Options > Compléments > Compléments COM` — Power Pivot est-il listé ?
5. `Fichier > Compte` — noter la version exacte et le canal de mise à jour

Reporter la date de vérification en haut de ce fichier.

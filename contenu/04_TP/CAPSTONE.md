# 🏆 CAPSTONE — « EXCEL AI BUSINESS ANALYST »
### **Livré et en ligne** · lancement **vendredi 2 octobre** · dépôt jusqu'au **dimanche 11 octobre**

> **Condition du certificat *Avancé*.** Un capstone rendu, trois corrections faites, et une note ≥ 12/20.

## Où il vit

**Deuxième TP du module 10** *(`tps.numero = 2`)*. Toute la mécanique existante — dépôt, correction automatique, attribution des corrections croisées, médiane, courrier — fonctionne **sans une ligne de code en plus**. Ce qui change tient en trois réglages : la grille, le poids, et le fichier de départ.

Il est mis en avant sur `/modules`, sous la liste des dix modules, avec son propre bouton.

## Ce qui a été livré

`CAPSTONE.zip` — **1,78 Mo**, et tout est dedans :

| | |
|---|---|
| `Sources/` | **les 21 fichiers** |
| `CAPSTONE_DEPART.xlsx` | les 7 feuilles imposées, vides |
| `CAPSTONE_BRIEF.md` | la note de la direction — quatre phrases |
| `CAPSTONE_GRILLE.md` | la grille de correction entre pairs, en cases à cocher |
| `CAPSTONE_SOUTENANCE.md` | **la banque de 27 questions**, publiée exprès |

Plus `CAPSTONE_CORRIGE.xlsx` dans le dépôt privé, et **4 schémas** dans `/lecons/capstone/`.

## Les 21 sources

Périmètre : les **grands comptes**, exercice du 1er octobre 2025 au 30 septembre 2026, six agences, trois devises. C'est un sous-ensemble assumé — **il ne se compare pas au consolidé du module 5**, qui est au grain du ticket.

| | Fichiers | Le défaut, délibéré |
|---|---|---|
| Ventes | `V01` → `V04` | un standard · un avec titre et ligne vide · un aux colonnes réordonnées · un avec une colonne en plus |
| Stocks | `S01` → `S03` | croisés, mois en colonnes · un en ordre inverse · un avec un titre au-dessus |
| Référentiels et budgets | `R01` → `R04`, `B01`, `B02` | budget croisé ; **18 clients à défaut de saisie** *(insécables, casse, accents perdus)* |
| Charges et historique | `C01`, `H01` | charges en devise locale, historique déjà en USD |
| Comptabilité | 5 × `CPT_*.csv` | cp1252 + `;` · utf-8 BOM · dates `mm/dd/yyyy` · montants négatifs |
| Facture | `F01_Facture_photo.jpg` | photographiée de travers, total imprimé en contrôle |

**26 637 lignes · 9 464 factures · 9 465 écritures · 600 clients · 54 références.**

## Le cœur : le rapprochement

Deux vues du même chiffre d'affaires, à deux **grains différents** — la ligne de facture d'un côté, la facture de l'autre. L'écart brut vaut **7 192,74 USD**, et il s'explique en entier :

| | Famille | Nombre | Montant USD |
|---|---|:--:|---:|
| ① | factures sans écriture comptable | 12 | −17 589,12 |
| ② | écritures sans facture commerciale | 8 | +20 859,90 |
| ③ | montants différents *(remise de fin d'année)* | 23 | −1 911,50 |
| ④ | doublons de saisie comptable | 5 | +5 833,46 |
| | **somme** | | **7 192,74** |
| | **`R_RECONCILIATION`** | | **0** |

> **Le résidu est exactement nul, par construction.** Les deux côtés convertissent par le même chemin — au grain de la ligne, puis agrégé. Deux chemins d'arrondi différents auraient laissé un résidu qui n'est l'écart de rien, et qui brouille les quatre familles.

## Comment la machine note un livrable libre

> **L'architecture est entièrement libre.** Schéma en étoile ou tableaux structurés, DAX ou `SOMME.SI.ENS`, Power Query ou copier-coller documenté.

La machine ne note donc que **deux choses** : les **7 feuilles imposées**, et les **36 cellules** *(26 réponses + 10 contrôles)*.

Et les formules du corrigé sont de simples renvois `=C10` — **elles n'appellent aucune fonction**. Le correcteur accorde alors le point de méthode dès qu'une formule est présente, quel que soit le chemin. Autrement dit, la question posée est : *« l'avez-vous calculé, ou tapé ? »*

**Vérifié :** corrigé **20/20** · départ **1,7/20** · copie entièrement tapée à la main **11,1/20** *(résultat 36/36, méthode 0/36)*.

`poids_machine = 0,30`. Six critères de pairs, médiane de trois. Les cinq points de soutenance sont hors plateforme.

## Ce qui n'est pas dans l'énoncé, et pourquoi

**Les cinq chiffres d'import sont donnés** — lignes, factures, écritures, clients, références. Ils vérifient l'import, pas l'analyse : un apprenant bloqué sur un fichier mal chargé perd trois jours pour rien.

**Aucun montant n'est donné.** C'est le travail. Les seules valeurs annoncées sont celles qui doivent valoir **zéro**.

## Ce qui reste à faire

- [ ] Les **soutenances** : dix minutes, écran partagé, trois questions tirées dans la banque publiée
- [ ] La **correction finale** du formateur — le capstone est le seul livrable que je corrige moi-même ; la plateforme ne modélise pas cette étape
- [ ] Décider si les dates `ouvre_le` / `ferme_le` sont posées en base *(elles sont dans l'énoncé, pas encore appliquées — comme pour tous les autres TP)*

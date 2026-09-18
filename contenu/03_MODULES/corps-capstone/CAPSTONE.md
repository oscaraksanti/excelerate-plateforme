> **Condition du certificat *Excelerate IA — Avancé*.** Un capstone rendu, trois corrections faites, et une note d'au moins **12 sur 20**.

## Le brief

Vous êtes recruté comme analyste de données au siège du **GROUPE BAOBAB**. Votre première mission arrive sous la forme d'un dossier, et de quatre phrases de la direction générale :

> *« On veut savoir où on gagne de l'argent et où on en perd.*
> *On veut le savoir chaque mois, sans vous rappeler.*
> *On veut pouvoir poser des questions auxquelles on n'a pas encore pensé.*
> *Et on veut un document qu'on puisse montrer au conseil. »*

**C'est tout. Le reste, c'est votre travail.**

Personne ne vous dira quelles colonnes croiser, ni quel graphique faire. C'est exactement ce qui se passe le premier lundi d'un poste d'analyste — et c'est ce que ce projet évalue.

## Ce que vous recevez

![Vingt et un fichiers, et aucun au même format](/lecons/capstone/01-sources.svg)

`CAPSTONE_Sources.zip` — **21 fichiers, 1,8 Mo.** Périmètre : les **grands comptes** du groupe, exercice du **1er octobre 2025 au 30 septembre 2026**, six agences, trois devises.

| | |
|---|---|
| **4 classeurs de ventes** | `V01` à `V04`, un par trimestre — et quatre formats différents |
| **3 classeurs de stocks** | `S01` à `S03`, en tableaux croisés, les mois en colonnes |
| **6 référentiels et budgets** | produits, clients, agences, taux de change, budget, objectifs |
| **2 autres classeurs** | charges fixes en devise locale, exercice N-1 déjà en USD |
| **5 exports comptables** | des CSV, avec ce que les CSV ont de pénible |
| **1 facture scannée** | photographiée de travers, avec son total imprimé |

> **Le périmètre est un sous-ensemble assumé.** Il ne se compare pas au consolidé du module 5, qui est au grain du ticket et couvre toute l'activité. Ici on est au grain de la **ligne de facture**, sur les grands comptes seulement.

### Cinq chiffres vous sont donnés, et cinq seulement

Ils vérifient **votre import**, pas votre analyse. Si l'un des cinq ne tombe pas, ne cherchez pas plus loin : quelque chose n'a pas été chargé.

| | |
|---|---:|
| Lignes de vente, les quatre trimestres réunis | **26 637** |
| Factures commerciales distinctes | **9 464** |
| Écritures comptables de vente | **9 465** |
| Clients au référentiel | **600** |
| Références au catalogue | **54** |

**Les montants, eux, ne sont pas donnés.** C'est le travail.

## Les douze livrables

![Douze livrables](/lecons/capstone/03-livrables.svg)

| # | Livrable | Module |
|:--:|---|:--:|
| 1 | **Import Power Query** des 21 sources, avec paramètres | M7 |
| 2 | **Nettoyage** documenté, ordre des opérations respecté | M3 |
| 3 | **Modèle de données** en schéma en étoile + table de calendrier | M8 |
| 4 | **Mesures** — au moins 10, nommées en français métier | M8 |
| 5 | **Réconciliation** commercial / comptable, ses quatre familles d'écarts | M4 |
| 6 | **Tableau de bord** d'une page, interactif, lisible en 8 secondes | M6 |
| 7 | **Analyse de scénarios** — au moins une table de données à deux entrées | M9 |
| 8 | **Automatisation** — une macro ou une requête paramétrée qui rejoue le tout | M10 |
| 9 | **`README`** complet | M9 |
| 10 | **`QUALITE`** — les dix contrôles | M2 |
| 11 | **`ANNEXE_IA`** — au moins **trois** erreurs d'IA détectées et corrigées | tous |
| 12 | **`NOTE_DE_SYNTHESE`** — une page pour le conseil | M6 |

> **Sur Mac ?** Power Pivot n'existe pas. Le livrable 3 se fait alors avec des tableaux structurés et des `RECHERCHEX`, le 4 avec des `SOMME.SI.ENS` nommées. **Dites-le dans le `README`** : les correcteurs ont consigne de ne pas pénaliser une contrainte de plateforme déclarée. Ce qui est noté, ce sont les chiffres et le raisonnement, pas le moteur.

## Le cœur de l'épreuve : le rapprochement

![Le rapprochement, et les quatre seules façons dont deux sources diffèrent](/lecons/capstone/02-quatre-familles.svg)

Vous avez deux vues du même chiffre d'affaires :

- **la vue commerciale** — les quatre classeurs `V0*`, au grain de la **ligne de facture**
- **la vue comptable** — `CPT_Factures.csv`, au grain de la **facture**

Elles ne donnent pas le même total. **Votre travail est d'expliquer l'écart en entier**, et il n'y a que quatre façons dont deux sources peuvent différer :

| | |
|---|---|
| **①** | des factures chez le commercial, **absentes** de la comptabilité |
| **②** | des écritures comptables **sans** facture commerciale |
| **③** | des factures présentes des deux côtés, aux **montants différents** |
| **④** | des **doublons** de saisie |

La feuille `RECONCILIATION` doit les lister toutes les quatre, ligne à ligne, avec leur montant. Et la cellule `R_RECONCILIATION` doit valoir **zéro** :

```
écart brut  −  (① + ② + ③ + ④)  =  0
```

> 🔴 **Tant qu'elle ne vaut pas zéro, une cinquième cause existe et vous ne l'avez pas trouvée.** Ce n'est pas un détail de présentation : c'est la différence entre « il y a un écart » et « voici l'écart ».

### Trois pièges, et ils sont tous délibérés

**Le grain.** Le commercial est à la ligne, la comptabilité à la facture. **Il faut agréger avant de rapprocher** — comparer une ligne à une facture ne donne rien.

**La devise.** Les deux côtés portent des montants en monnaie locale. Rapprochez **dans la devise d'origine**, puis convertissez pour le rapport. L'inverse crée un bruit d'arrondi qui masque les vrais écarts.

**Le libellé.** Dix-huit clients du référentiel portent un défaut de saisie : espaces insécables, casse anormale, accents perdus. **Rapprochez sur le code, jamais sur le nom.** Le contrôle n° 7 de `QUALITE` vous demande d'ailleurs de les compter.

## Le classeur de réponses

Téléchargez **`CAPSTONE_DEPART.xlsx`**. Il contient les **sept feuilles imposées**, et rien d'autre. Tout le reste — l'architecture, les requêtes, le modèle, les mesures — est **entièrement libre**.

| Feuille | Ce qu'on y attend |
|---|---|
| `README` | à quoi sert ce classeur, d'où viennent les données, comment l'actualiser, ce qu'il ne dit pas |
| `RECONCILIATION` | le rapport de rapprochement, les quatre familles, ligne à ligne |
| `DASHBOARD` | une page — ce que le conseil regarde |
| `QUALITE` | les dix contrôles, aucun ne peut échouer |
| `ANNEXE_IA` | les prompts, **trois erreurs d'IA**, et quel `V` a attrapé chacune |
| `NOTE_DE_SYNTHESE` | une page pour le conseil, la recommandation en premier |
| `REPONSES` | les vingt-six cellules notées |

> 💎 **Chaque cellule jaune de `REPONSES` doit porter une FORMULE qui pointe vers votre modèle.**
>
> Peu importe laquelle : `=SOMME(…)`, `=SOMME.SI.ENS(…)`, `=CUBEVALEUR(…)`, un renvoi vers votre tableau de bord. La machine ne juge pas le chemin — elle vérifie qu'il y en a un, et que le chiffre est juste.
>
> **Un chiffre tapé à la main vaut la moitié des points.** C'est voulu : vous avez le bon résultat, vous n'avez pas de modèle.

Les vingt-six cellules couvrent le rapprochement *(quinze)* et l'activité de l'exercice *(onze)* : clients, références, marge, panier moyen, comparaison N-1, agence la plus rentable, mois record, écart au budget. Les libellés sont dans le classeur.

## Les dix contrôles de `QUALITE`

Huit doivent valoir **0**, un doit valoir **18**, deux doivent afficher **`PASS`**. Les libellés sont dans le classeur de départ.

Ils ne sont pas décoratifs : le contrôle n° 8 *(« factures présentes des deux côtés dont les montants diffèrent »)* doit redonner exactement le nombre de la famille ③. Si les deux ne coïncident pas, l'une des deux analyses est fausse.

## La condition qui compte plus que les douze

> ## **Vous devez pouvoir expliquer chaque élément de votre fichier.**
>
> Chaque formule, chaque relation, chaque mesure, chaque étape de requête.
> **Jamais « c'est Claude qui l'a fait ».**

C'est vérifié de deux façons.

**Le `README`** doit expliquer les **choix**, pas seulement les décrire. Pourquoi cette granularité. Pourquoi ce sens de relation. Pourquoi ce taux de change et pas un autre.

**Une soutenance de dix minutes**, en visioconférence, écran partagé : **trois questions tirées au hasard dans votre propre fichier.** La banque de questions est publiée avec ce sujet — non pas pour que vous la révisiez, mais parce qu'un fichier qu'on peut expliquer se construit autrement qu'un fichier qui marche.

**C'est le niveau 8 de l'Échelle, et c'est la thèse du programme.** Le niveau 8 n'est pas au-dessus de l'IA : il en est la condition.

## Comment la note se fait

![Cent points, et trois semaines](/lecons/capstone/04-bareme.svg)

| Critère | Points | Qui |
|---|:--:|---|
| Exactitude et cohérence des chiffres | 25 | machine + pairs |
| Architecture et modélisation | 20 | pairs |
| Qualité et traçabilité des données | 15 | pairs |
| Restitution et lisibilité | 15 | pairs |
| Reproductibilité et documentation | 10 | pairs |
| Usage critique de l'IA | 10 | pairs |
| **Soutenance — expliquer son propre fichier** | **5** | le formateur |

**Sur la plateforme :** la note automatique pèse **30 %**, la médiane de **trois** corrections entre pairs **70 %**. La machine ne vérifie que les vingt-six réponses et les dix contrôles — tout le reste se juge.

**Hors plateforme :** la soutenance, et la correction finale. **Le capstone est le seul livrable du programme que je corrige moi-même.**

## Le calendrier

| | |
|---|---|
| **vendredi 2 octobre** | lancement — les 21 fichiers sont en ligne |
| **dimanche 11 octobre, 23 h 59** | dépôt de la copie |
| **12 → 15 octobre** | trois corrections croisées à rendre |
| **16 → 20 octobre** | soutenances de dix minutes |
| **mercredi 22 octobre** | certificats délivrés |

## Avant de déposer

- [ ] Les cinq chiffres d'import de l'énoncé tombent juste
- [ ] `R_RECONCILIATION` vaut **zéro**
- [ ] `R_CONTROLE` vaut **zéro**
- [ ] Les dix contrôles de `QUALITE` passent
- [ ] Les vingt-six cellules de `REPONSES` portent une **formule**, aucune valeur tapée
- [ ] Le `README` explique les **choix**, pas seulement les données
- [ ] L'`ANNEXE_IA` contient **trois** erreurs d'IA, chacune avec son `V`
- [ ] La `NOTE_DE_SYNTHESE` tient en une page et commence par la recommandation
- [ ] Le classeur s'ouvre sur `DASHBOARD`, curseur en `A1`
- [ ] Vous pouvez expliquer, à voix haute, la cellule la plus compliquée de votre fichier

> **Le dernier point n'est pas une formalité. C'est le sujet.**

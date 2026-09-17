# Module 7 · Leçon 5 — Choisir l'outil, et savoir ne pas automatiser

> **Une requête que personne d'autre ne comprend n'est pas un actif. C'est une dette.**

---

## Le tableau de décision

| La situation | L'outil | Pourquoi |
|---|---|---|
| Une seule fois, jamais à refaire | les formules, ou à la main | monter une requête coûte 45 min |
| **Tous les mois, mêmes fichiers** | **Power Query** | 45 min une fois, puis un clic |
| Plusieurs tables, millions de lignes | le modèle de données *(M8)* | PQ charge, le DAX calcule |
| Mise en page figée, mêmes cellules | `SOMME.SI.ENS` *(M2)* | PQ produit des tables, pas des mises en page |
| Explorer, changer d'angle | le tableau croisé *(M5)* | PQ n'est pas un outil d'exploration |
| 200 fichiers vraiment hétérogènes | un script *(M10)* | PQ n'aime pas l'hétérogène extrême |
| Personne d'autre ne saura reprendre | **y réfléchir à deux fois** | le coût de maintenance est réel |

**Le point d'équilibre : deux mois.** 3 h par mois indéfiniment contre 45 min une fois puis un clic. Sur trois ans, cent heures.

---

## 1 · Le prompt de décision

```
Voici cinq tâches répétitives de mon service :
[pour chacune : ce qu'elle produit, à quelle fréquence,
combien de temps elle prend, qui la fait, et ce qui
change d'une fois à l'autre]

1. Pour chacune, dis-moi l'outil : formules, tableau
   croisé, Power Query, modèle de données, ou script.
   Un seul par tâche, et justifie en deux lignes.
2. Estime le temps de mise en place et le point
   d'équilibre en nombre d'occurrences.
3. Classe-les par gain sur douze mois.
4. Dis-moi laquelle NE PAS automatiser, et pourquoi.
5. Pour celle que je vais automatiser en premier : qui
   d'autre, dans mon service, doit savoir l'actualiser,
   et qu'est-ce qu'il faut lui écrire.
```

**Le point 4 distingue quelqu'un qui maîtrise un outil de quelqu'un qui en est content.**
**Le point 5 est celui qui fait qu'on vous confiera la suivante.**

---

## 2 · Le prompt de reprise d'un classeur hérité

```
J'ai récupéré un classeur avec des requêtes Power Query
que je n'ai pas écrites. Voici ce que je vois :
- les noms des requêtes : [liste-les]
- les étapes de la requête principale : [liste-les]
- le volet Dépendances montre : [décris]

1. Reconstitue ce que ce classeur fait, requête par
   requête, en français simple.
2. Signale-moi les étapes qui vont casser : positions,
   chemins en dur, nombres de lignes.
3. Dans quel ordre les corriger sans rien casser.
4. Qu'est-ce que je dois écrire dans un README pour
   que le prochain n'ait pas à refaire ce travail.
```

---

## 3 · Le prompt du README

```
Voici ma requête Power Query :
[les étapes, les paramètres, les sources]

Écris-moi le README que je dois coller dans une feuille
du classeur, pour qu'un collègue puisse actualiser le
mois prochain sans m'appeler.

Il doit contenir, et rien d'autre :
- d'où viennent les données
- le seul paramètre à changer, et où
- la procédure d'actualisation, en trois lignes
- ce que veulent dire PASS, WARNING et FAIL
- les hypothèses qui ne se voient pas dans les données
- quoi faire si le contrôle affiche FAIL

Pas de jargon. Le lecteur ne connaît pas Power Query.
```

---

## Les six limites réelles de Power Query

1. **Pas de vraie boucle.** On applique une fonction à chaque ligne, et c'est tout.
2. **L'hétérogène extrême est hors de portée.** Trois formats, oui. Quarante, non.
3. **Certaines jointures sont lentes** — clés texte, grosses tables, pas de repliage.
4. **La dépendance au chemin est structurelle.** Un paramètre règle le poste voisin, pas le dossier partagé déplacé.
5. **Le débogage est pauvre.** Pas de point d'arrêt : on clique sur une étape et on regarde.
6. **Il ne met rien en forme.**

> 🔴 **La conséquence la plus importante du module :**
> **si vous corrigez quelque chose à la main après le chargement, vous le corrigerez tous les mois.**
> Toute correction doit remonter **dans la requête**.

---

## Ce qui fait qu'une requête survit à son auteur

1. Les **étapes renommées en français**
2. Le **README** avec la procédure d'actualisation
3. La **requête de contrôle**, qui dit elle-même si ça s'est bien passé
4. **Une personne de plus qui sait actualiser** — vingt minutes, et c'est le seul qu'on ne fait jamais

> **Le test, et il est sans appel :** partez en congé. Si on vous appelle le 5 du mois, la requête n'était pas finie.

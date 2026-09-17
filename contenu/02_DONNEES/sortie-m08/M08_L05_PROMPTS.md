# Module 8 · Leçon 5 — Faire concevoir son modèle

> **L'IA propose la structure. Vous apportez les règles.**
> Personne ne peut faire l'un des deux à la place de l'autre.

---

## ① Obtenir un schéma en étoile

```
Je veux concevoir un modèle de données en étoile pour
Power Pivot dans Excel 2024.

MES SOURCES
[pour chaque fichier : son nom, d'où il vient, à quelle
fréquence il arrive, et ses colonnes avec ce que
contient chacune]

MES QUESTIONS MÉTIER
[les dix questions auxquelles le modèle doit répondre,
écrites comme les pose la direction]

CE QUI ME CONTRAINT
[le volume, la fréquence d'actualisation, qui va
maintenir le fichier, quelle version d'Excel]

1. Propose-moi un schéma en étoile : une table de faits,
   les dimensions, les clés, les relations.
2. Écris la phrase « une ligne de la table de faits
   = … ». Si mes sources sont ambiguës là-dessus,
   dis-le et pose-moi la question.
3. Pour chaque colonne de mes sources, dis-moi où elle
   va : faits, quelle dimension, ou nulle part.
4. Quelles questions de ma liste ce modèle ne pourra
   PAS trancher, et qu'est-ce qu'il faudrait y ajouter.
5. Quelles colonnes auront beaucoup de valeurs
   distinctes et coûteront cher en mémoire.
```

**Le point 4 est le seul qui vaille vraiment.** Un schéma qui répond à neuf questions sur dix vous fera perdre six mois si la dixième est celle qu'on pose tous les trimestres.

---

## ② Faire défendre la granularité — ne jamais prendre la première réponse

```
Tu proposes une table de faits à la maille [X].

1. Donne-moi trois questions de ma liste qui
   deviendraient impossibles à cette maille.
2. Propose la maille immédiatement plus fine, et
   dis-moi combien de lignes ça ferait chez moi.
3. Dis-moi ce que je gagne, ce que je perds, et à
   partir de quel volume ça devient déraisonnable.
4. Si tu devais trancher pour quelqu'un qui ne
   reviendra pas dessus avant trois ans, tu
   choisirais laquelle ?
```

**Une granularité se choisit une fois.** On agrège toujours vers le haut, jamais vers le bas.

---

## ③ Les six requêtes M, d'un coup *(bonus Claude Code)*

```
Écris-moi les six requêtes Power Query, en langage M,
qui chargent ces six fichiers CSV dans le modèle de
données :
[les six noms de fichiers, et les colonnes de chacun]

Contraintes communes :
- un paramètre Dossier_Source, aucun chemin en dur
- encodage UTF-8, séparateur point-virgule
- les types posés explicitement à la fin de chaque
  requête, colonne par colonne
- les étapes nommées en français
- toutes en connexion seule + modèle de données

Donne-moi les six en un seul bloc, dans l'ordre de
chargement, et dis-moi lequel charger en premier
et pourquoi.
```

Ce qui change n'est pas la vitesse d'écriture : c'est que **les six requêtes sont cohérentes entre elles**. Écrites une par une, elles divergent toujours.

---

## ④ La documentation du modèle

```
Voici mon modèle terminé :
[les tables, les relations, les mesures avec leur DAX]

Écris la documentation à coller dans une feuille README
du classeur. Le lecteur est un collègue qui ne connaît
pas Power Pivot.

Elle doit contenir, et rien d'autre :
- ce que le modèle permet de répondre, en cinq lignes
- la granularité de la table de faits, en une phrase
- le schéma des relations, en texte
- la définition métier de chaque mesure — pas son DAX,
  sa définition en français
- la procédure d'actualisation
- les trois pièges à connaître avant d'y toucher

Pas de jargon.
```

> **« La définition métier, pas le DAX »** est la consigne qui compte. Le DAX est déjà dans le fichier ; ce qui manque, c'est ce que la mesure **veut dire**.

---

## 🔴 ⑤ Le prompt qui remet chacun à sa place

```
Avant que je construise ce modèle : liste-moi les dix
règles de gestion que tu as dû SUPPOSER pour proposer
ce schéma, et que tu ne peux pas connaître.

Pour chacune, dis-moi quelle serait la conséquence si
la réalité de mon entreprise était différente.
```

**C'est la question qui transforme une proposition en point de départ.**

Elle ne sait pas que chez vous :

- une commande annulée reste dans l'export avec un montant négatif ;
- une agence a changé de plan comptable en mars ;
- les avoirs sont facturés le mois suivant, mais rattachés au mois d'origine ;
- un « client » dans le CRM peut être trois entités juridiques ;
- le mois comptable se ferme le 25.

**Aucune de ces choses n'est dans les données.** Elles sont dans la tête de trois personnes — et c'est exactement ce que `V4 — Vérité métier` va chercher.

---

## Chrono

| | Temps |
|---|---|
| **Classique** — concevoir, discuter, se tromper, reprendre | **1 journée** |
| **Avec l'IA** — sources, schéma, granularité discutée, requêtes | **30 min** |
| **Vérification obligatoire** — règles de gestion, V4, questions non traitables | **1 h** |

**La vérification dure deux fois plus longtemps que la production.** C'est le seul module du programme où c'est le cas — parce qu'une erreur de conception ne se voit pas tout de suite, et se paie six mois plus tard.

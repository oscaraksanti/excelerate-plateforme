# Module 7 · Leçon 4 — Écrire et déboguer du M

> **La ligne à mettre en tête de chaque prompt :**
> *« Je veux du langage M, pour l'éditeur avancé de Power Query. Pas de DAX. »*
>
> Sans elle, vous recevrez du `CALCULATE` une fois sur trois — et le code est refusé avant même de s'exécuter.

---

## La méthode, en quatre temps

**① Faire le geste dans l'interface d'abord.** Toujours, même si ça ne suffit pas. Vous obtenez du M juste, avec les bonnes fonctions et les bons noms de colonnes. C'est un bien meilleur point de départ qu'une description en français.

**② Demander de généraliser.** ③ **Écrire une fonction sur description.** ④ **Déboguer le message d'erreur.**

---

## 1 · Généraliser une étape produite par l'interface

```
Je veux du langage M, pour l'éditeur avancé de Power
Query. Pas de DAX.

Voici une étape générée par l'interface :

[colle le code de la barre de formule]

Elle fonctionne sur un fichier, mais elle est fragile :
[dis précisément ce qui te gêne — noms de colonnes en
dur, nombre de lignes à sauter, ordre des colonnes...]

1. Réécris-la pour qu'elle ne dépende plus de ça.
2. Explique-moi chaque fonction utilisée, en une ligne.
3. Dis-moi ce qui se passe si [le cas limite : colonne
   absente, table vide, valeur nulle].
4. Donne-moi le code final en un seul bloc, prêt à
   coller dans l'éditeur avancé.
```

---

## 2 · Écrire une fonction personnalisée

```
Je veux du langage M. Pas de DAX.

Écris-moi une fonction personnalisée.
Elle prend : [les arguments, avec leur type]
Elle rend : [ce qu'elle doit produire, précisément]

Les cas qu'elle doit traiter :
- [cas 1]
- [cas 2]
- [cas 3]

Contraintes :
- aucune colonne désignée par sa position
- les colonnes manquantes sont créées à vide plutôt
  que de faire échouer la fonction
- les types sont posés explicitement à la fin

Commente chaque étape en français.
```

**Les trois contraintes se recopient telles quelles, à chaque fois.** Sans elles, vous obtenez du code qui marche sur votre exemple et casse le mois suivant.

---

## 3 · Déboguer un message d'erreur

```
Power Query me rend cette erreur :
[colle le message ENTIER, sans le raccourcir]

Voici l'étape sur laquelle elle apparaît :
[colle le code]

Voici les deux ou trois étapes précédentes :
[colle-les]

1. Explique-moi ce que dit vraiment ce message.
2. Donne-moi les deux causes les plus probables,
   dans l'ordre.
3. Pour chacune, comment je la vérifie en trois
   secondes dans l'éditeur.
4. Puis la correction.
```

**Le point 3 est celui qui fait gagner du temps.** Une explication sans vérification vous fait essayer trois corrections au hasard.

---

## 4 · Le prompt de relecture — avant de garder le code

```
Voici une étape M que je m'apprête à garder :
[colle-la]

1. Dépend-elle d'une position, d'un nombre de lignes,
   d'un ordre de colonnes ? Où exactement ?
2. Que se passe-t-il si une colonne est renommée ?
   Si une colonne est ajoutée ? Si un fichier manque ?
3. Y a-t-il un typage explicite à la fin ? Sinon,
   ajoute-le.
4. Comment vérifier en trois secondes que ta version
   donne exactement le même résultat que la mienne
   sur mes données actuelles ?
```

Le point 4 est la règle de base d'une réécriture : **plus robuste doit d'abord vouloir dire identique.**

---

## Les trois choses à savoir sur le M

**① Une requête est un `let … in`** — une suite d'étapes nommées, et le nom de celle qu'on rend. Chaque ligne du volet « Étapes appliquées » est une ligne de ce code.

**② `each` veut dire « pour chaque ligne ».** `_` est la ligne courante, `[Nom]` la colonne `Nom` de cette ligne.

**③ Le M est sensible à la casse.** `Table.SelectRows` marche, `table.selectrows` non. C'est la première cause d'erreur quand on recopie.

---

## M ou DAX — la question qui tranche

> *« Dans quel éditeur est-ce que je vais coller ça ? »*

| | Le M | Le DAX |
|---|---|---|
| Quand | **avant** le chargement | **après** le chargement |
| Quoi | il transforme la donnée | il calcule sur la donnée |
| Où | l'éditeur Power Query | le modèle de données |
| Exécution | à l'actualisation | à chaque clic |
| Casse | sensible | insensible |
| Ça ressemble à | `Table.SelectColumns`, `each`, `let … in` | `CALCULATE`, `SUMX`, `RELATED` |

**C'est `V1 — Version` qui l'attrape**, et c'est la meilleure des erreurs : elle est immédiate et sans conséquence.

---

## Les six erreurs typiques de l'IA sur le M

1. **Elle invente des fonctions.** `Table.RemoveEmptyRows` n'existe pas.
2. **Elle se trompe de casse.** `Text.startsWith`.
3. **Elle mélange les versions d'Excel** — le menu décrit n'existe pas dans votre ruban.
4. **Elle écrit des noms de colonnes en dur** sans qu'on lui demande.
5. **Elle oublie le typage final** — la colonne arrive en `any`.
6. **Elle propose `Table.Buffer` comme remède à tout** — ça casse le repliage de requête.

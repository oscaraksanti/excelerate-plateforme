# Module 5 · Leçon 5 — Interroger ses données en langage naturel

> 🔴 **Ne colle jamais un fichier entier dans une conversation.** Le modèle en lit une partie et complète le reste de façon plausible. Rien, dans sa réponse, ne signale la troncature.

---

## Les quatre blocs — ce qu'on envoie à la place du fichier

**① Les en-têtes, avec le sens de chaque colonne.**
`Montant_USD` ne dit pas si c'est hors taxes, ni si c'est le montant commandé ou facturé. Une ligne par colonne.

**② Trente lignes prises au hasard.**
Jamais les trente premières : un fichier est presque toujours trié.

```
Ajoute une colonne =ALEA(), trie dessus,
prends les trente du haut, supprime la colonne.
```

**③ Les valeurs distinctes de chaque dimension.**

```
=JOINDRE.TEXTE(" ; ";VRAI;TRIER(UNIQUE(t_Ventes[Famille])))
```

**④ Les totaux de contrôle.**
Chiffre d'affaires total, nombre de lignes, nombre de commandes, période couverte. **C'est le bloc qu'on oublie, et c'est le plus utile** : sans lui, personne ne peut voir qu'un résultat est hors échelle.

---

## 1 · 💎💎 Les questions qu'on n'a pas pensé à poser

```
Voici la structure d'un jeu de données et un
échantillon de trente lignes :
[les quatre blocs]

Ne réponds à aucune question pour l'instant.

Dis-moi plutôt : quelles sont les dix questions que
ces données permettent de trancher, et que quelqu'un
dans mon métier aurait intérêt à poser ?

Classe-les de la plus actionnable à la moins
actionnable. Pour chacune, précise en une ligne la
décision qu'elle permettrait de prendre.

Signale-moi séparément les questions que ces données
NE permettent PAS de trancher, et ce qu'il faudrait
y ajouter.
```

**La dernière consigne rapporte le plus.** Savoir ce que vos données ne disent pas, c'est savoir quelle colonne réclamer au service informatique.

---

## 2 · Demander la configuration, jamais le chiffre

```
Pour la question n° 3 de ta liste, donne-moi la
configuration exacte du tableau croisé : lignes,
colonnes, valeurs, filtres, et l'affichage à choisir
dans « Afficher les valeurs ».

Dis-moi aussi ce que je dois vérifier dans le
résultat pour savoir que je ne me suis pas trompé
de configuration.
```

---

## 3 · Faire écrire les contrôles AVANT l'analyse

```
Avant de m'aider à analyser ce jeu de données,
donne-moi cinq contrôles de qualité à passer dessus,
sous forme de formules Excel prêtes à coller, chacune
avec la valeur que je dois obtenir si tout va bien.

Concentre-toi sur : les valeurs en texte dans les
colonnes numériques, les dimensions qui comptent plus
de valeurs distinctes que prévu, les périodes
incomplètes, et les doublons de lignes.
```

C'est le prompt le plus rentable du module. Il produit en trente secondes la feuille `QUALITE` qu'on aurait mis vingt minutes à écrire — **et il l'écrit avant l'analyse**, ce qui est le seul moment où elle sert.

---

## 4 · Le prompt du fichier hérité

```
Voici la description d'un classeur dont plus personne
dans mon service ne sait comment il fonctionne :
[les en-têtes de chaque feuille, et les formules des
cellules de total]

1. Explique-moi ce que ce classeur calcule, feuille
   par feuille, en français simple.
2. Signale-moi toute formule qui me semblerait fragile :
   plage figée, valeur en dur, référence à une autre
   feuille qui pourrait bouger.
3. Dis-moi ce qui casserait si on y ajoutait
   deux mille lignes.
```

---

## La répartition, et elle est stable

> **L'IA pour trouver la question et la configuration.**
> **Excel pour produire et vérifier le chiffre.**
> **Vous pour la conclusion.**

## Ce qu'on n'envoie jamais

Clients, salariés, patients, montants nominatifs. Les données de votre employeur ne vous appartiennent pas — c'est une question de contrat, pas de technique. Un extrait anonymisé de trente lignes suffit à tout ce qui précède.

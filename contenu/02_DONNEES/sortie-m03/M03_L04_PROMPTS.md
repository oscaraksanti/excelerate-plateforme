# Leçon 3.4 — Les prompts, prêts à copier

## 1. Diagnostiquer AVANT de corriger

```
Voici 20 lignes représentatives de mon export.

Liste toutes les anomalies que tu vois, classées par
gravité, SANS rien corriger pour l'instant.

Pour chacune :
- combien de lignes sont probablement touchées
- la formule Excel qui la répare
- ce qui se passe si on l'ignore
```

## 2. Les valeurs distinctes — le geste qui révèle tout 💎

```
Donne-moi la liste des valeurs distinctes de la
colonne [nom], avec leur nombre d'occurrences,
triée par fréquence décroissante.

Puis regroupe celles qui désignent visiblement la
même chose, et propose-moi une table de
correspondance valeur_sale → valeur_normalisée.

Ne corrige rien : donne-moi la table, je déciderai.
```

## 3. L'ordre des opérations — on l'impose

```
Donne-moi le plan de nettoyage sous forme de liste
à cocher, dans cet ordre exact :
1. supprimer les caractères invisibles
2. normaliser la casse et les espaces
3. typer les dates et les nombres
4. dédoublonner
5. rapprocher

Pour chaque étape, la formule ou l'outil Excel.
```

> 🔴 **On impose l'ordre. On ne le demande pas.** Laissée libre, une IA propose de dédoublonner en premier — « ce sera plus rapide sur moins de lignes ». C'est logique, et c'est faux : elle trouve 150 doublons au lieu de 340, et elle ne le signale pas.

## 4. Le protocole d'échantillonnage — non négociable

```
Voici le résultat de ton nettoyage.

1. Donne-moi 30 identifiants tirés au hasard, que je
   vais vérifier ligne à ligne.
2. Donne-moi les 10 valeurs les plus atypiques de
   chaque colonne nettoyée : les plus longues, les
   plus courtes, celles qui ont le plus changé.
3. Donne-moi le nombre de lignes avant et après, et
   le détail de ce qui a été supprimé.
4. Dis-moi ce que tu n'es pas sûre d'avoir bien
   traité.
```

| | Ce qu'on vérifie | Ce que ça attrape |
|:--:|---|---|
| **30** | lignes au hasard | l'erreur systématique |
| **10** | valeurs atypiques | **l'erreur sur les cas rares** |
| **1** | total avant / après | la perte de lignes |

**Les cinquante premières lignes ne prouvent rien : elles sont toujours propres.**

## 5. La mise en forme conditionnelle par formule

C'est le domaine où l'IA a le meilleur rapport temps gagné / risque.

```
Donne-moi la règle de mise en forme conditionnelle
qui colore toute la ligne en rouge quand la colonne
Statut vaut "Retard", pour la plage A2:H5001.
Donne-moi la formule exacte à coller dans
« Utiliser une formule », en français.
```

## 6. Les formats de nombre personnalisés

```
Donne-moi le format de nombre personnalisé qui
affiche : [1 234 567 → « 1,2 M USD » / les négatifs
en rouge entre parenthèses / une flèche ▲ ou ▼ selon
le signe].
Le format ne doit pas changer la valeur calculée.
```

---

## Le tableau de décision

| Volume | Une seule fois | Tous les mois |
|---|---|---|
| moins de 100 lignes | À la main | Formules |
| 100 à 5 000 | Formules ou `Ctrl+E` | **Power Query** |
| 5 000 à 100 000 | IA, puis on vérifie | **Power Query** |
| plus de 100 000 | IA | **Power Query + automatisation** |

**Ce n'est pas le volume qui décide. C'est la récurrence.**

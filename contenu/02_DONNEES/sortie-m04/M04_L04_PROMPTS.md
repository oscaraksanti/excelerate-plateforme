# Leçon 4.4 — Les prompts de réconciliation

## 1. Le prompt qui évite les 5 635 écarts fantômes

La différence entre un rapport juste et un rapport ridicule tient à **deux lignes** du bloc E.

```
[colle ton bloc E du module 1]

J'ai trois fichiers qui devraient se correspondre :
- t_Commandes  : Ref_Commande, Date, Client, Agence,
                 Devise, Montant — 8 000 lignes
- t_Livraisons : Ref_Livraison, Ref_Commande,
                 Date_Livraison, Colis — 7 880 lignes
- t_Factures   : Ref_Facture, Ref_Commande,
                 Date_Facture, Montant, Devise

⚠️ MES CLÉS NE SONT PAS PROPRES. La même référence
s'écrit de cinq façons selon le logiciel :
CMD-00220 · cmd-00220 · avec des espaces de bord ·
DKR/CMD-00220 · avec un espace insécable à la fin.

Donne-moi la MÉTHODE avant le code :
1. la règle de normalisation, valable des deux côtés
2. dans quel sens rapprocher, et pourquoi
3. les quatre familles d'écarts à produire
4. l'ordre de priorité des statuts
5. le contrôle final qui doit valoir zéro
```

> **Sans le paragraphe en gras, l'IA propose une méthode juste appliquée à des données qu'elle croit propres.** Le rapport annonce 71 % d'écarts. Ce n'est pas elle qui s'est trompée.

## 2. La normalisation, des deux côtés

```
Donne-moi UNE formule Excel qui normalise une
référence de commande :
- tout en MAJUSCULES
- sans espaces ordinaires ni insécables
- sans le préfixe d'agence « XXX/ » s'il existe

Donne-la en deux versions : une qui marche en Excel
2021, une qui utilise TEXTE.APRES pour 2024.
Puis donne-moi la formule qui COMPTE combien de clés
ont dû être réparées.
```

> 💎 La formule de comptage doit utiliser **`EXACT`**. `=A1=B1` ignore la casse : sans `EXACT`, on sous-compte de plus de mille lignes.

## 3. Les quatre familles

```
Pour chacune des quatre familles d'écarts, donne-moi
la formule Excel, en français :

1. chez A, pas chez B  (livrée jamais facturée)
2. chez B, pas chez A  (facturée sans commande)
3. des deux côtés, montants différents
4. deux fois du même côté (doublon)

Puis la formule de statut unique, avec l'ordre de
priorité, en SI imbriqués.
```

## 4. Le contrôle — la question qu'on oublie

```
Donne-moi trois formules de contrôle qui doivent
toutes valoir zéro, et dis-moi ce que chacune
attrape si elle ne vaut pas zéro.
```

## 5. Quand l'ordre de grandeur est absurde

```
Mon rapprochement annonce [N] écarts sur [M] lignes,
soit [P] %.

Avant de me donner une explication : est-ce que cet
ordre de grandeur est plausible pour une entreprise
qui fonctionne ? Si non, dis-moi ce qui, dans ma
méthode, pourrait produire ce chiffre.
```

> **C'est `V3 — Volumétrie`, transformée en prompt.** À garder.

---

## La méthode en cinq étapes

| | Étape | Ce qu'on fait |
|:--:|---|---|
| **1** | **Compter** | Combien de lignes de chaque côté. **On l'écrit avant de commencer.** |
| **2** | **Normaliser** | Casse, espaces, préfixes. Des deux côtés, avec la même règle, dans une colonne dédiée. |
| **3** | **Rapprocher** | Une ligne par élément du référentiel. Jamais l'inverse. |
| **4** | **Classer** | Un statut, et un seul. Priorité écrite dans le README. |
| **5** | **Contrôler** | Somme des statuts = total. Sinon on ne publie pas. |

**L'étape qu'on saute, c'est la 1. C'est aussi celle qui coûte le plus cher.**

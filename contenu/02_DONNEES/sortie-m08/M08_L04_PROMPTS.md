# Module 8 · Leçon 4 — Le DAX assisté

> **La ligne à mettre en tête de chaque conversation :**
> *« Pour Power Pivot dans Excel 2024. Pas pour Power BI. Si une fonction n'y est pas disponible, donne-moi l'équivalent avec les fonctions de base. »*
>
> La seconde phrase est celle qui fait le travail : sans elle, on obtient une mesure refusée à la saisie et aucune alternative.

---

## ① Le bloc de description du modèle — à garder, à recoller

```
Je travaille avec Power Pivot dans Excel 2024 — pas
Power BI. Langage DAX.

Voici mon modèle. Ce sont les tables et les relations,
pas les données.

TABLES
f_Ventes (1 200 000 lignes) : Date_Cle, Agence_Cle,
  Client_Cle, Produit_Cle, Ticket_Cle, Quantite,
  Montant_Local
d_Calendrier (1 096) : Date_Cle, Date, Annee,
  Trimestre, Mois_Num, Debut_Mois, Est_Ouvre
  — MARQUÉE comme table de dates
d_Agence (6) : Agence_Cle, Agence, Pays, Devise
d_Client (3 600) : Client_Cle, Client, Segment
d_Produit (980) : Produit_Cle, Produit, Famille,
  Taux_Marge
d_Taux (36) : Debut_Mois, CDF, XOF, XAF

RELATIONS (toutes plusieurs-à-un)
f_Ventes[Date_Cle]    → d_Calendrier[Date_Cle]
f_Ventes[Agence_Cle]  → d_Agence[Agence_Cle]
f_Ventes[Client_Cle]  → d_Client[Client_Cle]
f_Ventes[Produit_Cle] → d_Produit[Produit_Cle]
d_Calendrier[Debut_Mois] → d_Taux[Debut_Mois]  (flocon)

Confirme-moi que tu as bien compris le sens des filtres
avant qu'on commence.
```

**Vingt lignes, dans un fichier texte, recollées à chaque fois.** C'est ce qui sépare une réponse utile d'une réponse générique — et c'est l'outil le plus rentable du module.

---

## ② 💎 Faire expliquer le contexte de filtre — l'usage le plus rentable du programme

```
Voici ma mesure :
[colle-la]

Elle est dans un tableau croisé qui a :
- en lignes : [quoi]
- en colonnes : [quoi]
- en filtres / segments : [quoi]

Pour la cellule [ligne Kinshasa, colonne 2026], dis-moi :
1. Exactement quels filtres sont actifs quand la mesure
   s'évalue.
2. Ce que CALCULATE modifie dans ces filtres, et dans
   quel ordre.
3. Sur quelles lignes de f_Ventes elle finit par
   travailler.
4. Ce qui changerait dans la cellule Total.
```

**Le point 4 attrape le défaut classique du DAX :** une mesure juste au détail et fausse au total. Ça vient toujours d'une hypothèse implicite sur le contexte.

---

## ③ Faire écrire une mesure, puis la faire expliquer

```
Écris-moi la mesure suivante en DAX, pour Power Pivot
dans Excel 2024 :

[décris ce que tu veux, en français métier, avec les
cas particuliers]

Puis :
1. Explique-la ligne par ligne, en français.
2. Dis-moi ce qu'elle rend dans le total général.
3. Dis-moi ce qu'elle rend s'il n'y a aucune ligne
   dans le contexte.
4. Donne-moi trois cas de test avec la valeur attendue,
   que je puisse vérifier à la main.
5. Propose une version plus simple si elle existe, et
   dis-moi ce qu'on perd.
```

**Le point 4 est non négociable.** Une mesure DAX ne se vérifie pas en la relisant : elle se vérifie contre un chiffre connu par ailleurs.

---

## ④ Déboguer — le cas qui ne produit aucun message

```
Ma mesure rend [vide / une erreur / un chiffre que je
ne comprends pas].

Voici la mesure : [colle-la]
Voici mon modèle : [recolle le bloc ①]
Voici le contexte : [le TCD, les filtres, la cellule]

1. Donne-moi les trois causes les plus probables,
   classées.
2. Pour chacune, comment je la vérifie en dix secondes.
3. Puis la correction.

Si la cause la plus probable est la table de dates,
dis-le en premier.
```

**La dernière phrase fait gagner du temps neuf fois sur dix.**

---

## 🔴 L'erreur n° 7 — le DAX de Power BI

Elle propose une mesure élégante, avec une fonction **parfaitement documentée**, que Power Pivot **refuse à la saisie**.

**Pourquoi :** Power BI reçoit de nouvelles fonctions DAX plusieurs fois par an ; le moteur embarqué dans Excel évolue beaucoup plus lentement. Une bonne partie du DAX écrit sur Internet vise Power BI.

**Ce qui la rend pénible :** la réponse est juste, la fonction existe, la documentation la décrit. Elle n'existe simplement pas **chez vous**.

> **`V1 — Version`**, et il s'attrape **avant** d'écrire la mesure, par la phrase en tête de cette fiche.
>
> **Le bon réflexe quand une formule est rejetée à la saisie :** ce n'est presque jamais une faute de frappe. C'est une fonction qui n'existe pas dans votre version.

---

## Les six autres erreurs typiques sur le DAX

1. **Elle confond colonne calculée et mesure** — `SUMX` là où `SUM` suffit, ou une colonne calculée sur 1,2 million de lignes.
2. **Elle utilise `FILTER` partout.** Élégant, lisible, et lent sur une table de faits.
3. **Elle oublie le troisième argument de `DIVIDE`.**
4. **Elle suppose que votre table de dates est marquée.** Elle ne pose jamais la question.
5. **Elle écrit du DAX juste au détail et faux au total** — surtout sur les ratios et les comptages distincts.
6. **Elle mélange le M et le DAX** quand la question ne dit pas où le code sera collé.

---

## Le rappel qui vaut pour tout le module

| | Le M *(module 7)* | Le DAX *(module 8)* |
|---|---|---|
| Quand | **avant** le chargement | **après** le chargement |
| Quoi | il transforme la donnée | il calcule sur la donnée |
| Où | l'éditeur Power Query | le modèle de données |
| Casse | sensible | insensible |

**La question qui tranche : « dans quel éditeur est-ce que je colle ça ? »**

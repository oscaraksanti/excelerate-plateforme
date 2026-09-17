# MODULE 4 — Chercher, croiser, réconcilier
## 🔒 Payant · **ouvert dès l'achat** · à tourner **lundi 21 septembre**

> **Promesse :** *Vous ne recopierez plus jamais une donnée d'un fichier à un autre. Et vous saurez retrouver ce qui manque entre trois fichiers qui ne se parlent pas.*
>
> **Échelle :** niveau **3 maîtrisé**, entrée au niveau **4**.

---

## 🔴 Le module le plus critique de la production

C'est **ce que l'acheteur ouvre dans les cinq minutes qui suivent son paiement**, mercredi soir à 20 h 47. Il décide de ses commentaires dans le groupe, de sa demande de remboursement, et de ce qu'il dira aux autres.

**Il se tourne le lundi 21, pas le jeudi 24.** Si le lundi déborde, on coupe le montage du module 5 — jamais le tournage du module 4.

---

## Le hook

Trois fichiers ouverts côte à côte : les commandes, les livraisons, les factures. 24 000 lignes au total. Nadège : *« Il manque de l'argent. Je ne sais pas combien, je ne sais pas où. »*

À la fin de la leçon 4.4, on affiche : **84 320 USD, 8 commandes, 3 agences, et la raison de chacune.**

## Les données du jour
`J04_Commandes.xlsx` · `J04_Livraisons.xlsx` · `J04_Factures.xlsx` — 3 × 8 000 lignes, **trois devises**, et des clés qui ne concordent pas : espaces, casse, préfixes d'agence ajoutés par un logiciel.

---

## Leçon 4.1 — `INDEX`/`EQUIV` et les tables de barème · 🔧
**Le problème.** La table de commission a changé : trois paliers sont devenus cinq. La formule à six `SI` imbriqués doit être réécrite entièrement. Chaque trimestre.
**La mission.** Sortir la règle de la formule et la mettre dans une table qu'un non-informaticien peut modifier.

### Notions
`INDEX(plage;ligne;colonne)` · `EQUIV(valeur;plage;type)` et **le troisième argument** : `0` exact, `1` approximatif croissant, `-1` approximatif décroissant · la combinaison `INDEX(EQUIV();EQUIV())` en deux dimensions · **la recherche approximative dans une table de barème** — le vrai usage de `EQUIV(…;1)` · `DECALER` et pourquoi on l'évite *(volatile)* · `CHOISIR`

### Pépites 💎
1. **`INDEX`/`EQUIV` survit à l'insertion d'une colonne** ; `RECHERCHEV` non. C'est pour ça qu'il reste au programme malgré `RECHERCHEX`.
2. **Une table de barème remplace six `SI`** et devient modifiable par le DRH sans toucher à une formule.
3. **`EQUIV` seul** répond à « à quelle ligne est-ce ? » — utile pour trouver la dernière ligne remplie, ou détecter une absence.
4. `INDEX` renvoie **une référence**, pas une valeur : `SOMME(A1:INDEX(A:A;10))` fonctionne. Une plage dont la fin est calculée.

**Mini-défi (12 min)** · **Chez vous, demain**

---

## Leçon 4.2 — `RECHERCHEX` à deux dimensions et les cas difficiles · 🔧
**Le problème.** Le prix dépend du produit **et** du canal de vente **et** du mois. Trois entrées, une réponse.

### Notions
`RECHERCHEX` imbriquée pour croiser ligne × colonne · la **clé composite** `[@Produit]&"|"&[@Canal]` et ses pièges · la recherche sur **plusieurs critères sans clé composite**, par multiplication booléenne · `si_absent` qui contient une autre formule · **les jokers** avec `mode_correspondance = 2` · la recherche binaire `mode_recherche = 2` sur données triées, et pourquoi c'est dangereux

### Pépites 💎
1. **Le séparateur de clé composite doit être un caractère impossible** dans les données. `"|"` oui, `"-"` non — sinon « ABC-1 » + « 2 » et « ABC » + « 1-2 » donnent la même clé.
2. **`RECHERCHEX` peut renvoyer une plage entière**, pas une valeur : `SOMME(RECHERCHEX(...):RECHERCHEX(...))` somme entre deux bornes trouvées.
3. Le **8ᵉ piège** : une recherche binaire sur données non triées ne renvoie pas d'erreur. Elle renvoie une **mauvaise valeur**, en silence.

---

## Leçon 4.3 — Les matrices dynamiques en profondeur · 🔧
**Le problème.** Serge veut le tableau de bord de la leçon 1.3, mais avec les 5 000 lignes, les trois devises, et un calcul par ligne.

### Notions
`FILTRE` avec conditions multiples et imbriquées · `TRIERPAR` sur une colonne masquée · `UNIQUE` avec `par_colonne` et `exactement_une_fois` · `SEQUENCE` pour fabriquer calendriers et matrices · `LET` pour rendre lisible une matricielle de 200 caractères
> ⚠️ **2024 uniquement :** `ASSEMB.V` / `ASSEMB.H`, `PRENDRE` / `EXCLURE`, `CHOISIRCOLS`, `ENCOL` — alternative 2021 systématique

### Pépites 💎
1. **`UNIQUE(…;;VRAI)`** — le troisième argument renvoie **ce qui n'apparaît qu'une seule fois**. Détecter les orphelins, les saisies uniques, les anomalies.
2. **`ASSEMB.V` empile trois tableaux en une formule**, sans copier-coller, et se met à jour. *(2024+)*
3. **`FILTRE` dans `FILTRE`** pour un ET qui porte sur deux tableaux différents.

---

## Leçon 4.4 — 🤖 La réconciliation intelligente — **le cas que personne ne sait faire**
**Le problème.** Trois fichiers, 24 000 lignes, des clés qui ne concordent pas, trois devises. Où sont les 84 000 USD ?

### Le prompt décortiqué
Décrire les trois structures · **dire explicitement que les clés sont sales** · demander **la méthode avant le code** · exiger un rapport de réconciliation, pas une colonne de résultats

### 🔴 L'IA se trompe à l'écran
Elle rapproche sur la clé brute et annonce **1 400 écarts**. Après normalisation : **8**. Elle avait raison sur la méthode et tort sur les données — parce qu'on ne lui avait pas dit dans quel état elles étaient.
**`V3 — Volumétrie` l'attrape** : 1 400 écarts sur 8 000 lignes n'est pas un ordre de grandeur plausible.

### Notions
Normaliser **avant** de rapprocher · rapprochement à trois niveaux : exact → normalisé → approximatif · les **quatre familles d'écarts** *(chez A pas chez B, chez B pas chez A, montants différents, doublons)* · le rapport de réconciliation comme livrable · le **total de contrôle en devise de reporting**

**Chrono** — *Classique **3 h** · IA **20 min** · **Vérification 40 min**.*

---

## Leçon 4.5 — 🤖 Prototyper avec Artifacts avant de construire
**Le problème.** On construit trois heures un tableau de bord, on le montre, et Serge dit « ce n'est pas ça ».

### Notions
Faire produire une **maquette interactive** du tableau de bord **avant** de l'ouvrir dans Excel · la faire valider par le commanditaire · seulement ensuite, construire · ce qu'une maquette évite : les trois heures perdues, et la discussion pénible
> **Parcours A :** décrire la maquette en texte et la faire dessiner. Moins joli, même bénéfice.

### Pépites 💎
1. **Faire valider la maquette par écrit** avant de construire. C'est un réflexe de consultant, il vaut de l'or.
2. Demander **trois maquettes différentes** plutôt qu'une. Le commanditaire choisit — et il s'engage en choisissant.

**Chrono** — *Classique **1 h 20** · IA **12 min** · **Vérification 10 min**.*

---

## 🎁 Bonus Niveau + — Le Filtre Avancé et sa zone de critères
La fonctionnalité de 1993 qui fait encore des choses que `FILTRE` ne fait pas : extraire vers une autre feuille, critères en OU sur plusieurs colonnes, **critère calculé par formule**, extraction sans doublon.

## 🧪 TP 4 — « Le trou de 84 000 dollars » → `04_TP/TP-04.md`
## ❓ QCM → `05_QCM/QCM-M04.md`
## 📦 Fichiers
`M04_L01` → `M04_L05` *(DEPART, CORRIGE, SCRIPT, DEFI)* · `J04_*.xlsx` *(3 fichiers)* · `M04_L04_PROMPTS.md` · `M04_BONUS_FiltreAvance.xlsx` · `M04_MEMO_Reconciliation.pdf` · `TP04_*`

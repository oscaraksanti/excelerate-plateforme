# QCM — Module 2 · L'IA comme copilote, pas comme oracle

---

### 1 · Concept
**Quand faut-il préférer `SI.CONDITIONS` à des `SI` imbriqués ?**

- A — Toujours, `SI` est obsolète
- B — **Au-delà de trois niveaux, pour la lisibilité** ✅
- C — Jamais, `SI.CONDITIONS` est plus lent
- D — Uniquement avec des conditions numériques

> Les deux calculent la même chose. Au-delà de trois niveaux, un `SI` imbriqué devient impossible à relire — et donc à vérifier.

---

### 2 · Pépite 💎
**Une cellule de votre colonne de totaux affiche un chiffre qui ne colle pas, sur 3 000 lignes. Quel outil la trouve en deux secondes ?**

- A — `Ctrl+F` avec la valeur
- B — La mise en forme conditionnelle « valeurs en double »
- C — **`F5 > Cellules > Différences entre lignes`** ✅
- D — Le vérificateur d'erreurs

> Il sélectionne d'un coup toutes les cellules qui **ne suivent pas le motif** de leurs voisines. Le détecteur de sabotage.

---

### 3 · Diagnostic
**`=SOMME.SI.ENS(C2:C500;A2:A500;"Kinshasa")` renvoie 0, alors qu'il y a des ventes à Kinshasa. Quelle cause devez-vous vérifier en premier ?**

- A — La plage de somme et la plage de critère n'ont pas la même hauteur
- B — Les valeurs de la colonne A contiennent des espaces
- C — Les montants de la colonne C sont stockés en texte
- D — **Les trois sont possibles, et il faut les vérifier dans cet ordre** ✅

> Les trois causes classiques. La première est la plus sournoise : elle ne produit **aucune erreur**, juste un mauvais chiffre.

---

### 4 · Choix d'outil
**Nadège veut un reporting à mise en page figée, avec ses couleurs, qu'elle envoie chaque mois au conseil. Quel outil ?**

- A — Un tableau croisé dynamique
- B — **`SOMME.SI.ENS` avec des critères référencés en cellules** ✅
- C — Power Query
- D — Une macro

> Un TCD impose sa structure. Quand la mise en page doit être figée et maîtrisée, la formule reste le bon outil — et elle se recalcule toute seule.

---

### 5 · Vérification IA
**L'IA vous rend une formule juste sur les dix premières lignes et fausse à partir de la onzième. De quelle erreur typique s'agit-il, et quel V l'attrape ?**

- A — Fonction inexistante — V1
- B — **Elle a supposé les données triées — V2, sur un cas limite** ✅
- C — Mauvais séparateur — V1
- D — Plage mal étendue — V3

> C'est l'hypothèse silencieuse : elle ne la dit pas, et rien ne la signale. **Seul un test sur un cas mal placé la révèle.**

---

### 6 · Piège
**Après avoir filtré votre tableau pour ne garder que Kinshasa, `=SOMME(C2:C500)` affiche toujours le total général. Pourquoi ?**

- A — Il faut actualiser le filtre
- B — La plage est incorrecte
- C — **`SOMME` ignore les filtres — il faut `SOUS.TOTAL` ou `AGREGAT`** ✅
- D — Les données sont dans un tableau structuré

> Un filtre **masque** des lignes, il ne les supprime pas. `SOMME` les compte quand même. `SOUS.TOTAL(109;…)` ne compte que le visible.

# QCM — Module 1 · Reprendre la main sur ses données

---

### 1 · Concept
**Dans un tableau structuré nommé `t_Caisse`, que désigne `[@Montant]` ?**

- A — Le total de la colonne Montant
- B — **La cellule Montant de la ligne courante** ✅
- C — Toute la colonne Montant
- D — La première valeur de la colonne Montant

> `@` veut dire « sur cette ligne ». Sans lui, `t_Caisse[Montant]` désigne toute la colonne.

---

### 2 · Pépite 💎
**Vous cherchez le *dernier* prix appliqué à un client qui apparaît quinze fois dans la table. Que faut-il à `RECHERCHEX` ?**

- A — Trier la table par date décroissante d'abord
- B — Utiliser `RECHERCHEV` avec le dernier argument à FAUX
- C — **Passer `-1` en sixième argument, `mode_recherche`** ✅
- D — Encadrer la formule par `GRANDE.VALEUR`

> Le sixième argument `-1` fait chercher **de bas en haut**. Sans lui, on trouve le premier, pas le dernier.

---

### 3 · Diagnostic
**`=RECHERCHEX("Kinshasa";t_Agences[Ville];t_Agences[CA])` renvoie `#N/A`, alors que « Kinshasa » est bien dans la table. Quelle est la cause la plus probable ?**

- A — La table n'est pas triée
- B — **La valeur de la table contient un espace invisible** ✅
- C — `RECHERCHEX` ne fonctionne pas sur les tableaux structurés
- D — Il manque le quatrième argument

> `RECHERCHEX` cherche **exactement**. « Kinshasa » et « Kinshasa » — avec un espace final — sont deux valeurs différentes.

---

### 4 · Choix d'outil
**Vous devez saisir quatorze lignes depuis une facture PDF. Une seule fois. Que faites-vous ?**

- A — À la main, c'est plus sûr
- B — **Par IA, puis on vérifie le total recalculé contre le total imprimé** ✅
- C — Par Power Query, il lit les PDF
- D — On demande au fournisseur un fichier Excel

> Quatre-vingt-dix secondes contre quarante-cinq minutes — **à condition de vérifier**. C'est le total de contrôle qui rend l'opération professionnelle, pas l'IA.

---

### 5 · Vérification IA
**L'IA vous rend `=SUM(B2,B10)`. Quel V du protocole l'attrape, et en combien de temps ?**

- A — V2 — Valeurs, en deux minutes
- B — **V1 — Version, en dix secondes** ✅
- C — V3 — Volumétrie, en une minute
- D — V4 — Vérité métier, en une minute

> Nom anglais et virgule au lieu du point-virgule : deux défauts de **version et d'environnement**. C'est le contrôle le plus rapide et le plus rentable.

---

### 6 · Piège
**Vous écrivez `=UNIQUE(t_Caisse[Client])` en E2. La formule déverse 18 noms. Puis vous la recopiez vers le bas jusqu'en E19, « pour être sûr ». Que se passe-t-il ?**

- A — Rien, c'est une précaution inutile mais sans effet
- B — Les 18 noms sont dupliqués
- C — **E2 affiche `#DEBORDEMENT!` : les cellules recopiées lui bloquent la place** ✅
- D — Excel supprime automatiquement les doublons de formules

> Une formule matricielle **se déverse déjà**. La recopier occupe les cellules dont elle a besoin — et elle ne peut plus s'afficher.

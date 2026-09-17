# QCM — Module 3 · Ce qui tourne tout seul

---

### 1 · Concept
**Quelle est la différence essentielle entre une formule et une requête Power Query ?**

- A — La requête est plus rapide
- B — **La formule recalcule ; la requête rejoue une suite d'étapes sur de nouvelles données** ✅
- C — La requête fonctionne sur plus de lignes
- D — La formule est visible, la requête est cachée

> C'est toute la différence entre *faire le travail* et *décrire le travail une bonne fois*.

---

### 2 · Pépite 💎
**`=SUPPRESPACE(A1)` ne nettoie pas votre cellule copiée depuis un PDF. Pourquoi ?**

- A — `SUPPRESPACE` ne fonctionne pas sur du texte importé
- B — Il faut `EPURAGE` à la place
- C — **C'est un espace insécable, `CAR(160)` — `SUPPRESPACE` n'enlève que `CAR(32)`** ✅
- D — La cellule contient un retour à la ligne

> `=SUPPRESPACE(SUBSTITUE(A1;CAR(160);" "))`. La formule qui répare des années de rapprochements qui ne tombaient pas juste.

---

### 3 · Diagnostic
**Vous dédoublonnez 5 000 clients : Excel en trouve 150. Vous normalisez ensuite la casse, et il en trouve 340. Qu'est-ce que ça révèle ?**

- A — Excel a un bug sur les grands volumes
- B — **L'ordre des opérations était faux : on normalise avant de dédoublonner** ✅
- C — Il faut dédoublonner deux fois
- D — Les 190 lignes supplémentaires ne sont pas de vrais doublons

> « KALALA Nadège » et « kalala nadege » sont deux clients différents pour Excel. **Nettoyer d'abord, dédoublonner ensuite. Toujours.**

---

### 4 · Choix d'outil
**Cinq mille lignes à nettoyer, avec le même export qui arrive chaque mois. Quel outil ?**

- A — `Ctrl+E` Remplissage instantané
- B — Des formules de nettoyage
- C — **Power Query** ✅
- D — L'IA, sur le fichier complet

> C'est le mot **« chaque mois »** qui décide. Récurrent + volume moyen : la requête se fait une fois et se rejoue en un clic.

---

### 5 · Vérification IA
**Une IA vous rend 5 000 lignes nettoyées. Quel contrôle appliquez-vous ?**

- A — On relit les cinquante premières lignes
- B — **30 lignes au hasard + les 10 valeurs les plus atypiques + le total de contrôle** ✅
- C — On compare le nombre de lignes avant et après
- D — On refait le nettoyage à la main sur un échantillon

> Les cinquante premières lignes sont toujours propres. **Ce sont les cas rares qu'elle rate** — d'où les dix valeurs atypiques.

---

### 6 · Piège
**`Ctrl+E` a bien rempli 980 lignes sur 1 000. Que faites-vous ?**

- A — On corrige les 20 restantes à la main
- B — On relance `Ctrl+E` sur les 20 lignes
- C — **On considère le résultat comme non fiable et on vérifie les 1 000** ✅
- D — On accepte : 98 %, c'est suffisant

> `Ctrl+E` ne prévient jamais quand il se trompe. S'il a raté 20 lignes visibles, **rien ne garantit que les 980 autres soient justes** — il a pu « réussir » de travers.

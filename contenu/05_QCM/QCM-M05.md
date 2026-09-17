# QCM — Module 5 · Tableaux croisés dynamiques
### ✅ **7 questions en ligne** — 6 prévues au plan, plus le piège `AGREGAT` trouvé en fabriquant le fichier de la leçon 3

| # | Type | Sujet | Bonne réponse |
|:--:|---|---|---|
| 1 | Concept | Le TCD affiche « Nombre de » au lieu de « Somme de » | au moins une cellule de la colonne est en texte |
| 2 | **Pépite 💎** | L'évolution mois par mois sans écrire de formule | Afficher les valeurs → % de différence par rapport à → *(précédent)* |
| 3 | Diagnostic | 2 400 lignes ajoutées, actualisation faite, le total ne bouge pas | la source est une plage, pas un tableau structuré |
| 4 | Choix d'outil | Même tableau, mêmes cellules, tous les mois | `SOMME.SI.ENS` dans une mise en page figée |
| 5 | Vérification IA | La baisse de 12,2 % à Douala | **V4 — Vérité métier** |
| 6 | **Piège** | Champ calculé `Quantite × Prix_Unitaire` sur 29 000 lignes | `SOMME(Quantite) × SOMME(Prix)` — énorme et faux |
| 7 | **Piège** | `=AGREGAT(9;5;plage)` sur une colonne contenant `#DIV/0!` | erreur : `5` ignore le masquage, pas les erreurs |

> **La question 7 corrige une erreur du plan.** Le squelette annonçait « `AGREGAT(9;5;…)` ignore lignes masquées **et** erreurs ». C'est faux, et la fabrication de `M05_L03_CORRIGE.xlsx` l'a montré : l'option `5` ne traite que le masquage, `6` les erreurs, `7` les deux. Vérifié dans le vrai Excel.

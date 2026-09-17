# QCM — Module 8 · Modèle de données & DAX
### ✅ **7 questions en ligne** — 6 prévues au plan, plus la non-additivité de `DISTINCTCOUNT`

| # | Type | Sujet | Bonne réponse |
|:--:|---|---|---|
| 1 | Concept | Découper un TCD par tranche d'ancienneté | **colonne calculée** — une mesure ne va qu'en Valeurs |
| 2 | **Pépite 💎** | La table de calendrier est propre, `SAMEPERIODLASTYEAR` rend vide | le clic **Marquer comme table de dates** |
| 3 | Diagnostic | Le cumul annuel est faux en décembre | le calendrier s'arrête à la dernière vente |
| 4 | Choix d'outil | 1,2 million de lignes, six tables reliées | **le modèle de données** |
| 5 | Vérification IA | Une mesure documentée que Power Pivot refuse | **V1** — c'est du DAX Power BI |
| 6 | **Piège** | `#DIV/0!` qui remonte dans tout le tableau | `DIVIDE(a ; b ; 0)` |
| 7 | **Piège** | 1 240 + 980 ≠ 2 015 sur les clients actifs | `DISTINCTCOUNT` **n'est pas additif** |

> **La question 7 est celle qui reste.** Ce n'est pas un bug, c'est la définition : un client qui achète dans deux agences n'est compté qu'une fois au total. Les comptages distincts, les moyennes et les ratios ne sont jamais additifs — et c'est précisément pour ça qu'on ne peut pas les pré-calculer dans une colonne.

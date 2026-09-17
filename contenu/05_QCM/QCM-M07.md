# QCM — Module 7 · Power Query en profondeur
### ✅ **7 questions en ligne** — 6 prévues au plan, plus le piège de type date/datetime

| # | Type | Sujet | Bonne réponse |
|:--:|---|---|---|
| 1 | Concept | Huit requêtes, sept intermédiaires | connexion seule pour les sept |
| 2 | **Pépite 💎** | Une septième famille apparaît | **dépivoter les AUTRES colonnes** |
| 3 | Diagnostic | Le total divisé par trente en octobre | une colonne désignée par sa position |
| 4 | Choix d'outil | 200 classeurs clients à produire et envoyer | **un script** — PQ ne sort pas d'Excel |
| 5 | Vérification IA | `CALCULATE` collé dans l'éditeur PQ | **V1** — c'est du DAX, pas du M |
| 6 | **Piège** | Corriger deux libellés à la main après chargement | ils redeviennent faux tous les mois |
| 7 | **Piège** | La colonne jointe est vide partout, sans erreur | une `date` contre un `datetime` |

> **La question 7 vient de la fabrication du TP.** La jointure des taux ne rendait que des nulls, sans le moindre message : une date construite dans la requête ne concorde pas avec une date lue depuis une feuille, qui arrive en `datetime`. C'est le bug le plus coûteux du module, parce qu'il ne se signale jamais.

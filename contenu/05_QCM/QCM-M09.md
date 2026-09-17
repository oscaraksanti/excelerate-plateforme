# QCM — Module 9 · Simulation, finance & modèle professionnel
### 7 questions — **rédigées et en ligne**

| # | Type | Sujet |
|:--:|---|---|
| 1 | Concept | La convention de couleurs : une cellule bleue sur `CALCULS` est un bug |
| 2 | **Pépite 💎** | La table de données à deux entrées : 420 simulations sans macro |
| 3 | Diagnostic | `=VAN(t;B5:B11)` avec l'année 0 dedans — l'erreur **silencieuse**, qui divise la VAN par (1 + t) |
| 4 | Choix d'outil | Répartir un stock sous contraintes : Solveur *(Simplexe PL)*, pas Valeur cible |
| 5 | Vérification IA | Un business plan multi-devises sans sensibilité au taux → **V4** |
| 6 | **Piège** | `F5 > Constantes` sur `CALCULS` sélectionne 17 cellules : ce que ça dit du modèle |
| 7 | **Piège** | Protéger une feuille sans avoir rien déverrouillé : tout est bloqué, **car tout est « Verrouillée » par défaut** |

> La question 3 a été reformulée en cours de fabrication. L'erreur classique sur `VAN` ne rend pas le projet *meilleur* qu'il n'est, comme on l'écrit souvent : elle divise la VAN entière par (1 + t), sans jamais changer son signe. C'est exactement ce qui la rend indétectable.

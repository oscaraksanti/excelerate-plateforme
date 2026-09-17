# Leçon 3.5 — Vos conventions, et la carte de ce qui vous manque

## 1. Vos conventions — à écrire une fois, à garder des années

```
MES CONVENTIONS EXCEL

Excel [version], interface en [langue].
Séparateur [;] · décimale [,] · date [jj/mm/aaaa].
Devise de reporting : [...]

Mes tableaux : t_[nom] pour les données,
d_[nom] pour les tables de référence.
Mes feuilles : RAW jamais modifiée, CLEAN nettoyée,
REPONSES, QUALITE, README, ANNEXE_IA.

Mes règles :
- aucune valeur en dur dans une formule
- un total de contrôle sur chaque classeur livré
- toute sortie d'IA passe par le Protocole V4
```

Collez-les au début de chaque conversation. Au bout de six mois, vous obtiendrez du premier coup ce qui vous prenait trois allers-retours.

## 2. Faire documenter avant de fermer la conversation

```
Avant que je ferme : rédige la feuille README de ce
que nous venons de construire — objectif, sources,
hypothèses prises, procédure d'actualisation, limites
connues. Écris À COMPLÉTER pour ce que tu ne peux pas
déduire.
```

**C'est le seul moment où tout le contexte est encore là.**

## 3. La carte de ce qui vous manque 💎

Le prompt le plus utile des trois soirées.

```
Voici ce que je fais à la main chaque mois :
[décris-le en cinq phrases, comme à un collègue]

Voici mes fichiers sources :
[leur nombre, leur format, ce qu'ils contiennent]

Dis-moi :
1. quelle partie est automatisable dès aujourd'hui,
   avec ce que je sais faire
2. quelle partie demande Power Query
3. quelle partie demande un modèle de données
4. quelle partie ne s'automatise pas, et pourquoi

Ne me donne pas la solution : donne-moi la carte.
```

---

## Le Protocole V4 — le rappel final

| | Contrôle | La question | Temps |
|---|---|---|---|
| **V1** | Version | Cette fonction existe-t-elle dans MON Excel ? Le séparateur est-il le bon ? | 10 s |
| **V2** | Valeurs | Juste sur 3 cas connus **et 1 cas limite** ? | 2 min |
| **V3** | Volumétrie | Ça tient sur toute la plage ? Combien en entrée, combien en sortie ? | 1 min |
| **V4** | Vérité métier | L'ordre de grandeur est-il plausible ? Un collègue validerait-il ? | 1 min |

> **`V4` est le seul que l'IA ne pourra jamais faire à votre place.** Elle ne sait pas que l'agence de Douala a changé de plan comptable en mars. Le sens métier n'est pas dans les données.

## Le total de contrôle

```
=SOMME(détail) - SOMME(synthèse)     →  doit valoir 0
```

Une cellule. Une soustraction. C'est la différence entre « voilà le chiffre » et « voilà le chiffre, et voici pourquoi il est juste ».

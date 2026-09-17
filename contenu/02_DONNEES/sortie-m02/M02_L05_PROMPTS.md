# Leçon 2.5 — Les prompts, prêts à copier

## 1. L'inventaire d'un classeur hérité

```
Voici un classeur dont j'ai hérité et que personne
ne comprend.

Fais-moi l'inventaire, sous forme de tableau :
- les feuilles, et ce que contient chacune
- les formules distinctes utilisées
- les valeurs écrites en dur À L'INTÉRIEUR des
  formules, avec leur cellule
- les liens vers d'autres fichiers
- les plages nommées, et celles qui ne servent à rien
- les formules de plus de 200 caractères

Classe le tout par niveau de risque.
Puis dis-moi ce que tu n'as PAS pu vérifier.
```

> La dernière ligne est la plus importante du prompt.

## 2. Quand le fichier ne peut pas sortir de l'entreprise

```
Je ne peux pas te transmettre le fichier.
Voici seulement sa structure :
- Feuille [nom] : colonnes [...], environ [n] lignes
- Feuille [nom] : ...
- Les formules les plus répétées : [colle-les]

Dis-moi :
1. quels risques classiques ce type de structure
   présente
2. dans quel ordre je devrais l'auditer
3. les huit contrôles à mettre en place, avec leur
   formule Excel
```

**On envoie la structure, pas le contenu.**

## 3. La feuille README, générée

```
À partir de ce classeur, rédige la feuille README :
objectif, source des données, date de mise à jour,
propriétaire, procédure d'actualisation, hypothèses
prises, définitions des indicateurs, limites connues.

Pour chaque élément que tu ne peux pas déduire du
fichier, écris À COMPLÉTER PAR L'HUMAIN plutôt que
d'inventer.
```

## 4. La feuille QUALITE, générée

```
Propose-moi huit contrôles de qualité pour ce
classeur, sous forme de tableau
Contrôle | Attendu | Constaté | Statut PASS/WARNING/FAIL,
avec la formule Excel de chaque contrôle.

Les contrôles doivent pouvoir échouer : un contrôle
qui sera toujours PASS ne contrôle rien.
```

## 5. La checklist de recette

```
Voici mon classeur terminé. Fais-moi la checklist de
recette à passer avant de l'envoyer au conseil
d'administration — les points qui feraient mauvais
effet, pas les points théoriques.
```

---

## Ce que l'IA ne voit pas

| Ce qu'elle ne voit pas | Pourquoi ça compte |
|---|---|
| La mise en forme conditionnelle | Une règle peut masquer des erreurs en police blanche |
| Les règles de validation | Elles portent souvent la vraie logique métier |
| Les objets graphiques et zones de texte | Un commentaire important y est parfois écrit |
| Les macros protégées | Elle lit le code visible, pas le reste |
| Les feuilles « très masquées » | Elles n'apparaissent même pas dans le menu Afficher |
| **Le sens métier des chiffres** | Elle dit qu'une formule existe. Pas qu'elle est juste. |

**`V4 — Vérité métier` n'est pas délégable. Jamais.**

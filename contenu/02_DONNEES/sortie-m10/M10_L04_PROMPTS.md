# Module 10 · leçon 10.4 — faire écrire son VBA sans se faire piéger
### Quatre prompts, et la règle qui les gouverne tous

> **On ne déploie jamais ce qu'on ne comprend pas.** Ce n'est pas une précaution de débutant : une macro tourne sans surveillance, sur les fichiers de quelqu'un d'autre, à une heure où vous n'êtes pas là.

---

## Le bloc de contexte — à coller en premier

```
J'écris une macro VBA pour Excel. Contraintes fermes :

- elle doit tourner sur Excel Windows ET Excel pour Mac
- donc : PAS de Scripting.FileSystemObject (n'existe pas sur Mac)
- donc : PAS de Application.FileDialog (n'existe pas sur Mac)
- les chemins utilisent Application.PathSeparator, jamais "\"
- Option Explicit en tête, toutes les variables déclarées
- Long, jamais Integer
- aucun chemin absolu : tout est relatif à ThisWorkbook.Path

Et trois règles de sécurité :
- aucune suppression sans demander confirmation
- rien qui écrive dans un fichier autre que celui de la macro
- la remise en état (ScreenUpdating, Calculation) doit se faire
  MÊME si la macro plante
```

**Les deux lignes sur macOS valent la moitié du prompt.** Sans elles, l'IA écrit du `FileSystemObject` neuf fois sur dix — c'est ce qu'elle a le plus vu, parce que le corpus VBA public est écrit sous Windows.

---

## Prompt 1 — décrire l'automatisation, pas le code

```
Décris-moi, en français et SANS CODE, les étapes qu'une macro
devrait suivre pour :

produire un PDF par ligne d'un tableau de 12 lignes, en
écrivant à chaque tour deux cellules d'une feuille de rapport,
en recalculant, puis en exportant cette feuille.

Pour chaque étape, dis ce qui peut mal se passer.
```

**Pourquoi commencer là.** Vous obtenez une liste de six ou sept étapes que vous pouvez valider **avant** qu'une ligne de code existe. Et la colonne « ce qui peut mal se passer » est celle qui vous fera écrire la gestion d'erreur — au lieu de l'ajouter après le premier plantage.

---

## Prompt 2 — obtenir le code, commenté ligne par ligne

```
Maintenant écris cette macro.

Exigence : CHAQUE ligne porte un commentaire en français qui dit
ce qu'elle fait ET pourquoi elle est là. Un commentaire qui
paraphrase le code ("incrémente i") ne compte pas.

Là où tu fais un choix — un type de variable, un ordre de
boucle, une valeur par défaut — dis pourquoi tu as choisi ça
plutôt qu'autre chose.
```

> 💎 **« Dis pourquoi tu as choisi ça plutôt qu'autre chose »** est le morceau qui change la nature de la réponse. C'est là qu'apparaissent les décisions discutables — et donc celles que vous devez trancher.

---

## Prompt 3 — 🔴 l'erreur qu'elle écrit presque toujours

Demandez-lui une macro qui supprime les lignes vides d'une plage. Neuf fois sur dix, vous obtiendrez ceci :

```vba
For i = 1 To derniere
    If Cells(i, 1).Value = "" Then Rows(i).Delete
Next i
```

C'est faux. **Quand la ligne 2 est supprimée, l'ancienne ligne 3 devient la ligne 2 — et la boucle passe à 3, qui est l'ancienne 4.** Une ligne vide sur deux survit.

Sur un jeu de test de trois lignes, ça marche. Sur 5 637 lignes, ça laisse passer des centaines de lignes vides, et **rien ne s'affiche.**

| | Ce qu'il vérifie | Ici |
|---|---|---|
| `V1` | la source | ✓ |
| **`V2`** | **le calcul** | **✗ — les indices se décalent** |
| **`V3`** | **la cohérence** | **✗ — le compte final ne tombe pas** |
| `V4` | la vérité métier | — |
| `V5` | la lisibilité | ✓ le code est propre, et c'est le piège |

**La correction tient en trois caractères :**

```vba
For i = derniere To 1 Step -1
    If Cells(i, 1).Value = "" Then Rows(i).Delete
Next i
```

En remontant, supprimer la ligne 60 ne déplace rien de ce qui est au-dessus.

### Le prompt qui l'attrape avant vous

```
Cette macro supprime des lignes dans une boucle.
Simule-la, pas à pas, sur cette plage :

  1  Kinshasa
  2  (vide)
  3  (vide)
  4  Dakar
  5  (vide)

Dis-moi, ligne par ligne, ce que vaut i, quelle ligne est
supprimée, et à quoi ressemble la plage après. Puis compte
les lignes vides restantes.
```

Elle trouve son propre bug. **Presque toujours.** Et c'est le prompt à garder : *« simule ton code pas à pas sur ces données-là »* marche pour n'importe quelle boucle qui modifie ce qu'elle parcourt.

---

## Prompt 4 — faire expliquer une macro héritée

Le cas le plus fréquent en entreprise : un `.xlsm` que personne n'ose toucher.

```
Voici une macro que j'ai trouvée dans un classeur hérité.
Personne ne sait plus ce qu'elle fait.

[le code]

Trois questions :
1. Qu'est-ce qu'elle fait, en trois phrases, en français ?
2. Qu'est-ce qu'elle MODIFIE ? Liste tout : cellules, feuilles,
   fichiers, réglages d'Application.
3. Qu'est-ce qui peut mal tourner si je la lance maintenant ?

Ne la réécris pas. Explique-la.
```

**La question 2 est celle qui compte.** Une macro qui laisse `Application.Calculation` en manuel, ou qui écrit dans un classeur ouvert à côté, fait des dégâts qu'on découvre trois jours plus tard.

---

## Les trois règles de sécurité, et pourquoi

| La règle | Ce qu'elle évite |
|---|---|
| **Jamais de suppression sans confirmation** | `Rows.Delete` dans une boucle mal bornée efface une feuille en une seconde, et `Ctrl+Z` ne remonte pas une macro |
| **Toujours une copie avant le premier essai** | la première exécution est la seule qui compte : c'est là que le fichier est encore intact |
| **Toujours tester sur une copie du vrai fichier** | trois lignes de test ne reproduisent aucun des cas qui cassent |

> **Et la règle qui les contient toutes :** si vous ne pouvez pas expliquer une ligne de la macro à voix haute, elle ne part pas. Le TP de ce module le note explicitement — un code non commenté vaut zéro au critère « usage critique de l'IA », quelle que soit sa qualité.

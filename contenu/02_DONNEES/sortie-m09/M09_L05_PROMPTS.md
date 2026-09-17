# Module 9 · leçon 9.5 — auditer, documenter, synthétiser
### Les quatre prompts de la fin de chantier

> L'IA ne peut pas ouvrir votre `.xlsx`. On ne lui donne donc pas le fichier : **on lui donne la carte.**

---

## Prompt 1 — l'audit hostile

```
Je te donne la structure d'un modèle financier que j'ai
écrit. Audite-le comme un auditeur externe hostile.

FEUILLES
README, HYPOTHESES (14 saisies nommées), RAW, CLEAN,
CALCULS (25 lignes : mois 0 à 24), ANALYSE (3 scénarios
+ table de données 21 × 20), DASHBOARD, QUALITE

LES 14 HYPOTHÈSES
[la liste avec valeurs et unités]

LES COLONNES DE CALCULS
[la liste de vos colonnes, dans l'ordre]

LES RÉSULTATS
[investissement, VAN, TRI, seuil, mois de retour,
 taux de bascule]

Cherche, dans cet ordre :
1. les incohérences internes
2. les hypothèses non documentées
3. les calculs qui pourraient être faux sans que rien
   ne le signale
4. ce qu'un auditeur demanderait en premier

Ne reformule pas mon modèle. Attaque-le.
```

> **Le mot « hostile » n'est pas un effet de style.** Sans lui, vous obtenez un compliment poli et trois suggestions de mise en forme.

### 🔴 Et la limite, qu'il faut connaître avant de commencer

**L'IA vérifie la cohérence interne. Jamais la véracité métier.**

Tapez `H_PRIX_XOF = 43 500` au lieu de `4 350` : elle ne dira rien. Les formules s'enchaînent, les contrôles valent zéro, la VAN devient magnifique. Tout est cohérent, et tout est faux.

| Ce qu'elle attrape | Ce qu'elle n'attrapera jamais |
|---|---|
| un total qui ne correspond pas au détail | un prix dix fois trop haut |
| une hypothèse utilisée nulle part | un volume que le marché n'absorbe pas |
| une formule décalée d'une ligne | un loyer qui n'est pas celui du bail |

**La parade est toujours la même : un ordre de grandeur, relu à voix haute.**

---

## Prompt 2 — le `README`

```
Rédige la feuille README de ce modèle, avec ces
rubriques :
à quoi sert ce classeur · qui l'a produit et quand ·
les sources · la règle des couleurs · la définition de
chaque KPI · comment actualiser · ce que ce modèle ne
dit pas · le journal des versions

Pour les définitions de KPI : dis comment chacun est
calculé DANS CE MODÈLE, pas la définition de manuel.

Style : phrases courtes, pas de jargon, lisible par
quelqu'un qui n'a jamais ouvert le fichier.
```

**La consigne sur les KPI fait toute la différence.** « La VAN est la somme des flux actualisés » n'aide personne. « Somme des flux mensuels actualisés des mois 1 à 24, moins l'investissement du mois 0, au taux mensuel équivalent à 14 % par an » permet à quelqu'un d'autre de refaire le calcul.

---

## Prompt 3 — la note de synthèse d'une page

```
Rédige une note d'une page pour un comité de direction,
à partir de ces résultats : [les chiffres]

Structure imposée :
1. La recommandation, en une phrase, EN PREMIER
2. Les trois chiffres qui la portent
3. Le risque principal, chiffré
4. Ce qu'on ne sait pas encore
5. La décision demandée, et pour quand

Pas de conditionnel. Pas de « il conviendrait de ».
Une page. Si ça ne tient pas, coupe le 4.
```

**« La recommandation en premier »** sépare une note lue d'une note posée sur un coin de bureau. La structure classique — contexte, méthode, résultats, conclusion — fait attendre la réponse jusqu'en bas de la page. Un comité ne lit pas jusqu'en bas.

---

## Prompt 4 — les cas de test

```
Donne-moi 8 cas de test pour vérifier ce modèle.
Pour chacun : ce que je change, et ce que je dois
observer si le modèle est juste.
Inclus au moins deux cas absurdes.
```

Les cas absurdes sont les meilleurs :

| Le test | Ce qu'on doit observer |
|---|---|
| `H_VOLUME_CROISIERE` = `H_VOLUME_M1` | volume plat, aucune erreur |
| `H_DERIVE_TAUX` = 0 | le taux reste à 631,40 partout |
| `H_MONTEE` = 1 | **`#DIV/0!`** — la formule divise par `H_MONTEE − 1` |
| `H_ACTUALISATION` = 0 | VAN = résultat cumulé, exactement |
| `H_TAUX_XOF` = taux de bascule | **VAN = 0** |

Le troisième trouve un vrai défaut. Le modèle livré ne le corrige pas : il le **documente** dans `README`. La montée en charge doit valoir au moins 2.

Le dernier est le plus élégant — c'est la vérification de la leçon 9.1, retournée. **Dix secondes, et vous savez si votre formule de taux limite est juste.**

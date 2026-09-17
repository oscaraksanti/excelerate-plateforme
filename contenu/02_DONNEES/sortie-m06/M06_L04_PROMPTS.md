# Module 6 · Leçon 4 — L'IA comme directeur artistique

> **La règle :** on ne lui demande pas de produire la page. On lui demande de **la critiquer** — parce qu'elle peut la regarder sans savoir ce qu'elle contient, et vous non.

---

## 1 · La critique de lisibilité

```
Voici la capture de mon tableau de bord.

Un directeur va le regarder huit secondes, puis on le
masque, et on lui demande : « [ta question de décision] »

1. Quelles trois informations aura-t-il retenues, dans
   l'ordre où son œil les a prises ?
2. Répondra-t-il correctement à la question ? Si non,
   qu'est-ce qui l'a détourné ?
3. Qu'est-ce qui occupe de la place sans rien apporter ?
4. Qu'est-ce qui est important et que je n'ai pas
   suffisamment mis en avant ?

Ne reformule pas ce que tu vois. Critique la hiérarchie.
```

**La dernière phrase est obligatoire.** Sans elle, vous obtenez la description de votre propre page.

---

## 2 · La palette accessible

```
Propose-moi une palette de cinq couleurs pour un tableau
de bord d'entreprise :
- une couleur d'accent, et quatre neutres
- lisible en deutéranopie ET en protanopie
- qui donne des gris distincts à l'impression noir et blanc
- qui tienne au vidéoprojecteur, où les contrastes s'écrasent

Donne-moi les codes hexadécimaux, et pour chaque paire
que je risque de comparer, dis-moi si elle survit aux
trois épreuves. Si une paire ne survit pas, dis-le.
```

> 🔴 **Sans contrainte explicite, elle proposera du rouge et du vert.** À peu près toujours.
> La deutéranopie touche **8 % des hommes**. Et imprimés en noir et blanc, le rouge et le vert donnent le même gris — ce qui concerne, cette fois, tout le monde.
>
> **La paire qui survit aux deux épreuves : bleu et orange.** Et jamais la couleur seule : une forme, un signe ou un mot en plus.

**Le test, en un geste :** imprimez la page en noir et blanc.

---

## 3 · Le titre qui affirme

```
Voici les chiffres de mon graphique :
[colle-les]

Écris-moi cinq titres qui AFFIRMENT quelque chose.
Contraintes :
- un chiffre et un verbe dans chaque titre
- moins de douze mots
- aucun adjectif d'appréciation
- aucun titre ne doit dire une chose que les données
  ne prouvent pas

Puis classe-les : lequel ferait agir, lequel ferait
seulement hocher la tête.
```

| Étiquette | Affirmation |
|---|---|
| « Chiffre d'affaires par agence » | « Kinshasa pèse deux fois et demie Libreville » |
| « Évolution mensuelle » | « Septembre recule de 9,8 % après le pic d'août » |
| « Suivi des objectifs » | « Septembre : 98,5 % de l'objectif — Lubumbashi décroche de 51 503 USD » |

---

## 4 · La note de synthèse en trois phrases

```
Voici les quatre indicateurs de mon tableau de bord :
[colle-les]

Rédige trois phrases pour le destinataire :
- phrase 1 : le constat, chiffré, sans adjectif
- phrase 2 : la cause, uniquement si les données
  l'établissent. Sinon, écris « cause non établie »
  et dis ce qu'il faudrait vérifier.
- phrase 3 : la décision proposée, avec un responsable
  et une date.

25 mots maximum par phrase. N'invente aucune cause.
```

---

## 5 · Les formats de nombre personnalisés

```
Je veux afficher [ce que tu veux voir à l'écran] dans
Excel, sans changer la valeur de la cellule.

Donne-moi le format de nombre personnalisé exact, avec
ses sections positif / négatif / zéro, et explique-moi
chaque symbole. Précise si le format dépend des
paramètres régionaux — je suis en français.
```

**Les deux règles à connaître :**
- une **virgule collée à la fin** du format divise l'affichage par mille ; deux virgules, par un million. **La valeur ne change pas** — les calculs restent exacts.
- un format a jusqu'à quatre sections : `positif ; négatif ; zéro ; texte`.

| Ce qu'on veut voir | Le format |
|---|---|
| `2,30 M USD` | `#,##0.00,," M USD"` |
| `604 k USD` | `#,##0," k USD"` |
| `+8,0 %` / `−9,8 %` | `+0,0 %;−0,0 %;0,0 %` |
| un tiret à la place du zéro | `#,##0;-#,##0;"—"` |

---

## Les quatre V, appliqués à la forme

| | Le contrôle | Sur un tableau de bord |
|:--:|---|---|
| **V1** | Version | la police existe-t-elle chez le destinataire ? |
| **V2** | Valeurs | le format d'affichage cache-t-il un arrondi qui trompe ? |
| **V3** | Volumétrie | la page tient-elle encore avec une agence de plus ? |
| **V4** | **Vérité métier** | **un collègue la lirait-il en huit secondes — et pourrait-il seulement la voir ?** |

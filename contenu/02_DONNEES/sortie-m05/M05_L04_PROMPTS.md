# Module 5 · Leçon 4 — De la question métier au bon tableau croisé

> **La règle du module :** on ne demande pas la réponse, on demande **le tableau croisé qui la produit**.
> Une réponse n'est pas vérifiable. Un tableau croisé, si — il reste dans le fichier, il s'actualise, il se double-clique.

---

## 1 · Traduire une question floue en configuration

```
Voici les colonnes d'un extrait de ventes, avec ce
qu'elles contiennent :
[colle tes en-têtes, une ligne de description chacune]

Ma direction demande : « [recopie la question, mot
pour mot, y compris si elle est mal formulée] »

Ne me donne aucun chiffre. Donne-moi :
1. Les trois tableaux croisés qui permettraient de
   trancher cette question. Pour chacun : lignes,
   colonnes, valeurs, filtres, et l'affichage à
   choisir dans « Afficher les valeurs ».
2. Dans quel ordre les regarder, et ce que chacun
   éliminerait comme explication.
3. Les trois causes possibles d'une baisse apparente
   qui ne seraient PAS une baisse réelle.
```

**Le point 3 est celui qui sauve la soirée.** Il force la machine à envisager que la question elle-même soit mal posée.

---

## 2 · Faire interpréter, pas seulement produire

```
Voici le résultat du premier tableau croisé :
[colle le tableau, tel quel]

1. Qu'est-ce que ce tableau montre, factuellement ?
   Uniquement ce qui est lisible dedans.
2. Qu'est-ce qu'il ne montre PAS, et qui pourrait
   renverser la conclusion ?
3. Quelle vérification ferais-tu avant d'envoyer ce
   chiffre à une direction ?
```

La question 2 manque dans la grande majorité des usages. On demande une analyse, on obtient un commentaire du tableau. On ne demande presque jamais **ce que le tableau cache**.

---

## 3 · La note de synthèse en trois phrases

```
Voici les six chiffres du comité :
[colle-les]

Rédige une note de trois phrases pour un comité de
direction :
- phrase 1 : le constat, chiffré, sans adjectif
- phrase 2 : la cause, et uniquement si elle est
  établie par les données. Si elle ne l'est pas,
  écris « cause non établie » et dis ce qu'il
  faudrait vérifier.
- phrase 3 : la décision proposée, avec un
  responsable et une échéance.

Aucune phrase ne doit dépasser 25 mots. N'invente
aucune cause.
```

> **« N'invente aucune cause » n'est pas une précaution de style.** Sans cette consigne, un modèle proposera toujours une explication : c'est ce qu'on lui demande implicitement quand on lui montre un écart.

---

## 4 · Le prompt de vérification — à passer systématiquement

```
Voici une conclusion que je m'apprête à envoyer :
[colle-la]

Joue le rôle du contradicteur. Pour chaque affirmation :
1. Dis si elle est établie par les données que je t'ai
   montrées, ou seulement plausible.
2. Si elle est seulement plausible, donne-moi les deux
   explications concurrentes les plus probables.
3. Pour chacune, dis quel contrôle de trois secondes
   la confirmerait ou l'écarterait dans mon fichier.
```

---

## 5 · Le contrôle des dimensions — trois secondes, à faire avant tout

```
=NBVAL(UNIQUE(t_Ventes[Famille]))
=NBVAL(UNIQUE(t_Ventes[Agence]))
=NBVAL(UNIQUE(t_Ventes[Devise]))
```

Une dimension qui compte **plus de valeurs distinctes que le référentiel n'en prévoit** est toujours le signe de quelque chose : un doublon d'orthographe, une saisie libre, ou un reclassement.

Sur le fichier de ce module : **huit libellés de famille pour six familles au catalogue.** C'est ce chiffre, et lui seul, qui aurait évité de conclure à un effondrement qui n'a jamais eu lieu.

---

## Les quatre V, rappelés

| | Le contrôle | La question à se poser |
|:--:|---|---|
| **V1** | Version | cette fonction existe-t-elle dans ma version d'Excel ? |
| **V2** | Valeurs | le calcul tient-il sur un cas limite : zéro, vide, doublon ? |
| **V3** | Volumétrie | l'ordre de grandeur est-il plausible ? |
| **V4** | Vérité métier | **qui, dans l'entreprise, confirmerait ce chiffre — et que me répondrait-il ?** |

**V4 est le seul qui attrape un changement de nomenclature.** Ni la formule, ni l'ordre de grandeur, ni la version d'Excel ne pouvaient le voir.

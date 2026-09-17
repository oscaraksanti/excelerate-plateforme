# Module 9 · leçon 9.4 — les quatre prompts du cadrage
### Du problème flou au modèle structuré

> À copier tels quels, puis à adapter. Le bloc de contexte est le même pour les quatre : collez-le une fois en début de conversation, et n'y revenez plus.

---

## Le bloc de contexte — à coller en premier

```
Je suis directeur financier d'un distributeur de produits
de grande consommation en Afrique centrale et de l'Ouest.

Six agences : Kinshasa et Lubumbashi (RD Congo, francs
congolais CDF), Abidjan et Dakar (francs CFA Ouest XOF),
Douala et Libreville (francs CFA Central XAF).
Reporting consolidé en dollars.

Point qui change tout et que tu ne peux pas deviner :
nous ENCAISSONS en monnaie locale et nous DÉCAISSONS en
dollars — le stock est importé et payé par la centrale
d'achat du groupe.

Le franc CFA n'est pas une devise flottante : il est
arrimé à l'euro à parité fixe (655,957 XOF = 1 EUR).
Notre risque de change est donc un risque EUR/USD,
que personne ici ne pilote.

Outil : Excel 2024, en français. Pas de VBA.
```

---

## Prompt 1 — faire lister les hypothèses, sans les chiffrer

```
La direction envisage d'ouvrir une septième agence à
Bamako, Mali. Horizon d'évaluation : 24 mois.

Ne me donne AUCUN chiffre. Donne-moi la LISTE des
hypothèses qu'il faut chiffrer pour répondre à
« est-ce rentable ? ».

Pour chacune :
- son nom
- son unité
- QUI dans l'entreprise détient l'information

Si une hypothèse n'est détenue par personne, dis-le
explicitement : c'est celle-là qui m'intéresse le plus.
```

**Pourquoi ça marche.** « Qui détient l'information » transforme une liste de concepts en liste de coups de téléphone. Et la ligne « personne » vous dit où vous allez devoir décider vous-même — ici, la durée de montée en charge, qu'aucun service ne connaît et qu'il a fallu calibrer sur l'ouverture de Libreville.

---

## Prompt 2 — faire produire la structure, avant la première formule

```
Voici les 14 hypothèses retenues, avec leurs valeurs :
[votre liste]

Propose-moi la STRUCTURE du classeur : quelles feuilles,
et sur chaque feuille quelles colonnes.
Pas de formules pour l'instant.

Contraintes :
- toutes les saisies sur une seule feuille
- une projection mensuelle sur 24 mois
- il doit rester lisible par quelqu'un qui n'est pas moi
- il sera relu par un auditeur externe
```

**Pourquoi ça marche.** La structure d'un modèle financier est une convention publique, largement documentée. C'est exactement ce que l'IA restitue le mieux : vite, et complètement.

---

## Prompt 3 — le rattrapage, quand elle a oublié le terrain

> 🔴 **Sur ce cas, elle propose une feuille `ANALYSE` complète — et sans aucune sensibilité au taux de change.** C'est `V4` qui l'attrape : la vérité métier, le seul des cinq contrôles qu'elle ne pourra jamais faire à votre place.

```
Tu as oublié la variable qui décide.

Relis le bloc de contexte : on encaisse en XOF, on
décaisse en USD. Le taux de change n'est pas une
annexe de ce plan, c'est sa ligne du haut.

Reprends la feuille ANALYSE en mettant le taux de change
en variable principale.
Dis-moi quelles sensibilités tu proposes, et pourquoi
dans cet ordre.
```

**Ce qu'elle rend alors :** la table à deux entrées taux × volume, la recherche du taux de bascule, et — d'elle-même — la décomposition du flux en part « devise locale » et part « dollar ». C'est cette décomposition qui permet ensuite de calculer le taux limite par formule, sans tâtonner.

---

## Prompt 4 — faire challenger ses propres hypothèses

```
Voici mes 14 hypothèses chiffrées et le résultat :
VAN 33 175 USD à 14 % par an, TRI 27,1 %,
retour sur investissement au mois 20,
taux de bascule 644,44 XOF pour 1 USD.

Trois questions, dans cet ordre.

1. Quelles hypothèses ce modèle prend-il SANS LES DIRE ?
2. Laquelle a le plus d'effet sur la VAN, et de combien ?
3. Qu'est-ce qu'un auditeur externe demanderait en
   premier ?

Ne reformule pas mon modèle. Attaque-le.
```

**La question 1 est celle à retenir.** Elle marche sur n'importe quel modèle — y compris ceux qu'on vous envoie. Sur celui-ci, elle a sorti quatre trous réels : le besoin en fonds de roulement, la fiscalité malienne, l'absence d'indexation des charges, et le stock initial jamais récupéré.

Deux ont été assumés et écrits dans `README`. Deux mériteraient une version 2.

> **Un modèle dont on connaît les limites vaut infiniment mieux qu'un modèle dont on les découvre en réunion.**

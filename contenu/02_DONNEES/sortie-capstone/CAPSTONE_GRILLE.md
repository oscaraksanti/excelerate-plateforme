# 🏆 CAPSTONE — la grille de correction entre pairs
### Six critères, chacun de 0 à 4 · à garder ouvert pendant la correction

> Vous corrigez **trois** copies. Votre médiane compte pour 70 % de la note de l'auteur. Prenez-y quarante minutes chacune, pas cinq.
>
> **Vous ne jugez pas le goût.** Chaque critère dit exactement quoi regarder, et dans quel ordre.

| Note | Ce que ça veut dire |
|:--:|---|
| 0 | absent |
| 1 | insuffisant |
| 2 | correct |
| 3 | bien |
| 4 | exemplaire |

---

## 1 · L'exactitude et la cohérence des chiffres

- [ ] `R_RECONCILIATION` vaut **zéro**
- [ ] `R_CONTROLE` vaut **zéro**
- [ ] Les cinq chiffres d'import de l'énoncé tombent juste
- [ ] Les quatre familles d'écarts sont toutes les quatre présentes et chiffrées
- [ ] La somme par agence redonne le total général
- [ ] Le chiffre du `DASHBOARD` et celui de `REPONSES` sont **le même**

> **Le dernier point attrape la faute la plus fréquente :** un tableau de bord alimenté par une source, une feuille de réponses par une autre. Vérifiez-en un, au hasard.

## 2 · L'architecture et la modélisation

- [ ] Les données sources ne sont **pas** collées à la main : il y a des requêtes, ou au moins des tableaux structurés nommés
- [ ] Le flux va dans un seul sens — brut, propre, calculs, restitution
- [ ] Les 21 sources sont **toutes** utilisées, ou leur non-usage est justifié
- [ ] Une table de calendrier existe *(ou son équivalent : une colonne de dates complète)*
- [ ] Au moins dix mesures ou indicateurs nommés **en français métier**, pas `Mesure1`
- [ ] Aucune valeur en dur dans une formule de calcul

## 3 · La qualité et la traçabilité des données

- [ ] La feuille `QUALITE` porte les **dix** contrôles
- [ ] Aucun ne montre `FAIL`
- [ ] Le contrôle n° 8 redonne le **même nombre** que la famille ③ du rapprochement
- [ ] Les dix-huit clients à défaut de saisie sont comptés
- [ ] Le nettoyage est **documenté** — on sait ce qui a été corrigé, et où
- [ ] La facture scannée a été saisie **et** son total imprimé sert de contrôle

## 4 · La restitution et la lisibilité

- [ ] `DASHBOARD` tient sur **une** page
- [ ] On comprend la situation du groupe en **huit secondes**, sans explication
- [ ] Les montants portent leur devise, les pourcentages leur signe
- [ ] Au moins un élément interactif — segment, liste, filtre
- [ ] `NOTE_DE_SYNTHESE` tient en une page et **commence par la recommandation**
- [ ] Un export PDF est lisible : rien n'est coupé, aucun `#####`

## 5 · La reproductibilité et la documentation

- [ ] `README` rempli, et il explique les **choix**, pas seulement les données
- [ ] La procédure d'actualisation du mois prochain est écrite
- [ ] Les définitions de KPI disent comment **ce** classeur les calcule
- [ ] Une rubrique « ce que ce modèle ne dit pas » existe et n'est pas vide
- [ ] Une automatisation rejoue le tout — macro ou requête paramétrée
- [ ] Une contrainte de plateforme *(Mac, Excel web, macros bloquées)* est **déclarée** si elle s'applique

> 🔴 **Une contrainte de plateforme déclarée ne se pénalise pas.** Power Pivot n'existe pas sur Mac ; un modèle fait en tableaux structurés et `RECHERCHEX` vaut autant, à chiffres égaux.

## 6 · L'usage critique de l'IA

- [ ] `ANNEXE_IA` contient les prompts, **tels qu'ils ont été écrits**
- [ ] **Trois** erreurs d'IA au moins, décrites précisément
- [ ] Chacune porte le `V` qui l'a attrapée
- [ ] Chacune dit **comment** elle a été vue, pas seulement qu'elle existait
- [ ] Au moins une suggestion refusée, avec sa raison
- [ ] *« J'ai utilisé l'IA »* sans rien d'autre : **0**

---

## Le commentaire obligatoire

Deux cents caractères au moins, sur **le critère le plus faible**. Dites ce qui manque et ce qui le corrigerait. *« Bien joué »* n'apprend rien à personne, et c'est la moitié de l'intérêt de l'exercice.

## Ce qui n'entre pas dans votre note

La **soutenance** — les cinq derniers points — est notée par le formateur, après le dépôt. Vous n'avez pas à en tenir compte.

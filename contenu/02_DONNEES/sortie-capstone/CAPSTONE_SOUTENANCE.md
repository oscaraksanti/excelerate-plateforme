# 🏆 CAPSTONE — la banque de questions de soutenance
### Dix minutes · écran partagé · trois questions tirées au hasard

> **Elle est publiée exprès.** Non pas pour que vous la révisiez — les questions portent sur **votre** fichier, personne ne peut vous souffler les réponses — mais parce qu'un fichier qu'on peut expliquer se construit autrement qu'un fichier qui marche.
>
> Lisez-la **avant** de commencer, pas la veille de la soutenance.

---

## Comment ça se passe

Dix minutes, en visioconférence, vous partagez votre écran. J'ouvre votre classeur. Je tire **trois questions**, une dans chacun des trois premiers blocs. Vous montrez et vous expliquez.

**Il n'y a pas de bonne réponse unique.** Un choix défendable et assumé vaut mieux qu'un choix « correct » que vous ne pouvez pas justifier. Et *« je ne sais plus pourquoi j'ai fait ça »* est une réponse — elle coûte des points, elle ne vous disqualifie pas.

Ce qui disqualifie, c'est **« c'est Claude qui l'a fait »** suivi d'un silence.

---

## Bloc A — le modèle et les données

1. Montrez-moi votre table de faits. **Une ligne, c'est quoi exactement ?**
2. Pourquoi cette granularité et pas une plus fine ? Qu'est-ce que vous ne pourrez plus jamais analyser ?
3. Montrez une relation. **Dans quel sens le filtre circule-t-il ?** Qu'est-ce qui filtre quoi ?
4. Vous avez six agences et trois devises. **À quel moment exact convertissez-vous en dollars, et pourquoi à ce moment-là ?**
5. Ouvrez `R04_Taux_Change.xlsx`. Le XOF et le XAF ont le même taux. **Est-ce une erreur du fichier ?**
6. Montrez-moi une étape de votre requête Power Query que vous pourriez supprimer sans rien casser. Pourquoi est-elle là ?
7. Le fichier `V04` a une colonne que les trois autres n'ont pas. **Qu'en avez-vous fait, et pourquoi ce choix ?**
8. Les stocks arrivent en tableaux croisés. **Montrez-moi l'étape qui les dépivote** et dites ce qui se serait passé sans.
9. Un des CSV est en cp1252. **Comment l'avez-vous su**, et qu'est-ce que ça change ?
10. `CPT_Journal_Caisse.csv` porte des dates au format américain. Montrez comment vous les avez lues.

## Bloc B — le rapprochement

11. Montrez-moi `R_RECONCILIATION`. **Pourquoi doit-elle valoir zéro** et pas « à peu près zéro » ?
12. Prenez une facture de la famille ③. **Ouvrez les deux sources et montrez-moi l'écart.**
13. La famille ② est faite de régularisations de clôture. **Faut-il les retirer du chiffre d'affaires, ou pas ?** Défendez votre réponse.
14. Les doublons sont comptés deux fois côté comptable. **Quel signe a leur contribution à l'écart**, et pourquoi ?
15. Vous avez rapproché sur quoi — le code, le numéro de facture, le nom ? **Qu'est-ce qui se serait passé si vous aviez rapproché sur le nom du client ?**
16. Le commercial est au grain de la ligne, la compta au grain de la facture. **Montrez-moi l'endroit de votre modèle où les deux se rencontrent.**
17. Si un seizième écart apparaissait le mois prochain, **dans quelle famille tomberait-il** ? Et si dans aucune ?

## Bloc C — la restitution et les choix

18. Votre `DASHBOARD` porte *n* indicateurs. **Lequel retireriez-vous** si on vous demandait d'en enlever un ?
19. Montrez-moi un chiffre de votre tableau de bord et **remontez jusqu'à la source**, clic par clic.
20. Votre `NOTE_DE_SYNTHESE` recommande quelque chose. **Quel chiffre de votre fichier la porte ?**
21. Ouvrez `ANNEXE_IA`. **Racontez-moi la première erreur** : ce que vous avez demandé, ce qu'elle a rendu, comment vous l'avez vue.
22. Cette erreur-là — **quel `V` l'a attrapée** ? Aurait-elle pu être attrapée par un autre ?
23. Qu'est-ce que l'IA vous a proposé **que vous avez refusé** ? Pourquoi ?
24. Votre table de données à deux entrées croise deux variables. **Pourquoi ces deux-là ?**
25. Montrez-moi la cellule la plus compliquée de votre fichier, et expliquez-la **à voix haute, ligne par ligne**.
26. Dans six mois, quelqu'un d'autre ouvre ce classeur. **Qu'est-ce qui lui manquera ?**

## Bloc D — la question qui revient toujours

27. **Votre classeur donne un chiffre. Comment savez-vous qu'il est juste ?**

C'est la seule question à laquelle il faut savoir répondre sans réfléchir. La bonne réponse ne commence jamais par *« parce que la formule est bonne »* — elle commence par *« parce que ce contrôle-là vaut zéro »*.

---

## Ce qui rapporte, et ce qui coûte

| | |
|---|---|
| ✅ *« J'ai choisi ça parce que… et l'autre option aurait posé ce problème. »* | le maximum |
| ✅ *« Je ne me souviens plus. Mais je peux le retrouver : c'est écrit dans le `README`. »* | presque le maximum |
| ⚠️ *« Je ne sais plus pourquoi. »* | quelques points de moins |
| 🔴 *« C'est Claude qui l'a fait. »* | zéro sur le critère |

> **La différence entre les deux dernières lignes est toute la formation.**

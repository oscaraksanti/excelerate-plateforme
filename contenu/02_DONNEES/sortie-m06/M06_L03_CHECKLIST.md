# Module 6 · Leçon 3 — La liste de contrôle d'un tableau de bord

> À garder ouverte pendant la construction. Elle est dans l'ordre de fabrication, pas dans l'ordre d'importance.

---

## Avant d'ouvrir Excel

- [ ] **La question de décision est écrite en une phrase.** Pas « comment ça va » — une question dont dépend une action.
- [ ] Le destinataire est nommé, et son support est connu : écran, téléphone, ou papier.
- [ ] Les **quatre indicateurs** sont définis, pas seulement nommés :
  - [ ] une **valeur** — où en est-on
  - [ ] une **comparaison** — par rapport à quoi
  - [ ] une **tendance** — dans quel sens
  - [ ] une **exception** — qu'est-ce qui cloche
- [ ] L'esquisse papier est faite : cinq rectangles, deux minutes.

---

## L'installation à faire une seule fois

- [ ] **L'appareil photo est dans la barre d'accès rapide.**
      `Fichier > Options > Barre d'outils Accès rapide > Commandes non présentes dans le ruban > Appareil photo > Ajouter`

C'est l'outil avec lequel se construisent les vrais tableaux de bord, et il n'apparaît dans aucun ruban. Il crée une **image liée** d'une plage : elle se met à jour toute seule, se déplace librement, et permet à chaque bloc d'avoir ses propres largeurs de colonnes.

**C'est ce qui remplace la fusion de cellules** — laquelle casse le tri, le filtre, les tableaux croisés et la sélection.

---

## La couche de calcul

- [ ] Une feuille `CALCULS` séparée, jamais de calcul sur la page affichée.
- [ ] **Une seule cellule de paramètre** — le mois, la période, le périmètre. Tout le reste en dépend.
- [ ] Les indicateurs sont rangés en deux colonnes : **nom technique à gauche, valeur à droite**.
- [ ] Les plages nommées sont créées en un geste : sélectionner les deux colonnes, `Ctrl + Maj + F3`, **Colonne de gauche**.
- [ ] Une troisième colonne porte le libellé lisible — les noms Excel ne prennent ni espace ni accent.
- [ ] **Deux cellules de contrôle qui valent 0.**

---

## La page

- [ ] Le **titre affirme** : un chiffre et un verbe. Pas une étiquette.
- [ ] Sous le titre : la source, la période, l'unité, la date d'actualisation.
- [ ] Les quatre indicateurs sont alignés, de même taille, en haut.
- [ ] **L'exception est en grand**, et elle nomme quelque chose : une agence, un produit, un client.
- [ ] Le détail qui la justifie est à côté, pas ailleurs.
- [ ] La tendance est en bas : une courbe, douze points, sans quadrillage.
- [ ] Les formes pointent des **noms** — `=KPI_CA` — jamais des adresses.
- [ ] **Aucun camembert.**
- [ ] **Aucune information portée par la seule couleur.**

---

## Les finitions

- [ ] `Affichage > décocher Quadrillage`
- [ ] `Affichage > décocher Titres`
- [ ] Les feuilles de calcul sont masquées — clic droit sur l'onglet > Masquer.
      *(Pour aller plus loin : `Alt + F11`, propriété `Visible` à `xlSheetVeryHidden`.)*
- [ ] La feuille est protégée **en laissant cochées** « Sélectionner les cellules déverrouillées », « Utiliser le tri », « Utiliser le filtre automatique », et « Utiliser les rapports de tableau croisé dynamique » si un segment est présent.
- [ ] Zone d'impression définie · **Paysage** · **Ajuster : 1 page en largeur, 1 en hauteur**.
- [ ] `Ctrl + F2` : **une seule page**.

---

## Les deux tests, avant d'envoyer

### Le test des huit secondes

> Ouvrir. Regarder **huit secondes**. Fermer.
> *« [votre question de décision] »*

Par quelqu'un qui n'a pas vu vos données. S'il hésite, ce n'est pas lui qui a mal lu.

### Le test du noir et blanc

> Imprimez la page en noir et blanc, ou regardez-la en niveaux de gris.

Si l'exception ne se voit plus, c'est que la couleur codait seule. Ajoutez une icône, un signe, un mot — quelque chose qui survive au gris.

---

## Ce qui casse un tableau de bord, par ordre de fréquence

1. On a commencé par la mise en forme, pas par la question.
2. Quatorze indicateurs de la même taille : aucun ne ressort.
3. Il faut faire défiler : ce qui est en bas n'existe pas.
4. Des cellules fusionnées pour la mise en page.
5. Des formes qui pointent `=$J$5` : une ligne insérée, et l'indicateur ment.
6. Rouge et vert, sans autre codage.
7. Personne n'a fait le test des huit secondes.

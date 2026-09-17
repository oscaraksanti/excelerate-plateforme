# 🎁 Bonus Niveau + — Les quinze pièges qui font perdre un fichier
### Module 9 · à relire avant chaque envoi

> Chacun de ces quinze a déjà coûté une journée à quelqu'un. Ils sont classés par ce qu'ils cassent : le calcul, la lecture, la transmission.

---

## Ce qui casse le calcul

### 1 · La référence circulaire involontaire

Une somme qui s'étend jusqu'à sa propre cellule. Excel affiche `0` et une petite mention en bas de fenêtre — que personne ne lit.

**Le trouver :** `Formules > Vérification des erreurs > Références circulaires`. Il donne l'adresse.
**L'éviter :** ne jamais écrire `=SOMME(B:B)` dans la colonne `B`.

### 2 · Le calcul passé en mode manuel

Quelqu'un l'a mis en manuel pour survivre à un gros fichier, a enregistré, et le classeur transporte le réglage. **Vos formules ne se recalculent plus. Rien ne le dit.**

**Le trouver :** `Formules > Options de calcul`. Ou : `F9` change un chiffre → c'est qu'il était périmé.
**La règle :** le mode de calcul est enregistré **dans le fichier**, pas dans votre Excel.

### 3 · Les liens externes cassés

`='[Budget_2026.xlsx]T1'!B4`. Le fichier a été renommé, déplacé, ou il vit sur le lecteur réseau de quelqu'un d'autre. À l'ouverture : `#REF!`, ou pire, **l'ancienne valeur mise en cache, qui a six mois.**

**Les trouver :** `Données > Modifier les liens`. Si le bouton est grisé, il n'y en a aucun — et c'est une bonne nouvelle.
**La règle :** zéro lien externe, ou chacun justifié dans `README`.

### 4 · `SIERREUR` posé partout

```
=SIERREUR(RECHERCHEX(...) ; 0)
```

Ça fait disparaître le `#N/A`. **Ça fait aussi disparaître le fait qu'une clé sur douze n'est pas trouvée** — et votre total est faux de 8 % sans que rien ne s'affiche.

**La règle :** `SIERREUR` seulement quand vous savez **pourquoi** l'erreur arrive et que le remplacement est juste. Sinon, laissez l'erreur crier.

### 5 · Les valeurs en dur au milieu des formules

La colonne est en formules, sauf la ligne 47 où quelqu'un a tapé le résultat « juste pour aujourd'hui ». C'était il y a onze mois.

**Les trouver :** `F5 > Cellules > Constantes`, ou la formule de la leçon 9.3 :
```
=SOMMEPROD((zone<>"") * NON(ESTFORMULE(zone)))
```

### 6 · La précision au format affiché

`Fichier > Options > Options avancées > Définir le calcul avec la précision au format affiché`. Cochée, elle **tronque définitivement** toutes les valeurs du classeur à ce qui est affiché.

**C'est irréversible.** Décocher ne rend pas les décimales perdues. Un classeur de comptabilité peut perdre quelques centimes par ligne, et quelques milliers en bas.

### 7 · Les dates régionales

Un CSV américain ouvert sur un Excel français : `03/04/2026` devient le 3 avril au lieu du 4 mars. **Les douze premiers jours de chaque mois sont ambigus, les autres sont convertis en texte.** Un tri « chronologique » donne alors n'importe quoi.

**La parade :** importer par Power Query en désignant explicitement la locale de la colonne.

---

## Ce qui casse la lecture

### 8 · Les colonnes masquées qui contiennent des données

Elles ne se voient pas, et elles entrent dans toutes les sommes. Un total qui ne colle pas avec l'addition mentale des colonnes visibles, c'est presque toujours ça.

**Les trouver :** `Ctrl+A`, puis `Format > Masquer & afficher > Afficher les colonnes`.

### 9 · Les lignes filtrées prises pour des lignes supprimées

Vous filtrez, vous copiez, vous collez ailleurs : Excel ne copie que le visible — **bien**. Vous filtrez, vous faites `=SOMME()` : elle additionne **tout**, visible ou non.

**La parade :** `SOUS.TOTAL(109 ; plage)` ou `AGREGAT(9 ; 5 ; plage)` ignorent les lignes masquées par un filtre. `SOMME` non.

### 10 · Les cellules fusionnées

Elles cassent le tri, le filtre, la sélection de colonne entière, les tableaux structurés et la moitié des formules matricielles.

**La parade :** `Format de cellule > Alignement > Centré sur plusieurs colonnes`. Le rendu est identique, et rien ne casse.

### 11 · Les plages nommées orphelines

`Formules > Gestionnaire de noms`, colonne **Valeur** : les `#REF!` sont des noms dont la plage a été supprimée. Ils traînent, ils apparaissent dans l'autocomplétion, et ils polluent chaque nouveau classeur qui copie une feuille depuis celui-ci.

**Triez par la colonne Valeur et supprimez-les.** C'est trente secondes.

---

## Ce qui casse la transmission

### 12 · Les feuilles très masquées oubliées

`xlSheetVeryHidden` : invisible même dans le menu Afficher. Le jour où vous partez, personne ne sait qu'elle existe.

**La règle :** s'il y en a une, elle est écrite dans `README`. Toujours.

### 13 · Les macros sans documentation

Un bouton, un nom de procédure, et aucun commentaire. Six mois plus tard, personne n'ose cliquer.

**La règle :** trois lignes en tête de chaque procédure — ce qu'elle fait, ce qu'elle suppose, ce qu'elle modifie. Et le classeur en `.xlsm`, jamais en `.xlsx` renommé.

### 14 · Le classeur ouvert en lecture seule sans qu'on le sache

Un fichier `~$Modele.xlsx` traîne à côté du vôtre : c'est un verrou laissé par un Excel qui s'est arrêté brutalement. Le fichier s'ouvre alors en lecture seule, **les modifications semblent fonctionner, et l'enregistrement échoue.**

**La parade :** fermer Excel, supprimer le fichier `~$...`, rouvrir.

### 15 · Et le pire : le classeur qu'une seule personne sait faire tourner

Pas de `README`, une procédure d'actualisation qui vit dans la tête de quelqu'un, trois macros non documentées, un mot de passe connu d'une seule personne.

Tant que cette personne est là, tout va bien. **C'est ce qui rend le problème invisible jusqu'au jour où il coûte le plus cher.**

> **Les quatorze premiers pièges sont techniques et se réparent en une heure. Le quinzième est organisationnel, et il ne se répare qu'en amont — en écrivant, pendant qu'on construit.**

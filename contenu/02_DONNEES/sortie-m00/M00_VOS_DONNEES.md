# Fabriquez le jeu de données de VOTRE métier
### Dix minutes, et chaque TP devient le vôtre

> BAOBAB sert d'exemple commun — c'est utile pour que tout le monde parle de la même chose pendant les directs. **Mais le vrai bénéfice arrive quand vous refaites chaque geste sur vos chiffres.**

## La règle que je vous propose

**Faites le TP sur BAOBAB** — il est noté, et ses réponses sont vérifiables.
Puis refaites-en **une seule partie** sur vos propres données. Dix minutes, la même semaine.

C'est ce qui transforme un exercice en compétence. Et c'est ce que vous montrerez en entretien.

---

## Le prompt — à copier, à adapter, à réutiliser

```
Fabrique-moi un jeu de données Excel réaliste pour :
[VOTRE MÉTIER, en une phrase]

Volume : 300 lignes
Colonnes : [CE QUE VOUS SUIVEZ VRAIMENT]
Période : les 12 derniers mois

Rends-le RÉALISTE, donc imparfait :
- 3 % de lignes avec une valeur manquante
- 5 lignes en double exact
- quelques nombres stockés en TEXTE (avec un espace, ou une virgule
  décimale là où il faudrait un point)
- deux ou trois libellés avec un espace en trop, ou une casse
  différente du reste
- une ou deux dates au mauvais format

Donne-moi le résultat en CSV.

Puis, EN DESSOUS et séparément :
- le total exact de la colonne [MONTANT]
- le nombre de lignes
- la liste précise des anomalies que tu as introduites, avec
  le numéro de ligne de chacune
```

> 💎 **Les trois dernières lignes sont l'essentiel.**
>
> Sans elles, vous avez un fichier. Avec elles, vous avez un fichier **et la vérité à laquelle le comparer** — donc un total de contrôle, donc la possibilité de savoir si vous avez juste.
>
> C'est exactement ce que le module 2 vous apprendra à faire sur de vraies données.

---

## Six exemples, prêts à l'emploi

### Pharmacie / dépôt pharmaceutique
```
Colonnes : Date · Code_Produit · Designation · Famille (antipaludéen,
antibiotique, antalgique, vitamine) · Quantite · Prix_Unitaire ·
Date_Peremption · Fournisseur · Montant
```
*Le geste à refaire :* le stock qui périme dans moins de 90 jours.

### École / établissement de formation
```
Colonnes : Date_Paiement · Matricule · Nom_Eleve · Classe · Niveau ·
Type_Frais (inscription, scolarité, examen) · Montant_Du ·
Montant_Paye · Mode_Paiement
```
*Le geste à refaire :* le taux de recouvrement par classe, et les impayés.

### Transport / logistique
```
Colonnes : Date · Numero_Course · Vehicule · Chauffeur · Origine ·
Destination · Distance_Km · Carburant_Litres · Cout_Carburant ·
Recette · Type_Chargement
```
*Le geste à refaire :* le coût au kilomètre par véhicule, et celui qui coûte le plus.

### ONG / projet financé
```
Colonnes : Date · Code_Projet · Bailleur · Ligne_Budgetaire ·
Activite · Montant_Budget · Montant_Engage · Montant_Decaisse ·
Devise · Zone
```
*Le geste à refaire :* le taux d'exécution budgétaire par ligne, et ce qui est en retard.

### Boutique / commerce de détail
```
Colonnes : Date · Ticket · Article · Categorie · Quantite ·
Prix_Achat · Prix_Vente · Vendeur · Mode_Paiement
```
*Le geste à refaire :* la marge par catégorie, et les articles vendus à perte.

### Cabinet / prestation de services
```
Colonnes : Date · Reference_Mission · Client · Consultant ·
Type_Prestation · Heures · Taux_Horaire · Montant_Facture ·
Statut_Paiement · Date_Reglement
```
*Le geste à refaire :* le délai moyen de paiement par client, et qui paie mal.

---

## Si vous avez de vraies données

**Prenez-les. Même mal foutues — surtout mal foutues.** Un export de votre logiciel de gestion, votre suivi de caisse, votre fichier de stock.

> 🔴 **Deux précautions, et elles ne sont pas négociables.**
>
> **Anonymisez avant de montrer.** Si vous partagez un extrait dans le groupe ou pendant un direct : remplacez les noms de clients et les montants réels. Un `RECHERCHEX` marche aussi bien sur « Client 1 ».
>
> **Ne collez jamais de données réelles dans une IA** sans l'accord écrit de votre employeur. L'IA n'a pas besoin de vos données : elle a besoin de leur **forme**. Donnez-lui la liste des colonnes et trois lignes inventées — la réponse sera identique, et le risque aura disparu.

---

## Le fichier que vous construirez pour vous

À la fin du programme, vous aurez pris l'habitude de livrer un classeur avec ces feuilles-là :

```
README      ·  d'où viennent les données, comment actualiser
RAW         ·  les sources, intactes
CLEAN       ·  les mêmes, exploitables
CALCULS     ·  la mécanique
DASHBOARD   ·  une page, celle qu'on montre
QUALITE     ·  les contrôles qui bloquent l'envoi
```

**Faites-le dès maintenant sur vos propres données**, même vide, même maladroit. Vous le remplirez module après module — et au capstone, ce sera devenu un réflexe.

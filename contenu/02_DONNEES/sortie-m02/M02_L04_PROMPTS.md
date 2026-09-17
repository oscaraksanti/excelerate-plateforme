# Leçon 2.4 — Les prompts, prêts à copier

## 1. Le cahier des charges de formule — quatre blocs

```
[colle ici ton bloc E du module 1]

1. LES DONNÉES DISPONIBLES
Tableau t_Com, colonnes :
Matricule, Nom, Agence, Devise, Date_Embauche,
Objectif, Realise
Trois lignes d'exemple :
BAO-001 ; ... ; Kinshasa ; CDF ; 12/03/2019 ; 9 000 000 ; 9 000 000
BAO-002 ; ... ; Abidjan  ; XOF ; 01/09/2024 ; 1 800 000 ; 1 798 200
BAO-007 ; ... ; Douala   ; XAF ; 04/07/2022 ;         0 ;   720 000

2. LA RÈGLE MÉTIER
Taux de réalisation = Réalisé ÷ Objectif.
Paliers : <80 % → 0 % · 80-100 % → 4 % ·
100-120 % → 6 % · >120 % → 8 %.
Bonus de 5 % de la commission si l'objectif est
atteint ET l'ancienneté ≥ 2 ans révolus.
Plafond : jamais plus de 450 USD, converti au taux
de la devise du commercial.

3. LES CAS PARTICULIERS
Un objectif à zéro : le taux vaut 0, sans erreur
affichée. Exactement 100 % : palier 6 %. Exactement
deux ans d'ancienneté : le bonus tombe.

4. LA SORTIE ATTENDUE
Pour un réalisé de 12 000 000 CDF sur un objectif de
10 000 000 et trois ans d'ancienneté, je dois obtenir
756 000 CDF.

Donne-moi la formule, sa version anglaise, son
explication en deux lignes, ses cas limites, et un
jeu de test avec le résultat attendu ligne par ligne.
```

## 2. Le Protocole V4 — à écrire à chaque fois

```
V1 — Version       : ✓ / ✗  →  ce que j'ai vérifié
V2 — Valeurs       : ✓ / ✗  →  mes 3 cas + mon cas limite
V3 — Volumétrie    : ✓ / ✗  →  lignes entrée / sortie
V4 — Vérité métier : ✓ / ✗  →  l'ordre de grandeur
```

## 3. Les quatre prompts d'audit

**Expliquer une formule héritée**
```
Explique cette formule en français, étape par étape.
Dis-moi surtout ce qu'elle suppose SANS le dire :
hypothèses sur le tri, les doublons, les cellules
vides, les textes, les dates.

[colle la formule]
```

**Les trois cas où elle se trompe en silence** 💎
```
Donne-moi trois jeux de données où cette formule
rendrait un résultat faux SANS afficher d'erreur.
```

**La version la plus simple**
```
Quelle est la version la plus simple qui fait
exactement la même chose ?
```

**Le prompt du contrôleur** 💎💎
```
Joue le rôle du contrôleur de gestion qui doit
auditer cette formule avant qu'elle parte au conseil
d'administration. Qu'est-ce que tu lui reproches ?
Quelles hypothèses prend-elle sans les écrire ?
```

## 4. Le jeu de test qui casse la formule

```
Fabrique-moi dix lignes de données conçues pour faire
échouer la formule que tu viens d'écrire. Pour
chacune, dis-moi ce qui devrait se passer et ce qui
va réellement se passer.
```

---

## Les huit erreurs typiques de l'IA sur Excel

| # | L'erreur | Le V qui l'attrape |
|:--:|---|---|
| 1 | Séparateur `,` au lieu de `;` | V1 |
| 2 | Nom de fonction resté en anglais | V1 |
| 3 | Fonction inexistante dans votre version | V1 |
| 4 | Plage qui inclut ou exclut l'en-tête à tort | V3 |
| 5 | Hypothèse silencieuse que les données sont triées | V2 |
| 6 | Confusion entre formule, code M, DAX et VBA | V1 |
| 7 | DAX de Power BI non supporté par Excel | V1 |
| 8 | `SIERREUR` posé partout, qui masque un vrai problème | V2 |

## Ce qu'il faut écrire à la place de `SIERREUR`

```
=SI.NON.DISP(formule ; "Non trouvé")
        n'attrape QUE l'absence

=RECHERCHEX(x ; … ; … ; "absent")
        le filet est dans la fonction

=SI([@Objectif]=0 ; 0 ; [@Realise]/[@Objectif])
        on traite le cas, on ne le cache pas
```

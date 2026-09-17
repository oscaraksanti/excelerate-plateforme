# Leçon 1.4 — Les prompts, prêts à copier

## 1. Le bloc E — à garder pour toujours

```
MON ENVIRONNEMENT EXCEL

Excel 2024 en français, interface française.
Séparateur d'arguments : point-virgule.
Décimale : virgule.
Format de date : jj/mm/aaaa.
Devise : CDF (franc congolais).

Mes tableaux et leurs colonnes :
- t_Caisse : Date, Ticket, Client, Produit, Famille, Quantite, PU_CDF, Commercial, Montant
- t_Taux   : Mois, CDF_USD, XOF_USD, XAF_USD

Donne-moi toujours la formule en français ET en anglais.
N'utilise aucune fonction indisponible dans ma version ; si tu en
proposes une, signale-le et donne l'alternative.
```

## 2. Le prompt C.L.E.A.R. complet

```
CONTEXTE
Je suis contrôleur de gestion chez un distributeur agroalimentaire en
RDC. Six agences, trois devises de facturation, reporting consolidé
en dollars.

LOGIQUE
Je veux, pour un mois donné, retrouver le taux de change de ce mois,
puis convertir le chiffre d'affaires total en dollars.

ENVIRONNEMENT
[colle ici ton bloc E]

ACTION
Donne la formule, sa version anglaise, et l'explication en deux lignes.
Pas de cours sur la fonction.

REVUE
Donne-moi trois cas de test avec le résultat attendu, dont un cas
limite : un mois qui n'existe pas dans la table des taux.
```

## 3. Les quatre prompts d'usage courant

**Expliquer une formule héritée**
```
Explique cette formule en français, étape par étape, comme à quelqu'un
qui connaît Excel mais pas cette fonction. Dis-moi surtout ce qu'elle
suppose sans le dire — hypothèses sur le tri, sur les doublons, sur les
cellules vides.

[colle la formule]
```

**Corriger une erreur**
```
Cette formule renvoie [le message d'erreur exact].
Voici la formule : [...]
Voici cinq lignes réelles de mes données : [...]
[colle ton bloc E]

Diagnostique la cause, puis donne la correction. Ne réécris pas tout :
dis-moi ce qui n'allait pas.
```

**Demander trois solutions**
```
Donne-moi trois façons de faire : la plus simple, la plus robuste, la
plus rapide. Pour chacune, dis-moi ce qu'elle coûte et dans quel cas
elle casse.
```

**Le prompt du contrôleur** 💎
```
Joue le rôle du contrôleur de gestion qui doit auditer cette formule
avant qu'elle parte au conseil d'administration. Qu'est-ce que tu lui
reproches ? Quelles hypothèses prend-elle sans les écrire ?
```

## 4. Le meilleur test qui existe 💎

```
Fabrique-moi maintenant dix lignes de données conçues pour faire
échouer la formule que tu viens d'écrire. Pour chacune, dis-moi ce qui
devrait se passer et ce qui va réellement se passer.
```

## 5. Générer ton propre jeu de données

```
Tu génères un jeu de données Excel réaliste pour un exercice de formation.

MON CONTEXTE
Secteur : [...]
Pays : [...]
Devise : [...]
Mon métier : [...]

CE QUE JE VEUX
Un tableau de 60 lignes qui ressemble à ce que je manipule vraiment.
6 à 8 colonnes : au moins une date, un libellé texte, une catégorie
répétée (5 ou 6 valeurs distinctes), une quantité, un prix unitaire.

CONTRAINTES
- Des montants plausibles pour ce pays et ce secteur, pas des chiffres ronds
- Des noms crédibles localement
- Aucune donnée personnelle réelle
- CSV, séparateur point-virgule, décimale virgule, en-têtes sans accent
- Ne calcule aucun total : je veux le faire moi-même
```

---

## Le Protocole V4 — à appliquer à chaque fois

| | Contrôle | La question | Temps |
|---|---|---|---|
| **V1** | Version | Cette fonction existe-t-elle dans MON Excel ? Le séparateur est-il le bon ? | 10 s |
| **V2** | Valeurs | Juste sur 3 cas connus **et 1 cas limite** ? | 2 min |
| **V3** | Volumétrie | Ça tient sur toute la plage ? Combien de lignes en entrée, combien en sortie ? | 1 min |
| **V4** | Vérité métier | L'ordre de grandeur est-il plausible ? Un collègue validerait-il ? | 1 min |

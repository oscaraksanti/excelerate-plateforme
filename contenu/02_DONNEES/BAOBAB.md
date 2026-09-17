# LE FIL ROUGE — GROUPE BAOBAB
### L'univers, les personnages, et les jeux de données des 10 modules

---

# 1. L'entreprise

> **GROUPE BAOBAB SARL** — distributeur agroalimentaire : huiles, riz, farine, boissons, savons, conserves.
> **6 agences** : Kinshasa · Lubumbashi · Abidjan · Dakar · Douala · Libreville
> 42 commerciaux · 980 références · 3 600 clients — grossistes, supermarchés, boutiques de quartier, restauration
> **Chiffre d'affaires consolidé : 28 millions USD**
> **Trois devises de facturation** : franc congolais **CDF**, FCFA Ouest **XOF**, FCFA Central **XAF**. **Reporting consolidé en USD.**

## Pourquoi cette entreprise et pas une autre

Le public d'Excelerate IA est réparti sur **douze pays** : RDC 48 %, Côte d'Ivoire 8 %, Cameroun 5 %, Sénégal 4 %, Bénin 4 %, Tchad 4 %, Togo 3 %, Burkina Faso 3 %, Guinée 3 %, Congo 3 %, Mali 2 %, France 1 %.

Un fil rouge basé sur une entreprise française ou sur un magasin unique aurait exclu les trois quarts de la promotion. Une entreprise à six agences, sur quatre pays et trois devises, est **le quotidien réel** d'une grande partie de ce public — et c'est un terrain qu'aucune formation Excel francophone n'exploite.

## Pourquoi le multi-devises est pédagogique, pas décoratif

Il fait travailler, naturellement et sur les dix modules :

| Module | Ce que la devise fait travailler |
|:--:|---|
| M1 | Formats monétaires personnalisés · **la cellule unique de taux**, référencée en absolu · `RECHERCHEX` du taux du bon mois |
| M2 | Conversion dans une formule de commission · le total de contrôle en devise de reporting |
| M3 | Trois formats de nombre dans un même tableau · nettoyage de montants stockés en texte |
| M4 | Rapprochement de trois fichiers libellés dans trois devises |
| M5 | TCD en devise locale **et** en devise de reporting |
| M6 | Afficher « 1,2 M USD » sans casser le calcul |
| M7 | La conversion dans Power Query, faite une fois pour toutes |
| M8 | Une mesure DAX en devise de reporting, avec sa table de taux |
| M9 | **La sensibilité du résultat au taux de change** — le vrai sujet d'un business plan africain |
| M10 | Un classeur livré qui gère les trois devises sans intervention |

---

# 2. Les personnages

| Personnage | Rôle | Ce qu'il exige | Où il apparaît |
|---|---|---|---|
| **Nadège Kalala** | DAF, Kinshasa | **La fiabilité.** Elle vérifie tout, elle pose les questions difficiles. C'est elle qui dit « ce chiffre est impossible ». | M1, M2, M5, M9 |
| **Serge Kouadio** | Directeur commercial, Abidjan | **Du visuel, vite.** Lisible en 8 secondes, sur un téléphone, en réunion. | M2, M5, M6 |
| **Aïcha Ndiaye** | Responsable logistique, Dakar | **Qu'on lui rende ses 3 heures du lundi matin.** C'est l'incarnation du gain de temps. | M1, M3, M7, M10 |
| **Thomas Mbarga** | Stagiaire, Douala | Il fait tout à la main. **C'est l'apprenant du jour 0.** | partout |

## L'arc de Thomas — le dispositif narratif du programme

Thomas est l'avatar de l'apprenant. Il doit avoir une trajectoire visible, et elle se raconte en trois soirs :

| | Où en est Thomas | Ce que l'apprenant ressent |
|:--:|---|---|
| **Avant** | Il tient la caisse sur un cahier. Il ressaisit 14 factures par semaine à la main. | « C'est moi. » |
| **Soir 1** | Il photographie une facture, elle devient un tableau vérifié en 90 secondes. | « Moi aussi je peux. » |
| **Soir 2** | Il trouve les 5 anomalies du fichier que personne n'osait ouvrir. Nadège le remercie devant l'équipe. | « On me prendrait au sérieux. » |
| **Soir 3** | Il appuie sur **Actualiser**. Le rapport de 3 heures est fait. Aïcha récupère ses lundis matin. | « Je veux la suite. » |

> **Cet arc est la mécanique de conversion du mercredi soir.** Il ne se raconte pas, il se montre : à chaque module, une scène où Thomas fait ce que l'apprenant vient d'apprendre.

---

# 3. La progression des données

| Module | Jeu de données | Volume | La difficulté ajoutée |
|:--:|---|---|---|
| **M1** | Caisse d'une agence + une facture scannée + la table des taux | 60 lignes · 1 PDF · 24 taux | Données non structurées, trois devises |
| **M2** | Objectifs et commissions des 42 commerciaux + un budget saboté | 42 lignes | Règles métier imbriquées, plafonds, **5 pièges** |
| **M3** | Export CRM issu d'une fusion + 12 fichiers mensuels | 5 000 lignes · 12 fichiers | Doublons, casse, espaces insécables, dates texte, six formats de téléphone |
| **M4** | Commandes / Livraisons / Factures | 3 × 8 000 lignes | **Clés qui ne concordent pas**, trois devises |
| **M5** | Ventes détaillées 24 mois | 120 000 lignes | Multi-dimensions |
| **M6** | `J06_Synthese_Mensuelle.xlsx` *(434 + 72 lignes, agrégé depuis J05)* + `J06_Rapport_Mensuel_Actuel.xlsx` | 2 fichiers | Design et restitution |
| **M7** | 12 fichiers mensuels des 6 agences | 12 fichiers hétérogènes | Colonnes qui bougent, tableaux croisés reçus |
| **M8** | Faits + dimensions + calendrier + taux de change | 6 tables | Modélisation en étoile |
| **M9** | Business plan de la 7ᵉ agence | — | Hypothèses, scénarios, optimisation |
| **M10** | 200 classeurs clients + tout le reste | 200 fichiers | Industrialisation et livraison |

---

# 4. Spécification des jeux de données

## `J01_Caisse_Kinshasa.xlsx` — module 1

Feuille unique `Caisse`, 60 lignes, période **1 → 30 septembre 2026**.

| Colonne | Type | Contenu | Défauts volontaires |
|---|---|---|---|
| `Date` | date | sept. 2026 | **8 lignes au format texte `03/09/26`** |
| `Ticket` | texte | `KIN-0001` … | 2 doublons |
| `Client` | texte | 18 clients distincts | casse incohérente, 3 espaces insécables |
| `Produit` | texte | 12 produits | — |
| `Famille` | texte | Huiles · Riz · Farine · Boissons · Savons · Conserves | — |
| `Quantite` | entier | 1 → 240 | 1 valeur négative |
| `PU_CDF` | nombre | 2 500 → 180 000 | **6 valeurs stockées en texte** |
| `Commercial` | texte | 7 commerciaux | — |

> **Total attendu après nettoyage** : à figer une fois le fichier généré, et à reporter dans `04_TP/TP-01.md`.

## `J01_Taux_Change.xlsx` — module 1

Feuille `Taux`, tableau structuré **`t_Taux`**, 24 lignes (sept. 2025 → août 2026… puis sept. 2026).

| `Mois` | `CDF_USD` | `XOF_USD` | `XAF_USD` |
|---|---|---|---|
| date, 1er du mois | ~2 800 | ~600 | ~600 |

**Le taux de septembre 2026 est la valeur pivot de tout le module 1.** C'est lui qu'on va chercher avec `RECHERCHEX`, et c'est la seule cellule de taux du classeur.

## `J01_Facture_Fournisseur.pdf` — module 1, leçon 5

Une facture **photographiée de travers**, légèrement floue, 14 lignes d'articles, un total imprimé.

> 🔴 **Elle doit contenir un chiffre volontairement ambigu** — un `8` qui peut se lire `3`. C'est le cœur pédagogique de la leçon : le total de contrôle attrape l'erreur de lecture. Sans ce piège, la leçon n'enseigne rien, elle émerveille.

## `J02_Commissions_BAOBAB.xlsx` — module 2

`t_Commerciaux` — 42 lignes : `Matricule`, `Nom`, `Agence`, `Devise`, `Date_Embauche`, `Objectif`, `Realise`.
`t_Baremes` — 3 paliers de commission, un plafond à 8 % du CA, un bonus d'ancienneté à 2 ans.

**Cas limites obligatoires** : un commercial exactement à 100 % de l'objectif · un à 99,9 % · un embauché il y a exactement 2 ans · un au-dessus du plafond · un à zéro réalisé.

## `J02_Budget_SABOTE.xlsx` — module 2, leçon 3

Un classeur hérité dont le contrôle général affiche **4 272 USD** là où le consolidé en vaut **1 928**, et dont le CA total oublie **5 050 000 CDF**. **Cinq anomalies, et cinq seulement :**

| # | L'anomalie | Ce qui la révèle |
|:--:|---|---|
| 1 | Une `SOMME` qui s'arrête 3 lignes trop tôt | `F5 > Différences entre lignes` |
| 2 | Une valeur en dur au milieu d'une colonne de formules | Le triangle vert, ou `F5 > Formules` |
| 3 | Un taux de change écrit en dur dans la formule, au lieu de la cellule nommée | `Ctrl+[` |
| 4 | Une ligne de total incluse dans la somme des détails | Le total de contrôle ≠ 0 |
| 5 | Un lien externe vers `C:\Users\ancien_collegue\` | `Données > Modifier les liens` |

> **Un fichier formateur séparé** documente les 5 pièges, leur cause, leur impact chiffré et leur correction. **Il n'est jamais publié.**

## `J03_CRM_Fusion.xlsx` — module 3

5 000 clients issus d'un autre CRM. **Volontairement catastrophique — 18 anomalies plantées :**

| Famille | Anomalies |
|---|---|
| Noms | MAJUSCULES, minuscules, ordre inversé, doubles espaces |
| **Espaces insécables `U+00A0`** | sur 412 lignes, invisibles, que `SUPPRESPACE` n'enlève pas. Se détectent par `UNICAR(160)`, jamais par `CAR(160)` |
| Dates | `03/04/25` ambigu · format américain · dates stockées en texte · 12 dates impossibles (31/02) |
| Téléphones | six formats, avec et sans indicatif, avec espaces, points, tirets |
| Emails | espaces avant/après, majuscules, 40 doublons de casse |
| Villes | **14 orthographes de « Kinshasa »** |
| Doublons | 340, dont 190 invisibles tant que la casse n'est pas normalisée |
| Montants | 210 stockés en texte |

> 🔴 **Les 190 doublons invisibles sont le cœur de la leçon 3.4** : l'IA propose de dédoublonner avant de normaliser la casse. Résultat : elle n'en trouve que 150 et ne le signale pas.

## Les jeux des modules 4 à 10

Spécifiés au moment de la production de chaque module. Contraintes déjà arrêtées :

- **M4** — les trois fichiers ont des clés qui ne concordent pas : espaces, casse, préfixes, et **8 commandes livrées jamais facturées, pour 84 320 USD**
- **M5** — 120 000 lignes sur 24 mois *(oct. 2024 → sept. 2026)*, ce qui force le tableau structuré et rend le TCD indispensable. **Trois faits construits, pas subis :**
  - **le reclassement de Douala au 1er mars 2026** — `Savons` → `Hygiène & entretien`, `Conserves` → `Épicerie sèche`. Mêmes produits, mêmes clients, mêmes prix. Une analyse filtrée sur les six familles historiques affiche **−12,2 %** là où l'agence **progresse de +2,9 %**. 623 248,35 USD sortent des tableaux.
  - **37 références vendues une seule fois** dans l'exercice, exactement.
  - **9 quantités stockées en texte** sur 29 046 lignes — de quoi faire basculer un TCD en « Nombre de ».
  - CA consolidé de l'exercice : **28 022 768,30 USD**, conforme aux 28 M du fil rouge. *(Relevé sur le fichier livré ; une première mesure annonçait 28 022 927,06 — elle datait d'avant le rattachement des 37 références en fin de vie aux trois agences du TP.)*
- **M7** — `J07_Agences_mensuel/` : les douze fichiers dont la synthèse du module 6 était issue, ré-émis dans **quatre formats différents**. Sept standard *(mais l'ordre des colonnes change onze fois sur treize)*, deux avec un titre et une ligne vide avant les en-têtes, trois en **tableaux croisés** à dépivoter, un **CSV en Windows-1252**. La colonne `Remise_Pct` apparaît en mars 2026. Un **treizième fichier** — octobre 2026 — est fourni à part, dans un ordre de colonnes inédit : c'est l'épreuve de l'actualisation. Total après ajout : **468 lignes, 30 398 871,28 USD**.
- **M8** — schéma en étoile livré dans `J08_Modele.zip` *(13 Mo)* : `f_Ventes` **1 200 000 lignes** au niveau du ticket, sur deux années civiles pleines *(2025 et 2026)*, plus `d_Calendrier` *(1 096 j)*, `d_Client` *(3 600)*, `d_Produit` *(980, porte le taux de marge)*, `d_Taux` *(36, une colonne par devise)*, `d_Agence` *(6)*. **Cinq relations**, dont un flocon `d_Calendrier → d_Taux`. CA 2026 **30 317 122,55 USD**, CA 2025 **27 852 544,37**. La table de faits ne porte que des clés et des mesures — aucun libellé.
- **M9** — `J09_BusinessPlan_7e_agence.xlsx` : l'ouverture d'une **septième agence à Bamako** (Mali, XOF), 24 mois, **14 hypothèses** toutes sur une seule feuille et toutes en bleu. L'asymétrie est le sujet : **on encaisse en francs CFA, on décaisse en dollars** — le stock est importé et payé par la centrale d'achat. Investissement **204 500 USD**, VAN **33 174,54** à 14 %, TRI **27,10 %**, seuil **7 549 unités/mois**, retour au **mois 20**. Et le chiffre qui porte le module : **le projet devient perdant dès que le taux de départ dépasse 644,44 XOF** contre 631,40 aujourd'hui — **2,07 % de marge**. Le franc CFA étant arrimé à l'euro, ce risque est en réalité un risque EUR/USD. La montée en charge (14 mois) est calibrée sur les 24 premiers mois de Libreville, livrés en `RAW` et `CLEAN`.
- **M10** — `J10_Clients.zip` *(1,4 Mo)* : **200 classeurs clients** au même format, commandes d'**août 2026**, soit **5 637 lignes** et **1 672 787,91 USD**. « Au même format » est le mot important — et **quinze fichiers ne le sont pas tout à fait**, délibérément : **4 vides**, **6 avec une ligne `TOTAL`** sous le tableau *(qui ferait tout compter deux fois)*, **3 avec une colonne `Remise_Pct` en plus**, **2 dont la feuille s'appelle `COMMANDES`**. C'est sur ces quinze-là que se joue la différence entre un script qui tourne et un script qui tient. Les douze rapports du lundi — six agences, six familles — sont **deux découpes du même total**, et chacune doit s'y re-sommer.
  > **Un écart assumé et enseigné :** convertir ligne à ligne ou convertir le total donne **0,54 USD** de différence sur le mois. Les deux méthodes sont défendables ; le classeur porte les deux colonnes et le `README` dit laquelle fait foi.
  > **Une divergence avec le module 8, notée ici :** `d_Taux` y fait dériver XOF et XAF indépendamment. C'est techniquement faux — les deux francs CFA sont arrimés à l'euro à la même parité, donc leur taux face au dollar est identique. Le module 10 utilise la même valeur pour les deux, et l'explique. Le module 8 n'a pas été régénéré : ses corrigés sont figés.

---

# 5. Règles de fabrication des données

| Règle | Pourquoi |
|---|---|
| **Les défauts sont plantés volontairement et listés** dans un fichier formateur | Sans la liste, tu ne peux pas corriger, et le TP devient injuste |
| **Les totaux attendus sont figés et écrits** dans le fichier du TP | Le correcteur automatique compare des valeurs ; elles doivent exister avant le tournage |
| **Aucune donnée personnelle réelle** | Noms inventés, téléphones en plages non attribuées, emails en `@exemple.cd` |
| **Les montants sont plausibles** | Un sac de riz de 25 kg à Kinshasa ne coûte pas 4 USD ni 900 USD. `V4` s'applique aussi au formateur. |
| **Les fichiers `_DEPART` sont en `.xlsx`**, jamais en `.xlsm` | Les `.xlsm` sont bloqués par la messagerie et par le Mark of the Web |
| **Chaque jeu existe en version « propre »** pour les démonstrations | On ne nettoie pas en direct ce qu'on doit montrer propre |

---

# 6. Générer les données

Les jeux sont produits par script, jamais à la main : ils doivent être **reproductibles** — si un fichier se perd la veille du tournage, il se régénère à l'identique.

```
02_DONNEES/
├── generateur_baobab.py     un seul script, une graine aléatoire fixe
├── ATTENDUS.md              tous les totaux figés, par jeu de données
└── BAOBAB/
    ├── J01/ … J10/
```

**La graine aléatoire est fixe.** Sans ça, une régénération change les totaux, et tous les corrigés deviennent faux.

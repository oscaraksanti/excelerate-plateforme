# MODULE 7 — Un clic, tous les mois
### *Power Query en profondeur*
## 🔒 Payant · publié **jeudi 1er octobre** · à tourner **sam. 26 / dim. 27**

> **Promesse :** *Le rapport mensuel qui vous prend trois heures se fera en un clic. Définitivement — y compris le mois où quelqu'un déplace une colonne.*
>
> **Échelle :** niveau **5 atteint** — *j'industrialise*.

## Le hook
Le chronomètre du module 3 : 3 h → 1 clic. Puis on ouvre le fichier de mars, où la colonne « Remise » a bougé de la position 4 à la position 7. **La requête casse.**
> « Voilà pourquoi une démonstration ne suffit pas. Ce module, c'est celui où votre requête survit à vos collègues. »

## Les données du jour
`J07_Agences_mensuel/` — 12 fichiers hétérogènes : colonnes qui changent de place, trois fichiers qui sont des **tableaux croisés reçus**, deux avec des en-têtes sur deux lignes, un en CSV mal encodé.

---

## Leçon 7.1 — Les fondations · 🔧
**Notions** — Sources : fichier, **dossier**, web, base de données, tableau · l'éditeur et **les étapes appliquées** · **typer explicitement**, toujours · promouvoir les en-têtes · supprimer colonnes et lignes · **Colonnes depuis les exemples** · fractionner et fusionner des colonnes · remplacer les valeurs · filtrer · **charger vers : tableau, TCD, ou connexion seule**

**💎** 1. **Connexion seule + chargement dans le modèle** : 500 000 lignes sans faire exploser le fichier. · 2. **Renommer chaque étape** en français : la requête devient sa propre documentation. · 3. Le volet **Dépendances de la requête** : la carte de ce qui alimente quoi.

---

## Leçon 7.2 — Les transformations décisives · 🔧
**Notions** — **Dépivoter** et **dépivoter les autres colonnes** *(la variante robuste)* · pivoter · **Fusionner** *(les 6 types de jointure, expliqués en images)* vs **Ajouter** · grouper par · colonne conditionnelle · colonne d'index · **remplir vers le bas** *(les cellules fusionnées d'un rapport reçu)* · gérer les erreurs par colonne · la **conversion de devises dans la requête**, faite une fois pour toutes

**💎** 1. 💎💎 **« Dépivoter les autres colonnes »** plutôt que « Dépivoter les colonnes » : la requête survit quand un nouveau mois apparaît. Un mot de différence, des années de tranquillité. · 2. **Remplir vers le bas** répare en un clic un rapport à cellules fusionnées. · 3. **La jointure anti** *(Left Anti)* : « ce qui est chez moi et pas chez eux ». C'est la réconciliation du module 4, en deux clics.

---

## Leçon 7.3 — Des requêtes qui survivent à la vraie vie · 🔧
**Notions** — **Ne jamais référencer une colonne par sa position** · les **paramètres** de requête *(chemin du dossier, mois, taux)* · les **fonctions personnalisées** en M · gérer un fichier manquant, une colonne renommée, un format changé · **la requête de contrôle qualité** : nombre de lignes, valeurs nulles, doublons, statuts PASS/WARNING/FAIL · la performance : ce qui est replié vers la source, ce qui ne l'est pas · documenter une requête pour celui qui reprendra le fichier

**💎** 1. **Un paramètre de chemin de dossier** : le fichier fonctionne sur le poste du collègue sans rien modifier. · 2. **La requête de contrôle**, chargée à côté du résultat : l'actualisation dit elle-même si elle s'est bien passée. · 3. **`try … otherwise`** en M : une étape qui échoue n'arrête plus toute la requête.

---

## Leçon 7.4 — 🤖 Écrire et déboguer du langage M avec l'IA
**Notions** — Le M : à quoi ça ressemble, et pourquoi on ne l'apprend pas par cœur · coller l'étape générée par l'interface et demander de la **généraliser** · écrire une **fonction personnalisée** sur description · **déboguer un message d'erreur M**, qui est parmi les plus obscurs d'Excel

### 🔴 L'IA se trompe à l'écran
Erreur n° 6 de la liste : **elle mélange le M et le DAX.** Deux langages, deux moments, deux syntaxes. `V1` l'attrape.

**Chrono** — *Classique **2 h** (ou impossible) · IA **12 min** · **Vérification 10 min**.*

---

## Leçon 7.5 — 🤖 Quand Power Query n'est **pas** le bon outil
**Notions** — Le tableau de décision, revisité avec l'expérience · PQ vs formules vs modèle de données vs script · les **limites réelles** : pas de boucle sur un dossier hétérogène, lenteur sur certaines jointures, dépendance au chemin · **ce qui relève de Claude Code** *(M10)* · le coût de maintenance d'une requête que personne d'autre ne comprend

**Chrono** — *Classique : **3 h par mois, indéfiniment** · Mise en place : **45 min, une fois** · Puis : **un clic**.*

---

## 🎁 Bonus Niveau + — La table de calendrier parfaite
Générée en M · année, trimestre, mois, semaine ISO, jour ouvré, jour férié par pays · **la clé de tout le module 8**.

## 🧪 TP 7 — « Les 12 agences » → `04_TP/TP-07.md`
## ❓ QCM → `05_QCM/QCM-M07.md` — **7 questions** *(6 prévues + le piège de type date/datetime)*

---

## ✅ État de production — livré le 17 septembre 2026

| | |
|---|---|
| Corps des 5 leçons | **55 800 caractères** |
| Schémas | **8** — `public/lecons/m07/` |
| Jeu de données | `J07_Agences_mensuel.zip` — **12 fichiers**, 4 formats différents |
| Le treizième | `Ventes_2026-10_NOUVEAU.xlsx` — colonnes dans un ordre inédit |
| Code M livré | `M07_L04_EXEMPLES.m` *(8 morceaux)* · `M07_BONUS_CALENDRIER.m` |
| Code M **non publié** | `M07_REQUETE_COMPLETE.m` — c'est la solution du TP |
| TP | 15 cellules · 3 plages nommées · 40 points · **corrigé 20/20** · départ 3,5/20 |
| QCM | 7 questions en ligne |

### Les formats réellement plantés dans les treize fichiers

| Format | Combien | Ce qu'il impose |
|---|:--:|---|
| standard | 7 | l'ordre des colonnes change **onze fois sur treize** |
| titre + ligne vide avant les en-têtes | 2 | sauter jusqu'à la ligne qui contient « Agence » |
| tableau croisé | 3 | **dépivoter les autres colonnes** · ni quantité ni remise |
| CSV en Windows-1252 | 1 | l'encodage : 6 responsables, ou 10 |

La colonne `Remise_Pct` apparaît en **mars 2026**, et jamais à la même place.

### Les chiffres du module, figés

| | |
|---|---|
| Après ajout du treizième fichier | **13** fichiers · **468** lignes · **13** mois · **6** responsables |
| Chiffre d'affaires total | **30 398 871,28 USD** |
| Le mois ajouté | **2 376 101,86 USD** |
| Lignes sans quantité *(les 3 tableaux croisés)* | **108** |
| Lignes avec remise | **141** · remises totales **284 114,90 USD** |
| Kinshasa | **8 254 116,16 USD** |
| Écart assumé avec le module 6 | **1,12 USD** sur les 12 mois communs — conversion après agrégation |

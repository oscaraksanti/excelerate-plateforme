# MODULE 6 — Huit secondes
### *Visualiser & construire un tableau de bord*
## 🔒 Payant · publié **mercredi 30 septembre** · à tourner **jeu. 24 / ven. 25**

> **Promesse :** *Vos rapports seront compris en huit secondes. Et vous saurez pourquoi les vôtres ne l'étaient pas.*
>
> **Échelle :** niveau **4 consolidé**.

## Le hook
Le rapport mensuel actuel de BAOBAB, projeté huit secondes puis masqué. *« Quelle agence est en difficulté ? »* Personne ne sait. Même donnée, autre mise en forme, huit secondes : tout le monde répond.
> « Ce ne sont pas vos chiffres qui sont mauvais. C'est qu'on ne les voit pas. »

## Les données du jour
Le jeu du module 5, plus **le vrai rapport mensuel de BAOBAB — illisible, et représentatif de ce que 90 % des entreprises produisent.**

---

## Leçon 6.1 — Les graphiques, correctement · 🔧
**Notions** — **Choisir le type selon la question**, pas selon le goût : évolution → courbe · comparaison → barres · composition → barres empilées ou 100 % · corrélation → nuage de points · **pourquoi le camembert est presque toujours une erreur** *(et les deux cas où il ne l'est pas)* · axes, échelles, **l'axe qui ne part pas de zéro et ment** · étiquettes de données plutôt que quadrillage · **supprimer tout ce qui n'informe pas** *(ratio données/encre)* · graphique combiné à deux axes · graphique sur données filtrées

**💎** 1. **`Alt+F1`** : un graphique sur la sélection, instantanément. · 2. **Enregistrer un graphique comme modèle** : la charte de l'entreprise en un clic. · 3. **Copier une mise en forme de graphique** : `Ctrl+C` sur le graphique, collage spécial > Formats.

---

## Leçon 6.2 — Les visualisations que 90 % des gens n'ont jamais utilisées · 🔧
**Notions** — **Sparklines** dans une cellule · **barres de données, nuances et jeux d'icônes** en MFC · **cartes 2D** pour six agences dans quatre pays · **compteur** et **jauge** fabriqués en anneau · **cascade** pour expliquer un écart · **treemap** et **rayons de soleil** pour les hiérarchies de produits · **boîte à moustaches** · **histogramme et Pareto** · la **MFC utilisée comme diagramme de Gantt**, sans aucun graphique

**💎** 1. 💎💎 **La cascade** explique « pourquoi la marge a baissé de 3 points » mieux que n'importe quel tableau. · 2. **Une MFC en barres de données** donne un graphique dans une colonne, sans objet, sans ralentir. · 3. **Le Gantt en MFC** : un planning de projet en quatre règles.

---

## Leçon 6.3 — Assembler un tableau de bord interactif · 🔧
**Notions** — **La question d'abord** : quelle décision ce tableau permet-il ? · la grille de composition, l'information importante en haut à gauche · **une seule page, jamais de défilement** · les quatre indicateurs : valeur, comparaison, tendance, exception · segments et chronologies connectés · **masquer les feuilles de calcul** · protéger sans bloquer · l'impression et le PDF · la version téléphone

**💎** 1. 💎💎 **L'appareil photo** *(Camera Tool)* : invisible dans tous les rubans, à ajouter à la barre d'accès rapide. Il crée une **image liée** d'une plage, qui se met à jour toute seule et qu'on positionne librement. **C'est l'outil avec lequel se construisent les vrais tableaux de bord.** · 2. **Les formes liées à une cellule** : `=B2` dans une zone de texte affiche un KPI géant, à jour. · 3. **Masquer la grille et les en-têtes** : Excel cesse de ressembler à Excel.

---

## Leçon 6.4 — 🤖 L'IA comme directeur artistique et rédacteur du message
**Notions** — Coller la capture d'un tableau de bord et demander **une critique de lisibilité** · faire **choisir la palette accessible** *(daltonisme, impression noir et blanc, projection)* · faire **écrire le titre** : « CA en hausse de 12 % » plutôt que « Chiffre d'affaires » — **un titre doit affirmer, pas étiqueter** · la note de synthèse en trois phrases · générer les **formats de nombre personnalisés** pour « 1,2 M USD »

### 🔴 L'IA se trompe à l'écran
Elle propose une palette rouge/vert **illisible pour 8 % des hommes**. `V4` : un collègue validerait-il ?

**Chrono** — *Classique **1 h** · IA **6 min** · **Vérification 5 min**.*

---

## Leçon 6.5 — 🤖 Maquetter avec Artifacts, puis construire dans Excel
**Notions** — Trois maquettes interactives en dix minutes · les faire arbitrer par le commanditaire · **traduire la maquette validée en Excel** · ce qui est reproductible dans Excel et ce qui ne l'est pas · **Parcours A** : décrire, faire dessiner, choisir

**Chrono** — *Classique **3 h** · IA **20 min** · **Vérification 15 min**.*

---

## 🎁 Bonus Niveau + — Les graphiques dynamiques sans macro
Un graphique piloté par une liste déroulante · une série définie par un **nom qui contient `DECALER`** · le graphique qui ne montre que les 12 derniers mois, toujours · la mise en évidence de la série survolée.

## 🧪 TP 6 — « Le rapport que personne ne lit » → `04_TP/TP-06.md`
## ❓ QCM → `05_QCM/QCM-M06.md` — **7 questions** *(6 prévues + le piège de l'ordre des règles de MFC)*

---

## ✅ État de production — livré le 17 septembre 2026

| | |
|---|---|
| Corps des 5 leçons | **56 048 caractères** |
| Schémas | **9** — `public/lecons/m06/` |
| Jeu de données | `J06_Synthese_Mensuelle.xlsx` — 434 + 72 lignes, agrégé depuis J05 |
| Le rapport illisible | `J06_Rapport_Mensuel_Actuel.xlsx` — 14 indicateurs, 3 camemberts, axe à 1,8 M |
| Classeurs de leçon | `M06_L01_*` *(4 questions, 4 types)* · `M06_L02_*` *(MFC, Gantt, cascade, Pareto)* |
| TP | 30 cellules de calcul · 12 plages nommées · 163 points · **corrigé 20/20** · départ 0,9/20 |
| **Pondération** | **pairs 60 % / machine 40 %** — migration `0013_poids_par_tp.sql` |
| QCM | 7 questions en ligne |

### Les chiffres du module, figés

| | |
|---|---|
| Septembre 2026 | CA **2 299 043,24 USD** · objectif **2 335 000** · atteinte **98,46 %** |
| Variation sur un mois | **−9,80 %** · taux de marge **17,17 %** |
| Cumul de l'exercice | **28 022 768,30 USD** |
| L'agence en difficulté | **Lubumbashi — 87,1 %, soit −51 503,07 USD** |
| Le pont de marge | **434 374 → 394 687 USD**, dont la farine pour −13 400 |
| Pareto | les trois premières familles font **64,7 %** du chiffre d'affaires |

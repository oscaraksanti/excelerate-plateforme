# MODULE 8 — Modèle de données, Power Pivot & DAX
## 🔒 Payant · publié **vendredi 2 octobre** · à tourner **lun. 28 / mar. 29**

> **Promesse :** *Vous dépasserez le million de lignes, vous supprimerez 90 % de vos `RECHERCHEX`, et vous parlerez le langage de la BI.*
>
> **Échelle :** niveau **5 maîtrisé**.

> ⚠️ **Power Pivot n'existe pas sur Mac ni sur Excel pour le web.** À annoncer au début du module, avec le plan B : faire l'exercice sur un poste Windows, ou suivre en observation et rattraper au module 9.

## Le hook
Le fichier du module 5 : 120 000 lignes, 48 Mo, dix secondes pour s'ouvrir, 42 `RECHERCHEX` qui recalculent à chaque frappe.
Le même, en modèle de données : **4 Mo, instantané, zéro `RECHERCHEX`.**

## Les données du jour
`J08_Modele/` — six tables : `f_Ventes` *(1,2 million de lignes)*, `d_Client`, `d_Produit`, `d_Agence`, `d_Calendrier`, `d_Taux`.

---

## Leçon 8.1 — Penser en modèle : le schéma en étoile · 🔧
**Notions** — Pourquoi un tableau unique de 40 colonnes est une impasse · **table de faits vs tables de dimensions** · la **granularité** : une ligne = quoi, exactement ? · les **relations** 1-à-plusieurs et le sens du filtre · **la table de calendrier est obligatoire**, et pourquoi · charger depuis Power Query vers le modèle · la **vue de diagramme** · le piège de la relation plusieurs-à-plusieurs

**💎** 1. **Une relation remplace toutes les `RECHERCHEV` d'un coup** — et ne recalcule jamais. · 2. **La table de calendrier marquée comme telle** débloque toute la *time intelligence*. Sans ce clic, la moitié du DAX ne fonctionne pas. · 3. Le modèle **compresse** : 1,2 million de lignes pèsent moins qu'une feuille de 120 000.

---

## Leçon 8.2 — DAX essentiel : les mesures · 🔧
**Notions** — **Mesure vs colonne calculée** : la distinction la plus mal comprise de la BI, expliquée une bonne fois · `SUM`, `AVERAGE`, `DISTINCTCOUNT` · **`CALCULATE`** — la fonction centrale · `FILTER`, `ALL`, `ALLEXCEPT` · `DIVIDE` plutôt que `/` · **le contexte de filtre**, expliqué avec le TCD sous les yeux · les mesures **implicites** et pourquoi on les évite · organiser ses mesures en dossiers

**💎** 1. **Une mesure ne prend aucune place et se calcule à l'affichage.** Une colonne calculée occupe de la mémoire sur chaque ligne. · 2. **`DIVIDE(a;b;0)`** gère la division par zéro sans `SIERREUR`. · 3. **Nommer ses mesures en français métier** — « Marge % », pas « mesure1 » : le TCD devient lisible par la direction.

---

## Leçon 8.3 — Time intelligence, restitution, et le pont vers Power BI · 🔧
**Notions** — `SAMEPERIODLASTYEAR`, `DATEADD`, `TOTALYTD`, `DATESYTD` · **le cumul annuel mobile** · comparer N vs N-1 en une mesure · **la conversion multi-devises en DAX** avec `d_Taux` · les **KPI** de Power Pivot · le TCD branché sur le modèle · `CUBEVALEUR` pour une mise en page totalement libre · **ce qui se transporte tel quel vers Power BI**, et ce qui ne se transporte pas

**💎** 1. **`CUBEVALEUR`** libère du carcan du TCD : un tableau de bord entièrement libre, alimenté par le modèle. · 2. **La même mesure en devise locale et en USD**, par une seule table de taux. · 3. Le modèle Excel **s'importe directement dans Power BI Desktop**. Le travail n'est jamais perdu.

---

## Leçon 8.4 — 🤖 DAX assisté : l'IA comme tuteur du concept le plus difficile de la BI
**Notions** — Décrire son modèle à l'IA *(le schéma, pas les données)* · faire **expliquer le contexte de filtre** sur son cas précis — c'est l'usage où l'IA est la plus utile de tout le programme · faire écrire une mesure, puis **la faire expliquer ligne par ligne** · faire **produire les cas de test**

### 🔴 L'IA se trompe à l'écran
Erreur n° 7 : **elle propose du DAX de Power BI que Power Pivot ne supporte pas.** Les deux moteurs ne suivent pas le même rythme de mise à jour. `V1` l'attrape.

**Chrono** — *Classique **6 h** de documentation · IA **20 min** · **Vérification 20 min**.*

---

## Leçon 8.5 — 🤖 Faire concevoir son modèle par l'IA
**Notions** — Décrire ses sources et son besoin, obtenir **le schéma en étoile proposé** · discuter la granularité · **Claude Code** *(bonus)* : générer les requêtes M des six tables d'un coup · faire produire la documentation du modèle · **la limite honnête** : l'IA propose un modèle plausible, elle ne connaît pas vos règles de gestion

**Chrono** — *Classique **1 journée** · IA **30 min** · **Vérification 1 h**.*

---

## 🎁 Bonus Niveau + — `LAMBDA` : créer ses propres fonctions sans VBA
> ⚠️ **Excel 2024 et 365 uniquement.**
Écrire `=CONVERTIR_USD(montant;devise;mois)` une fois, l'utiliser partout · `LAMBDA` + `LET` · `PARLIGNE`, `MAP`, `REDUCE`, `SCAN` · le gestionnaire de noms comme bibliothèque de fonctions · **l'alternative 2021** : noms définis + `LET`.

## 🧪 TP 8 — « Le modèle qui remplace 42 RECHERCHEX » → `04_TP/TP-08.md`
## ❓ QCM → `05_QCM/QCM-M08.md`

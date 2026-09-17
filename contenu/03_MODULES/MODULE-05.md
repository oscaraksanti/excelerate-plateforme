# MODULE 5 — Six questions, cinq minutes
### *Tableaux croisés dynamiques*
## 🔒 Payant · publié **mardi 29 septembre** · à tourner **mar. 22 / mer. 23**

> **Promesse :** *Toutes les questions que votre direction peut poser sur vos données, vous y répondrez en moins de cinq minutes.*
>
> **Échelle :** niveau **4 atteint**.

## Le hook
Nadège pose six questions d'affilée, sans prévenir. Six TCD, cinq minutes, chronomètre à l'écran.
> « Ce n'est pas de la vitesse. C'est le même outil, six fois. »

## Les données du jour
`J05_Ventes_24_mois.xlsx` — **120 000 lignes**, 24 mois, 6 agences, 980 références, 3 devises. Un volume qui rend le TCD indispensable et la formule impraticable.

---

## Leçon 5.1 — Le TCD de A à Z · 🔧
**Notions** — Ce qu'est un TCD : quatre zones, une question · les prérequis *(un tableau structuré, pas de cellule fusionnée, pas de ligne vide)* · lignes / colonnes / valeurs / filtres · **changer l'agrégation** *(la cause n° 1 des « Nombre de » involontaires)* · grouper par date, par tranche · trier, filtrer, top 10 · actualiser · la mise en forme qui survit à l'actualisation

**💎** 1. **Double-cliquer sur une valeur** extrait les lignes de détail sur une nouvelle feuille. L'audit en un geste. · 2. **Disposition sous forme tabulaire** + **répéter les étiquettes** : un TCD qui redevient une base de données exploitable. · 3. `Alt+N+V` puis `Entrée` : un TCD en deux secondes.

---

## Leçon 5.2 — Le TCD de niveau professionnel · 🔧
**Notions** — **Champs calculés** et **éléments calculés** *(et leur piège : ils calculent sur les totaux, pas sur les lignes)* · **Afficher les valeurs en** : % du total, % du parent, **% de différence par rapport au précédent**, cumul · les **segments** et la **chronologie**, connectés à plusieurs TCD · `LIREDONNEESTABCROISDYNAMIQUE` : l'apprivoiser au lieu de la désactiver · TCD sur plusieurs plages · le **cache** du TCD et le poids du fichier

**💎** 1. 💎💎 **« % de différence par rapport au précédent »** : l'évolution mois par mois **sans écrire une seule formule**. Presque personne ne descend dans ce menu. · 2. **Les segments pilotent plusieurs TCD** *(Connexions de rapport)* — c'est ce qui fait un tableau de bord. · 3. **Désactiver « Ajuster la largeur des colonnes à l'actualisation »** : la mise en forme cesse de sauter.

---

## Leçon 5.3 — Ce qui complète le TCD · 🔧
**Notions** — `SOUS.TOTAL` et `AGREGAT` sur données filtrées · les **sous-totaux automatiques** · le **mode plan** et le groupement de lignes · les **vues personnalisées** · la consolidation de plages · quand le TCD **n'est pas** le bon outil : mise en page figée → `SOMME.SI.ENS` *(M2)* ; volume extrême → modèle de données *(M8)*

**💎** 1. `AGREGAT(1;7;…)` ignore lignes masquées **et** erreurs. 🔴 **Correction du plan : `AGREGAT(9;5)` n'ignore QUE le masquage** — l'option `6` traite les erreurs, la `7` les deux. Vérifié sur `M05_L03_CORRIGE.xlsx`, et devenu la question 7 du QCM. · 2. Le **mode plan** replie un rapport de 400 lignes en 12. · 3. `SOUS.TOTAL(109;…)` vs `SOUS.TOTAL(9;…)` : la différence entre masqué et filtré.

---

## Leçon 5.4 — 🤖 De la question métier au bon TCD, et à la bonne conclusion
**Notions** — Traduire une question floue de direction en configuration de TCD · faire **interpréter** le résultat, pas seulement le produire · la **note de synthèse en trois phrases** · **ce que l'IA ne peut pas savoir** : que février a eu deux jours fériés de plus

### 🔴 L'IA se trompe à l'écran — chiffres définitifs
Elle conclut à une **baisse de 12,2 % à Douala**. En réalité l'agence **progresse de 2,9 %** : au 1er mars 2026, `Savons` est devenu `Hygiène & entretien` et `Conserves` est devenu `Épicerie sèche`. **623 248,35 USD** sortent des tableaux filtrés sur les six familles historiques.

**`V4 — Vérité métier` l'attrape.** Aucun des trois autres V ne l'aurait vue : la formule était juste, l'ordre de grandeur plausible, la version sans importance.

**Le signal qui était dans le fichier :** `=NBVAL(UNIQUE(t_Ventes[Famille]))` → **8**, pour **6** familles au catalogue.

**Chrono** — *Classique **2 h** · IA **15 min** · **Vérification 20 min**.*

---

## Leçon 5.5 — 🤖 Interroger ses données en langage naturel
**Notions** — Uploader un extrait et poser ses questions en français · les limites de taille et comment échantillonner correctement · **Claude for Excel** *(bonus)* : travailler dans le volet latéral sur la feuille active · faire **générer les questions qu'on n'a pas pensé à poser** · pourquoi on ne remplace pas le TCD par une conversation : la traçabilité

**💎** 1. **« Quelles questions devrais-je poser à ces données que je n'ai pas posées ? »** — le prompt qui trouve ce qu'on ne cherchait pas. · 2. Demander **le TCD à construire**, pas la réponse : on garde la traçabilité et le fichier reste auditable.

**Chrono** — *Classique **1 h 30** · IA **8 min** · **Vérification 12 min**.*

---

## 🎁 Bonus Niveau + — Les 6 réglages de TCD que personne ne change
Disposition tabulaire par défaut · conserver la mise en forme · désactiver l'ajustement des colonnes · afficher les éléments sans données · **libeller les cellules vides** · actualiser à l'ouverture.

## 🧪 TP 5 — « Le comité de direction de jeudi » → `04_TP/TP-05.md`
## ❓ QCM → `05_QCM/QCM-M05.md` — **7 questions** *(6 prévues + le piège `AGREGAT`)*

---

## ✅ État de production — livré le 17 septembre 2026

| | |
|---|---|
| Corps des 5 leçons | **55 753 caractères** |
| Schémas | **8** — `public/lecons/m05/` |
| Jeu de données | `J05_Ventes_24_mois.xlsx` · **120 000 lignes** · 8,3 Mo |
| Classeurs de leçon | `M05_L01_*` *(1 622 lignes)* · `M05_L03_*` *(420 lignes)* |
| TP | **29 046 lignes** · 15 cellules notées · 43 points · **corrigé 20/20** · départ 2,8/20 |
| QCM | 7 questions en ligne |

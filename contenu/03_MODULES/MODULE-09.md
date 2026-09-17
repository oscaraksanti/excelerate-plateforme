# MODULE 9 — Décider : simulation, finance & modèle professionnel
## 🔒 Payant · publié **samedi 3 octobre** · à tourner **mer. 30 / jeu. 1er oct.**

> **Promesse :** *Vous construirez un modèle de décision qu'un auditeur validera, et vous répondrez à des questions que personne ne vous avait encore posées.*
>
> **Échelle :** niveau **6 et 8** — *je fais raisonner l'IA avec moi* et *j'assume le résultat*.

## Le hook
La direction veut ouvrir une septième agence à Bamako. *« C'est rentable ? »*
Trois minutes plus tard, à l'écran : le seuil de rentabilité, le mois de retour sur investissement, **et à partir de quel taux de change le projet devient perdant**.
> « Ce n'est pas Excel qui impressionne. C'est de pouvoir répondre à la question d'après. »

## Les données du jour
`J09_BusinessPlan_7e_agence.xlsx` — **14 hypothèses**, toutes sur une seule feuille, toutes en bleu.

---

## Leçon 9.1 — Simulation : répondre aux questions « et si… » · 🔧
**Notions** — **Valeur cible** : « quel prix pour atteindre 15 % de marge ? » · **Table de données** à une et **deux entrées** — l'outil le plus sous-utilisé d'Excel · **Gestionnaire de scénarios** : pessimiste / base / optimiste, et le rapport de synthèse · **l'analyse de sensibilité au taux de change** — le vrai sujet d'un business plan africain · les hypothèses **toutes au même endroit, jamais dans une formule**

**💎** 1. 💎💎 **La table de données à deux entrées** : 400 simulations dans un rectangle, sans macro, sans copier-coller. Presque personne ne l'a jamais utilisée. · 2. **Le rapport de synthèse de scénarios** génère un tableau comparatif prêt à présenter. · 3. **Une cellule d'hypothèse qui n'est pas bleue est un bug** — la convention n'est pas décorative, c'est un contrôle visuel.

---

## Leçon 9.2 — Optimisation et fonctions financières · 🔧
**Notions** — **Solveur** : objectif, variables, contraintes · le cas de l'allocation de stock entre six agences · Solveur linéaire vs non linéaire · **`VAN`**, **`TRI`**, `TRIM` · `VPM`, `VA`, `VC`, `NPM`, `TAUX` · le **tableau d'amortissement d'emprunt** complet · amortissement d'immobilisations · **le seuil de rentabilité**, calculé et représenté · pourquoi `TRI` peut avoir plusieurs solutions

**💎** 1. **Le Solveur résout en dix secondes** ce qu'on tente d'ajuster à la main pendant une heure. · 2. **`VAN` ne prend pas le flux de l'année 0** — l'erreur classique, qui fausse toutes les rentabilités. · 3. **`TRI` avec une estimation initiale** quand elle ne converge pas.

---

## Leçon 9.3 — Construire et sécuriser un classeur professionnel · 🔧
**Leçon décisive : c'est elle qui sépare l'utilisateur avancé du professionnel.**

**Notions** — **L'architecture en 8 feuilles** *(README, HYPOTHESES, RAW, CLEAN, CALCULS, ANALYSE, DASHBOARD, QUALITE)* · **la convention de couleurs des modélisateurs financiers** : bleu = saisie, noir = formule, vert = lien vers une autre feuille, rouge = lien externe — **universelle en finance, inconnue ailleurs** · verrouiller les formules, déverrouiller les saisies, protéger la feuille · protéger la structure du classeur · masquer une feuille *(et la masquer « très fort »)* · **la feuille `QUALITE` complète** · les commentaires et notes · préparer pour l'impression et le PDF · **la checklist de recette avant envoi**

**💎** 1. **`F5 > Cellules > Constantes`** sélectionne toutes les saisies d'un coup : on les met en bleu en un geste, et toute cellule bleue hors de `HYPOTHESES` devient visiblement suspecte. · 2. **Masquer « très fort »** *(`xlSheetVeryHidden`)* : une feuille invisible même dans le menu Afficher. · 3. **Protéger sans mot de passe** suffit à empêcher les accidents, et n'enferme personne dehors.

---

## Leçon 9.4 — 🤖 L'IA comme consultant : du problème flou au modèle de décision
**Notions** — Décrire un problème métier mal posé et obtenir **la liste des hypothèses à chiffrer** · faire produire la **structure du modèle** avant la moindre formule · faire **lister les risques** et les variables sensibles · faire challenger ses propres hypothèses : *« qu'est-ce que j'ai oublié ? »*

### 🔴 L'IA se trompe à l'écran
Elle propose un modèle **sans analyse de sensibilité au taux de change**, sur un business plan libellé en trois devises. **`V4` l'attrape** — et c'est le rappel que l'IA ne connaît pas votre terrain.

**Chrono** — *Classique **2 jours** · IA **1 h** · **Vérification 3 h**.*

---

## Leçon 9.5 — 🤖 Auditer son modèle et générer ce qui est générable
**Notions** — Faire **auditer son propre modèle** : valeurs en dur, formules incohérentes, hypothèses non documentées, cellules bleues égarées · générer la feuille `README` complète avec les définitions de KPI · générer la **note de synthèse d'une page** pour la direction · générer les **cas de test du modèle** · **la limite absolue** : l'IA vérifie la cohérence interne, jamais la véracité métier

**💎** 1. **« Quelles hypothèses ce modèle prend-il sans les dire ? »** — la question qui trouve les vraies faiblesses. · 2. Faire **rédiger la note de synthèse à partir du modèle** : ce qui prend une heure en prend cinq minutes, et se relit.

**Chrono** — *Classique **4 h** · IA **25 min** · **Vérification 45 min**.*

---

## 🎁 Bonus Niveau + — Les 15 pièges qui font perdre un fichier
Références circulaires involontaires · calcul en mode manuel oublié · liens externes cassés · `SIERREUR` posé partout · plages nommées orphelines · colonnes masquées contenant des données · lignes filtrées prises pour des lignes supprimées · fusion de cellules · valeurs en dur dans les formules · feuilles très masquées oubliées · macros sans documentation · classeur en lecture seule · dates régionales · précision au format affiché · **et le classeur qu'une seule personne sait faire tourner.**

## 🧪 TP 9 — « La septième agence » → `04_TP/TP-09.md`
## ❓ QCM → `05_QCM/QCM-M09.md`

# MODULE 10 — « Le lundi matin d'Aïcha »
### *Automatiser & livrer*
## 🔒 Payant · **en ligne** · publié **samedi 3 octobre** · à tourner **ven. 2 / sam. 3 oct.**

> **Livré.** 5 leçons *(40 974 caractères)* · 8 schémas · 200 classeurs clients · 2 fichiers `.bas` · 1 script Python vérifié · TP noté **20/20** · 7 questions de QCM.
> **Le programme est complet.** Il reste le capstone.

> **Promesse :** *Ce que vous faites chaque lundi matin, vous ne le ferez plus jamais. Et vous rendrez une solution, pas un fichier.*
>
> **Échelle :** niveaux **7 et 8** — *Claude Code automatise le flux complet* et *je contrôle, je valide, j'assume*.

## Le hook
Aïcha ouvre son ordinateur le lundi matin. Elle clique une fois. Elle va prendre un café. Quand elle revient, les douze rapports d'agence sont générés, nommés, formatés, et le récapitulatif est prêt à envoyer.
> « Elle a récupéré ses lundis matin. C'est ça, le vrai sujet de cette formation. »

## Les données du jour
`J10_Clients/` — **200 classeurs clients** au même format, à traiter en lot, plus tout ce qui a été construit depuis le module 1.

---

## Leçon 10.1 — L'enregistreur de macros : automatiser sans coder · 🔧
**Notions** — Enregistrer, exécuter, ce que l'enregistreur capte et ce qu'il rate · **références relatives vs absolues à l'enregistrement** · `.xlsm` vs `.xlsx` · le **classeur de macros personnelles `PERSONAL.XLSB`** : des macros disponibles dans tous vos fichiers · affecter une macro à un bouton, à une forme, à un raccourci · **la sécurité des macros** et le Mark of the Web

**💎** 1. **`PERSONAL.XLSB`** : vos dix macros utiles, partout, tout le temps. Presque personne ne sait qu'il existe. · 2. **Enregistrer une macro pour apprendre le VBA** : on fait le geste, on lit le code produit. C'est le meilleur tutoriel qui existe. · 3. Les `.xlsm` sont **bloqués par la messagerie** : livrer en `.zip` et documenter le déblocage.

---

## Leçon 10.2 — Lire, corriger et déclencher du code · 🔧
**Notions** — L'éditeur VBA en cinq minutes · lire du code sans savoir l'écrire · variables, boucle `For Each`, condition · **les événements** : `Workbook_Open`, `Worksheet_Change` · un bouton qui actualise tout, exporte le PDF et l'enregistre au bon nom · gérer les erreurs · **quand ne PAS faire de VBA** : si Power Query le fait, Power Query gagne — toujours

**💎** 1. **`Application.ScreenUpdating = False`** : une macro dix fois plus rapide, en une ligne. · 2. **Une macro d'export PDF nommé automatiquement** avec la date et l'agence. · 3. **`Workbook_Open` qui actualise tout** : le fichier est à jour avant même qu'on le regarde.

---

## Leçon 10.3 — Partager, collaborer — et Google Sheets · 🔧
**Notions** — Co-édition sur OneDrive et SharePoint : ce qui marche, ce qui casse · **l'historique des versions**, la fonctionnalité qui sauve · protéger une plage pour certains utilisateurs · les **formulaires** qui alimentent un tableau · **exporter vers Google Sheets** : ce qui survit, ce qui meurt *(matrices dynamiques, PQ, modèle de données)* · `QUERY()` et `IMPORTRANGE()` côté Sheets · **livrer à quelqu'un qui n'a pas votre version d'Excel**

**💎** 1. **L'historique des versions de OneDrive** récupère le fichier d'avant la catastrophe. · 2. **`QUERY()` dans Sheets** fait en une formule ce qui demande un TCD dans Excel. · 3. **Toujours livrer avec la feuille `README`** : c'est elle qui fait la différence entre un fichier et une solution.

---

## Leçon 10.4 — 🤖 Faire écrire son code par l'IA sans se faire piéger
**Notions** — Décrire une automatisation en langage naturel et obtenir du VBA · **exiger le code commenté ligne par ligne** — on ne déploie jamais ce qu'on ne comprend pas · faire expliquer une macro héritée · **les règles de sécurité** : jamais de code qui supprime sans confirmation, toujours une sauvegarde avant, toujours un test sur une copie

### 🔴 L'IA se trompe à l'écran
Elle écrit une boucle qui **supprime des lignes en montant… en descendant**. Les indices se décalent, une ligne sur deux survit. `V2` et `V3` l'attrapent — et c'est l'illustration parfaite de « ça a l'air juste et ça ne l'est pas ».

**Chrono** — *Classique **1 journée** · IA **20 min** · **Vérification 1 h**.*

---

## Leçon 10.5 — 🤖 Claude Code industriel & construire son système personnel
### **La dernière leçon du programme.**

**Notions** — **Claude Code** *(offert 1 mois aux 50 premiers)* : traiter 200 classeurs en une commande · le fichier **`CLAUDE.md`** : vos conventions, vos formats, vos devises, votre nommage, rejoués à chaque fois · les **Skills** : vos processus récurrents, écrits une fois · générer un classeur complet sans ouvrir Excel · **le parcours A documenté** : ce que Claude web permet de faire du même travail, et ce qu'il ne permet pas
- **Construire son système** : l'apprenant repart avec son bloc E, ses conventions, ses cinq prompts, ses macros, ses requêtes. **C'est ça, le livrable réel de la formation.**
- **L'Échelle, entière, les huit niveaux cochés.** Et le rappel final : *le niveau 8 n'est pas au-dessus de l'IA, il en est la condition.*

**Chrono** — *Classique : **impossible** · IA : **40 min** de mise en place · Puis : **une commande**.*

---

## 🎁 Bonus Niveau + — Les 10 macros à avoir dans son `PERSONAL.XLSB`
Supprimer les lignes vides · convertir les formules en valeurs · nettoyer les espaces insécables de la sélection · exporter la feuille en PDF nommé · dégrouper toutes les feuilles · afficher toutes les feuilles masquées · supprimer les plages nommées orphelines · rompre tous les liens externes · ajuster toutes les colonnes de toutes les feuilles · **poser le total de contrôle.**

---

## 🏆 CAPSTONE — « EXCEL AI BUSINESS ANALYST »

Énoncé complet, livrables, barème : **`04_TP/CAPSTONE.md`**

**En deux lignes :** 15 fichiers Excel, 5 CSV, une facture scannée, un brief de direction. Une solution complète à livrer. **Et la condition qui compte le plus : pouvoir expliquer chaque élément de son fichier. Jamais « c'est Claude qui l'a fait ».**

## ❓ QCM → `05_QCM/QCM-M10.md`

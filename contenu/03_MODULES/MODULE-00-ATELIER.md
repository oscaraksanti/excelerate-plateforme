# L'ATELIER
# Préparer sa machine — offert, 40 min, avant le jour 1

> **Promesse :** *En quarante minutes, votre Excel est installé, réglé, vos comptes IA sont créés, et vous savez ce que vous ne devez jamais coller dans une IA.*
>
> **Accès :** `libre` · **En ligne dès le dimanche 20 septembre**
> **Sans lui, une part significative de la promotion bloque à la première leçon IA.** Il sert aussi de teaser.

---

## Pourquoi il existe

Trois problèmes tuent une formation Excel en ligne dans les dix premières minutes du premier soir, et les trois se règlent la veille :

1. **La version d'Excel.** `RECHERCHEX`, `FILTRE`, `TRIER`, `UNIQUE` n'existent ni en 2016 ni en 2019. Découvrir ça lundi à 19 h 15 est une catastrophe.
2. **Le séparateur d'arguments.** Une IA qui rend `=SI(A1>0,"oui","non")` dans un Excel français produit une erreur incompréhensible pour un débutant.
3. **Le compte IA.** Créer un compte, vérifier un email, comprendre ce qui est gratuit : ça prend dix minutes qu'on ne peut pas prendre pendant un live.

---

## Leçon 0.1 — Installer et vérifier son Excel · 12 min

### Notions couvertes
- **Identifier sa version** : `Fichier > Compte > À propos d'Excel`. Noter la version **et** le canal de mise à jour.
- **Le test en 10 secondes** : taper `=RECHERCHEX(` dans une cellule vide. Si l'autocomplétion ne la propose pas, la version est insuffisante pour le programme.
- **Les trois voies si la version ne suffit pas** : Office 2024 (distribué aux inscrits) · **Excel pour le web**, gratuit avec un compte Microsoft · **Google Sheets**.
- **Activer ce qui est masqué** : onglet **Développeur** · **Power Pivot** · **Solveur** · **Utilitaire d'analyse** · vérifier **Power Query** (`Données > Obtenir des données`).
- **Régler les séparateurs** : `Fichier > Options > Options avancées` → décocher « Utiliser les séparateurs système », poser **`,` décimale** et **`;` séparateur de listes**. Format de date en `jj/mm/aaaa`.

### Pépites 💎
1. **Le piège des CSV.** Un double-clic sur un `.csv` détruit vos données : dates converties à l'américaine, zéros initiaux perdus, accents cassés. La bonne porte est **`Données > À partir d'un fichier texte/CSV`**, en **UTF-8**, avec le séparateur choisi explicitement.
2. Excel pour le web est **gratuit et possède `RECHERCHEX`** — mais Power Query y est quasi inexistant. Bon pour les modules 1, 2, 4, 5 ; insuffisant pour le 3 et le 7.

### Chez vous, maintenant
Tape `=RECHERCHEX(` et dis-nous dans le groupe si elle apparaît.

---

## Leçon 0.2 — Le dossier de travail · 8 min

### Notions couvertes
- Arborescence de travail · conventions de nommage · pourquoi on ne travaille jamais dans `Téléchargements`
- Les formats : `.xlsx` `.xlsm` `.xlsb` `.xltx` `.csv` — ce que chacun garde et ce qu'il perd
- **Débloquer un fichier téléchargé** : clic droit > Propriétés > **Débloquer** (*Mark of the Web*). Sans ça, rien ne fonctionnera au module 10, et certains classeurs du programme s'ouvriront en lecture seule.
- Récupération automatique : la régler à **2 minutes**

### Pépites 💎
1. **Récupérer un classeur jamais enregistré** : `Fichier > Informations > Gérer le classeur > Récupérer les classeurs non enregistrés`.
2. Enregistrer en `.csv` un classeur à 4 feuilles n'en garde qu'une, sans mise en forme, sans formules. Sans avertissement clair.

---

## Leçon 0.3 — Créer ses comptes IA · 12 min

### Notions couvertes
- **Claude** — web et application. Ce qui est gratuit, ce qui ne l'est pas. C'est l'outil principal du programme.
- **ChatGPT** — le comparatif de 60 secondes présent dans chaque leçon IA. Son **Analyse de données** sur fichier uploadé est très lisible pour un débutant.
- **Ce que vous n'avez pas, et pourquoi ce n'est pas grave** : Copilot dans Excel et Python in Excel n'existent pas en 2021/2024. **On branche l'IA par l'extérieur.**
- **Le bloc E de C.L.E.A.R., à écrire maintenant** et à garder dans ses notes pour des années :
  > *« Excel 2024 en français, séparateur d'arguments point-virgule, décimale virgule. Mes données sont dans un tableau nommé `t_…`. Donne-moi la formule en français ET en anglais. N'utilise aucune fonction indisponible dans ma version ; si tu en proposes une, signale-le et donne l'alternative. »*

### Pépites 💎
1. **Coller une capture d'écran** de son tableau plutôt que de le décrire : l'IA voit la structure *et* la mise en forme.
2. Demander **trois solutions classées** — simple, robuste, rapide — plutôt qu'une seule. On apprend en comparant.

> ⚠️ **Claude Code n'est pas au programme des trois soirées gratuites.** Il demande un terminal et un abonnement. Il est offert un mois aux 50 premiers inscrits à la masterclass, et traité aux modules 8, 9 et 10.

---

## Leçon 0.4 — La charte de confidentialité IA · 8 min

### Notions couvertes
- **Ce qu'on ne colle jamais dans une IA** : noms de clients réels, salaires nominatifs, numéros de compte, données de santé, contrats sous NDA, identifiants.
- **Anonymiser en deux minutes** : remplacer la colonne des noms par `Client_001…`, garder la structure, jeter le contenu.
- **Le principe du programme :** *on envoie la structure, pas le contenu.* Une IA n'a jamais besoin de vos vraies valeurs pour écrire une formule — elle a besoin de connaître vos colonnes.
- Les réglages de confidentialité des comptes · le cas des entreprises avec DPO · ce que disent les pages légales d'Excelerate IA.

### Le livrable
**La charte, lue et acceptée avant le jour 1.** Une case sur la plateforme.

---

## 📦 Fichiers à produire

| Fichier | Contenu |
|---|---|
| `M00_L01` → `M00_L04` | `_SCRIPT.md` |
| `M00_CHECKLIST_INSTALLATION.pdf` | La liste à cocher : version, séparateurs, compléments, comptes |
| `M00_BLOC_E.md` | Le bloc E, copiable, à garder |
| `M00_CHARTE_IA.pdf` | La charte de confidentialité |

# Module 10 · leçon 10.5 — `CLAUDE.md` et les Skills
### Ce qui transforme un prompt en système

> Un prompt se perd. Un fichier de conventions se transmet, se relit, et se corrige. C'est toute la différence entre « demander à une IA » et **avoir un système**.

---

## 1 · `CLAUDE.md` — vos conventions, rejouées à chaque fois

Ce fichier se pose **à la racine du dossier de travail**. Claude Code le lit automatiquement, à chaque session, sans qu'on le rappelle. Voici celui de BAOBAB — copiez-le, remplacez tout.

````markdown
# BAOBAB Distribution — conventions de travail

## Le contexte
Distributeur de produits de grande consommation. Six agences :
Kinshasa et Lubumbashi (RD Congo, CDF), Abidjan et Dakar (XOF),
Douala et Libreville (XAF). Reporting consolidé en USD.

## Les devises — la règle qui décide de tout
On encaisse en monnaie locale, on décaisse en dollars.
Taux du mois d'août 2026, figés, source : Banque centrale,
relevé du 1er août.
  CDF  3 145,80
  XOF    648,20
  XAF    648,20
Le XOF et le XAF sont arrimés à l'euro à la même parité
(655,957 pour 1 EUR) : leur taux face au dollar est IDENTIQUE.
Ce n'est pas une coquille, ne la « corrige » pas.

## La conversion
Ligne à ligne, jamais sur le total. Arrondi à deux décimales
à chaque ligne. Les deux méthodes écartent de 0,54 USD sur
août 2026 ; c'est normal, c'est documenté, ne le corrige pas.

## Les fichiers clients
Un classeur par client, feuille « Commandes », en-têtes en ligne 5.
Lis les colonnes PAR NOM, jamais par position.
Quinze fichiers sur deux cents ne sont pas au format :
  - 4 sont vides (le client n'a rien commandé)
  - 6 portent une ligne TOTAL sous le tableau  → À IGNORER
  - 3 ont une colonne Remise_Pct en plus       → à lire quand même
  - 2 ont une feuille nommée COMMANDES         → casse indifférente
Ces quinze-là sont connus. S'il en apparaît un seizième,
SIGNALE-LE, ne le devine pas.

## Le nommage des sorties
  AAAA-MM_Type_Valeur.pdf        2026-08_Agence_Kinshasa.pdf
Sans accent, sans espace, sans apostrophe. Le souligné sépare.

## Les contrôles, avant de dire que c'est fini
  1. total consolidé − somme des récapitulatifs par fichier = 0
  2. somme des six rapports d'agence = total consolidé
  3. somme des six rapports de famille = total consolidé
  4. aucun montant négatif
  5. aucune ligne sans agence
Si l'un des cinq ne passe pas : arrête-toi et dis lequel.
Ne « corrige » jamais un écart en ajustant un chiffre.

## Ce que tu ne fais jamais sans me demander
  - écrire dans un fichier client (ils sont en lecture seule)
  - supprimer quoi que ce soit
  - envoyer un courriel
  - changer un taux de change
````

**Pourquoi ça marche.** Les trois quarts de ce fichier sont des choses qu'aucune IA ne peut deviner : que le XOF et le XAF ont le même taux, que six fichiers portent une ligne TOTAL, que l'écart de 0,54 USD est connu et assumé. **C'est du terrain écrit une fois.**

Et la dernière section est celle qu'on oublie toujours : **dire ce qu'elle ne doit pas faire.**

---

## 2 · Une Skill — votre processus, écrit une fois

Une Skill est un dossier avec un `SKILL.md`. Elle se déclenche quand la tâche correspond à sa description.

````markdown
---
name: consolidation-mensuelle
description: Consolider les classeurs clients BAOBAB d'un mois et
  produire les douze rapports d'agence et de famille. À utiliser
  dès qu'on parle de consolidation, de clôture mensuelle ou des
  rapports du lundi.
---

# Consolidation mensuelle BAOBAB

## Avant de commencer
Demande le mois traité s'il n'est pas donné. Ne le devine pas
à partir de la date du jour : on clôture toujours le mois d'avant.

## Les étapes, dans cet ordre
1. Lister les fichiers du dossier. En annoncer le nombre.
   S'il n'y en a pas 200, s'arrêter et le dire.
2. Lire chaque fichier. Consigner pour chacun : lignes, total
   local, total USD, anomalie rencontrée.
3. Écrire `consolide.csv` et `recapitulatif.csv`.
4. Passer les cinq contrôles du CLAUDE.md. Les afficher tous
   les cinq, même ceux qui passent.
5. Produire les douze agrégats : six agences, six familles.
6. Afficher un tableau final : le total, les douze lignes, et
   les deux écarts de découpe.

## Ce qu'il faut afficher à la fin, toujours
- le nombre de fichiers lus, vides, en anomalie, en erreur
- le total consolidé
- les cinq contrôles, avec leur valeur
- la liste des fichiers en anomalie, nommés

## Ce qu'il ne faut jamais faire
- corriger un écart en modifiant une donnée
- ignorer un fichier illisible sans le nommer
- arrondir le total après coup pour que le contrôle tombe juste
````

---

## 3 · Le script produit

Il est livré avec ce module : **`M10_L05_CONSOLIDER.py`**. Lisez-le. Il fait 150 lignes, il est commenté, et trois de ses commentaires expliquent une décision que l'IA n'aurait pas prise seule :

- **`feuille_commandes()`** cherche la feuille par nom insensible à la casse — *« un script qui écrit `wb["Commandes"]` plante sur ceux-là, et plante à la 34ᵉ itération, c'est-à-dire assez tard pour qu'on croie le reste bon. »*
- **le test qui saute la ligne TOTAL** — *« sans lui, le consolidé compte tout deux fois pour ces six clients-là, et rien ne le signale. »*
- **la conversion ligne à ligne** — *« les deux sont défendables ; ce qui ne l'est pas, c'est de mélanger. »*

Ce qu'il produit sur les données du module :

```
  200 fichiers · 5637 lignes
  total consolidé        1,672,787.91 USD
  total récapitulatif    1,672,787.91 USD
  ÉCART                          0.00 USD   ← doit valoir 0,00
  vides      4
  anomalies  15
  erreurs    0
```

**Les quinze anomalies sont annoncées, pas masquées.** C'est la seule sortie acceptable : un script qui dit « 200 fichiers traités » sans mentionner les quinze ment par omission.

---

## 4 · Le parcours A — sans Claude Code

Tout le monde n'aura pas Claude Code. Voici ce que **Claude sur le web** permet, et ce qu'il ne permet pas.

| | Claude web | Claude Code |
|---|---|---|
| Lire 200 fichiers d'un dossier | ❌ un par un, à la main | ✅ |
| Écrire le script qui les lit | ✅ **aussi bien** | ✅ |
| L'exécuter | ❌ à vous de le faire | ✅ |
| Rejouer vos conventions sans les retaper | ❌ à recoller à chaque fois | ✅ `CLAUDE.md` |
| Vérifier le résultat | ❌ | ❌ **— c'est vous** |

> **La dernière ligne est la même dans les deux colonnes.** Le niveau 8 ne s'achète pas avec un abonnement.

Le parcours A tient donc en trois gestes : demander le script à Claude web, **le lire**, le lancer soi-même avec `python3`. Le gain est déjà de plusieurs heures. Ce que Claude Code ajoute, c'est de ne plus avoir à recoller le contexte — et c'est beaucoup, mais ce n'est pas la compétence.

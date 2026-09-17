# MODULE 1 — LUNDI 21 SEPTEMBRE
# Reprendre la main sur ses données

> **Promesse affichée :** *Ce soir, vous repartez avec deux heures par semaine. Vos tableaux s'agrandiront tout seuls, vous ne chercherez plus jamais une donnée à la main, et une photo de facture deviendra un tableau vérifié en 90 secondes.*
>
> **Message implicite du jour :** « Ce soir, tu repars avec deux heures par semaine. »
> **Échelle de maturité :** niveaux **2 et 3** atteints — *je le fais avec une formule* → *je rends la formule dynamique*.
> **À tourner : jeudi 17 septembre.** 5 leçons · 75 à 90 min de vidéo.

---

## ⚠️ Le cadre non négociable de ce module

Ce module **tient exactement la promesse déjà vendue** sur la page d'accueil à 1 837 inscrits :

> *« Les tableaux structurés, RECHERCHEX, et les trois fonctions qu'Excel 2024 a rendues disponibles sans que personne ne le dise : FILTRE, TRIER, UNIQUE. »*

On ne descend pas au niveau débutant. Le débutant a le module **Mise à niveau**, en accès libre depuis dimanche. **Un soir 1 qui commence par « anatomie du ruban » ferait partir ceux qui sont venus pour `RECHERCHEX`.**

> 🔴 **`RECHERCHEX`, `FILTRE`, `TRIER` et `UNIQUE` n'existent ni en Excel 2016 ni en 2019.** L'encart de version s'affiche à l'écran dès la leçon 1.2, et les trois parades (Office 2024, Excel web, Sheets) ont été réglées le dimanche.

---

## Le hook des 90 premières secondes

On filme trois personnes qui font le même tableau : **14 minutes** à la souris · **40 secondes** au clavier · **1 prompt**. Sans commentaire. Puis, à l'écran :

> « Ces trois personnes ont exactement le même Excel. »

---

## Les données du jour

| Fichier | Contenu |
|---|---|
| `J01_Caisse_Kinshasa.xlsx` | 60 mouvements de caisse de l'agence de Kinshasa, en CDF. 8 dates en texte, 6 prix en texte, 2 doublons, 1 quantité négative. |
| `J01_Taux_Change.xlsx` | `t_Taux` — 24 mois × CDF / XOF / XAF vers USD |
| `J01_Facture_Fournisseur.pdf` | Une facture scannée de travers, 14 articles, **un chiffre volontairement ambigu** |

---

# Leçon 1.1 — Le tableau structuré
### 🔧 Classique · 15 min

**Le problème.** Chaque mois, Aïcha ajoute des lignes à son fichier de ventes. Et chaque mois elle doit rétendre à la main ses formules, ses graphiques et son tableau croisé. Elle en oublie toujours un. Le mois dernier, le rapport envoyé à la direction était faux de 400 000 CDF.

**La mission.** Transformer une plage morte en objet vivant, et voir tout le classeur se mettre à jour tout seul quand on ajoute une ligne.

### Le concept
Une plage, c'est un rectangle de cellules : Excel n'en sait rien d'autre. Un **tableau structuré**, c'est un objet **nommé**, qui connaît ses colonnes, sa taille, et qui prévient tout le classeur quand il grandit. **C'est la porte d'entrée de tout le reste du programme** — Power Query et le modèle de données ne fonctionnent que sur des tableaux.

### Notions couvertes
- **`Ctrl+L`** *(FR)* / `Ctrl+T` : ce qui change réellement. **Nommer son tableau** dans `Création de tableau > Nom du tableau`.
- **Les références structurées** : `=SOMME(t_Caisse[Montant])` · `[@Quantite]*[@PU]` · `t_Caisse[#Totaux]` · `t_Caisse[[#Tout];[Montant]]`
- **Colonnes calculées auto-propagées** : on écrit la formule une fois, elle descend sur 60 lignes et sur les 600 suivantes
- **La ligne de total** avec son menu déroulant d'agrégation
- **Les en-têtes qui remplacent A/B/C** au défilement — plus besoin de figer les volets
- **L'extension automatique** : la nouvelle ligne est intégrée partout — formules, graphiques, TCD, listes de validation
- **Les segments sur un tableau**, pas seulement sur un TCD
- **Quand ne PAS faire de tableau** : mise en page complexe, feuille de saisie à trous, double en-tête

### Pratique guidée
Convertir la caisse en `t_Caisse`. Ajouter une colonne calculée `Montant = [@Quantite]*[@PU_CDF]`. Brancher un graphique. **Ajouter 5 lignes et regarder tout suivre.**

### Pépites 💎
1. **Un TCD branché sur un tableau structuré ne rate plus jamais les nouvelles lignes.** C'est la **cause n° 1 des tableaux croisés faux en entreprise** : quelqu'un actualise, les nouvelles lignes ne sont pas là, et personne ne s'en aperçoit.
2. **Nommer ses tableaux `t_Ventes`, `t_Clients`, `t_Taux`** : taper `t_` dans une formule fait apparaître le plan complet du classeur. L'autocomplétion devient une carte.
3. **Le double-clic sur le bord d'un en-tête** : premier clic = les données, deuxième clic = en-tête inclus. Sélectionner 80 000 lignes en deux gestes.
4. `Ctrl+Maj+L` : filtres instantanés. Filtrer **par couleur**, **par icône**, par « 10 premiers ».

### Erreurs fréquentes
Fusionner des cellules dans un tableau *(interdit, et ça casse tout)*. Laisser une ligne vide au milieu. Garder le nom « Tableau1 » sur quatorze tableaux différents.

### Raccourcis
`Ctrl+L` · `Ctrl+Maj+L` · `Ctrl+Espace` · `Ctrl+A` *(dans un tableau : 1 fois les données, 2 fois tout)* · `Alt+↓`

### Mini-défi — 10 min
Convertir les trois plages du classeur en tableaux nommés, brancher un graphique sur l'un d'eux, ajouter 5 lignes, et vérifier que le graphique, le total et le TCD ont tous suivi.

### Chez vous, demain
Ouvre ton fichier le plus utilisé et convertis sa plage principale en tableau. Nomme-le. Tu viens de régler ton problème de rentrée.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

# Leçon 1.2 — RECHERCHEX : la fin de RECHERCHEV
### 🔧 Classique · 15 min

**Le problème.** Nadège veut le total de la caisse en dollars. Le taux change chaque mois, et la table des taux est dans un autre fichier. Thomas a tapé `=B2*2800` dans 60 cellules. Le mois prochain, tout sera faux.

**La mission.** Aller chercher le taux du bon mois automatiquement, et le référencer **une seule fois** dans tout le classeur.

### Le concept
`RECHERCHEV` a trois défauts qui ont coûté des millions à des entreprises : elle cherche **approximativement par défaut**, elle compte les colonnes **en numéro** (on insère une colonne, tout devient faux), et elle ne regarde **jamais à gauche**. `RECHERCHEX` corrige les trois. Il n'y a aucune raison de continuer à enseigner l'autre.

### Notions couvertes
- **La syntaxe** : `=RECHERCHEX(valeur_cherchée ; tableau_recherche ; tableau_renvoyé ; [si_absent] ; [mode_correspondance] ; [mode_recherche])`
- **Correspondance exacte par défaut** — la différence décisive avec `RECHERCHEV`
- **Le 4ᵉ argument `si_absent`** : `"Non trouvé"` au lieu de `#N/A`. **Et pourquoi c'est mieux que `SIERREUR`** : il n'attrape que l'absence, pas les autres erreurs qu'il ne faut surtout pas masquer.
- **Chercher à gauche** : impossible avec `RECHERCHEV`, naturel ici
- **Renvoyer plusieurs colonnes d'un coup** : le tableau renvoyé peut être une plage
- **La correspondance approximative maîtrisée** : `mode_correspondance = -1` pour une table de barème
- **Comparaison honnête** : `RECHERCHEV`, `INDEX`/`EQUIV`, `RECHERCHEX` — quand chacune reste utile *(et le renvoi au module 4)*

> ⚠️ **Encart à l'écran :** *Indisponible en Excel 2016 et 2019. Alternative : `INDEX`/`EQUIV` — voir la fiche mémo.*

### Pratique guidée
Chercher le taux de septembre 2026 dans `t_Taux` par `RECHERCHEX`. Le poser dans **une seule cellule nommée** `TauxUSD`. Convertir toute la caisse en la référençant.

### Pépites 💎
1. **`RECHERCHEX` en marche arrière.** Le 6ᵉ argument `mode_recherche = -1` cherche **de bas en haut**. C'est comme ça qu'on trouve **le dernier prix appliqué à un client**, le dernier mouvement d'un compte, la dernière valeur saisie. Presque personne ne connaît cet argument, et il résout un problème que tout le monde a.
2. **`RECHERCHEX` imbriquée = recherche à deux dimensions.** Un `RECHERCHEX` dans le tableau renvoyé d'un autre `RECHERCHEX` : on croise une ligne et une colonne sans `INDEX`/`EQUIV`.
3. **Une seule cellule de taux, nommée.** `=Montant/TauxUSD` se relit dans six mois ; `=B2/$K$1` non. C'est la première leçon de modélisation du programme — et elle vaut pour tout : TVA, remise, seuil, objectif.
4. `si_absent` renvoie ce qu'on veut, y compris **une autre formule**. Un plan B intégré à la recherche.

### Erreurs fréquentes
Écrire le taux en dur dans la formule. Garder `RECHERCHEV` « parce qu'on la connaît » et se faire piéger par la correspondance approximative par défaut. Mettre `SIERREUR` autour de tout, ce qui masque une vraie erreur de données.

### Raccourcis
`F4` *(figer une référence)* · `Ctrl+F3` *(gestionnaire de noms)* · `Alt+Entrée` *(aérer une formule longue)* · `Ctrl+Maj+A` *(insérer les arguments)*

### Mini-défi — 12 min
Ajouter au classeur : le taux du mois, trouvé automatiquement · le CA converti en USD · **le dernier prix appliqué au client « SUPERMARCHÉ CITY »**, trouvé en marche arrière. Puis changer le mois en B1 : tout doit se recalculer.

### Chez vous, demain
Cherche un nombre écrit en dur dans une de tes formules — un taux, une TVA, un seuil. Sors-le, nomme-le, référence-le.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

# Leçon 1.3 — FILTRE, TRIER, UNIQUE : la liste qui se fabrique toute seule
### 🔧 Classique · 15 min

**Le problème.** Serge veut, sur une feuille, la liste des clients de Kinshasa qui ont acheté pour plus de 500 000 CDF, triée du plus gros au plus petit. À jour. Tous les matins. Sans qu'il ait à cliquer.

**La mission.** Un tableau de bord qui se fabrique seul, **sans tableau croisé, sans filtre, sans macro** — trois formules.

### Le concept
Jusqu'en 2021, une formule rendait **une** valeur. Depuis, une formule peut rendre **un tableau entier**, qui se déverse dans les cellules voisines. C'est le changement le plus profond de l'histoire d'Excel, et la majorité des utilisateurs ne s'en est pas aperçue.

### Notions couvertes
- **`FILTRE(tableau ; condition ; [si_vide])`** — et la condition multiple par multiplication `(A)*(B)` pour ET, addition `(A)+(B)` pour OU
- **`TRIER(tableau ; [index] ; [ordre])`** et **`TRIERPAR`** pour trier selon une colonne qu'on n'affiche pas
- **`UNIQUE(tableau)`** — la liste des valeurs distinctes, sans doublon, à jour
- **Le déversement** : la plage de débordement, le **cadre bleu**, et **`#DEBORDEMENT!`** — sa cause unique : quelque chose occupe la place
- **L'opérateur `#`** : `E2#` désigne « tout ce que cette formule a déversé ». On l'utilise comme source d'un graphique, d'une liste déroulante, d'un autre calcul.
- **Les trois imbriquées** : `=TRIER(FILTRE(t_Caisse[[Client]:[Montant]];t_Caisse[Agence]="Kinshasa");2;-1)`
- **Ce que ça remplace** : le filtre manuel, la copie-colle du lundi matin, et dans bien des cas le TCD lui-même

### Pratique guidée
Construire la feuille `Synthese` : la liste unique des clients, la liste triée des 10 plus gros, et le tableau filtré de Serge. Puis **ajouter une ligne dans `t_Caisse`** et regarder les trois se mettre à jour.

### Pépites 💎
1. **`FILTRE` + `TRIER` + `UNIQUE` imbriquées = un tableau de bord sans TCD**, qui n'a jamais besoin d'être actualisé. Un TCD demande un clic sur « Actualiser ». Ça, non.
2. **`UNIQUE` alimente une liste déroulante qui s'allonge toute seule.** Validation des données > Liste > `=$E$2#`. Un nouveau client apparaît dans la caisse : il est dans la liste déroulante dans la seconde.
3. **Le troisième argument de `FILTRE`**, `si_vide` : `"Aucun résultat"` au lieu de `#CALC!`. Un tableau de bord qui n'affiche jamais d'erreur devant un directeur.
4. **`SEQUENCE`** pour fabriquer une colonne de dates ou de numéros sans recopier : `=SEQUENCE(30;1;DATE(2026;9;1))`.

### Erreurs fréquentes
Écrire une formule de déversement dans un tableau structuré *(ça ne marche pas, et l'erreur est obscure)*. Laisser une cellule occupée sous la formule et ne pas comprendre `#DEBORDEMENT!`. Recopier une formule matricielle vers le bas — elle se déverse déjà, c'est inutile et ça casse.

### Raccourcis
`Ctrl+Maj+Entrée` *(reconnaître une matricielle héritée)* · `Ctrl+/` *(sélectionner toute la plage de déversement)* · `F2` · `Échap`

### Mini-défi — 12 min
Une seule feuille, trois formules, zéro clic : la liste des familles de produits vendues, le top 5 des clients de Kinshasa par montant, et le nombre de clients distincts. Ajoute deux lignes : tout doit bouger.

### Chez vous, demain
Le fichier où tu refais le même filtre chaque semaine : remplace le filtre par une formule `FILTRE`. Tu ne le refiltreras plus jamais.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

# Leçon 1.4 — 🤖 C.L.E.A.R. : obtenir une formule juste du premier coup
### 🧠 IA · 15 min

**Le problème.** Thomas demande à une IA « donne-moi une formule pour calculer la marge ». Il obtient `=SUM(B2:B10)*0.2`. Ça ne fonctionne pas dans son Excel français, et ça ne calcule pas ce qu'il voulait.

**La mission.** Refaire toute la leçon 1.2 en trois prompts — puis faire générer 500 lignes de données de test réalistes pour éprouver son propre classeur.

### Le prompt décortiqué — C.L.E.A.R.
Chaque lettre est écrite à l'écran, une par une, et on voit la réponse se corriger à mesure qu'on les ajoute.

| | Contenu du prompt |
|---|---|
| **C** | « Je suis contrôleur de gestion chez un distributeur agroalimentaire, 6 agences, 3 devises. » |
| **L** | « Je veux le taux de change du mois de la vente, puis le montant converti en USD. » |
| **E** | **« Excel 2024 en français, séparateur d'arguments point-virgule, décimale virgule. Mes données sont dans `t_Caisse`, les taux dans `t_Taux` (colonnes `Mois`, `CDF_USD`). Donne-moi la formule en français ET en anglais. N'utilise aucune fonction indisponible en 2024. »** |
| **A** | « Donne la formule, son équivalent anglais, et l'explication en deux lignes. » |
| **R** | « Donne 3 cas de test avec le résultat attendu, dont un cas limite : un mois absent de la table. » |

> **Le bloc E est celui que personne n'écrit, et il cause 70 % des formules inutilisables.** C'est le moment le plus important de la leçon. On le montre **deux fois** : sans lui, puis avec.

### L'exécution en direct, y compris l'échec
On lance d'abord le prompt **sans le bloc E**. L'IA rend une formule avec des virgules et un nom anglais. On la colle dans Excel : `#NOM?`. **On ne coupe pas.**

### 🔴 L'IA se trompe à l'écran
Erreur n° 1 de la liste des huit : **séparateur `,` au lieu de `;`**.
**`V1` l'attrape en dix secondes.** On ajoute le bloc E, on relance, c'est juste.

### Le Protocole V4 appliqué
| | Ce qu'on vérifie ici |
|---|---|
| **V1 — Version** | La fonction existe-t-elle en 2024 ? Le séparateur est-il le bon ? |
| **V2 — Valeurs** | Trois cas connus + **un mois absent de la table** |
| **V3 — Volumétrie** | 60 lignes en entrée → 60 résultats, pas 59 |
| **V4 — Vérité métier** | 28 M CDF / 2 800 ≈ 10 000 USD. Plausible ? |

### Les 4 usages fondamentaux
Générer une formule · **expliquer** une formule qu'on n'a pas écrite · corriger une erreur · **générer un jeu de données de test**.

### Pépites 💎
1. **Coller une capture d'écran du tableau** plutôt que de le décrire. L'IA voit la structure *et* la mise en forme, et la réponse est meilleure.
2. **Demander trois solutions classées** — la plus simple, la plus robuste, la plus rapide. On apprend en comparant, et on choisit en connaissance de cause.
3. **Demander à l'IA de générer le jeu de test qui casse sa propre formule.** C'est le test le plus efficace qui existe, et il ne coûte rien.

### Chrono
*Classique **18 min** · IA **4 min** · **Vérification 3 min**.*

### Mini-défi — 10 min
Obtenir, **en un seul prompt C.L.E.A.R.**, une formule de commission à trois paliers qui fonctionne du premier coup dans un Excel français. Si elle ne marche pas du premier coup, c'est le prompt qu'il faut corriger, pas la formule.

### Chez vous, demain
Enregistre ton **bloc E personnel** dans tes notes. Tu le colleras au début de chaque conversation pendant des années.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2 — inclut les prompts complets, copiables)*

---

# Leçon 1.5 — 🤖 Du papier au tableau
### 🧠 IA — **la leçon signature du module** · 15 min

**Le problème.** Aïcha reçoit 14 factures fournisseurs par semaine, en PDF ou photographiées au téléphone. Elle ressaisit tout à la main : 45 minutes par lot, avec des erreurs de frappe qu'elle ne voit qu'au moment du rapprochement bancaire.

**La mission.** Transformer une facture scannée de travers en tableau Excel propre — **et prouver que la lecture est exacte** — en 90 secondes.

### Le prompt décortiqué
> *« Voici la photo d'une facture fournisseur. Rends-moi un tableau avec exactement ces six colonnes : Référence, Désignation, Quantité, Prix unitaire, Montant, Devise. Format CSV, séparateur point-virgule, décimale virgule. Ne calcule rien : recopie ce qui est écrit. Si un chiffre est illisible, écris `?` — ne devine pas. »*

Trois exigences, trois raisons :
- **le CSV** plutôt qu'un tableau formaté → le collage est propre, les décimales sont justes
- **« ne calcule rien »** → on veut la lecture brute, le calcul c'est notre travail, c'est lui qui va servir de contrôle
- **« ne devine pas »** → c'est la consigne qui transforme une IA confiante en IA honnête

### 🔴 L'IA se trompe à l'écran — le cœur de la leçon
La facture contient un chiffre ambigu : **un `8` qui peut se lire `3`**. L'IA lit `3`.

On ne fait jamais confiance à une lecture d'image. **Le contrôle en trois points :**

| | Le contrôle | Ce qu'il attrape |
|---|---|---|
| 1 | **Le total recalculé doit tomber sur le total imprimé** | l'erreur de chiffre |
| 2 | **Le nombre de lignes doit correspondre** | la ligne sautée |
| 3 | **Les montants aberrants sont signalés** | le décalage de virgule |

Le total ne tombe pas. On retourne voir la facture. **On corrige.** Et on a appris quelque chose que personne n'enseigne : *l'IA lit très bien et se trompe quand même, et c'est votre total de contrôle qui vous sauve.*

### Notions couvertes
- Donner **une image ou un PDF** à Claude et obtenir un tableau structuré : les colonnes à exiger, le format de sortie à imposer
- **Les sources non structurées du quotidien** : facture PDF, photo de bon de livraison, email de commande, capture d'un logiciel métier, tableau collé dans WhatsApp
- **Le total de contrôle**, importé dans le classeur et affiché en rouge s'il n'est pas nul
- **Le traitement d'un lot** : dix factures d'un coup, et la limite honnête de l'exercice
- **Parcours A, sans rien installer** : Claude web ou ChatGPT. La limite à connaître — **il vous rend un fichier, il ne modifie pas le vôtre.**

### Pratique guidée
La facture du jour, en direct, du téléphone au classeur. Puis on casse volontairement le total et on regarde le contrôle virer au rouge.

### Pépites 💎
1. **Exiger le CSV en sortie** plutôt qu'un beau tableau : le collage est propre, les décimales sont justes, et on contrôle l'import.
2. **« Si un chiffre est illisible, écris `?` — ne devine pas. »** Une consigne de six mots qui change la nature de la réponse.
3. Faire **documenter un classeur hérité** : inventaire des feuilles, des formules, des liens externes. Le sauvetage des fichiers dont personne ne veut.

### Chrono
*Classique **45 min** pour 14 lignes · IA **90 s** · **Vérification 3 min**.*

### Mini-défi — 15 min
Photographie une facture ou un ticket de caisse **réel**, obtiens le tableau, et **prouve par un total de contrôle** que la lecture est exacte. Poste ta capture dans le groupe.

### Chez vous, demain
Le prochain document papier que tu allais ressaisir : ne le ressaisis pas.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

## 🎁 Bonus Niveau + — Les 12 options d'Excel à changer le premier jour

Calcul automatique/manuel · nombre d'annulations · dossier d'enregistrement par défaut · récupération automatique à 2 minutes · désactiver `LIREDONNEESTABCROISDYNAMIQUE` · style de référence L1C1 · saisie semi-automatique · gestion des liens externes · affichage des zéros · sens de la touche Entrée · listes personnalisées *(taper « Kinshasa » et tirer pour obtenir les 6 agences dans l'ordre métier — et trier dans cet ordre)* · police et nombre de feuilles par défaut.

**Livrable :** `M01_BONUS_Options.pdf`, une page, à cocher.

---

## 🧪 TP 1 — « Le premier lundi chez BAOBAB »

Énoncé complet, cellules attendues et barème : **`04_TP/TP-01.md`**

**En deux lignes :** Thomas te transmet le fichier de caisse qu'il tient à la main — montants en texte, dates américaines, doublons, pas une formule. Il y joint une facture scannée qu'il n'a pas eu le temps de saisir. Nadège veut « quelque chose de propre pour 16 h ».

---

## ❓ QCM du module 1

Les 6 questions : **`05_QCM/QCM-M01.md`**

---

## 📦 Fichiers à produire pour ce module

| Fichier | Contenu |
|---|---|
| `M01_L01` → `M01_L05` | `_DEPART.xlsx` · `_CORRIGE.xlsx` · `_SCRIPT.md` · `_DEFI.xlsx` |
| `M01_L04_PROMPTS.md` · `M01_L05_PROMPTS.md` | Les prompts, copiables |
| `J01_Caisse_Kinshasa.xlsx` · `J01_Taux_Change.xlsx` · `J01_Facture_Fournisseur.pdf` | Les données du jour |
| `M01_BONUS_Options.pdf` | Les 12 réglages |
| `M01_RACCOURCIS.pdf` | La fiche des 24 raccourcis de survie, recto A4 |
| `TP01_DEPART.xlsx` · `TP01_CORRIGE.xlsx` · `TP01_ENONCE.pdf` | Le TP |

# MODULE 3 — MERCREDI 23 SEPTEMBRE
# Ce qui tourne tout seul

> **Promesse affichée :** *Vous ne retoucherez plus jamais un fichier à la main. Et votre rapport mensuel de trois heures deviendra un bouton.*
>
> **Message implicite du jour :** « Voilà ce que construit un professionnel. Et voilà ce qui te manque pour le faire seul. »
> **Échelle de maturité :** niveau **4 atteint**, aperçu du niveau **5**.
> **À tourner : samedi 19 septembre.**

---

## ⚠️ Le module le plus important des trois — et pas pour la raison qu'on croit

C'est **le dernier soir gratuit**. C'est lui qui décide si quelqu'un paie 37 $ ou s'en va.

> 🔴 **Le soir 3 est la bande-annonce du payant, jamais son résumé.**
> On livre **un** classeur qui marche, sur **nos** données, et il doit devenir évident que le refaire sur **ses propres** données demande la méthode — qui est dans les modules 4 à 10. **S'ils repartent autonomes mercredi, il n'y a pas de vente.**

Concrètement : Power Query est montré, il n'est pas enseigné en profondeur. On importe un dossier, on dépivote, on actualise. On ne traite ni les colonnes qui bougent, ni les requêtes qui survivent à la vraie vie, ni le langage M. **Ça, c'est le module 7**, et on le dit.

---

## Le hook

Un fichier de 5 000 clients, hérité d'une fusion : noms en MAJUSCULES, dates au format américain, téléphones en six formats, 340 doublons. On annonce :

> « Thomas y passerait trois jours. Ce soir, vous le ferez pendant une pause café. »

---

## Les données du jour

| Fichier | Contenu |
|---|---|
| `J03_CRM_Fusion.xlsx` | 5 000 clients d'un autre CRM. Volontairement catastrophique : 18 anomalies, dont **190 doublons invisibles tant que la casse n'est pas normalisée** |
| `J03_Ventes_12_mois/` | 12 fichiers mensuels des 6 agences, à consolider en un clic |

---

# Leçon 3.1 — Nettoyer sans jamais retoucher à la main
### 🔧 Classique · 15 min

**Le problème.** L'export CRM : « KALALA Nadège », « kalala nadege », « Nadège KALALA ». Des emails avec des espaces invisibles. Des dates « 03/04/25 » dont personne ne sait si c'est mars ou avril. Six formats de téléphone.

**La mission.** Une base exploitable, **sans une seule correction manuelle** — parce que le mois prochain le même export arrivera.

### Le concept
Corriger une cellule à la main, c'est perdre le travail. Écrire la règle qui corrige, c'est le garder. **La question n'est jamais « comment je répare ça », c'est « comment je fais pour ne plus jamais avoir à le réparer ».**

### Notions couvertes
**Texte** — `SUPPRESPACE` (TRIM) · `EPURAGE` (CLEAN) · `MAJUSCULE` / `MINUSCULE` / `NOMPROPRE` · `NBCAR` · `GAUCHE` / `DROITE` / `STXT` · **`CHERCHE` vs `TROUVE`** *(la casse — et c'est l'inverse de ce que les noms français laissent croire)* · `SUBSTITUE` vs `REMPLACER` · `CONCAT` / `JOINDRE.TEXTE` · `TEXTE`
> ⚠️ *2024 uniquement :* `FRACTIONNER.TEXTE`, `TEXTE.AVANT`, `TEXTE.APRÈS` — avec l'alternative 2021 fournie à l'écran.

**Outils** — **Convertir > Texte en colonnes**, y compris son usage détourné : convertir une colonne entière de faux nombres ou de fausses dates en quatre clics · **`Ctrl+E` Remplissage instantané** : ses réussites et **ses trahisons silencieuses** · Supprimer les doublons · Rechercher/Remplacer avec jokers · `Ctrl+H` sur une sélection seulement

**Dates** — la sérialisation · `DATE`, `ANNEE`, `MOIS`, `JOUR` · `JOURSEM` · **`FIN.MOIS`** · `MOIS.DECALER` · **`NB.JOURS.OUVRES.INTL`** avec une liste de jours fériés nommée · **`DATEDIF`** · `NO.SEMAINE.ISO` · **réparer une date texte** : `DATEVAL`, `CNUM`, Texte en colonnes

### Pratique guidée
Sur 200 lignes du CRM : normaliser les noms, réparer les dates, extraire l'indicatif téléphonique. Et **prouver par `NBCAR`** qu'il ne reste aucun caractère invisible.

### Pépites 💎
1. 💎💎 **L'espace insécable, `U+00A0`.** `SUPPRESPACE` ne l'enlève pas — il ne connaît que l'espace ordinaire, le code 32. Tout ce qui est copié depuis le web, SAP, un PDF ou un logiciel comptable en contient. ⚠️ **N'écris pas `CAR(160)` : il dépend de la plateforme** — sur Excel pour Mac il rend « † ». La formule fiable partout :
   `=SUPPRESPACE(SUBSTITUE(A1;UNICAR(160);" "))`
   Et pour **détecter** : `NBCAR(x) <> NBCAR(SUBSTITUE(x;UNICAR(160);""))` — pas `CHERCHE`, qui assimile l'insécable à un espace ordinaire.
   **C'est la pépite la plus rentable du programme.** Elle explique des années de rapprochements qui ne tombaient pas juste.
2. **`DATEDIF`** n'apparaît dans aucun assistant, dans aucun menu, dans aucune autocomplétion — et elle existe depuis trente ans. Elle calcule l'ancienneté exacte en années, mois et jours : `=DATEDIF(A1;AUJOURDHUI();"y")`.
3. **Détecter les caractères invisibles** en comparant `NBCAR()` à la longueur attendue. Six caractères annoncés, huit comptés : il y a quelque chose.
4. **`NB.JOURS.OUVRES.INTL`** avec son paramètre de week-end personnalisé — indispensable là où la semaine ouvrée n'est pas lundi-vendredi.
5. **Trier par une colonne clé masquée** pour obtenir un ordre métier : Janvier avant Avril, et Kinshasa avant Abidjan.

### Erreurs fréquentes
Faire confiance à `Ctrl+E` sans vérifier les vingt dernières lignes — il apprend sur les premières et se trompe silencieusement sur les cas rares. Nettoyer **dans** la colonne d'origine, sans garder le brut. Convertir les dates avant d'avoir identifié leur format source.

### Raccourcis
`Ctrl+E` · `Ctrl+H` · `Alt` `A` `E` *(texte en colonnes)* · `Ctrl+Maj+U` *(agrandir la barre de formule)*

### Mini-défi — 15 min
Sur 200 lignes du CRM : normaliser les noms, réparer les dates, extraire l'indicatif, et **prouver par `NBCAR`** qu'il ne reste aucun caractère invisible.

### Chez vous, demain
Prends la colonne qui ne se rapproche jamais correctement dans ton fichier, et applique-lui `SUBSTITUE(…;UNICAR(160);" ")`. Dis-nous combien de lignes se sont réparées.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

# Leçon 3.2 — Power Query : le rapport de trois heures devient un bouton
### 🔧 Classique · 15 min

**Le problème.** Aïcha reçoit douze fichiers par mois, un par agence. Elle les ouvre un par un, copie, colle, empile, nettoie, recalcule. Trois heures, chaque premier lundi du mois. Depuis quatre ans.

**La mission.** Les douze fichiers, consolidés et nettoyés. Le mois prochain : **un clic**.

### Le concept
Une formule recalcule. Power Query **rejoue**. Tu décris une fois la suite d'opérations — importer, supprimer, renommer, typer, fusionner — et cette recette s'applique à n'importe quelles données du même format, pour toujours. **C'est la différence entre faire le travail et le décrire une bonne fois.**

### Notions couvertes
- **`Données > Obtenir des données`** : depuis un fichier, depuis **un dossier entier**, depuis un tableau structuré
- **L'éditeur** : les étapes appliquées, à droite — **chaque étape se relit, se modifie, se supprime**
- **Les transformations de base** : supprimer des colonnes, promouvoir les en-têtes, **typer les colonnes** *(l'étape que tout le monde saute, et qui cause tous les bugs)*, remplacer les valeurs, filtrer
- **Dépivoter** — l'opération qui change une vie
- **Fusionner** *(jointure)* et **Ajouter** *(empiler)* : la différence, en une image
- **Charger vers** : un tableau, un TCD, ou seulement une connexion
- **Actualiser** : le bouton, et l'actualisation à l'ouverture

> ⚠️ **Power Query est quasi absent d'Excel pour le web.** Pour cette leçon, il faut la version bureau. À redire à l'écran.

### Pratique guidée
Importer le dossier des douze fichiers. Nettoyer une fois. Charger. Puis **ajouter un treizième fichier dans le dossier et appuyer sur Actualiser.**

### Pépites 💎
1. 💎💎 **Dépivoter.** On reçoit un tableau avec douze colonnes de mois. C'est illisible par un TCD, inutilisable par une formule. **Sélectionner les colonnes de mois > Transformer > Dépivoter les colonnes.** Quatre clics, et douze tableaux croisés reçus redeviennent des données analysables. Personne ne connaît ce bouton, et il débloque des années de fichiers.
2. **Importer un dossier, pas des fichiers.** La requête pointe sur le dossier : tout fichier déposé dedans est automatiquement intégré à l'actualisation suivante. Aïcha ne fait plus rien du tout — elle dépose et elle actualise.
3. **Typer les colonnes explicitement, toujours.** Power Query devine, et il devine mal sur les dates ambiguës et les nombres à virgule. Une étape de typage explicite évite 80 % des bugs d'actualisation.
4. **La requête ne modifie jamais la source.** Le fichier d'origine reste intact. C'est ce qui rend l'opération sans risque, et ça vaut d'être dit à des gens qui ont peur de casser leurs données.

### Erreurs fréquentes
Nettoyer à la main **après** le chargement — tout est perdu à l'actualisation suivante. Sauter l'étape de typage. Charger 120 000 lignes dans une feuille alors qu'une connexion suffisait.

### Raccourcis
`Alt` `A` `PN` *(nouvelle requête)* · `Ctrl+Alt+F5` *(tout actualiser)*

### Mini-défi — 15 min
Consolider les douze fichiers, typer les colonnes, charger. Puis ajouter un treizième fichier et actualiser. **Chronomètre les deux : la première fois et la deuxième.**

### Chez vous, demain
Le dossier où tu empiles des fichiers tous les mois : importe-le en une requête ce soir.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

# Leçon 3.3 — Le tableau de bord qui se met à jour tout seul
### 🔧 Classique · 15 min

**Le problème.** Serge veut voir, en huit secondes et sur son téléphone : le CA du mois, l'évolution, les cinq meilleurs clients, et l'agence en retard. Il veut pouvoir changer le mois lui-même. Il ne veut pas appeler quelqu'un.

**La mission.** Un tableau de bord d'une page, interactif, branché sur la requête d'hier, qui se recalcule tout seul.

### Le concept
Un tableau de bord n'est pas un tableau coloré. C'est **une réponse à une question**, posée avant d'ouvrir Excel. Si on ne sait pas quelle décision il doit permettre, on ne peut pas le construire — on peut seulement le décorer.

### Notions couvertes
- **Le TCD branché sur la requête Power Query** — pas sur une plage, pas sur une copie
- **Les segments et la chronologie** : un segment pilote plusieurs TCD simultanément *(Connexions de rapport)*
- **Les quatre indicateurs qui suffisent** : la valeur, la comparaison, la tendance, l'exception
- **`LET`** : nommer les calculs intermédiaires **à l'intérieur** d'une formule, pour qu'elle se relise. Une formule de 200 caractères devient six lignes lisibles — et elle calcule plus vite, parce que chaque morceau n'est évalué qu'une fois
  > ⚠️ `LET` n'existe ni en 2016 ni en 2019.
- **Les graphiques utiles** : courbe pour le temps, barres pour la comparaison, **et pourquoi le camembert est presque toujours une erreur**
- **Les graphiques sparkline** dans une cellule
- La mise en page : une seule page, pas de défilement, l'information la plus importante en haut à gauche

### Pratique guidée
Assembler le tableau de bord de Serge. Puis **changer le segment de mois** et regarder les six éléments se mettre à jour ensemble.

### Pépites 💎
1. **Un segment peut piloter plusieurs TCD à la fois.** Clic droit > Connexions de rapport. C'est ce qui transforme quatre tableaux indépendants en un tableau de bord.
2. **`LET` rend une formule lisible ET plus rapide.** Le gain de vitesse surprend tout le monde : ce qui est nommé n'est calculé qu'une seule fois.
3. **La mise en forme conditionnelle en barres de données** donne un graphique dans une colonne, sans objet graphique, sans ralentir le fichier.
4. **Masquer la feuille de calcul et ne montrer que le tableau de bord.** Un fichier dont on ne voit que la restitution inspire une confiance qu'un fichier à quatorze onglets n'inspire jamais.

### Erreurs fréquentes
Brancher le TCD sur une plage au lieu du tableau ou de la requête. Mettre quatorze indicateurs. Utiliser un camembert à huit parts.

### Raccourcis
`Alt` `N` `V` *(nouveau TCD)* · `Alt+F1` *(graphique sur la sélection)* · `Ctrl+Alt+F5`

### Mini-défi — 20 min
Le tableau de bord d'une page : CA du mois, évolution vs mois précédent, top 5 clients, agence la plus en retard. Un segment de mois. Zéro formule en dur.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

# Leçon 3.4 — 🤖 Nettoyer 5 000 lignes — et prouver que c'est juste
### 🧠 IA · 15 min

**Le problème.** Le fichier complet. 5 000 lignes, 18 types d'anomalies. Aucune envie d'y passer trois jours. Mais aucune envie non plus de livrer une base dont on ne sait pas si elle est juste.

**La mission.** Le traiter en une exécution — avec un rapport de qualité **vérifiable**.

### Le prompt décortiqué
> *« Voici 20 lignes représentatives de mon export CRM. Liste toutes les anomalies que tu vois, **classées par gravité**, sans rien corriger pour l'instant. Pour chacune : combien de lignes probablement touchées, et la formule Excel qui la répare. »*

Puis, seulement après :
> *« Donne-moi l'ordre des opérations de nettoyage, sous forme de liste à cocher. »*

### 🔴 L'IA se trompe à l'écran — l'erreur la plus instructive du programme
Elle propose **de dédoublonner avant de normaliser la casse.**

Résultat : « KALALA Nadège » et « kalala nadege » sont vus comme deux clients différents. **Elle trouve 150 doublons au lieu de 340. Et elle ne le signale pas.** Le fichier a l'air propre. Il est faux.

**La règle à lui imposer, et à retenir à vie :**
> *supprimer les caractères invisibles → normaliser la casse et les accents → typer les dates → dédoublonner → rapprocher*

### Le point de vigilance capital
> ⚠️ **Une IA qui nettoie 5 000 lignes peut en « corriger » 40 de travers sans le dire.** Elle ne ment pas : elle ne sait pas qu'elle s'est trompée.

**Le protocole d'échantillonnage de contrôle — non négociable :**

| | Ce qu'on vérifie | Pourquoi |
|:--:|---|---|
| **30** | lignes tirées au hasard | attrape l'erreur systématique |
| **10** | les valeurs les plus atypiques — plus longues, plus courtes, plus grandes | attrape l'erreur sur les cas rares, qui est la plus fréquente |
| **1** | le total de contrôle avant / après | attrape la perte de lignes |

### Notions couvertes
- Le **diagnostic qualité** avant toute correction — y compris les anomalies qu'on n'avait pas vues
- Faire générer : les formules de nettoyage · **les règles de MFC par formule**, écrites correctement du premier coup *(le domaine où l'IA a le meilleur rapport temps gagné / risque)* · les règles de validation · **les formats de nombre personnalisés**
- Faire produire une **table de correspondance** ville mal orthographiée → ville normalisée, à partir de **vos vraies valeurs distinctes**
- **Parcours A sans rien installer** : uploader dans Claude ou dans l'Analyse de données de ChatGPT — avec les limites de taille
- **Le tableau de décision définitif**, affiché ici et réutilisé jusqu'au module 10 :

| Volume | Ponctuel | Récurrent |
|---|---|---|
| < 100 lignes | À la main | Formules |
| 100 – 5 000 | Formules ou `Ctrl+E` | **Power Query** |
| 5 000 – 100 000 | IA ou Power Query | **Power Query** |
| > 100 000, hétérogène | IA | **Power Query + automatisation** *(M7, M10)* |

### Pépites 💎
1. **Demander la liste des valeurs distinctes d'une colonne AVANT de nettoyer.** On découvre les quatorze orthographes de « Kinshasa », et on comprend le vrai problème au lieu d'en traiter les symptômes.
2. **Faire écrire la mise en forme conditionnelle par formule.** C'est le domaine où l'IA est la meilleure : la syntaxe est pénible, les règles sont documentées, et le résultat se vérifie d'un coup d'œil.
3. **Demander le plan de nettoyage sous forme de liste à cocher**, jamais sous forme de texte. Une liste s'exécute ; un paragraphe se relit trois fois.

### Chrono
*Classique **4 h** · IA **8 min** · **Vérification 25 min**.*
> Et c'est bien la troisième colonne qui rend cette leçon honnête : 8 minutes plus 25 minutes, ce n'est pas 8 minutes. C'est quand même 4 heures de gagnées.

### Mini-défi — 12 min
Faire nettoyer 1 000 lignes, appliquer le protocole d'échantillonnage, et **trouver au moins une correction abusive**. Il y en a.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

# Leçon 3.5 — 🤖 Le système : ce qui se passe quand tout est branché
### 🧠 IA — **la leçon qui vend** · 15 min

**Le problème.** Vous savez maintenant nettoyer, chercher, consolider, présenter. Chacun séparément. Mais le premier lundi du mois arrive toujours, et il faut toujours tout refaire.

**La mission.** Voir à quoi ressemble la chose finie — et savoir exactement ce qui vous en sépare.

### Le déroulé
C'est une **démonstration**, pas un exercice. Quinze minutes, sans pause, et on montre :

1. Douze fichiers tombent dans un dossier
2. **Un clic** : ils sont importés, nettoyés, typés, consolidés, convertis en dollars au taux du bon mois
3. Le modèle de données les relie aux clients, aux produits, au calendrier
4. Le tableau de bord se met à jour
5. La note de synthèse s'écrit
6. **Le total de contrôle affiche zéro**

Puis on dit la vérité, et elle doit être dite exactement comme ça :

> « Ce que vous venez de voir, vous n'êtes pas encore capables de le refaire sur vos données. Moi non plus je ne l'étais pas il y a trois ans. Ce n'est pas de la magie et ce n'est pas du talent : c'est **sept modules**. Le 4 pour croiser trois fichiers dont les clés ne concordent pas. Le 7 pour que la requête survive quand une colonne change de place. Le 8 pour dépasser le million de lignes. Le 10 pour livrer ça à quelqu'un d'autre sans qu'il vous rappelle. »

### Ce que la leçon couvre quand même
- **Où s'arrête l'IA et où commence la méthode.** L'IA écrit la requête ; elle ne sait pas que votre agence de Douala a changé de plan comptable en mars.
- **Le fichier `CLAUDE.md` ou la note de conventions** : écrire une fois sa langue, son format de date, ses devises, son nommage — pour ne plus jamais les réexpliquer
- **L'Échelle**, affichée entière, avec les niveaux 2, 3 et 4 cochés : *« Vous êtes là. Il reste quatre niveaux. »*
- **Ce que vous savez déjà faire et que vous ne saviez pas lundi** — la liste, énumérée à voix haute. C'est ce qui donne envie de la suite.

### Pépites 💎
1. **Écrire ses conventions une fois.** Langue, date, devise, nommage, charte de couleurs. Collées au début d'une conversation, elles suppriment 80 % des allers-retours.
2. **Demander à l'IA de documenter ce qu'elle vient de construire** avant de fermer la conversation. C'est le seul moment où tout le contexte est encore là.

### Chrono
*Classique : **3 heures par mois, indéfiniment** · Mise en place : **45 minutes, une fois** · Puis : **un clic**.*

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

## 🎁 Bonus Niveau + — `Ctrl+E`, Power Query ou regex ?

Trois façons d'extraire un code produit d'une chaîne, comparées sur le même jeu de données, chronomètre à l'appui. Et les **fonctions REGEX** *(Microsoft 365 uniquement)* : ce que c'est, pourquoi c'est l'avenir du nettoyage, et comment faire sans en 2021/2024.

---

## 🧪 TP 3 — « L'assainissement de la base client »

Énoncé complet : **`04_TP/TP-03.md`**
**C'est le troisième et dernier TP du parcours gratuit — celui qui ouvre le droit au certificat *Fondations*.**

---

## ❓ QCM du module 3 — **`05_QCM/QCM-M03.md`**

---

## 📦 Fichiers à produire

`M03_L01` → `M03_L05` *(DEPART, CORRIGE, SCRIPT, DEFI)* · **`J03_CRM_Fusion.xlsx`** + son fichier formateur listant les 18 anomalies *(jamais publié)* · `J03_Ventes_12_mois/` *(12 fichiers)* · `M03_L04_PROMPTS.md` · `M03_BONUS_Extraction.xlsx` · **`M03_MEMO_Nettoyage.pdf`** *(l'ordre des opérations)* · **`M03_MEMO_Decision.pdf`** *(le tableau outil × volume)* · `TP03_DEPART.xlsx` · `TP03_CORRIGE.xlsx` · `TP03_ENONCE.pdf`

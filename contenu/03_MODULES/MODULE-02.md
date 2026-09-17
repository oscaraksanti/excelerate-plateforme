# MODULE 2 — MARDI 22 SEPTEMBRE
# L'IA comme copilote, pas comme oracle

> **Promesse affichée :** *Vous saurez traduire n'importe quelle règle métier en formule fiable, réparer un classeur que quelqu'un d'autre a cassé, et vous ne remettrez plus jamais une sortie d'IA sans l'avoir vérifiée.*
>
> **Message implicite du jour :** « L'IA travaille pour toi — à condition que tu saches la contrôler. »
> **Échelle de maturité :** niveau **3 consolidé**, entrée au niveau **6** — *je fais raisonner l'IA avec moi*.
> **À tourner : vendredi 18 septembre.**

---

## Le hook

On affiche une règle de prime écrite en quatre phrases ambiguës par un DRH. Puis la formule de 180 caractères qui l'implémente. Puis :

> « À la fin de la soirée, vous écrirez celle-ci les yeux fermés. Et surtout — vous saurez **prouver** qu'elle est juste. »

---

## Les données du jour

| Fichier | Contenu |
|---|---|
| `J02_Commissions_BAOBAB.xlsx` | Objectifs et réalisations des 42 commerciaux, 6 agences, 3 devises, avec 5 cas limites |
| `J02_Budget_SABOTE.xlsx` | Le contrôle général y affiche **4 272 USD** pour un consolidé de **1 928**, et le CA total oublie **5 050 000 CDF**. **5 pièges, et cinq seulement.** |

---

# Leçon 2.1 — Traduire une règle métier en formule fiable
### 🔧 Classique · 15 min

**Le problème.** Serge veut sa grille de commissions : trois paliers, un bonus si l'objectif est atteint **et** que l'ancienneté dépasse deux ans, un plafond à 8 % du CA. Il l'a écrit en quatre phrases. Thomas a écrit neuf `SI` imbriqués. Personne ne sait si c'est juste.

**La mission.** La grille des 42 commerciaux, juste du premier coup, et **vérifiable**.

### Le concept
**On ne commence jamais par écrire la formule.** On dessine l'arbre de décision. Toutes les branches, y compris celles qu'on croit impossibles. C'est cette étape de deux minutes qui évite 90 % des erreurs de logique — et c'est exactement ce que fait un développeur avant d'écrire une ligne de code.

### Notions couvertes
- **`SI` (IF)** : test / valeur si vrai / valeur si faux — **dessiné en arbre avant d'écrire quoi que ce soit**
- **`SI` imbriqué** : jusqu'où c'est raisonnable *(réponse : trois niveaux)*, et comment le rendre lisible avec `Alt+Entrée` dans la barre de formule
- **`SI.CONDITIONS` (IFS)** et **`SI.MULTIPLE` (SWITCH)** : la sortie de l'enfer des imbrications
- **`ET` / `OU` / `NON` / `OUX`**
- **`SIERREUR` (IFERROR) vs `SI.NON.DISP` (IFNA)** : pourquoi `SIERREUR` posé partout est une **faute professionnelle** — il masque les vraies erreurs de données, et une formule qui ne se plaint jamais est une formule dont personne ne sait si elle est juste
- `ESTNUM`, `ESTTEXTE`, `ESTVIDE`, `ESTERREUR`, `ESTNA`
- **Cellule vide ≠ zéro ≠ texte vide `""`** — la distinction qui fausse silencieusement les moyennes

### Pratique guidée
Dessiner l'arbre de la règle de prime au tableau. Puis écrire la formule. Puis la tester sur les **cinq cas limites** fournis : à 100 % pile, à 99,9 %, embauché il y a exactement deux ans, au-dessus du plafond, à zéro réalisé.

### Pépites 💎
1. **La multiplication booléenne.** `=(CA>Objectif)*(Anciennete>2)*Prime` remplace un `ET` imbriqué, se lit mieux, et se généralise à dix conditions sans devenir illisible.
2. **`--` (double négation)** pour convertir VRAI/FAUX en 1/0 — indispensable dès qu'on entre dans `SOMMEPROD`.
3. **`=A1=B1` sur du texte ne distingue pas la casse.** « KALALA » et « kalala » sont égaux pour Excel. `EXACT()` fait la différence. **C'est la source silencieuse des rapprochements faux** — et ça revient au module 3.
4. **Remplacer six `SI` imbriqués par une recherche approximative dans une table de barème.** La règle sort de la formule et entre dans une table qu'un non-informaticien peut modifier. *(Annonce du module 4.)*

### Erreurs fréquentes
Imbriquer neuf `SI`. Poser `SIERREUR` autour d'une formule dont on n'a pas compris l'erreur. Comparer un texte et un nombre sans s'en apercevoir — Excel ne dit rien, il renvoie FAUX.

### Raccourcis
`Alt+Entrée` *(dans la barre de formule)* · **`F9` sur une portion sélectionnée** *(voir la valeur intermédiaire)* · `Ctrl+Maj+A` · `Échap`

### Mini-défi — 12 min
Écrire la règle de prime **en arbre sur papier**, puis en formule. La tester sur les cinq cas limites. Si un seul tombe faux, c'est l'arbre qu'il faut corriger, pas la formule.

### Chez vous, demain
Prends ton `SI` le plus imbriqué et dessine-le en arbre. Tu trouveras probablement une branche morte.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

# Leçon 2.2 — Compter et sommer sous conditions
### 🔧 Classique · 15 min

**Le problème.** Nadège veut le CA par agence × mois × famille de produits. Sans tableau croisé — elle veut une mise en page figée pour son rapport au conseil, avec ses couleurs et ses totaux à elle.

**La mission.** Le tableau de reporting complet, qui se recalcule seul quand on change une seule cellule.

### Notions couvertes
- **`NB.SI.ENS`** et **`SOMME.SI.ENS`** — et pourquoi on n'utilise **plus jamais** les versions sans `.ENS`
- `MOYENNE.SI.ENS`, `MAX.SI.ENS`, `MIN.SI.ENS`
- **Les critères** : texte, nombre, **comparaison `">="&$B$1`** — la syntaxe qui bloque tout le monde · **jokers** `*` et `?` · critères de date · « différent de vide » `"<>"`
- **Les critères par référence de cellule** → le tableau croisé « fait main » qui se recalcule quand on change l'agence en B1
- **`SOMMEPROD`** : le couteau suisse. Somme conditionnelle multi-critères, comptage, produit scalaire. **Et pourquoi il survit à l'ère des matrices dynamiques : il fonctionne partout, de 2007 à 2026, sur toutes les versions.**
- **`SOUS.TOTAL` vs `AGREGAT`** : compter uniquement ce qui est visible après filtrage, et ignorer les erreurs

### Pratique guidée
Le tableau CA par agence × trimestre, piloté par une cellule d'année. Changer l'année : les 24 cases bougent.

### Pépites 💎
1. **`SOMME.SI.ENS` avec une plage de somme mal alignée donne un résultat faux et silencieux.** Aucune erreur, aucun avertissement, juste un mauvais chiffre. Le contrôle en cinq secondes : comparer la **hauteur** des plages.
2. **`NB.SI` compare mal les nombres de plus de 15 chiffres** — numéros de compte, EAN, IMEI, codes-barres. Il trouve des doublons qui n'existent pas. La parade : `SOMMEPROD(--(EXACT(plage;valeur)))`.
3. **`AGREGAT(9;5;plage)`** : sommer en ignorant les lignes masquées **et** les erreurs. Là où `SOUS.TOTAL` s'arrête.
4. 🔴 **Le total de contrôle.** `=SOMME(détail)-SOMME(synthèse)`, affiché en rouge si différent de zéro. **C'est la pratique qui distingue un professionnel d'un utilisateur avancé.** Elle deviendra la feuille `QUALITE` de tous les TP du programme.

### Erreurs fréquentes
Écrire `">=01/01/2026"` en dur au lieu de `">="&$B$1`. Oublier que `SOMME.SI.ENS` ne gère pas le OU sur une même colonne — il faut additionner deux `SOMME.SI.ENS`. Sommer une colonne qui contient déjà une ligne de total.

### Raccourcis
`Ctrl+Maj+L` · `F4` · `Ctrl+[` · `Ctrl+Maj+Entrée` *(reconnaître l'héritage matriciel)*

### Mini-défi — 15 min
Construire un tableau CA par agence × trimestre où **changer une seule cellule** recalcule les 24 cases. Ajouter le total de contrôle en bas, en rouge.

### Chez vous, demain
Ajoute un total de contrôle à ton rapport le plus important. S'il n'est pas nul, tu viens de trouver quelque chose.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

# Leçon 2.3 — Réparer un classeur cassé
### 🔧 Classique — **la leçon qui donne l'autorité** · 15 min

**Le problème.** On vous remet `J02_Budget_SABOTE.xlsx`. Son contrôle général affiche plus du double du consolidé, et son CA total oublie deux agences. Elle vous laisse quinze minutes. Le collègue qui l'a construit est parti il y a deux ans.

**La mission.** Trouver les cinq anomalies, les expliquer, les corriger. Devant elle.

> 🔴 **C'est la leçon décisive du module, et peut-être des trois soirées.** Une personne qui vous a vu réparer un classeur saboté en quinze minutes achète le mercredi. C'est celle qu'on rejoue en direct, lentement, au live du mardi.

### Notions couvertes
- **Relatif / absolu / mixte** maîtrisés à fond, avec le cas de la matrice à double entrée — `$B5` et `C$4` dans la même formule
- **Noms définis** : nommer une cellule, une plage, une constante. Gestionnaire de noms `Ctrl+F3`. Portée classeur vs feuille. **Pourquoi `=TauxUSD` bat `=$B$1`** : lisibilité, robustesse, maintenance
- **Audit de formules** : **antécédents** et **dépendants** (les flèches) · **Évaluer la formule** pas à pas · **Fenêtre Espion** · **`F9` sur une portion** pour voir la valeur intermédiaire
- Vérification des erreurs · incohérences de formules *(le triangle vert)* · formules qui ne couvrent pas les cellules adjacentes
- **Références circulaires** : les trouver, les comprendre, et les cas où elles sont volontaires
- **Liens externes** : les repérer, les rompre, et le danger du classeur qui pointe encore vers le poste d'un ancien collègue
- **Valeurs en dur cachées dans une formule** : comment les débusquer

### Les cinq pièges du fichier
| # | L'anomalie | L'outil qui la trouve |
|:--:|---|---|
| 1 | Une `SOMME` qui s'arrête trois lignes trop tôt | **`F5 > Différences entre lignes`** |
| 2 | Une valeur en dur au milieu d'une colonne de formules | Le triangle vert · `F5 > Formules` |
| 3 | Un taux écrit en dur au lieu de la cellule nommée | `Ctrl+[` |
| 4 | Une ligne de total incluse dans la somme des détails | **Le total de contrôle ≠ 0** |
| 5 | Un lien externe vers `C:\Users\ancien_collegue\` | `Données > Modifier les liens` |

### Pépites 💎
1. **`Ctrl+[`** : sauter directement à la cellule source d'une formule, même sur une autre feuille. **`F5` puis `Entrée`** pour revenir d'où on vient.
2. **`F5 > Cellules > Formules`** : sélectionner d'un coup toutes les formules du classeur — pour les protéger, les colorer, ou simplement les compter.
3. 💎💎 **`F5 > Cellules > Différences entre lignes`** : repérer en deux secondes la cellule qui ne suit pas le motif de ses voisines. **Le détecteur de sabotage.** C'est la pépite la plus spectaculaire du programme — elle tient en un geste et elle résout un problème que tout le monde a.
4. **La Fenêtre Espion** : surveiller six cellules clés situées sur six feuilles pendant qu'on travaille ailleurs.
5. **`Ctrl+`` `** : afficher toutes les formules de la feuille d'un coup, et revenir. Le mode audit instantané.

### Erreurs fréquentes
Corriger le symptôme — la cellule fausse — sans chercher la cause, qui est presque toujours une plage mal étendue trois colonnes plus loin.

### Raccourcis
`Ctrl+[` · `Ctrl+]` · `F5` · `Ctrl+F3` · `Ctrl+`` ` `` · `F9`

### Mini-défi — 15 min
Trouver les cinq pièges et écrire, pour chacun, **la cause et la correction en une ligne**. C'est exactement le livrable du TP 2.

### Chez vous, demain
Ouvre ton classeur le plus critique et lance `F5 > Différences entre lignes` sur ta colonne de totaux. Dis-nous ce que tu trouves.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

# Leçon 2.4 — 🤖 Le Protocole V4
### 🧠 IA · 15 min

**Le problème.** Le DRH envoie la règle de prime en quatre phrases ambiguës. Par ailleurs, un classeur hérité contient une formule de 420 caractères que personne ne comprend. Et l'IA répond avec un aplomb total dans les deux cas.

**La mission.** Traduire le français en formule, la formule en français — et **ne jamais livrer une sortie d'IA sans avoir essayé de la casser**.

### Le cahier des charges de formule — 4 blocs
C'est 80 % de la réussite :

> **1. Les données disponibles** — les colonnes, avec trois lignes d'exemple
> **2. La règle métier** — en français, exhaustive, cas particuliers compris
> **3. Les cas particuliers** — vide, zéro, négatif, doublon, texte, date absente
> **4. La sortie attendue** — avec **un exemple chiffré** : « pour un CA de 12 000 et 3 ans d'ancienneté, je dois obtenir 960 »

Et systématiquement : *« Donne-moi la formule, sa version anglaise, son explication, ses cas limites, **et un jeu de test avec le résultat attendu ligne par ligne**. »*

### 🔴 L'IA se trompe à l'écran — deux fois
| Erreur | Le V qui l'attrape |
|---|---|
| Elle propose `ASSEMB.V`, qui **n'existe pas en 2021** | **V1 — Version** |
| Elle **suppose silencieusement que les données sont triées** | **V2 — Valeurs**, sur un cas limite |

La deuxième est la plus instructive du programme : la formule est juste sur les dix premières lignes, et fausse à partir de la onzième. **Une vérification sur trois cas bien choisis l'attrape ; un coup d'œil ne l'attrape jamais.**

### Notions couvertes
- **Décomposer une formule monstre** : demander la version `LET`, la version commentée, la version éclatée en colonnes intermédiaires. Puis choisir.
- **Corriger** : coller l'erreur + la formule + un extrait de données réel → diagnostic
- **Documenter** : générer le commentaire de cellule, ou la feuille `README`
- **Les 8 erreurs typiques de l'IA sur Excel**, affichées en liste, une par module

### Pépites 💎
1. **« Quelle est la version la plus simple qui fonctionne ? »** L'IA a une tendance marquée à sur-compliquer. Cette question seule divise la longueur des formules par deux.
2. **Exiger la formule ET le tableau de test avec le résultat attendu.** Vous ne vérifiez plus, vous comparez. C'est infiniment plus rapide et beaucoup plus sûr.
3. **« Joue le rôle du contrôleur de gestion qui doit auditer cette formule. »** Elle trouve des failles qu'elle n'avait pas vues en mode « écris-moi une formule ». Changer de rôle change la réponse.

### Chrono
*Classique **35 min** · IA **5 min** · **Vérification 6 min**.*

### Mini-défi — 12 min
Faire traduire **une règle métier de ton propre travail** en formule, et la valider par le Protocole V4 complet. Les quatre V, écrits.

### Chez vous, demain
La prochaine formule que l'IA t'écrit : avant de la coller, demande-lui les trois cas de test.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

# Leçon 2.5 — 🤖 L'auditeur IA : cartographier un classeur hérité
### 🧠 IA · 15 min

**Le problème.** Vous héritez de vingt classeurs d'un collègue parti. Personne ne sait lesquels sont fiables, lesquels contiennent des macros, lesquels pointent vers un disque qui n'existe plus.

**La mission.** Un rapport de risque sur les vingt fichiers, en dix minutes.

### Notions couvertes
- **Uploader un classeur** à Claude et obtenir : inventaire des feuilles, formules distinctes, **valeurs en dur**, liens externes, plages nommées inutilisées, formules de plus de 200 caractères
- **Générer la feuille `README`** : objectif, source, hypothèses, définitions des KPI, procédure d'actualisation
- **Générer la feuille `QUALITE`** avec ses statuts **PASS / WARNING / FAIL**
- **Générer une checklist de recette** avant d'envoyer un fichier à sa direction
- **Les limites honnêtes — et il faut les dire** : l'IA ne voit pas la mise en forme conditionnelle complexe, les règles de validation, les objets graphiques, les macros obfusquées, et **le sens métier des chiffres**. Elle vous dit qu'une formule existe, pas qu'elle est juste.

### Pépites 💎
1. Demander le rapport **sous forme de tableau de risque classé**, pas de texte. Un tableau se trie, un paragraphe se relit.
2. Faire générer la feuille `QUALITE` **avant** de commencer à corriger : c'est elle qui dit par où commencer.
3. Demander : *« Qu'est-ce que tu n'as pas pu vérifier dans ce fichier ? »* La réponse est souvent la partie la plus utile.

### Chrono
*Classique **2 h** · IA **10 min** · **Vérification 20 min**.*

### Mini-défi — 10 min
Faire produire la feuille `QUALITE` du fichier de commissions, avec au moins cinq contrôles PASS / WARNING / FAIL. C'est le livrable 3 du TP 2.

### 📝 Corps de la leçon — à coller dans l'admin
*(rédigé en phase 2)*

---

## 🎁 Bonus Niveau + — Les formats de nombre personnalisés

La syntaxe à quatre sections `positif;négatif;zéro;texte`. Afficher **« 1,2 M USD »** sans casser le calcul · masquer les zéros · colorer les négatifs · afficher **« ▲ 3 % »** / **« ▼ 3 % »** · gérer CDF, XOF et USD dans un même tableau · et le format **`;;;`** qui rend une cellule invisible à l'écran mais imprimable.

> **C'est l'exemple parfait de la chose qu'un utilisateur de dix ans ne sait pas faire, et où l'IA est excellente** — parce que la syntaxe est illisible et parfaitement documentée. À montrer comme tel.

---

## 🧪 TP 2 — « La grille de primes et le fichier piégé »

Énoncé complet : **`04_TP/TP-02.md`**

---

## ❓ QCM du module 2 — **`05_QCM/QCM-M02.md`**

---

## 📦 Fichiers à produire

`M02_L01` → `M02_L05` *(DEPART, CORRIGE, SCRIPT, DEFI)* · **`M02_L03_SABOTE.xlsx`** + son fichier formateur documentant les 5 pièges *(jamais publié)* · `M02_L04_PROMPTS.md` · `M02_L05_PROMPTS.md` · `M02_BONUS_Formats.xlsx` · `M02_MEMO_Audit.pdf` *(la checklist d'audit d'un classeur hérité)* · `TP02_DEPART.xlsx` · `TP02_CORRIGE.xlsx` · `TP02_ENONCE.pdf`

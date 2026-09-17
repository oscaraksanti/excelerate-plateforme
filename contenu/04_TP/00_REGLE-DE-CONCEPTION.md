# RÈGLE DE CONCEPTION DES TP
### À lire **avant** de fabriquer le moindre classeur

> Ce document décrit **comment la plateforme note réellement**. Un TP conçu sans le lire donnera des notes absurdes et des apprenants perdus.

---

# 1. Comment la machine note, exactement

La plateforme ouvre deux fichiers : **le corrigé** que tu as déposé, et **la copie** de l'apprenant. Puis elle compare.

| Ce qui est noté | Points | Comment |
|---|:--:|---|
| **Chaque feuille présente dans le corrigé** | 1 | Elle existe dans la copie, au nom près |
| **Chaque plage nommée du corrigé** | 1 | Elle existe dans la copie |
| **Chaque cellule qui porte une formule dans le corrigé** | **2** | 1 pt **méthode** + 1 pt **résultat** |

**Le point méthode** est acquis si la copie utilise **toutes les fonctions** présentes dans la formule du corrigé. Elle peut en utiliser d'autres en plus — une solution plus longue mais qui passe par les mêmes fonctions est acceptée.

**Le point résultat** est acquis si la valeur calculée est identique, **à 0,01 près**.

**Le total est ramené sur 20.** Puis la note finale du TP est :

> **0,6 × note machine + 0,4 × médiane des 3 corrections entre pairs**

## Les quatre conséquences qui changent tout

**① Une cellule sans formule dans le corrigé n'est jamais notée.**
Les données sources, les titres, les feuilles de documentation : invisibles pour la machine. **Aucun risque de pénaliser quelqu'un sur une mise en forme.**

**② Une valeur tapée à la main rapporte la moitié des points.**
L'apprenant qui calcule de tête et tape `48250` obtient le point résultat, pas le point méthode. **C'est exactement le comportement voulu** : il a le bon chiffre, il n'a pas la bonne méthode, il a 50 %.

**③ Chaque formule du corrigé est une question posée.**
Un corrigé dont la feuille `Caisse` contient une colonne calculée de 60 lignes pose 60 questions de 2 points. Ce n'est pas un défaut — ça récompense l'usage des colonnes calculées — mais **ça dilue les 12 questions importantes**. Garder les formules du corrigé délibérées.

**④ Les feuilles et les plages nommées rapportent des points gratuits.**
Exiger `README`, `QUALITE`, `ANNEXE_IA` dans le corrigé donne 3 points structurels faciles. C'est un bon filet : personne ne repart à zéro.

**⑤ Une plage nommée `LIBRE_…` retire ses cellules de la notation.**

Certaines feuilles sont des **constructions libres** : la projection mensuelle d'un business plan, un bloc de scénarios, un tableau d'amortissement. Deux modèles justes n'y ont pas les mêmes colonnes — et noter cellule par cellule reviendrait à noter la *disposition*, pas le résultat.

Une plage nommée dont le nom commence par `LIBRE_` marque cette zone dans le corrigé :

```
LIBRE_CALCULS   →  CALCULS!$A$1:$M$30
LIBRE_ANALYSE   →  ANALYSE!$A$1:$U$60
```

Ses cellules ne sont plus notées une à une, et **le nom lui-même n'est pas exigé de la copie** — il n'appartient pas à l'énoncé. Tout le reste est inchangé : la feuille rapporte toujours son point de présence, et les réponses qui se nourrissent de la zone sont notées normalement.

> **Sans ça, le corrigé du TP 9 posait 300 questions de disposition et noyait les 26 qui comptent.** Avec, la grille fait 107 points : 10 feuilles, 29 plages nommées, 34 cellules.

**La contrepartie :** les réponses doivent alors passer par des **plages nommées** que l'apprenant crée lui-même — `F_FLUX`, `F_CUMUL`, `Z_AUDIT` — et non par des adresses. C'est ce qui permet à `REPONSES` de lire n'importe quelle disposition. Ces noms deviennent donc une partie de l'énoncé, et une partie de la note.

---

# 2. Les six règles de fabrication

## Règle 1 — Un TP est un classeur à trous

Une feuille **`REPONSES`**, 10 à 12 lignes, chacune :

| Cellule | Étiquette *(colonne A)* | La réponse *(colonne B)* |
|---|---|---|
| `B4` | Nombre de mouvements enregistrés | `⟨formule⟩` |
| `B5` | Chiffre d'affaires total en CDF | `⟨formule⟩` |

L'énoncé dit exactement **quelle cellule** remplir et **ce qu'elle doit contenir**. Aucune ambiguïté possible.

## Règle 2 — Chaque réponse est **une cellule, une formule, une valeur scalaire**

🔴 **Jamais de formule matricielle nue comme réponse.**

`FILTRE`, `TRIER`, `UNIQUE` se déversent sur plusieurs cellules. Seule la cellule d'ancrage porte la formule, et sa valeur enregistrée est **la première du déversement**. La machine ne compare donc qu'une valeur sur cinquante : la note devient du hasard.

| ❌ À ne pas demander | ✅ Ce qu'il faut demander |
|---|---|
| `=UNIQUE(t_Caisse[Client])` | `=NBVAL(UNIQUE(t_Caisse[Client]))` |
| `=TRIER(UNIQUE(t_Caisse[Agence]))` | `=JOINDRE.TEXTE(";";VRAI;TRIER(UNIQUE(t_Caisse[Agence])))` |
| `=FILTRE(t;t[Montant]>500000)` | `=LIGNES(FILTRE(t;t[Montant]>500000))` |

La compétence est évaluée à l'identique — il faut toujours écrire `UNIQUE`, `TRIER`, `FILTRE` — et le résultat devient vérifiable.

## Règle 3 — Deux cellules de contrôle obligatoires, qui doivent valoir **0**

| Cellule | Contenu |
|---|---|
| `R_CONTROLE` | `=SOMME(détail)-SOMME(synthèse)` |
| Un second contrôle propre au TP | écart de lecture, écart de réconciliation… |

Double bénéfice : c'est **la pratique professionnelle** enseignée en leçon 2.2, et c'est le filet de sécurité de la notation — un apprenant dont le contrôle vaut zéro sait que sa copie est bonne avant même de la déposer.

## Règle 4 — Les feuilles imposées sont dans le corrigé, mais notées par les pairs

| Feuille | Notée par |
|---|---|
| `RAW` | la machine *(présence)* |
| `REPONSES` | la machine *(formules)* |
| `README` | la machine *(présence)* + les pairs *(contenu)* |
| `QUALITE` | la machine *(présence)* + les pairs |
| `ANNEXE_IA` | la machine *(présence)* + les pairs |

**La machine ne lit jamais le contenu rédigé.** Les prompts, les hypothèses, l'erreur d'IA détectée : c'est le domaine des pairs, et c'est pour ça que le peer grading existe.

## Règle 5 — Les valeurs attendues sont figées **avant** le tournage

Le jeu de données est généré avec **une graine aléatoire fixe**. Les totaux sont relevés, écrits dans le fichier du TP, et **ne changent plus**. Une régénération sans graine fixe rend tous les corrigés faux.

## Règle 6 — Le corrigé n'est **jamais** une ressource de leçon

Il va dans le stockage privé `corriges`, invisible de tous, lu uniquement par le correcteur. Il n'apparaît dans aucune liste, aucun lien, aucune page.

---

# 3. La grille de correction entre pairs — 6 critères

Cases à cocher, **jamais d'appréciation libre**. Chaque critère est noté *absent · insuffisant · correct · bien · exemplaire*.

| Critère | Ce que l'évaluateur vérifie |
|---|---|
| **Exactitude des résultats** | Les valeurs attendues sont dans l'énoncé. Il compare, il ne juge pas. |
| **Méthode Excel** | Au moins 2 tableaux structurés ? Références absolues correctes ? **Aucune valeur en dur ?** |
| **Qualité des données** | Feuille `QUALITE` présente, statuts PASS/WARNING/FAIL, doublons traités |
| **Présentation & lisibilité** | Formats, devise affichée, impression, lisible en 10 secondes |
| **Reproductibilité** | Feuille `README` : source, date, hypothèses, procédure d'actualisation, définitions des KPI |
| **Usage critique de l'IA** | Feuille `ANNEXE_IA` : les prompts, **au moins une erreur de l'IA détectée et corrigée**, et quel V l'a attrapée |

**Règles de fonctionnement :** 3 évaluations reçues, **médiane retenue** *(jamais la moyenne : elle protège des notations aberrantes)* · chacun corrige **3 copies avant de voir sa note** · commentaire obligatoire de 200 caractères sur le critère le plus faible · **corrigé vidéo débloqué après dépôt, jamais avant**.

---

# 4. La liste de vérification avant de publier un TP

- [ ] `_DEPART.xlsx` ouvert : la feuille `REPONSES` existe, les étiquettes sont écrites, les cellules de réponse sont vides
- [ ] `_CORRIGE.xlsx` : **toutes** les cellules de réponse portent une formule, aucune valeur tapée à la main
- [ ] Aucune réponse n'est une matricielle nue *(règle 2)*
- [ ] Les deux cellules de contrôle valent bien **0** dans le corrigé
- [ ] Les 5 feuilles imposées existent dans le corrigé
- [ ] Les plages nommées attendues existent dans le corrigé
- [ ] Le corrigé a été **recalculé et enregistré depuis Excel** — la machine lit les valeurs mises en cache, pas des formules non évaluées
- [ ] Le corrigé a été **déposé comme copie de test** : la note doit être **20/20**
- [ ] Une copie volontairement fausse déposée : la note doit être cohérente
- [ ] Le corrigé est dans le bucket privé, **jamais** en ressource de leçon
- [ ] Les valeurs attendues sont écrites dans l'énoncé PDF

> **Le test « le corrigé se note 20/20 » est le seul qui compte.** Il attrape tout : la feuille mal nommée, la formule non recalculée, la matricielle mal posée.

---

# 5. Écrire des formules dans un fichier qu'Excel n'a pas créé

Un `.xlsx` fabriqué par script stocke les formules **en anglais**, avec des virgules pour séparateurs. Excel les retraduit à l'ouverture. Trois pièges s'accumulent là, et chacun a coûté une itération complète.

## Le préfixe `_xlfn.`

Toute fonction absente de la spécification OOXML d'origine doit être écrite **préfixée**, sinon Excel affiche `#NOM?` :

```
_xlfn.UNIQUE      _xlfn.XLOOKUP     _xlfn.TEXTJOIN
_xlfn.TAKE        _xlfn.LET         _xlfn.CHOOSECOLS
_xlfn.UNICHAR     _xlfn.UNICODE     _xlfn.AGGREGATE
_xlfn._xlws.FILTER                  _xlfn._xlws.SORT
```

> 🔴 **`AGGREGATE` est dans cette liste, et ce n'est pas intuitif** — la fonction date de 2010. Écrite `AGGREGATE(...)`, elle rend `#NOM?` ; écrite `_xlfn.AGGREGATE(...)`, elle marche. *Trouvé en fabriquant `M05_L03_CORRIGE.xlsx`.* `SUBTOTAL`, du même âge, n'a **pas** besoin du préfixe.

Le correcteur retire ces préfixes avant de comparer : ils n'ont aucun effet sur la notation.

## 🔴 `_xlfn.LET` empêche Excel d'enregistrer le classeur

Celui-là ne se voit qu'au dernier moment, et il a coûté une demi-heure de bissection.

Une formule `_xlfn.LET(...)` écrite par openpyxl **se calcule parfaitement** : Excel l'ouvre, l'évalue, rend le bon résultat. Puis `save active workbook` échoue avec **« Erreur de paramètre (-50) »**, et le classeur ne peut plus être enregistré — donc le corrigé n'a pas de valeurs mises en cache, donc la machine ne peut rien noter.

*Trouvé en fabriquant `TP09_CORRIGE.xlsx`, isolé par quatre sondes minimales : `LET` seul reproduit la panne ; la table structurée, `ESTFORMULE` et les plages nommées passent toutes.*

> **La règle : jamais de `LET` dans un classeur fabriqué par script.** On écrit la formule développée — plus longue, mais enregistrable. `LET` reste excellent **quand c'est l'apprenant qui le tape dans Excel** : la limite est celle du fichier fabriqué, pas celle de la fonction.



## Le nom d'un tableau, seul, ne se référence pas toujours

```
=ROWS(t_Ventes)              →  #NOM?
=ROWS(t_Ventes[Date_Vente])  →  29 046
```

Une référence structurée avec spécificateur de colonne fonctionne toujours. Le nom nu, non. **Toujours nommer une colonne.**

## L'intersection implicite

Une formule écrite hors d'Excel n'emporte pas les métadonnées de matrice dynamique. Excel lui applique alors `@` et réduit silencieusement un tableau à une seule cellule :

| Ce qu'on écrit | Ce qu'on obtient |
|---|---|
| `=MAX(ABS(plage))` | **0** — un nombre faux, pas une erreur |
| `=XLOOKUP(plage;…)` | la première valeur seulement |

La parade est toujours la même : **une fonction qui attend un tableau par nature.** `SOMMEPROD` et les doubles agrégats (`=MAX(MAX(p);-MIN(p))`) ne sont jamais touchés.

> **Le test qui tranche :** recalculer le corrigé avec `outils/recalculer-excel.sh`, relire les valeurs mises en cache, et les comparer une à une aux références Python. Une formule fausse par intersection implicite ne se voit **que** comme ça — elle ne lève aucune erreur.

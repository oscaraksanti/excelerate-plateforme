# CONVENTIONS
### Comment chaque leçon est écrite, nommée, tournée, et mise en ligne

---

## 1. La structure d'un fichier `MODULE-nn.md`

Chaque module suit exactement ce plan. C'est ce qui rend la production mécanique.

```
# MODULE n — titre
> Promesse · message implicite · niveau d'échelle atteint
## Le hook
## Les données du jour
## Leçon n.1 … n.5
   ### 🔧 Classique  ou  ### 🧠 IA
   **Le problème** / **La mission**
   ### Le concept
   ### Notions couvertes
   ### Pratique guidée
   ### Pépites 💎
   ### Erreurs fréquentes
   ### Raccourcis
   ### Chrono          (leçons IA uniquement)
   ### Mini-défi
   ### Chez vous, demain
   ### 📝 Corps de la leçon — à coller dans l'admin
   ### 📦 Fichiers
## 🎁 Bonus Niveau +
## 🧪 Le TP
## ❓ Le QCM
## 📦 Récapitulatif des fichiers à produire
```

---

## 2. 📝 Le bloc « Corps de la leçon — à coller dans l'admin »

**C'est le bloc le plus important de chaque fichier.**

La plateforme affiche, sous la vidéo, un texte en markdown que tu colles depuis `/admin/lecons/<id>`. C'est le support écrit que l'apprenant lit, imprime et garde. Le reste du fichier module est **pour toi** : ton script de tournage.

**Ce que contient le corps :**

1. Le problème, en 2 lignes
2. Ce qu'on va construire
3. **Les formules, écrites, copiables** — en français et en anglais
4. Les pépites 💎, chacune avec son geste exact
5. Les erreurs fréquentes
6. Les raccourcis, en tableau
7. Le mini-défi + le lien vers sa solution
8. « Chez vous, demain »

**Ce qu'il ne contient pas :** les indications de tournage, les chronos internes, les notes de mise en scène.

### Le markdown supporté par la plateforme

| Ça marche | Ça ne marche pas |
|---|---|
| `# ## ###` titres | Le HTML brut *(échappé)* |
| `**gras**`, `*italique*` | Les tableaux à colonnes fusionnées |
| Listes `-` et `1.` | Les images distantes non hébergées |
| `> citation` | Les notes de bas de page |
| `` `code` `` et blocs ``` | Les cases à cocher interactives |
| Tableaux `\|---\|` | |
| Liens `[texte](url)` | |

> Les formules Excel vont **toujours** dans du `` `code` ``. Sans ça, les astérisques d'une multiplication passent en italique et la formule devient fausse à l'écran.

---

## 3. Nommage des fichiers de travail

```
M<nn>_L<nn>_<TYPE>.<ext>
```

| `TYPE` | Contenu |
|---|---|
| `DEPART` | Le classeur que l'apprenant ouvre |
| `CORRIGE` | Le classeur terminé, montré à l'écran |
| `SCRIPT` | Le texte que tu dis face caméra |
| `DEFI` | Le mini-défi et sa solution |
| `PROMPTS` | Les prompts de la leçon, copiables |

Exemples : `M01_L02_DEPART.xlsx` · `M03_L01_CORRIGE.xlsx` · `M02_L03_SABOTE.xlsx`

Pour les TP : `TP01_DEPART.xlsx` · `TP01_CORRIGE.xlsx` · `TP01_ENONCE.pdf`

**Aucune exception.** Il y aura plus de 200 fichiers.

---

## 4. Règles de tournage

| Règle | Pourquoi |
|---|---|
| **Une prise par leçon.** Si ça rate à 12 min, reprendre à 10 min | Le perfectionnisme est le seul vrai risque du calendrier |
| **Zoom à 130 % minimum dans Excel** | Une partie du public regarde sur un téléphone |
| **Le curseur ralentit avant de cliquer** | On doit voir *où* tu vas, pas seulement le résultat |
| **Les raccourcis s'affichent à l'écran** quand tu les utilises | C'est ce qui se retient |
| **Dire la formule à voix haute en la tapant** | Le public en replay écoute souvent sans regarder |
| **Chaque leçon commence par le problème, jamais par la fonction** | Loi n° 2 |
| **Ne jamais couper une erreur réelle** | Une erreur réparée à l'écran vaut trois explications |
| **Encart « ⚠️ Indisponible en 2021 » systématique** | Risque n° 5 |

---

## 5. Contrôler l'accès à une leçon depuis l'admin

`/admin/lecons/<id>` expose trois réglages indépendants :

| Réglage | Valeurs | Effet |
|---|---|---|
| **Publiée** | oui / non | Non → la leçon n'existe pas pour l'apprenant |
| **Accès** | `hérite` · `libre` · `payant` | `hérite` prend l'accès du module · `libre` ouvre à tous, même dans un module payant · `payant` verrouille, même dans un module gratuit |
| **Date de publication** | date et heure, ou vide | Dans le futur → l'apprenant **voit la leçon marquée « programmée »** mais ne peut pas l'ouvrir |

### Les trois gestes utiles

**Déverrouiller une leçon maintenant** → vider la date de publication. Effet immédiat.

**Programmer la sortie d'un module** → poser la date sur chacune de ses leçons. C'est ce qui pilote la publication du 28 septembre au 3 octobre.

**Offrir une leçon d'un module payant** *(un extrait pour convaincre)* → accès `libre` sur cette leçon seulement.

> **Ce que voit l'apprenant devant une leçon verrouillée :** le titre, la durée, l'accroche, et un badge — « programmée » ou « payant ». **Jamais** le corps du texte ni l'identifiant de la vidéo. Le sommaire est conçu pour que la frustration travaille pour toi : ils voient ce qui existe, ils ne peuvent pas l'ouvrir.

---

## 6. Les ressources d'une leçon

`/admin/lecons/<id>` permet d'attacher des fichiers (classeurs, PDF, prompts). Ils apparaissent sous la vidéo.

| Règle | |
|---|---|
| Le `_DEPART` est attaché à la leçon | toujours |
| Le `_CORRIGE` d'une leçon est attaché | après le tournage, il ne révèle rien qui ne soit dans la vidéo |
| Le `_CORRIGE` d'un **TP** n'est **jamais** attaché | il est dans le bucket privé `corriges`, invisible, lu seulement par le correcteur automatique |
| Les prompts sont en `.md`, pas en `.docx` | copiables sur téléphone |

---

## 7. Le vocabulaire du programme

Employer toujours les mêmes mots. C'est ce qui fait qu'une méthode devient un objet mémorisable.

| On dit | On ne dit pas |
|---|---|
| **C.L.E.A.R.** | « une bonne consigne » |
| **Le Protocole V4** | « vérifier » |
| **L'Échelle** | « les niveaux » |
| **Une pépite 💎** | « une astuce » |
| **Le total de contrôle** | « la vérification » |
| **Le bloc E** | « le contexte technique » |
| **Un classeur à trous** | « un exercice » |
| **Excelerate IA** | Excelera, Excel AI, ExcelIA |

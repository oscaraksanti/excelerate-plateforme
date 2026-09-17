# Module 7 · Leçon 2 — Les transformations décisives
### La fiche à garder ouverte dans l'éditeur

---

## La règle qui gouverne tout le module

> **Entre deux commandes qui font la même chose, choisissez celle qui nomme le MOINS de colonnes.**

| ❌ Nomme ce qui varie | ✅ Nomme ce qui est stable |
|---|---|
| Dépivoter **les colonnes** | Dépivoter **les autres colonnes** |
| **Supprimer** les colonnes X, Y, Z | **Choisir** les colonnes A, B, C |
| Supprimer les **2 premières lignes** | Supprimer **jusqu'à la ligne qui contient « Agence »** |
| La **3ᵉ feuille** du classeur | La feuille **nommée « Ventes »** |

Le code doit décrire ce qui ne bouge pas.

---

## 💎💎 Dépivoter les autres colonnes

**Le geste :** sélectionner les colonnes **à conserver** → clic droit → **Dépivoter les autres colonnes**. Puis renommer `Attribut` et `Valeur`.

**En M :** `Table.UnpivotOtherColumns(table, {"Agence","Devise"}, "Famille", "Montant_Local")`

Le jour où une septième famille arrive : celle-ci la reprend, sa voisine l'ignore **en silence**.

*Pivoter fait l'inverse — `Transformer > Colonne pivotée`. On s'en sert presque toujours pour produire un affichage, presque jamais des données.*

---

## Ajouter ou Fusionner

> **Ajouter empile. Fusionner accole.**

- **Ajouter des requêtes** → les lignes de B **sous** celles de A. Mêmes noms de colonnes. *C'est la consolidation de douze mois.*
- **Fusionner des requêtes** → les colonnes de B **à droite** de A, par correspondance de clés. *C'est le `RECHERCHEX` du module 4.*

---

## Les six jointures

| Type | Ce qu'elle garde | Quand |
|---|---|---|
| **Externe gauche** | tout A, et ce qui concorde dans B | **le bon choix 9 fois sur 10** |
| Externe droite | tout B, et ce qui concorde dans A | rare — on inverse les tables plutôt |
| Externe complète | tout A et tout B | pour voir les manques des deux côtés |
| **Interne** | seulement ce qui concorde | 🔴 **elle fait disparaître des lignes** |
| **Anti gauche** | ce qui est dans A et **pas** dans B | 💎 la réconciliation du module 4 |
| Anti droite | ce qui est dans B et pas dans A | les orphelins de l'autre côté |

> 🔴 **La jointure interne est le piège silencieux.** Un mois manque dans la table de taux, ce mois disparaît du résultat. Aucune erreur, juste un total plus petit.
>
> **La parade :** faire une **externe gauche**, puis chercher les nulls dans la colonne ramenée. Un null vous dit ce qui n'a pas été trouvé ; une interne ne dit rien.

**Joindre sur deux colonnes :** sélectionner la première, puis `Ctrl` + la seconde, **du même côté et dans le même ordre** des deux tables. Les petits `1` et `2` dans les en-têtes confirment l'ordre.

---

## Regrouper par

`Accueil > Regrouper par`, puis **Avancé** pour plusieurs agrégations d'un coup.

C'est le `SOMME.SI.ENS` de Power Query, en plus puissant. Et il contient la fonction que personne ne trouve : **« Nombre de valeurs distinctes »** — « combien de clients différents ? », sans `UNIQUE`, sans matricielle, sur des millions de lignes.

---

## Les trois colonnes qu'on ajoute tout le temps

| Colonne | Où | Pour quoi |
|---|---|---|
| **Conditionnelle** | `Ajouter une colonne > Colonne conditionnelle` | un `SI` imbriqué, sans parenthèses à compter |
| **Index** | `Ajouter une colonne > Colonne d'index` | retrouver l'ordre d'origine, comparer à la ligne précédente |
| **Remplir vers le bas** 💎 | clic droit sur la colonne > `Remplir > Vers le bas` | réparer les **cellules fusionnées** d'un rapport reçu |

**Remplir vers le bas, c'est un clic**, et ça répare un défaut qui coûte dix minutes par fichier à la main.

---

## Gérer les erreurs, par colonne

| Geste | Où |
|---|---|
| Voir combien il y en a | `Affichage > Qualité des colonnes` |
| **Les isoler pour les regarder** | `Accueil > Conserver les lignes > Conserver les erreurs` |
| Les supprimer | `Accueil > Supprimer les lignes > Supprimer les erreurs` |
| Les remplacer | clic droit > Remplacer les erreurs |

> **Supprimer les erreurs sans les avoir regardées est une faute.** Dix lignes d'erreur sur un export bancaire, ce sont peut-être les dix virements qui manquent au rapprochement.

**À cocher une fois pour toutes**, dans `Affichage` : *Qualité des colonnes*, *Distribution des colonnes*, *Profil des colonnes*. Trois cases, et vous voyez ensuite sous chaque en-tête le pourcentage de valides, d'erreurs et de vides.

---

## La conversion de devises, dans la requête

1. La table des taux dans le classeur, sous le nom `t_Taux` : `Mois`, `Devise`, `Taux_USD`.
2. **Fusionner** en externe gauche, sur **deux** colonnes : `Mois` et `Devise`.
3. Déplier `Taux_USD`.
4. `Montant_USD = [Montant_Local] / [Taux_USD]`.

> 🔴 **Le piège de type, et il coûte une heure à qui ne le connaît pas.**
> Une date lue depuis une feuille arrive en `datetime` ; celle construite dans la requête est une `date`.
> **Une jointure date / datetime ne trouve jamais rien — et ne lève aucune erreur.** Elle rend des nulls.
> Retypez les deux côtés en `date` **avant** de fusionner.

**Une conséquence à documenter :** convertir après agrégation, avec un taux moyen mensuel, ne donne pas exactement le même total que convertir ligne à ligne. Sur les douze mois de Baobab, l'écart est de **1,12 dollar sur 28 millions**. Ce n'est pas une erreur — c'est une méthode, et elle s'écrit dans le `README`.

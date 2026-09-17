# Module 10 · leçon 10.3 — livrer
### La checklist, le partage, et ce qui survit à Google Sheets

---

## 1 · Le `LISEZ-MOI.txt` qui accompagne tout `.xlsm`

À mettre dans le `.zip`, à côté du classeur. Copiez-le tel quel.

```
RAPPORTS MENSUELS BAOBAB — mode d'emploi
========================================

CE QU'IL Y A DANS CE DOSSIER
  Rapports_BAOBAB.xlsm    le classeur, avec sa macro
  LISEZ-MOI.txt           ce fichier

AVANT D'OUVRIR — trois gestes, dans cet ordre
  1. ENREGISTREZ le .xlsm sur votre disque (Bureau ou Documents).
     Ne l'ouvrez pas directement depuis la pièce jointe : Excel
     désactivera les macros sans le dire clairement.

  2. Windows : clic droit sur le fichier > Propriétés >
     en bas, cochez « Débloquer » > OK.
     Mac : rien à faire à cette étape.

  3. Ouvrez-le. Excel affichera un bandeau jaune
     « Les macros ont été désactivées ». Cliquez sur
     « Activer le contenu ». Une seule fois, la première fois.

POUR PRODUIRE LES RAPPORTS
  Feuille PARAMETRES > bouton « Produire les douze rapports ».
  Environ 40 secondes. Les PDF arrivent dans le sous-dossier
  « Rapports », à côté du classeur.

SI ÇA NE MARCHE PAS
  Ouvrez la feuille JOURNAL : la colonne Message nomme le
  rapport qui a échoué et la raison.
  Les trois causes déjà rencontrées :
    - le sous-dossier Rapports n'existe pas et n'a pas pu être
      créé → créez-le à la main, à côté du classeur
    - un PDF du même nom est ouvert dans un lecteur → fermez-le
    - le fichier a été ouvert depuis la pièce jointe → reprenez
      à l'étape 1

QUI CONTACTER
  [votre nom] — [votre adresse]
```

> **Ce fichier prend dix minutes à écrire et supprime les trois quarts des allers-retours.** C'est le meilleur rapport temps investi / temps gagné de tout le module.

---

## 2 · La checklist de recette, avant de livrer

- [ ] Le classeur s'ouvre sur la bonne feuille, curseur en `A1`, zoom à 100 %
- [ ] Tous les contrôles de `QUALITE` passent
- [ ] `README` rempli, y compris « ce que ce classeur ne fait pas »
- [ ] La macro a tourné **une fois de plus**, sur une copie, depuis un autre dossier
- [ ] Le `JOURNAL` de ce dernier essai ne contient aucun `KO`
- [ ] Les PDF produits ont été **ouverts** — pas seulement comptés
- [ ] Aucun chemin absolu dans le code *(cherchez `C:\` et `/Users/`)*
- [ ] Aucun lien externe *(`Données > Modifier les liens`)*
- [ ] Le calcul est en mode automatique
- [ ] Aucune feuille masquée oubliée
- [ ] Le `.xlsm` est dans un `.zip`, avec le `LISEZ-MOI.txt`
- [ ] Le `.zip` a été **téléchargé depuis votre propre envoi** et essayé

La dernière ligne est celle qu'on saute, et c'est celle qui attrape le plus : elle reproduit exactement ce que vivra le destinataire, Mark of the Web compris.

---

## 3 · La co-édition — ce qui marche, ce qui casse

Sur OneDrive ou SharePoint, plusieurs personnes peuvent travailler dans le même classeur en même temps. **Avec des limites précises.**

| | |
|---|---|
| ✅ Marche | saisie simultanée, formules, mise en forme, commentaires |
| ⚠️ Bloque la co-édition | un classeur `.xlsm`, une feuille protégée par mot de passe, un classeur chiffré |
| ❌ Casse | deux personnes qui actualisent Power Query en même temps, une plage nommée renommée pendant qu'un autre l'utilise |

> 💎 **L'historique des versions est la fonctionnalité qui sauve.** Clic droit sur le fichier dans OneDrive > `Historique des versions`. Chaque enregistrement est là, avec son auteur et son heure. On restaure celui d'avant la catastrophe.
>
> **Elle n'existe que sur OneDrive et SharePoint.** Un fichier sur un lecteur réseau d'entreprise n'a rien de tel : le seul filet est la sauvegarde de nuit, et elle a douze heures de retard.

### Protéger une plage pour certaines personnes seulement

`Révision > Autoriser la modification des plages` — sur Windows. On désigne une plage, on nomme les utilisateurs autorisés. C'est ce qui permet qu'un budget soit rempli par douze chefs de service **sans** que l'un puisse écraser la colonne d'un autre.

**Cette fonctionnalité n'existe pas sur Excel pour Mac.** Sur Mac, on protège la feuille entière et on déverrouille les cellules de saisie : c'est plus grossier, et ça suffit presque toujours.

---

## 4 · Exporter vers Google Sheets

Un jour, quelqu'un n'aura pas Excel. Voici ce qui traverse.

| Ce qui survit | Ce qui meurt |
|---|---|
| Formules classiques *(`SOMME.SI.ENS`, `RECHERCHEV`, `SI`)* | **Power Query** — aucun équivalent, la requête disparaît |
| Mise en forme conditionnelle *(la plupart des règles)* | **Le modèle de données** et tout le DAX |
| Tableaux croisés dynamiques *(refaits, équivalents)* | **Les matrices dynamiques** — `FILTRE`, `TRIER`, `UNIQUE` |
| Validation de données, listes déroulantes | **Les macros VBA** — Sheets utilise Apps Script |
| Graphiques *(simplifiés)* | Les segments, la chronologie |

> **La règle : un classeur qui doit finir dans Sheets se construit avec des formules, pas avec Power Query.** Ce n'est pas une régression — c'est un choix d'architecture qu'on fait au début, pas à la livraison.

### Les deux formules de Sheets qui n'ont pas d'équivalent Excel

**`QUERY()`** — un tableau croisé dynamique en une formule, qui se recalcule :

```
=QUERY(A:F ; "select D, sum(F) where B='Kinshasa'
              group by D order by sum(F) desc" ; 1)
```

**`IMPORTRANGE()`** — lire une plage d'un autre classeur, en direct, avec autorisation explicite du propriétaire :

```
=IMPORTRANGE("1AbC...xyz" ; "DONNEES!A:L")
```

C'est le lien externe d'Excel, en mieux : il ne casse pas quand le fichier bouge, parce qu'il pointe un identifiant, pas un chemin.

---

## 5 · Et la seule chose qui fait la différence

> **Livrez toujours avec la feuille `README`.**
>
> C'est elle qui fait qu'on vous rend un fichier **ou** une solution. Un classeur sans `README` sera rouvert dans six mois par quelqu'un qui ne saura pas d'où viennent les chiffres — et ce quelqu'un, une fois sur deux, c'est vous.

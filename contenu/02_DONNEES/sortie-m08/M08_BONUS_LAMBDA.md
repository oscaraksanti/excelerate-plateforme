# 🎁 Bonus Niveau + — `LAMBDA` : vos propres fonctions, sans VBA

> ⚠️ **Excel 2024 et Microsoft 365 uniquement.** Sur Excel 2021 et antérieur, sautez à la section « L'alternative » en bas de page.

---

## Le problème

Vous écrivez la même formule de conversion dans quarante cellules, dans douze classeurs, depuis trois ans :

```
=B5/RECHERCHEX(A5;t_Taux[Mois];t_Taux[CDF])
```

Le jour où la règle change — un arrondi, une devise de plus, une date de bascule — il faut retrouver les quarante cellules.

`LAMBDA` permet de l'écrire **une fois**, de lui donner un nom, et de l'utiliser partout :

```
=CONVERTIR_USD(B5 ; "CDF" ; A5)
```

**Et le jour où la règle change, on la change à un seul endroit.**

---

## Comment on en fabrique une

### 1 — Écrire la formule normalement, dans une cellule

```
=B5 / RECHERCHEX(A5 ; t_Taux[Debut_Mois] ; t_Taux[CDF])
```

Vérifiez qu'elle marche. **Toujours commencer par là.**

### 2 — L'envelopper dans `LAMBDA`, et la tester en place

```
=LAMBDA(montant ; devise ; mois ;
    montant / RECHERCHEX(mois ; t_Taux[Debut_Mois] ;
                         CHOISIRCOLS(t_Taux ;
                             EQUIV(devise ; {"CDF";"XOF";"XAF"} ; 0) + 1))
)(B5 ; "CDF" ; A5)
```

Les arguments sont nommés en premier, la formule ensuite. Les parenthèses **à la fin** l'appellent immédiatement : c'est comme ça qu'on la met au point sans la nommer.

### 3 — Lui donner un nom

`Formules > Gestionnaire de noms > Nouveau`

- **Nom** : `CONVERTIR_USD`
- **Fait référence à** : la formule `LAMBDA(...)` **sans** les parenthèses d'appel finales

Et c'est fini. Elle s'utilise comme n'importe quelle fonction Excel, avec l'infobulle et tout :

```
=CONVERTIR_USD(B5 ; "CDF" ; A5)
```

> 💎 **Le gestionnaire de noms devient une bibliothèque de fonctions.** Un classeur peut en contenir des dizaines, et elles voyagent avec lui.

---

## `LET` — rendre une formule lisible avant de la nommer

`LET` nomme des résultats intermédiaires. C'est ce qui permet d'écrire une `LAMBDA` qu'on saura relire.

```
=LET(
    taux  ; RECHERCHEX(mois ; t_Taux[Debut_Mois] ; t_Taux[CDF]) ;
    brut  ; montant / taux ;
    ARRONDI(brut ; 2)
)
```

**Chaque nom n'est calculé qu'une fois**, même s'il est utilisé dix fois — d'où un gain de vitesse réel sur les formules répétitives.

**La règle de lecture :** nom, valeur, nom, valeur… et **la dernière expression est le résultat**.

---

## Les fonctions qui prennent une `LAMBDA` en argument

C'est là que ça devient puissant : certaines fonctions attendent **une fonction** comme argument.

| Fonction | Ce qu'elle fait |
|---|---|
| **`PARLIGNE`** *(BYROW)* | applique une lambda à chaque ligne d'une plage |
| **`PARCOL`** *(BYCOL)* | la même chose par colonne |
| **`MAP`** | applique une lambda à chaque cellule |
| **`REDUCE`** | replie une plage en une seule valeur, en accumulant |
| **`SCAN`** | comme `REDUCE`, mais rend **tous** les résultats intermédiaires |

### Trois exemples qui servent vraiment

**Le total de chaque ligne, sans colonne d'appoint :**
```
=PARLIGNE(B2:F100 ; LAMBDA(ligne ; SOMME(ligne)))
```

**Un cumul progressif — la colonne « cumul » sans la tirer vers le bas :**
```
=SCAN(0 ; B2:B13 ; LAMBDA(cumul ; valeur ; cumul + valeur))
```

**Un produit de tous les facteurs — le taux composé sur douze mois :**
```
=REDUCE(1 ; B2:B13 ; LAMBDA(acc ; taux ; acc * (1 + taux)))
```

`SCAN` est le plus utile des trois au quotidien : **il produit une colonne de cumuls en une seule formule**, qui se déverse toute seule et ne se décale jamais.

---

## Quand une `LAMBDA` est justifiée — et quand elle ne l'est pas

| ✅ Oui | ❌ Non |
|---|---|
| la même règle métier dans plusieurs classeurs | une formule utilisée une fois |
| une règle qui va changer | un calcul que trois personnes doivent pouvoir relire |
| une formule que personne n'ose modifier | quelque chose que Power Query ferait mieux |
| un cumul ou un pliage qui demanderait une colonne | |

> 🔴 **Le vrai risque d'une `LAMBDA` n'est pas technique : c'est qu'elle est invisible.** Un collègue voit `=CONVERTIR_USD(...)` et n'a aucun moyen de deviner ce qu'il y a dedans sans ouvrir le gestionnaire de noms.
>
> **Donc : une ligne de commentaire dans le champ « Commentaire » du nom défini, et une ligne dans le `README`.** Sans ça, vous avez fabriqué une boîte noire de plus.

---

## L'alternative sur Excel 2021 et antérieur

`LAMBDA` n'existe pas, mais **les noms définis, si** — et ils vont plus loin qu'on ne croit.

Un nom défini peut contenir une formule complète, avec des références **relatives** qui s'adaptent à la cellule d'où on l'appelle :

```
Nom : MARGE_LIGNE
Fait référence à :  =(Feuil1!$D1-Feuil1!$E1)/Feuil1!$D1
```

Écrit depuis la cellule `F2`, ce nom s'utilise ensuite partout en colonne F : `=MARGE_LIGNE`.

Ce n'est pas une fonction — pas d'argument, pas d'infobulle — mais **ça centralise la règle au même endroit**, ce qui est l'essentiel du bénéfice.

Et `LET` existe depuis Excel 2021 : la lisibilité, elle, est acquise.

---

## Le geste à faire ce soir

Cherchez la formule que vous recopiez le plus souvent. Enveloppez-la dans `LAMBDA`, nommez-la, et écrivez une ligne de commentaire.

**Puis ouvrez le classeur d'un collègue et cherchez la sienne.** Il y en a une.

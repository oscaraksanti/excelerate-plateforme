# Leçon 1.5 — Les prompts, prêts à copier

## 1. Lire une facture photographiée

```
Voici la photo d'une facture fournisseur.

Rends-moi un tableau avec exactement ces cinq colonnes :
Reference ; Designation ; Quantite ; PU_CDF ; Montant

CONTRAINTES
- Format CSV, séparateur point-virgule, décimale virgule
- Ne calcule rien : recopie ce qui est écrit sur la facture
- Si un chiffre est illisible, écris ? — ne devine pas
- N'ajoute aucune ligne de total
```

> **« Ne calcule rien » est la contrainte la plus importante.** Si l'IA
> calcule le total à partir de ce qu'elle a mal lu, le total sera
> cohérent avec son erreur — et ton contrôle ne contrôlera plus rien.

## 2. Les autres sources non structurées

**Un bon de livraison manuscrit**
```
Voici la photo d'un bon de livraison rempli à la main.
Rends-moi : Reference ; Designation ; Quantite_commandee ; Quantite_livree
CSV, séparateur point-virgule. Si l'écriture est ambiguë, écris ? —
ne devine pas. Signale-moi séparément les lignes dont tu n'es pas sûr.
```

**Une commande reçue par e-mail, en texte libre**
```
Voici un e-mail de commande écrit en langage courant.
Extrais-en un tableau : Produit ; Quantite ; Unite ; Date_souhaitee
CSV, séparateur point-virgule.
Si une information manque, écris MANQUANT — n'invente rien.
Liste à part ce que le client n'a pas précisé.
```

**Un tableau collé dans WhatsApp**
```
Voici un tableau dont la mise en forme a été détruite par la messagerie.
Reconstruis les colonnes d'origine et rends-le en CSV, séparateur
point-virgule, décimale virgule. Dis-moi combien de lignes tu as
reconstruites et si certaines te paraissent incomplètes.
```

**Un relevé bancaire PDF**
```
Voici un relevé bancaire en PDF.
Rends-moi : Date ; Libelle ; Debit ; Credit ; Solde
CSV, séparateur point-virgule, décimale virgule, dates en jj/mm/aaaa.
Ne calcule ni total ni solde : recopie ce qui est imprimé.
```

## 3. Le contrôle en trois points — à mettre dans le classeur

```
Total imprimé sur le document      [tapé à la main, lu sur le papier]
Total recalculé                    =SOMME(t_Facture[Montant])
Écart — doit valoir 0              =B4-B3

Nombre de lignes attendues         [compté sur le papier]
Nombre de lignes saisies           =NBVAL(t_Facture[Reference])
Écart — doit valoir 0              =B7-B6
```

| | Ce qu'on vérifie | Ce que ça attrape |
|---|---|---|
| **1** | Le total recalculé tombe-t-il sur le total imprimé ? | Le chiffre mal lu |
| **2** | Le nombre de lignes correspond-il ? | La ligne sautée |
| **3** | Un montant est-il aberrant ? | La virgule décalée |

## 4. Documenter un classeur hérité

```
Voici un classeur dont j'ai hérité et que personne ne comprend.

Fais-moi l'inventaire :
- les feuilles, et ce que chacune contient
- les formules distinctes utilisées
- les valeurs écrites en dur à l'intérieur des formules
- les liens vers d'autres fichiers
- les plages nommées inutilisées
- les formules de plus de 200 caractères

Classe le tout par niveau de risque, sous forme de tableau.
Puis dis-moi ce que tu n'as PAS pu vérifier.
```

## 5. Fabriquer ton propre document à ressaisir

```
Fabrique-moi un document réaliste, tel que j'en reçois vraiment dans
mon métier, que je devrai ensuite ressaisir dans Excel.

MON CONTEXTE
Secteur : [...]  ·  Pays : [...]  ·  Devise : [...]
Le document : [facture / bon de livraison / relevé / feuille de
               présence / devis / ...]

CONTRAINTES
- 12 à 18 lignes, avec un total imprimé en bas
- Des références, libellés et montants crédibles chez nous
- Aucune donnée personnelle réelle
- Rends-le-moi sous forme de tableau que je pourrai imprimer

Ensuite, ne me donne PAS la version en données : je veux la ressaisir
moi-même à partir du document, et vérifier par le total.
```

> La dernière ligne est essentielle. Si l'IA te donne les données propres
> en même temps que le document, tu ne t'entraînes à rien.

---

**La limite honnête :** l'IA te rend un fichier. **Elle ne modifie pas le tien.**
Tu copies, tu colles, tu contrôles. Pour qu'elle écrive directement dans
tes classeurs, il faut d'autres outils — modules 8 à 10.

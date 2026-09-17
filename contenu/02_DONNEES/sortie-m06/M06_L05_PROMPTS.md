# Module 6 · Leçon 5 — Maquetter avant de construire

> **On ne maquette pas pour faire joli. On maquette pour faire décider quelqu'un d'autre.**
> Dix minutes de maquette évitent trois heures de construction dans la mauvaise direction.

---

## 1 · Les trois maquettes

```
Fais-moi trois maquettes interactives d'un tableau de
bord, en HTML autonome, dans trois artefacts séparés.

Le contexte :
- qui le lit : [le destinataire]
- la décision qu'il doit prendre : [la question]
- la fréquence : [mensuelle / hebdomadaire]
- il le lira sur : [écran / téléphone / papier]

Les données réelles :
[tes quatre indicateurs, avec leurs vraies valeurs]
[ton tableau de détail, 6 à 10 lignes]
[ta série temporelle]

Les trois maquettes doivent différer par la HIÉRARCHIE,
pas par les couleurs :
- maquette A : l'exception domine la page
- maquette B : la comparaison à l'objectif domine
- maquette C : la tendance domine

Contraintes communes : une seule page sans défilement,
quatre indicateurs maximum, un titre qui affirme,
une palette lisible en noir et blanc.
```

**Deux consignes font tout le travail :**
- **des chiffres réels**, jamais de données inventées — sinon le commanditaire juge le décor ;
- **« qui diffèrent par la hiérarchie »** — sinon on obtient trois variations de couleur, et la réponse « la bleue » ne vous apprend rien.

---

## 2 · La question qu'on pose au commanditaire

> *« Laquelle vous permet de répondre le plus vite à : [ta question de décision] ? »*

**Jamais « laquelle préférez-vous ».** On fait choisir sur la fonction, pas sur le goût : un avis esthétique n'est pas arbitrable.

L'arbitrage produit presque toujours une phrase du type *« la B, mais je veux aussi voir les familles »*. **Cette phrase vaut plus que les trois maquettes** : c'est ce qui manquait au cahier des charges.

---

## 3 · La phrase à dire AVANT de montrer

> *« C'est une maquette : elle sert à choisir la disposition et la hiérarchie, pas le rendu. Le fichier final sera un classeur Excel. »*

Dite avant, elle évite une réunion. Dite après, elle passe pour une excuse.

---

## 4 · Traduire la maquette validée

```
Voici la maquette que mon commanditaire a choisie :
[décris-la bloc par bloc, ou colle le code]

1. Liste bloc par bloc ce que je dois construire dans
   Excel, et avec quel outil — forme liée, appareil
   photo, mise en forme conditionnelle, graphique,
   segment.
2. Signale-moi tout ce qui n'est pas reproductible, et
   propose l'équivalent le plus proche — ou dis-moi
   de le supprimer.
3. Donne-moi l'ordre de construction : quoi d'abord,
   quoi ensuite, pour ne pas avoir à tout refaire.
4. Dis-moi ce qui cassera le jour où on ajoutera une
   septième agence.
```

### La table de traduction

| Dans la maquette | Dans Excel |
|---|---|
| une tuile d'indicateur | une forme liée à une cellule nommée — `=KPI_CA` |
| un bloc positionné librement | l'**appareil photo** sur une plage |
| une barre de progression | une **barre de données** |
| une pastille de statut | un **jeu d'icônes** |
| une courbe de tendance | une sparkline, ou une courbe sans quadrillage |
| un filtre en haut de page | un **segment** connecté |
| une police web | la police la plus proche installée **chez le destinataire** |
| une animation | rien — et ce n'est pas une perte |

### Ce qui reste dans la maquette

Animations, infobulles riches, défilement fluide, ombres douces, coins arrondis sur une plage, adaptation au téléphone. **Aucun de ces éléments ne porte d'information** : leur absence ne coûte rien.

La seule perte réelle est la **police**.

---

## 5 · Maquetter pour soi

```
Voici mes données et ma question de décision :
[...]

Fais-moi deux maquettes qui répondent à la même
question, mais qui font un pari opposé :
- l'une qui montre le détail et laisse le lecteur
  conclure
- l'autre qui conclut à sa place et ne montre le détail
  qu'en second

Pour chacune, dis-moi dans quel contexte elle est le
bon choix, et à quel moment elle devient le mauvais.
```

**La dernière question est celle qui fait progresser.** Un choix de restitution est bon dans un contexte et mauvais dans un autre — savoir lequel, c'est exactement la compétence de ce module.

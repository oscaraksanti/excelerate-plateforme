// ══════════════════════════════════════════════════════════════════════
//  Module 7 · Leçon 4 — Huit morceaux de M, à lire et à essayer
//
//  Chacun est autonome. On les colle dans une requête vide :
//  Données > Obtenir des données > Autres sources > Requête vide,
//  puis Accueil > Éditeur avancé.
//
//  Le but n'est pas de les apprendre par cœur. C'est de reconnaître
//  ces huit formes quand une IA vous en propose une — et de savoir
//  dire si elle est robuste ou fragile.
// ══════════════════════════════════════════════════════════════════════


// ── 1 ────────────────────────  La forme de base : let … in
//  Une suite d'étapes nommées, et le nom de celle qu'on rend.
//  Chaque ligne ici est une ligne du volet « Étapes appliquées ».

let
    Source     = #table({"Ville", "Ventes"},
                        {{"Kinshasa", 1200}, {"Abidjan", 800}, {"Dakar", 450}}),
    Filtrees   = Table.SelectRows(Source, each [Ventes] > 500),
    Triees     = Table.Sort(Filtrees, {{"Ventes", Order.Descending}})
in
    Triees


// ── 2 ──────────────────────────  `each` et la ligne courante
//  `each` veut dire « pour chaque ligne ». `_` est la ligne entière,
//  [Colonne] est une colonne de cette ligne.

let
    Source  = #table({"Prix", "Quantite"}, {{12.5, 4}, {30.0, 2}, {7.25, 10}}),
    Montant = Table.AddColumn(Source, "Montant",
                              each [Prix] * [Quantite], type number)
in
    Montant


// ── 3 ────────────────  Choisir des colonnes PAR LEUR NOM
//  🔴 Le geste le plus important du module. Comparez les deux :
//
//     Table.RemoveColumns(t, {"Notes"})       ← fragile
//        une nouvelle colonne arrive : elle passe.
//
//     Table.SelectColumns(t, {"Agence", ...}) ← robuste
//        une nouvelle colonne arrive : elle est ignorée,
//        et l'ordre des colonnes source n'a plus d'importance.

let
    Source   = #table({"Notes", "Agence", "Montant"},
                      {{"rien", "Kinshasa", 1200}, {"rien", "Dakar", 450}}),
    Choisies = Table.SelectColumns(Source, {"Agence", "Montant"})
in
    Choisies


// ── 4 ─────────────  💎 Dépivoter les AUTRES colonnes
//  Table.UnpivotOtherColumns nomme ce qu'on GARDE, jamais ce qu'on
//  déplie. Le jour où une septième famille arrive, elle est reprise
//  toute seule. Sa voisine, Table.Unpivot, l'ignorerait en silence.

let
    Croise = #table({"Agence", "Huiles", "Riz", "Farine"},
                    {{"Kinshasa", 133920, 199205, 101608},
                     {"Abidjan",   79622,  84901,  70310}}),
    Deplie = Table.UnpivotOtherColumns(Croise, {"Agence"},
                                       "Famille", "Montant_Local")
in
    Deplie


// ── 5 ──────────────────────  try … otherwise : survivre
//  Trois mots, et un fichier abîmé ne fait plus tomber les douze
//  autres. La valeur fautive ressort en null, et la requête de
//  contrôle la nomme.

let
    Source = #table({"Texte"}, {{"120"}, {"abc"}, {"45"}}),
    Nombre = Table.AddColumn(Source, "Nombre",
                 each try Number.FromText([Texte]) otherwise null,
                 type nullable number)
in
    Nombre


// ── 6 ────────────────  Une fonction personnalisée, minimale
//  Une fonction est une requête qui prend un argument. On l'appelle
//  ensuite sur une colonne : each fxTauxRemise([Montant]).
//
//  À enregistrer dans SA PROPRE requête, nommée fxTauxRemise.

(montant as number) as number =>
    if      montant >= 3000 then 0.09
    else if montant >= 1500 then 0.06
    else if montant >=  800 then 0.04
    else if montant >=  400 then 0.02
    else                         0.00


// ── 7 ──────────  Une date tirée du NOM du fichier
//  Text.Middle compte à partir de zéro. Dans « Ventes_2025-10.xlsx » :
//  l'année commence en position 7, le mois en position 12.
//
//  Pourquoi le nom du fichier et pas une colonne : les trois tableaux
//  croisés reçus ne portent aucune date à l'intérieur.

let
    Fichiers = #table({"Name"}, {{"Ventes_2025-10.xlsx"},
                                 {"Ventes_2026-03.xlsx"},
                                 {"Ventes_2026-10_NOUVEAU.xlsx"}}),
    Mois = Table.AddColumn(Fichiers, "Mois", each
               #date(Number.FromText(Text.Middle([Name], 7, 4)),
                     Number.FromText(Text.Middle([Name], 12, 2)), 1),
               type date)
in
    Mois


// ── 8 ────────────────  L'encodage d'un CSV, choisi à la main
//  1252 = Windows-1252 · 65001 = UTF-8.
//  Lu dans le mauvais encodage, « Nadège » devient « Nadège »,
//  et le nombre de responsables distincts passe de 6 à 10.
//  Aucune erreur n'est levée : seul un comptage le révèle.

let
    Source = Csv.Document(
                 File.Contents("C:\Baobab\Ventes_2026-09.csv"),
                 [Delimiter = ";", Encoding = 1252,
                  QuoteStyle = QuoteStyle.None]),
    Entetes = Table.PromoteHeaders(Source, [PromoteAllScalars = true])
in
    Entetes


// ──────────────────────────────────────────────────────────────────────
//  Les trois choses à retenir, et elles suffisent
//
//  · Une requête est un let … in : des étapes nommées, et la dernière
//    qu'on rend. Renommer une étape, c'est renommer une variable.
//  · `each` veut dire « pour chaque ligne » ; `_` est la ligne.
//  · Le M est SENSIBLE À LA CASSE. Table.SelectRows marche,
//    table.selectrows non. C'est la première cause d'erreur quand
//    on recopie du code trouvé ailleurs.
// ──────────────────────────────────────────────────────────────────────

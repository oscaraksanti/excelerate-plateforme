// ══════════════════════════════════════════════════════════════════════
//  TP 7 — La consolidation des douze agences, en langage M
//
//  Quatre requêtes. À coller une par une dans l'éditeur avancé :
//  Données > Obtenir des données > Lancer l'éditeur Power Query,
//  puis Accueil > Nouvelle source > Requête vide > Éditeur avancé.
//
//  Aucune colonne n'est désignée par sa position. C'est la seule
//  raison pour laquelle cette requête survit au treizième fichier.
// ══════════════════════════════════════════════════════════════════════


// ── 1 ─────────────────────────────────────────────  Dossier_Source
//  Un paramètre, pas un chemin en dur. Sur le poste du collègue,
//  c'est la seule chose à changer.
//  Accueil > Gérer les paramètres > Nouveau paramètre, type Texte.

"C:\Baobab\J07_Agences_mensuel"


// ── 2 ───────────────────────────────────────────────  fxNormaliser
//  Prend le contenu d'un fichier reçu et rend TOUJOURS la même table,
//  quel que soit le format dans lequel l'agence l'a envoyé :
//  standard, avec un titre avant les en-têtes, ou en tableau croisé.

(contenu as binary, nomFichier as text) as table =>
let
    estCsv =
        Text.EndsWith(Text.Lower(nomFichier), ".csv"),

    //  Le CSV de septembre est en Windows-1252. Sans Encoding=1252,
    //  « Nadège » devient « Nad?ge » et on compte dix responsables
    //  au lieu de six.
    brut =
        if estCsv then
            Csv.Document(contenu, [Delimiter = ";", Encoding = 1252,
                                   QuoteStyle = QuoteStyle.None])
        else
            Excel.Workbook(contenu, null, true){[Item = "Ventes", Kind = "Sheet"]}[Data],

    //  Deux agences mettent un titre et une ligne vide avant les
    //  en-têtes. On ne compte pas les lignes à sauter : on saute
    //  jusqu'à trouver celle qui contient « Agence ».
    SautDuTitre =
        Table.Skip(brut, each not List.Contains(Record.ToList(_), "Agence")),

    Entetes =
        Table.PromoteHeaders(SautDuTitre, [PromoteAllScalars = true]),

    //  Trois agences envoient un tableau croisé : une colonne par
    //  famille. On le reconnaît à l'absence de colonne « Famille ».
    EstCroise =
        not List.Contains(Table.ColumnNames(Entetes), "Famille"),

    //  💎 « Dépivoter les AUTRES colonnes » — jamais « dépivoter les
    //  colonnes ». Le jour où une septième famille apparaît, celle-ci
    //  continue de fonctionner ; l'autre casse.
    Deplie =
        if EstCroise then
            Table.UnpivotOtherColumns(Entetes, {"Agence", "Devise"},
                                      "Famille", "Montant_Local")
        else
            Entetes,

    //  Les tableaux croisés n'apportent ni quantité, ni remise, ni
    //  responsable. On crée les colonnes manquantes à vide plutôt que
    //  de laisser la requête échouer.
    Complete =
        List.Accumulate(
            {"Quantite", "Remise_Pct", "Responsable"},
            Deplie,
            (t, c) =>
                if List.Contains(Table.ColumnNames(t), c) then t
                else Table.AddColumn(t, c, each null)),

    //  On choisit les colonnes PAR LEUR NOM, et dans un ordre imposé.
    //  C'est ici que se joue la survie au treizième fichier.
    Choisies =
        Table.SelectColumns(Complete,
            {"Agence", "Devise", "Famille", "Responsable",
             "Quantite", "Remise_Pct", "Montant_Local"}),

    //  Typer explicitement, toujours. Une colonne non typée se
    //  retypera toute seule un jour, et pas comme on voulait.
    Typees =
        Table.TransformColumnTypes(Choisies, {
            {"Agence", type text}, {"Devise", type text},
            {"Famille", type text}, {"Responsable", type text},
            {"Quantite", Int64.Type}, {"Remise_Pct", type number},
            {"Montant_Local", type number}})
in
    Typees


// ── 3 ─────────────────────────────────────────────────  Consolide
//  La requête principale. Elle se charge dans un tableau nommé
//  t_Consolide, sur la feuille CONSOLIDE, à partir de A1.

let
    Source =
        Folder.Files(Dossier_Source),

    //  On ne garde que les fichiers de ventes : un ~$verrou ou un
    //  .DS_Store traîne toujours dans un dossier partagé.
    Fichiers =
        Table.SelectRows(Source, each
            Text.StartsWith([Name], "Ventes_")
            and not Text.StartsWith([Name], "~$")),

    //  Le mois vient du NOM du fichier. Ventes_2025-10.xlsx →
    //  1er octobre 2025. Ventes_2026-10_NOUVEAU.xlsx aussi.
    AvecMois =
        Table.AddColumn(Fichiers, "Mois", each
            #date(Number.FromText(Text.Middle([Name], 7, 4)),
                  Number.FromText(Text.Middle([Name], 12, 2)), 1),
            type date),

    //  try … otherwise : un fichier illisible ne fait plus tomber
    //  les douze autres. Il ressortira dans la requête de contrôle.
    AvecTable =
        Table.AddColumn(AvecMois, "Donnees", each
            try fxNormaliser([Content], [Name]) otherwise null),

    Valides =
        Table.SelectRows(AvecTable, each [Donnees] <> null),

    Deplie =
        Table.ExpandTableColumn(Valides, "Donnees",
            {"Agence", "Devise", "Famille", "Responsable",
             "Quantite", "Remise_Pct", "Montant_Local"}),

    Nettoye =
        Table.SelectColumns(Deplie,
            {"Mois", "Agence", "Devise", "Famille", "Responsable",
             "Quantite", "Remise_Pct", "Montant_Local"}),

    //  La conversion de devises se fait ICI, une fois pour toutes.
    //  Jointure sur deux colonnes : on les sélectionne dans l'ordre
    //  des deux côtés avant de fusionner.
    //  La table des taux a été collée dans le classeur, feuille TAUX,
    //  sous le nom t_Taux. On la retype : une date lue depuis une
    //  feuille arrive en datetime, et une jointure date/datetime ne
    //  trouve jamais rien — sans erreur, juste des nulls.
    Taux =
        Table.TransformColumnTypes(
            Excel.CurrentWorkbook(){[Name = "t_Taux"]}[Content],
            {{"Mois", type date}, {"Devise", type text}, {"Taux_USD", type number}}),

    Jointe =
        Table.NestedJoin(Nettoye, {"Mois", "Devise"},
                         Taux, {"Mois", "Devise"},
                         "T", JoinKind.LeftOuter),

    AvecTaux =
        Table.ExpandTableColumn(Jointe, "T", {"Taux_USD"}, {"Taux_USD"}),

    AvecUSD =
        Table.AddColumn(AvecTaux, "Montant_USD", each
            Number.Round([Montant_Local] / [Taux_USD], 2), type number),

    Final =
        Table.TransformColumnTypes(AvecUSD, {
            {"Mois", type date}, {"Taux_USD", type number}})
in
    Final


// ── 4 ──────────────────────────────────────────────────  Controle
//  La requête de contrôle qualité, chargée À CÔTÉ du résultat.
//  C'est elle qui dit si l'actualisation s'est bien passée — et
//  c'est elle qui permet à R_ECART_SOURCE de valoir zéro.

let
    Source =
        Folder.Files(Dossier_Source),

    Fichiers =
        Table.SelectRows(Source, each
            Text.StartsWith([Name], "Ventes_")
            and not Text.StartsWith([Name], "~$")),

    AvecTable =
        Table.AddColumn(Fichiers, "Donnees", each
            try fxNormaliser([Content], [Name]) otherwise null),

    Mesure =
        Table.AddColumn(AvecTable, "Lignes", each
            if [Donnees] = null then 0 else Table.RowCount([Donnees]), Int64.Type),

    Total =
        Table.AddColumn(Mesure, "Montant_Local", each
            if [Donnees] = null then 0
            else List.Sum([Donnees][Montant_Local]), type number),

    SansQte =
        Table.AddColumn(Total, "Lignes_sans_quantite", each
            if [Donnees] = null then 0
            else List.Count(List.Select([Donnees][Quantite], each _ = null)),
            Int64.Type),

    Format =
        Table.AddColumn(SansQte, "Format", each
            if [Donnees] = null then "ILLISIBLE"
            else if [Lignes_sans_quantite] > 0 then "croise"
            else if Text.EndsWith(Text.Lower([Name]), ".csv") then "csv"
            else "standard", type text),

    //  PASS, WARNING, FAIL — trois mots, et l'actualisation se
    //  raconte toute seule.
    Statut =
        Table.AddColumn(Format, "Statut", each
            if [Donnees] = null then "FAIL"
            else if [Lignes_sans_quantite] > 0 then "WARNING"
            else "PASS", type text),

    Final =
        Table.SelectColumns(Statut,
            {"Name", "Format", "Lignes", "Montant_Local",
             "Lignes_sans_quantite", "Statut"}),

    Renomme =
        Table.RenameColumns(Final, {{"Name", "Fichier"}})
in
    Renomme

// ══════════════════════════════════════════════════════════════════════
//  🎁 Bonus Niveau + — La table de calendrier parfaite
//
//  Une table de dates complète, générée par la requête, sans aucune
//  saisie. C'est la clé de tout le module 8 : sans elle, aucune
//  fonction de temps ne fonctionne dans un modèle de données.
//
//  Deux paramètres à créer avant : DateDebut et DateFin (type Date).
// ══════════════════════════════════════════════════════════════════════

let
    NbJours =
        Duration.Days(DateFin - DateDebut) + 1,

    Liste =
        List.Dates(DateDebut, NbJours, #duration(1, 0, 0, 0)),

    Base =
        Table.FromList(Liste, Splitter.SplitByNothing(), {"Date"}),

    Typee =
        Table.TransformColumnTypes(Base, {{"Date", type date}}),

    //  Les jours fériés fixes de la RDC. À compléter par pays —
    //  c'est la seule partie qu'il faut écrire à la main, et elle
    //  se met à jour une fois par an.
    FeriesFixes = {
        [Jour = 1,  Mois = 1,  Nom = "Nouvel An"],
        [Jour = 4,  Mois = 1,  Nom = "Martyrs de l'indépendance"],
        [Jour = 16, Mois = 1,  Nom = "Laurent-Désiré Kabila"],
        [Jour = 17, Mois = 1,  Nom = "Patrice Lumumba"],
        [Jour = 1,  Mois = 5,  Nom = "Fête du travail"],
        [Jour = 30, Mois = 6,  Nom = "Indépendance"],
        [Jour = 1,  Mois = 8,  Nom = "Fête des parents"],
        [Jour = 25, Mois = 12, Nom = "Noël"]
    },

    Colonnes =
        Table.AddColumn(Typee, "Annee",      each Date.Year([Date]), Int64.Type),
    C2 = Table.AddColumn(Colonnes, "Trimestre",  each "T" & Text.From(Date.QuarterOfYear([Date])), type text),
    C3 = Table.AddColumn(C2, "MoisNum",          each Date.Month([Date]), Int64.Type),
    C4 = Table.AddColumn(C3, "MoisNom",          each Date.ToText([Date], "MMMM", "fr-FR"), type text),
    C5 = Table.AddColumn(C4, "MoisAbrege",       each Date.ToText([Date], "MMM yy", "fr-FR"), type text),

    //  Le premier du mois : la colonne sur laquelle on joint tout.
    C6 = Table.AddColumn(C5, "DebutMois",        each Date.StartOfMonth([Date]), type date),

    //  La semaine ISO — celle où la semaine 1 est celle du premier
    //  jeudi. C'est la norme européenne, et ce n'est PAS ce que rend
    //  Date.WeekOfYear par défaut.
    C7 = Table.AddColumn(C6, "SemaineISO",
            each Date.WeekOfYear(Date.AddDays([Date], 3 - Number.Mod(Date.DayOfWeek([Date], Day.Monday) + 6, 7)), Day.Monday),
            Int64.Type),

    C8 = Table.AddColumn(C7, "JourSemaine",      each Date.DayOfWeek([Date], Day.Monday) + 1, Int64.Type),
    C9 = Table.AddColumn(C8, "JourNom",          each Date.ToText([Date], "dddd", "fr-FR"), type text),
    C10 = Table.AddColumn(C9, "EstWeekEnd",      each Date.DayOfWeek([Date], Day.Monday) >= 5, type logical),

    C11 = Table.AddColumn(C10, "Ferie", each
            let trouve = List.Select(FeriesFixes, each
                    _[Jour] = Date.Day([Date]) and _[Mois] = Date.Month([Date]))
            in  if List.IsEmpty(trouve) then null else trouve{0}[Nom],
            type text),

    C12 = Table.AddColumn(C11, "EstOuvre",
            each not [EstWeekEnd] and [Ferie] = null, type logical),

    //  Les colonnes de comparaison à l'an dernier, calculées ici
    //  plutôt que dans chaque mesure.
    C13 = Table.AddColumn(C12, "MemeJourAnDernier",
            each Date.AddYears([Date], -1), type date),
    C14 = Table.AddColumn(C13, "RangMois",
            each Date.Year([Date]) * 12 + Date.Month([Date]), Int64.Type)
in
    C14

// ──────────────────────────────────────────────────────────────────────
//  Ce qu'il faut savoir avant de la charger
//
//  · La table de dates doit couvrir TOUT l'intervalle des données,
//    du 1er janvier de la première année au 31 décembre de la
//    dernière. Un trou, et les cumuls annuels sont faux.
//  · Elle se charge en connexion seule, puis dans le modèle de
//    données. On ne la met jamais dans une feuille : 3 650 lignes
//    pour dix ans, c'est du poids pour rien.
//  · Dans le modèle, il faut la MARQUER comme table de dates.
//    Sans ça, les fonctions de temps intelligentes refusent de
//    fonctionner — et c'est le premier blocage du module 8.
// ──────────────────────────────────────────────────────────────────────

#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════
#  Les trois classeurs de démonstration du module 9.
#
#  Ils ne sont pas notés : ce sont les supports des leçons 9.1, 9.2 et
#  9.3. Chacun est fait pour qu'on l'ouvre et qu'on fasse le geste —
#  pas pour qu'on le regarde.
#
#  🔴 Aucune formule _xlfn.LET ici : écrite hors d'Excel, elle se
#  calcule mais empêche Excel d'enregistrer le classeur (erreur -50).
# ══════════════════════════════════════════════════════════════════════
import pathlib, sys, json
import openpyxl
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side, Protection
from openpyxl.utils import get_column_letter

RACINE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "sortie-m09")
RACINE.mkdir(parents=True, exist_ok=True)

Ftitre  = Font(name="Calibri", size=14, bold=True)
Fentete = Font(name="Calibri", size=11, bold=True, color="FFFFFFFF")
Faide   = Font(name="Calibri", size=10, italic=True, color="FF6B7280")
Fgras   = Font(name="Calibri", size=11, bold=True)
Fbleu   = Font(name="Calibri", size=11, color="FF0000FF")
Fnoir   = Font(name="Calibri", size=11, color="FF000000")
Fvert   = Font(name="Calibri", size=11, color="FF008000")
Frouge  = Font(name="Calibri", size=11, color="FFC0392B")
Rentete = PatternFill("solid", fgColor="FF243044")
Rjaune  = PatternFill("solid", fgColor="FFFFF6D8")
Rbleu   = PatternFill("solid", fgColor="FFEFF4FE")
Rrouge  = PatternFill("solid", fgColor="FFFDECEA")
Bord    = Border(bottom=Side(style="thin", color="FFD6DBE1"))
USD, USD0, PCT, INT = '#,##0.00\\ "USD"', '#,##0\\ "USD"', "0.00%", "#,##0"

def entete(ws, cols, ligne=1, depart=1):
    for k, c in enumerate(cols, start=depart):
        cel = ws.cell(ligne, k, c); cel.font, cel.fill = Fentete, Rentete
        cel.alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[ligne].height = 22

def larg(ws, specs, depart=1):
    for k, w in enumerate(specs, start=depart):
        ws.column_dimensions[get_column_letter(k)].width = w

def saisie(c, v, fmt=None):
    c.value, c.font, c.fill = v, Fbleu, Rbleu
    if fmt: c.number_format = fmt
    return c

def calcul(c, f, fmt=None):
    c.value, c.font = f, Fnoir
    if fmt: c.number_format = fmt
    return c

REF = {}

# ══════════════════════════════════════════════════════════════════════
#  1 · M09_L01_SIMULATION.xlsx — Valeur cible et tables de données
# ══════════════════════════════════════════════════════════════════════
#  Le cas : la gamme « Riz parfumé 25 kg » de l'agence de Dakar.
PRIX, COUT, VOL, FIXES = 14.80, 11.35, 9_400, 21_500.0

def van_simple(prix, vol):
    return vol * (prix - COUT) - FIXES

def classeur_l01():
    wb = openpyxl.Workbook(); wb.remove(wb.active)

    ws = wb.create_sheet("MODELE")
    larg(ws, [34, 18, 54])
    ws["A1"] = "Riz parfumé 25 kg — Dakar, un mois"; ws["A1"].font = Ftitre
    ws["A2"] = ("Quatre saisies en bleu, trois formules en noir. "
                "C'est le plus petit modèle sur lequel les trois outils marchent.")
    ws["A2"].font = Faide
    lignes = [("Prix de vente unitaire", PRIX, USD, "saisie"),
              ("Coût d'achat unitaire", COUT, USD, "saisie"),
              ("Volume mensuel", VOL, INT, "saisie"),
              ("Charges fixes du mois", FIXES, USD0, "saisie"),
              ("Marge unitaire", "=B4-B5", USD, "calcul"),
              ("Marge sur coûts variables", "=B8*B6", USD0, "calcul"),
              ("Résultat du mois", "=B9-B7", USD0, "calcul"),
              ("Taux de marge sur le CA", "=B10/(B4*B6)", PCT, "calcul")]
    for k, (lib, v, fmt, genre) in enumerate(lignes, start=4):
        ws.cell(k, 1, lib).font = Fgras
        c = ws.cell(k, 2); c.border = Bord
        (saisie if genre == "saisie" else calcul)(c, v, fmt)
    ws["C4"] = "← c'est cette cellule que Valeur cible fera bouger"
    ws["C4"].font = Faide
    ws["C11"] = "← et c'est celle-ci qu'on veut amener à 15 %"
    ws["C11"].font = Faide
    for nom, ref in (("P_PRIX", "MODELE!$B$4"), ("P_COUT", "MODELE!$B$5"),
                     ("P_VOLUME", "MODELE!$B$6"), ("P_FIXES", "MODELE!$B$7"),
                     ("P_RESULTAT", "MODELE!$B$10"), ("P_TAUX", "MODELE!$B$11")):
        wb.defined_names[nom] = DefinedName(nom, attr_text=ref)

    #  Valeur cible : le prix qui donne 15 % de marge sur le CA.
    #  taux = (vol*(p-cout)-fixes)/(vol*p) = 0,15  →  p = (vol*cout+fixes)/(vol*0,85)
    prix_cible = (VOL * COUT + FIXES) / (VOL * 0.85)
    REF["prix_15pct"] = round(prix_cible, 4)
    #  Le prix qui annule le résultat.
    REF["prix_zero"] = round(COUT + FIXES / VOL, 4)
    #  Le volume qui annule le résultat, au prix actuel.
    REF["volume_zero"] = round(FIXES / (PRIX - COUT), 2)

    ws = wb.create_sheet("TABLE_1_ENTREE")
    larg(ws, [16, 20, 62])
    ws["A1"] = "Table de données à une entrée — le volume"; ws["A1"].font = Ftitre
    ws["A2"] = ("Le geste : sélectionner A5:B17, puis Données > Analyse de "
                "scénarios > Table de données, cellule d'entrée en COLONNE = B6 "
                "de MODELE.")
    ws["A2"].font = Faide
    ws["A4"] = "Volume"; ws["A4"].font = Fgras
    calcul(ws["B5"], "=P_RESULTAT", USD0)
    ws["C5"] = "← la formule va dans le coin, au-dessus de la colonne de résultats"
    ws["C5"].font = Faide
    vols = [5000 + 1000 * k for k in range(12)]
    for k, v in enumerate(vols, start=6):
        saisie(ws.cell(k, 1), v, INT)
        ws.cell(k, 2).number_format = USD0
    ws["C7"] = "Les cellules de résultat restent vides : c'est Excel qui les remplit."
    ws["C7"].font = Faide
    REF["table1"] = {v: round(van_simple(PRIX, v), 2) for v in vols}

    ws = wb.create_sheet("TABLE_2_ENTREES")
    larg(ws, [16] + [13] * 12)
    ws["A1"] = "Table de données à deux entrées — prix × volume"
    ws["A1"].font = Ftitre
    ws["A2"] = ("Sélectionner A5:M18, cellule d'entrée en LIGNE = B4 (le prix), "
                "en COLONNE = B6 (le volume). 132 simulations, aucune macro.")
    ws["A2"].font = Faide
    prix_axe = [round(13.00 + 0.40 * k, 2) for k in range(12)]
    calcul(ws["A5"], "=P_RESULTAT", USD0)
    for k, p in enumerate(prix_axe, start=2):
        saisie(ws.cell(5, k), p, USD)
    for k, v in enumerate(vols, start=6):
        saisie(ws.cell(k, 1), v, INT)
        for j in range(2, 14):
            ws.cell(k, j).number_format = "#,##0"
    ws["A20"] = ("Le coin porte la formule. La ligne du haut et la colonne de "
                 "gauche portent les valeurs à essayer. Le rectangle reste vide.")
    ws["A20"].font = Faide
    REF["table2"] = {f"{p}|{v}": round(van_simple(p, v), 2)
                     for p in prix_axe for v in vols}

    ws = wb.create_sheet("ATTENDU")
    larg(ws, [46, 20, 52])
    ws["A1"] = "Ce que vous devez trouver"; ws["A1"].font = Ftitre
    ws["A2"] = "À ne regarder qu'après avoir fait le geste."; ws["A2"].font = Faide
    att = [("Prix qui donne 15 % de marge sur le CA (Valeur cible)",
            REF["prix_15pct"], USD,
            "16,04 USD — soit 1,24 USD de plus qu'aujourd'hui"),
           ("Prix qui annule le résultat", REF["prix_zero"], USD,
            "en dessous, chaque sac vendu coûte de l'argent"),
           ("Volume qui annule le résultat, au prix actuel",
            REF["volume_zero"], INT, "le seuil de rentabilité, en sacs"),
           ("Résultat à 9 000 sacs (table à une entrée)",
            round(van_simple(PRIX, 9000), 2), USD0, "ligne « 9 000 » de TABLE_1"),
           ("Résultat à 13,80 USD et 11 000 sacs (table à deux entrées)",
            round(van_simple(13.80, 11000), 2), USD0,
            "croisement colonne 13,80 × ligne 11 000")]
    entete(ws, ["Ce qu'on cherche", "Valeur", "Comment la lire"], ligne=4)
    for k, (lib, v, fmt, quoi) in enumerate(att, start=5):
        ws.cell(k, 1, lib).border = Bord
        c = ws.cell(k, 2, v); c.number_format, c.border = fmt, Bord
        ws.cell(k, 3, quoi).font = Faide
    wb.save(RACINE / "M09_L01_SIMULATION.xlsx")
    print("  M09_L01_SIMULATION.xlsx")

classeur_l01()

# ══════════════════════════════════════════════════════════════════════
#  2 · M09_L02_FINANCE.xlsx — VAN, TRI, emprunt, seuil, Solveur
# ══════════════════════════════════════════════════════════════════════
EMPRUNT, TAUX_AN, MOIS = 150_000.0, 0.115, 60
FLUX_PROJET = [-320_000, 68_000, 94_000, 121_000, 138_000, 142_000, 126_000]
ACTUALISATION = 0.14

AGENCES_SOLVEUR = [
 # agence,        marge USD/unité, capacité, service minimum
 ("Kinshasa",     1.92, 8_000, 2_000),
 ("Lubumbashi",   1.64, 5_000, 1_500),
 ("Abidjan",      2.15, 6_500, 1_500),
 ("Dakar",        1.78, 4_500, 1_200),
 ("Douala",       1.55, 5_500, 1_200),
 ("Libreville",   2.04, 3_500, 1_000),
]
STOCK = 24_000

def optimum_solveur():
    """Le problème est linéaire : on sert les minimums, puis on remplit
    par marge décroissante. Le Solveur trouvera la même chose — c'est
    justement ce qui permet de vérifier qu'il n'a pas raconté n'importe quoi."""
    alloc = {a: mini for a, _m, _c, mini in AGENCES_SOLVEUR}
    reste = STOCK - sum(alloc.values())
    for a, m, cap, mini in sorted(AGENCES_SOLVEUR, key=lambda x: -x[1]):
        place = min(cap - mini, reste)
        alloc[a] += place; reste -= place
    marge = sum(alloc[a] * m for a, m, _c, _mi in AGENCES_SOLVEUR)
    return alloc, marge, reste

def van_projet():
    return sum(f / (1 + ACTUALISATION) ** k for k, f in enumerate(FLUX_PROJET))

def tri_projet():
    lo, hi = -0.9, 3.0
    for _ in range(400):
        mid = (lo + hi) / 2
        v = sum(f / (1 + mid) ** k for k, f in enumerate(FLUX_PROJET))
        if v > 0: lo = mid
        else:     hi = mid
    return (lo + hi) / 2

def mensualite():
    i = TAUX_AN / 12
    return EMPRUNT * i / (1 - (1 + i) ** -MOIS)

def classeur_l02():
    wb = openpyxl.Workbook(); wb.remove(wb.active)

    # ── VAN et TRI ───────────────────────────────────────────────────
    ws = wb.create_sheet("VAN_TRI")
    larg(ws, [12, 18, 6, 44, 20, 46])
    ws["A1"] = "Un entrepôt à Abidjan — six ans de flux"; ws["A1"].font = Ftitre
    ws["A2"] = ("Les flux sont annuels. L'année 0, c'est l'investissement : "
                "il est déjà payé, il n'a pas à être actualisé.")
    ws["A2"].font = Faide
    entete(ws, ["Année", "Flux"], ligne=4)
    for k, f in enumerate(FLUX_PROJET, start=5):
        ws.cell(k, 1, k - 5).border = Bord
        saisie(ws.cell(k, 2), f, USD0)
    wb.defined_names["FLUX"] = DefinedName("FLUX", attr_text="VAN_TRI!$B$5:$B$11")
    wb.defined_names["FLUX_1_N"] = DefinedName("FLUX_1_N", attr_text="VAN_TRI!$B$6:$B$11")
    ws["D4"] = "Taux d'actualisation exigé"; ws["D4"].font = Fgras
    saisie(ws["E4"], ACTUALISATION, PCT)
    wb.defined_names["T_ACT"] = DefinedName("T_ACT", attr_text="VAN_TRI!$E$4")

    ws["D6"] = "❌  Erreur silencieuse — toute la plage dans VAN()"
    ws["D6"].font = Frouge
    c = calcul(ws["E6"], "=NPV(T_ACT,FLUX)", USD0); c.font, c.fill = Frouge, Rrouge
    ws["F6"] = ("VAN() actualise DÉJÀ son premier flux. Toute la série glisse "
                "d'une période : la VAN entière se trouve divisée par 1,14. "
                "Le signe, lui, ne change jamais — c'est pour ça qu'on ne la "
                "voit pas.")
    ws["F6"].font = Faide
    ws["D7"] = "        écart avec la juste"; ws["D7"].font = Faide
    c = calcul(ws["E7"], "=E6/E9-1", PCT); c.font = Frouge

    ws["D8"] = "❌  Erreur bruyante — l'investissement oublié"
    ws["D8"].font = Frouge
    c = calcul(ws["E8"], "=NPV(T_ACT,FLUX_1_N)", USD0)
    c.font, c.fill = Frouge, Rrouge
    ws["F8"] = ("Celle-là se voit : 320 000 USD de trop. Elle est beaucoup "
                "moins grave que la précédente, justement parce qu'elle crie.")
    ws["F8"].font = Faide

    ws["D9"] = "✅  VAN juste — le flux 0 ajouté à part"; ws["D9"].font = Fgras
    calcul(ws["E9"], "=NPV(T_ACT,FLUX_1_N)+B5", USD0)
    ws["F9"] = "La seule écriture correcte, et c'est celle du TP."
    ws["F9"].font = Faide
    ws["D10"] = "Ce que l'erreur silencieuse coûte"; ws["D10"].font = Fgras
    calcul(ws["E10"], "=E9-E6", USD0)
    ws["F10"] = ("13 080 USD de VAN évaporés sur un projet qui en vaut 106 000. "
                 "Assez pour recaler un dossier devant un comité.")
    ws["F10"].font = Faide
    ws["D12"] = "TRI du projet"; ws["D12"].font = Fgras
    calcul(ws["E12"], "=IRR(FLUX)", PCT)
    ws["F12"] = ("TRI prend la plage ENTIÈRE, année 0 comprise — l'inverse de "
                 "VAN. C'est exactement ce qui fait tomber tout le monde.")
    ws["F12"].font = Faide
    ws["D14"] = "TRI avec estimation initiale"; ws["D14"].font = Fgras
    calcul(ws["E14"], "=IRR(FLUX,0.3)", PCT)
    ws["F14"] = ("Quand TRI rend #NOMBRE!, ce n'est pas que le taux n'existe "
                 "pas : c'est que l'itération n'a pas convergé depuis 10 %.")
    ws["F14"].font = Faide
    ws["D16"] = "TRIM — réinvestissement à 8 %"; ws["D16"].font = Fgras
    calcul(ws["E16"], "=MIRR(FLUX,T_ACT,0.08)", PCT)
    ws["F16"] = ("TRI suppose qu'on replace chaque flux au TRI lui-même — "
                 "27 % par an, indéfiniment. TRIM ne le suppose pas.")
    ws["F16"].font = Faide

    # ── Le tableau d'amortissement ───────────────────────────────────
    ws = wb.create_sheet("EMPRUNT")
    larg(ws, [10, 16, 16, 16, 16, 18, 18])
    ws["A1"] = "Emprunt d'équipement — 150 000 USD sur 5 ans"
    ws["A1"].font = Ftitre
    ws["A2"] = ("Taux nominal annuel 11,5 %, remboursement mensuel constant. "
                "Le tableau se construit en une seule ligne, tirée vers le bas.")
    ws["A2"].font = Faide
    for k, (lib, v, fmt) in enumerate(
            [("Capital emprunté", EMPRUNT, USD0),
             ("Taux annuel", TAUX_AN, PCT),
             ("Durée en mois", MOIS, INT)], start=4):
        ws.cell(k, 6, lib).font = Fgras
        saisie(ws.cell(k, 7), v, fmt)
    ws["F8"] = "Taux mensuel"; ws["F8"].font = Fgras
    calcul(ws["G8"], "=$G$5/12", "0.0000%")
    ws["F9"] = "Mensualité (VPM)"; ws["F9"].font = Fgras
    calcul(ws["G9"], "=-PMT($G$8,$G$6,$G$4)", USD)
    ws["F10"] = "Coût total du crédit"; ws["F10"].font = Fgras
    calcul(ws["G10"], "=$G$9*$G$6-$G$4", USD0)
    ws["F11"] = "Intérêts de la 1re année"; ws["F11"].font = Fgras
    calcul(ws["G11"], "=-CUMIPMT($G$8,$G$6,$G$4,1,12,0)", USD0)
    entete(ws, ["Mois", "Capital dû", "Mensualité", "Intérêts",
                "Capital remboursé", "Capital restant"], ligne=13)
    for k in range(14, 14 + MOIS):
        m = k - 13
        ws.cell(k, 1, m).border = Bord
        calcul(ws.cell(k, 2), "=$G$4" if m == 1 else f"=F{k-1}", USD)
        calcul(ws.cell(k, 3), "=$G$9", USD)
        calcul(ws.cell(k, 4), f"=-IPMT($G$8,A{k},$G$6,$G$4)", USD)
        calcul(ws.cell(k, 5), f"=-PPMT($G$8,A{k},$G$6,$G$4)", USD)
        calcul(ws.cell(k, 6), f"=B{k}-E{k}", USD)
    ws.cell(14 + MOIS, 1, "Contrôle").font = Fgras
    calcul(ws.cell(14 + MOIS, 6),
           f"=ROUND(F{13+MOIS},2)", USD)
    ws.cell(14 + MOIS, 7, "doit valoir 0,00 : le capital restant au dernier "
                          "mois").font = Faide

    # ── Le seuil de rentabilité ──────────────────────────────────────
    ws = wb.create_sheet("SEUIL")
    larg(ws, [30, 18, 18, 18, 46])
    ws["A1"] = "Le seuil de rentabilité, calculé puis représenté"
    ws["A1"].font = Ftitre
    ws["A2"] = ("Le point où la droite des produits croise celle des charges. "
                "Un graphique en nuage de points, pas en barres.")
    ws["A2"].font = Faide
    for k, (lib, v, fmt) in enumerate(
            [("Prix de vente unitaire", PRIX, USD),
             ("Coût variable unitaire", COUT, USD),
             ("Charges fixes du mois", FIXES, USD0)], start=4):
        ws.cell(k, 1, lib).font = Fgras
        saisie(ws.cell(k, 2), v, fmt)
    ws["A8"] = "Marge sur coût variable"; ws["A8"].font = Fgras
    calcul(ws["B8"], "=B4-B5", USD)
    ws["A9"] = "Seuil en unités"; ws["A9"].font = Fgras
    calcul(ws["B9"], "=ROUNDUP(B6/B8,0)", INT)
    ws["A10"] = "Seuil en chiffre d'affaires"; ws["A10"].font = Fgras
    calcul(ws["B10"], "=B9*B4", USD0)
    ws["A11"] = "Marge de sécurité au volume actuel"; ws["A11"].font = Fgras
    saisie(ws["C11"], VOL, INT)
    calcul(ws["B11"], "=C11/B9-1", PCT)
    entete(ws, ["Volume", "Produits", "Charges totales", "Résultat"], ligne=14)
    for k, v in enumerate([0, 2000, 4000, 6000, 8000, 10000, 12000], start=15):
        saisie(ws.cell(k, 1), v, INT)
        calcul(ws.cell(k, 2), f"=A{k}*$B$4", USD0)
        calcul(ws.cell(k, 3), f"=$B$6+A{k}*$B$5", USD0)
        calcul(ws.cell(k, 4), f"=B{k}-C{k}", USD0)

    # ── Le Solveur ───────────────────────────────────────────────────
    ws = wb.create_sheet("SOLVEUR")
    larg(ws, [16, 18, 14, 16, 18, 20, 48])
    ws["A1"] = "Répartir 24 000 unités entre six agences"; ws["A1"].font = Ftitre
    ws["A2"] = ("Objectif : la marge totale, maximale. Variables : la colonne "
                "« À livrer ». Contraintes : ni plus que la capacité, ni moins "
                "que le service minimum, et la somme égale au stock.")
    ws["A2"].font = Faide
    entete(ws, ["Agence", "Marge unitaire", "Capacité", "Minimum",
                "À livrer", "Marge obtenue"], ligne=4)
    for k, (a, m, cap, mini) in enumerate(AGENCES_SOLVEUR, start=5):
        ws.cell(k, 1, a).border = Bord
        saisie(ws.cell(k, 2), m, USD)
        saisie(ws.cell(k, 3), cap, INT)
        saisie(ws.cell(k, 4), mini, INT)
        c = ws.cell(k, 5); c.fill, c.border, c.number_format = Rjaune, Bord, INT
        c.value = mini          # un point de départ admissible
        calcul(ws.cell(k, 6), f"=E{k}*B{k}", USD0)
    r = 5 + len(AGENCES_SOLVEUR)
    ws.cell(r, 1, "Total").font = Fgras
    calcul(ws.cell(r, 5), f"=SUM(E5:E{r-1})", INT)
    calcul(ws.cell(r, 6), f"=SUM(F5:F{r-1})", USD0)
    ws.cell(r + 2, 1, "Stock disponible").font = Fgras
    saisie(ws.cell(r + 2, 2), STOCK, INT)
    ws.cell(r + 3, 1, "Écart à répartir").font = Fgras
    calcul(ws.cell(r + 3, 2), f"=B{r+2}-E{r}", INT)
    ws.cell(r + 3, 3, "doit valoir 0 quand le Solveur a fini").font = Faide
    ws.cell(r + 5, 1, "Ce qu'il faut dire au Solveur").font = Fgras
    for k, t in enumerate([
        f"Objectif :  $F${r}  →  Max",
        "Variables :  $E$5:$E$10",
        "Contraintes :  $E$5:$E$10 ≤ $C$5:$C$10   (capacité)",
        "                     $E$5:$E$10 ≥ $D$5:$D$10   (service minimum)",
        f"                     $E${r} = $B${r+2}                   (tout le stock)",
        "Méthode :  Simplexe PL — le problème est linéaire",
        "Cocher « Rendre les variables sans contrainte non négatives »",
    ], start=r + 6):
        ws.cell(k, 1, t).font = Fgras if k == r + 6 else Fnoir

    alloc, marge, reste = optimum_solveur()
    ws = wb.create_sheet("ATTENDU")
    larg(ws, [46, 20, 52])
    ws["A1"] = "Ce que vous devez trouver"; ws["A1"].font = Ftitre
    entete(ws, ["Ce qu'on cherche", "Valeur", "Comment la lire"], ligne=4)
    att = [("VAN fausse — toute la plage dans VAN()",
            round(sum(f / (1 + ACTUALISATION) ** (k + 1)
                      for k, f in enumerate(FLUX_PROJET)), 2), USD0,
            "exactement la VAN juste divisée par 1,14"),
           ("VAN fausse — investissement oublié",
            round(sum(f / (1 + ACTUALISATION) ** k
                      for k, f in enumerate(FLUX_PROJET) if k > 0), 2), USD0,
            "320 000 USD de trop : celle-là se voit"),
           ("VAN juste", round(van_projet(), 2), USD0, "la bonne"),
           ("TRI annuel", round(tri_projet(), 6), PCT, "sur la plage entière"),
           ("Mensualité de l'emprunt", round(mensualite(), 2), USD,
            "VPM rend un nombre négatif : c'est une sortie de trésorerie"),
           ("Coût total du crédit", round(mensualite() * MOIS - EMPRUNT, 2), USD0,
            "60 mensualités moins le capital"),
           ("Seuil de rentabilité", int(-(-FIXES // (PRIX - COUT))), INT,
            "en unités par mois"),
           ("Marge optimale du Solveur", round(marge, 2), USD0,
            "à comparer avec la répartition ci-dessous")]
    for k, (lib, v, fmt, quoi) in enumerate(att, start=5):
        ws.cell(k, 1, lib).border = Bord
        c = ws.cell(k, 2, v); c.number_format, c.border = fmt, Bord
        ws.cell(k, 3, quoi).font = Faide
    ws.cell(14, 1, "La répartition optimale").font = Ftitre
    entete(ws, ["Agence", "À livrer"], ligne=15)
    for k, (a, _m, _c, _mi) in enumerate(AGENCES_SOLVEUR, start=16):
        ws.cell(k, 1, a).border = Bord
        c = ws.cell(k, 2, alloc[a]); c.number_format, c.border = INT, Bord
    ws.cell(23, 1, "Pourquoi Douala reste au minimum").font = Fgras
    ws.cell(24, 1, "Sa marge unitaire est la plus faible des six. Le Solveur "
                   "ne « punit » personne : il constate qu'un carton envoyé à "
                   "Douala rapporte 0,60 USD de moins que le même carton "
                   "envoyé à Abidjan.").alignment = Alignment(wrap_text=True)
    ws.merge_cells("A24:C27")

    REF["van_juste"] = round(van_projet(), 2)
    REF["tri_projet"] = round(tri_projet(), 6)
    REF["mensualite"] = round(mensualite(), 2)
    REF["solveur_marge"] = round(marge, 2)
    REF["solveur_alloc"] = alloc
    wb.save(RACINE / "M09_L02_FINANCE.xlsx")
    print("  M09_L02_FINANCE.xlsx")

classeur_l02()

# ══════════════════════════════════════════════════════════════════════
#  3 · M09_L03_GABARIT.xlsx — l'architecture, vide et prête
# ══════════════════════════════════════════════════════════════════════
README_ENTREES = [
 "À quoi sert ce classeur", "Qui l'a produit, et quand", "Les sources",
 "La règle des couleurs", "Définition de chaque KPI",
 "Comment actualiser ce classeur", "Ce que ce modèle ne dit pas",
 "Journal des versions",
]
CONTROLES_TYPE = [
 ("Le détail et la synthèse tombent-ils d'accord ?",
  "=ROUND(SUM(detail)-SUM(synthese),2)", "doit valoir 0"),
 ("Reste-t-il des doublons de clé ?",
  '=SUMPRODUCT((COUNTIF(cles,cles)>1)*1)', "doit valoir 0"),
 ("Des valeurs en dur hors HYPOTHESES ?",
  '=SUMPRODUCT((zone<>"")*NOT(ISFORMULE(zone)))', "doit valoir 0"),
 ("Des cellules d'erreur dans le modèle ?",
  "=SUMPRODUCT(ISERROR(zone)*1)", "doit valoir 0"),
 ("La période couverte est-elle complète ?",
  "=MAX(dates)-MIN(dates)+1-COUNT(dates)", "doit valoir 0 si un jour par ligne"),
 ("Le total est-il stable depuis la dernière version ?",
  "=ROUND(total_actuel-total_precedent,2)", "à commenter, pas forcément 0"),
]

def classeur_l03():
    wb = openpyxl.Workbook(); wb.remove(wb.active)

    ws = wb.create_sheet("README")
    larg(ws, [30, 96])
    ws["A1"] = "README — à remplir avant d'envoyer quoi que ce soit"
    ws["A1"].font = Ftitre
    ws["A2"] = ("Huit rubriques. Si l'une reste vide, le classeur n'est pas "
                "reproductible, et vous serez le seul à savoir le faire tourner.")
    ws["A2"].font = Faide
    for k, t in enumerate(README_ENTREES, start=4):
        c = ws.cell(k, 1, t); c.font, c.border = Fgras, Bord
        d = ws.cell(k, 2); d.fill, d.border = Rjaune, Bord
        d.alignment = Alignment(wrap_text=True, vertical="top")
        ws.row_dimensions[k].height = 42

    ws = wb.create_sheet("HYPOTHESES")
    larg(ws, [26, 18, 70])
    ws["A1"] = "HYPOTHESES — la seule feuille où l'on tape"; ws["A1"].font = Ftitre
    entete(ws, ["Code", "Valeur", "Ce que c'est"], ligne=4)
    for k in range(5, 20):
        ws.cell(k, 1).border = Bord
        c = ws.cell(k, 2); c.fill, c.border, c.font = Rbleu, Bord, Fbleu
        c.protection = Protection(locked=False)
        ws.cell(k, 3).border = Bord
    ws["A22"] = "La convention de couleurs"; ws["A22"].font = Ftitre
    legende = [("Bleu", Fbleu, "une saisie — et elles sont toutes sur cette feuille"),
               ("Noir", Fnoir, "une formule"),
               ("Vert", Fvert, "un lien vers une autre feuille du même classeur"),
               ("Rouge", Frouge, "un lien vers un AUTRE classeur — à éviter, "
                                 "et à justifier quand il y en a un")]
    for k, (nom, police, quoi) in enumerate(legende, start=23):
        c = ws.cell(k, 1, nom); c.font = police
        ws.cell(k, 3, quoi).font = Faide
    ws["A28"] = ("Elle est universelle en modélisation financière, et inconnue "
                 "partout ailleurs. Elle transforme la relecture : une cellule "
                 "bleue hors de cette feuille se voit à l'œil nu.")
    ws["A28"].font = Faide

    for nom, titre, aide in [
        ("RAW", "RAW — les données sources, intactes",
         "On copie, on ne corrige pas. Si la source est fausse, elle reste "
         "fausse ici, et on le note dans README."),
        ("CLEAN", "CLEAN — les mêmes, exploitables",
         "Types corrigés, colonnes renommées, doublons traités. Une "
         "transformation par colonne, et toutes documentées."),
        ("CALCULS", "CALCULS — la mécanique",
         "Aucune saisie. Que des formules, qui descendent de HYPOTHESES "
         "et de CLEAN."),
        ("ANALYSE", "ANALYSE — les scénarios et les sensibilités",
         "Tables de données, scénarios, Solveur. C'est ici qu'on répond "
         "aux « et si »."),
        ("DASHBOARD", "DASHBOARD — une page, pas deux",
         "Ce que la direction lit. Rien qui ne soit pas décidable."),
    ]:
        ws = wb.create_sheet(nom)
        larg(ws, [110])
        ws["A1"] = titre; ws["A1"].font = Ftitre
        ws["A2"] = aide; ws["A2"].font = Faide
        ws["A2"].alignment = Alignment(wrap_text=True)
        ws.row_dimensions[2].height = 34

    ws = wb.create_sheet("QUALITE")
    larg(ws, [52, 20, 44, 40])
    ws["A1"] = "QUALITE — six contrôles à recopier dans tous vos modèles"
    ws["A1"].font = Ftitre
    ws["A2"] = ("Les noms entre parenthèses sont à remplacer par vos plages. "
                "Un contrôle qui ne passe pas interdit l'envoi.")
    ws["A2"].font = Faide
    entete(ws, ["Contrôle", "Valeur", "La formule type", "Ce qu'on attend"],
           ligne=4)
    for k, (lib, f, att) in enumerate(CONTROLES_TYPE, start=5):
        ws.cell(k, 1, lib).border = Bord
        c = ws.cell(k, 2); c.fill, c.border = Rjaune, Bord
        c.protection = Protection(locked=False)
        ws.cell(k, 3, f).font = Font(name="Consolas", size=10)
        ws.cell(k, 4, att).font = Faide

    #  La feuille « très masquée » : invisible même dans le menu Afficher.
    #  On ne la retrouve que par la fenêtre VBA, ou par ce README.
    ws = wb.create_sheet("_MOTEUR")
    larg(ws, [100])
    ws["A1"] = "Cette feuille est masquée « très fort » (xlSheetVeryHidden)."
    ws["A1"].font = Ftitre
    ws["A3"] = ("Vous ne la voyez pas dans Format > Feuille > Afficher : ce menu "
                "ne liste que les feuilles simplement masquées. Pour la faire "
                "revenir : Outils > Macro > Éditeur Visual Basic, sélectionner "
                "la feuille dans l'explorateur de projet, propriété Visible → "
                "-1 xlSheetVisible.")
    ws["A3"].alignment = Alignment(wrap_text=True)
    ws.row_dimensions[3].height = 64
    ws["A6"] = ("C'est utile pour ranger des paramètres techniques. C'est "
                "dangereux pour ranger des données : le jour où vous partez, "
                "personne ne sait qu'elle existe. D'où la ligne dans README.")
    ws["A6"].alignment = Alignment(wrap_text=True)
    ws.row_dimensions[6].height = 48
    ws.sheet_state = "veryHidden"

    #  On protège HYPOTHESES et QUALITE : les cellules de saisie ont été
    #  déverrouillées une à une plus haut, tout le reste est figé.
    #  Sans mot de passe : on empêche l'accident, on n'enferme personne.
    for nom in ("HYPOTHESES", "QUALITE"):
        p = wb[nom].protection
        p.sheet = True
        p.selectLockedCells = False
        p.formatCells = False
    wb.security = openpyxl.workbook.protection.WorkbookProtection(
        lockStructure=True)
    wb.save(RACINE / "M09_L03_GABARIT.xlsx")
    print("  M09_L03_GABARIT.xlsx")

classeur_l03()
json.dump(REF, open(RACINE / "REFERENCES_M09_LECONS.json", "w"),
          indent=1, ensure_ascii=False)
print("  REFERENCES_M09_LECONS.json")
for k, v in REF.items():
    if not isinstance(v, dict): print(f"    {k:<18} {v}")

#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════
#  Données du module 6 — la synthèse mensuelle, et le rapport illisible
#
#  On ne régénère rien : on agrège le fichier du module 5, ligne à
#  ligne. Les chiffres du tableau de bord doivent être exactement ceux
#  que le comité de jeudi a vus, sinon les deux modules se contredisent.
# ══════════════════════════════════════════════════════════════════════
import datetime as dt, pathlib, sys, json, random
from collections import defaultdict
import openpyxl

SRC = pathlib.Path("sortie-m05/J05_Ventes_24_mois.xlsx")
RACINE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "sortie-m06")
RACINE.mkdir(parents=True, exist_ok=True)

EXERCICE = dt.date(2025, 10, 1)
AGENCES = ["Kinshasa", "Lubumbashi", "Abidjan", "Dakar", "Douala", "Libreville"]
DEVISE = {"Kinshasa": "CDF", "Lubumbashi": "CDF", "Abidjan": "XOF",
          "Dakar": "XOF", "Douala": "XAF", "Libreville": "XAF"}

#  Taux de marge par famille — ils viennent de la comptabilité, pas des
#  ventes. Fixes, documentés, et c'est ce qui rend la marge reproductible.
MARGE = {"Huiles": 0.172, "Riz": 0.118, "Farine": 0.143, "Boissons": 0.221,
         "Savons": 0.264, "Conserves": 0.195,
         "Hygiène & entretien": 0.264, "Épicerie sèche": 0.195}

print("lecture du fichier des 24 mois…")
wb = openpyxl.load_workbook(SRC, read_only=True, data_only=True)
ws = wb["Ventes"]
it = ws.iter_rows(values_only=True)
entetes = next(it)
col = {n: i for i, n in enumerate(entetes)}

cell = defaultdict(lambda: {"ca": 0.0, "qte": 0, "marge": 0.0,
                            "cmd": set(), "cli": set()})
mois_ag = defaultdict(lambda: {"ca": 0.0, "marge": 0.0, "cmd": set(), "cli": set()})
n = 0
for r in it:
    d = r[col["Date_Vente"]]
    d = d.date() if hasattr(d, "date") else d
    if d < EXERCICE:
        continue
    n += 1
    m = dt.date(d.year, d.month, 1)
    ag, fam = r[col["Agence"]], r[col["Famille"]]
    usd, qte = float(r[col["Montant_USD"]]), int(r[col["Quantite"]])
    cmd, cli = r[col["N_Commande"]], r[col["Client"]]
    k = (m, ag, fam)
    c = cell[k]
    c["ca"] += usd; c["qte"] += qte; c["marge"] += usd * MARGE[fam]
    c["cmd"].add(cmd); c["cli"].add(cli)
    a = mois_ag[(m, ag)]
    a["ca"] += usd; a["marge"] += usd * MARGE[fam]
    a["cmd"].add(cmd); a["cli"].add(cli)
wb.close()
print(f"  {n:,} lignes de l'exercice agrégées en {len(cell)} cellules".replace(",", " "))

MOIS = sorted({k[0] for k in cell})
synthese = []
for (m, ag, fam) in sorted(cell, key=lambda k: (k[0], AGENCES.index(k[1]), k[2])):
    c = cell[(m, ag, fam)]
    synthese.append({
        "mois": m, "agence": ag, "devise": DEVISE[ag], "famille": fam,
        "ca": round(c["ca"], 2), "qte": c["qte"], "marge": round(c["marge"], 2),
        "lignes": len(c["cmd"]),      # lignes de commande — additif
    })

#  Un nombre de commandes distinctes n'est PAS additif : une commande qui
#  porte trois familles serait comptée trois fois. Il vit donc à la maille
#  (mois, agence), dans sa propre table, et jamais dans la synthèse.
activite = []
for m in MOIS:
    for ag in AGENCES:
        a = mois_ag[(m, ag)]
        activite.append({"mois": m, "agence": ag,
                         "cmd": len(a["cmd"]), "cli": len(a["cli"])})

CA_TOTAL = round(sum(s["ca"] for s in synthese), 2)
print(f"  CA de l'exercice : {CA_TOTAL:,.2f} USD".replace(",", " "))

# ══ 2 · Les objectifs ═════════════════════════════════════════════════
#  Un objectif est toujours un nombre rond : il sort d'une négociation,
#  pas d'un calcul. On le construit à partir du réel et d'un taux
#  d'atteinte visé par agence — c'est ce taux qui fabrique l'agence en
#  difficulté, et elle doit se voir en huit secondes.
random.seed(606)
ATTEINTE = {"Kinshasa": 1.012, "Lubumbashi": 0.883, "Abidjan": 1.081,
            "Dakar": 1.004, "Douala": 0.978, "Libreville": 1.021}

ca_mois_ag = {k: v["ca"] for k, v in mois_ag.items()}
objectifs = {}
for ag in AGENCES:
    for m in MOIS:
        reel = ca_mois_ag[(m, ag)]
        vise = ATTEINTE[ag] * random.uniform(0.96, 1.04)
        objectifs[(m, ag)] = round(reel / vise / 5000) * 5000

# ══ 3 · Les valeurs de référence ══════════════════════════════════════
COURANT = MOIS[-1]          # septembre 2026
PRECED = MOIS[-2]           # août 2026

def somme(f, cle="ca"):
    return round(sum(s[cle] for s in synthese if f(s)), 2)

R = {"mois_courant": COURANT.isoformat(), "lignes_synthese": len(synthese)}
R["ca_courant"] = somme(lambda s: s["mois"] == COURANT)
R["ca_precedent"] = somme(lambda s: s["mois"] == PRECED)
R["ca_cumul"] = CA_TOTAL
R["objectif_courant"] = sum(objectifs[(COURANT, a)] for a in AGENCES)
R["atteinte_courant"] = round(R["ca_courant"] / R["objectif_courant"], 6)
R["var_m1"] = round(R["ca_courant"] / R["ca_precedent"] - 1, 6)
R["marge_courant"] = round(somme(lambda s: s["mois"] == COURANT, "marge")
                           / R["ca_courant"], 6)
R["commandes_courant"] = sum(a["cmd"] for a in activite if a["mois"] == COURANT)
R["clients_courant"] = sum(a["cli"] for a in activite if a["mois"] == COURANT)
R["panier_courant"] = round(R["ca_courant"] / R["commandes_courant"], 2)

par_agence = {}
for ag in AGENCES:
    ca = somme(lambda s, a=ag: s["mois"] == COURANT and s["agence"] == a)
    ob = objectifs[(COURANT, ag)]
    par_agence[ag] = {"ca": ca, "objectif": ob, "ecart": round(ca - ob, 2),
                      "atteinte": round(ca / ob, 6)}
R["par_agence_courant"] = par_agence
alerte = min(par_agence, key=lambda a: par_agence[a]["atteinte"])
R["agence_alerte"] = alerte
R["ecart_alerte"] = par_agence[alerte]["ecart"]
R["atteinte_alerte"] = par_agence[alerte]["atteinte"]

fam = defaultdict(float)
for s in synthese:
    if s["mois"] == COURANT:
        fam[s["famille"]] += s["ca"]
R["famille_top"] = max(fam, key=fam.get)
R["ca_par_famille_courant"] = {f: round(v, 2) for f, v in
                               sorted(fam.items(), key=lambda x: -x[1])}
R["ca_par_mois"] = {m.isoformat(): somme(lambda s, x=m: s["mois"] == x) for m in MOIS}
R["marge_par_mois"] = {m.isoformat(): somme(lambda s, x=m: s["mois"] == x, "marge")
                       for m in MOIS}

json.dump(R, open(RACINE / "REFERENCES_M06.json", "w"), indent=1, ensure_ascii=False)
for k in ("mois_courant", "lignes_synthese", "ca_courant", "objectif_courant",
          "atteinte_courant", "var_m1", "marge_courant", "ca_cumul",
          "commandes_courant", "clients_courant", "panier_courant", "agence_alerte",
          "ecart_alerte", "atteinte_alerte", "famille_top"):
    print(f"  {k:<20} {R[k]}")
print("  atteintes ", {a: round(v["atteinte"] * 100, 1) for a, v in
                       sorted(par_agence.items(), key=lambda x: x[1]["atteinte"])})

# ══ 4 · Les styles ════════════════════════════════════════════════════
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.chart import BarChart, LineChart, PieChart, Reference, Series
from openpyxl.chart.label import DataLabelList
from openpyxl.drawing.fill import PatternFillProperties
from openpyxl.chart.shapes import GraphicalProperties
from openpyxl.formatting.rule import (DataBarRule, ColorScaleRule,
                                      IconSetRule, FormulaRule, CellIsRule)

Ftitre  = Font(name="Calibri", size=14, bold=True, color="FF101418")
Fentete = Font(name="Calibri", size=11, bold=True, color="FFFFFFFF")
Faide   = Font(name="Calibri", size=10, italic=True, color="FF6B7280")
Fgras   = Font(name="Calibri", size=11, bold=True)
Rentete = PatternFill("solid", fgColor="FF243044")
Rjaune  = PatternFill("solid", fgColor="FFFFF6D8")
Rvert   = PatternFill("solid", fgColor="FFE8F6EE")
Bord    = Border(bottom=Side(style="thin", color="FFD6DBE1"))

def remplir(coul):
    """Un remplissage de mise en forme conditionnelle.

    Dans un format différentiel, c'est bgColor qui peint. Un
    PatternFill("solid", fgColor=…) — celui qu'on écrit partout
    ailleurs — ne produit rien du tout, et sans erreur."""
    return PatternFill(patternType="solid", bgColor=coul)

FMT_USD  = '#,##0.00\\ "USD"'
FMT_USD0 = '#,##0\\ "USD"'
FMT_MUSD = '#,##0.00,,\\ "M USD"'
FMT_DATE = "mmm\\ yyyy"
FMT_PCT  = "0.0%"
FMT_INT  = "#,##0"

import zipfile, shutil, re as _re

def reparer_formats(chemin):
    """openpyxl oublie sourceLinked=0 : Excel reprend alors le format de
    la cellule source et affiche « 4998123,120 USD » sur une étiquette
    qu'on voulait en « 5,00 M ». On le rajoute après coup."""
    chemin = pathlib.Path(chemin)
    tmp = chemin.with_suffix(".tmp.xlsx")
    n = 0
    with zipfile.ZipFile(chemin) as zin, zipfile.ZipFile(
            tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for it in zin.infolist():
            data = zin.read(it.filename)
            if it.filename.startswith("xl/charts/chart"):
                txt = data.decode("utf-8")
                txt, k = _re.subn(r'(<(?:c:)?numFmt formatCode="[^"]*")\s*/>',
                                  r'\1 sourceLinked="0"/>', txt)
                n += k
                data = txt.encode("utf-8")
            zout.writestr(it, data)
    shutil.move(tmp, chemin)
    return n


def entete(ws, cols, ligne=1, depart=1):
    for i, c in enumerate(cols, start=depart):
        cel = ws.cell(ligne, i, c)
        cel.font, cel.fill = Fentete, Rentete
        cel.alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[ligne].height = 22

def colonnes(ws, specs, depart=1):
    for i, (w, fmt) in enumerate(specs, start=depart):
        d = ws.column_dimensions[get_column_letter(i)]
        d.width = w
        if fmt:
            d.number_format = fmt

def tableau(ws, nom, ref):
    t = Table(displayName=nom, ref=ref)
    t.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
    ws.add_table(t)

# ══ 5 · Le fichier de synthèse ════════════════════════════════════════
COLS_S = ["Mois", "Agence", "Devise", "Famille", "CA_USD", "Quantite",
          "Marge_USD", "Nb_Lignes"]
COLS_A = ["Mois", "Agence", "Objectif_USD", "Nb_Commandes", "Nb_Clients"]

def feuille_synthese(wb):
    ws = wb.create_sheet("Synthese")
    colonnes(ws, [(12, FMT_DATE), (14, None), (8, None), (20, None),
                  (15, FMT_USD), (11, FMT_INT), (14, FMT_USD), (11, FMT_INT)])
    entete(ws, COLS_S)
    for i, s in enumerate(synthese, start=2):
        for j, v in enumerate([s["mois"], s["agence"], s["devise"], s["famille"],
                               s["ca"], s["qte"], s["marge"], s["lignes"]], start=1):
            ws.cell(i, j, v)
    ws.freeze_panes = "A2"
    tableau(ws, "t_Synth", f"A1:H{len(synthese)+1}")
    return ws

def feuille_agence(wb):
    ws = wb.create_sheet("Agences")
    colonnes(ws, [(12, FMT_DATE), (14, None), (15, FMT_USD0), (14, FMT_INT), (12, FMT_INT)])
    entete(ws, COLS_A)
    for i, a in enumerate(activite, start=2):
        for j, v in enumerate([a["mois"], a["agence"], objectifs[(a["mois"], a["agence"])],
                               a["cmd"], a["cli"]], start=1):
            ws.cell(i, j, v)
    ws.freeze_panes = "A2"
    tableau(ws, "t_Agence", f"A1:E{len(activite)+1}")
    return ws

wb = openpyxl.Workbook(); wb.remove(wb.active)
feuille_synthese(wb); feuille_agence(wb)
ws = wb.create_sheet("LISEZ_MOI")
ws.column_dimensions["A"].width = 24
ws.column_dimensions["B"].width = 96
ws["A1"] = "J06 — Synthèse mensuelle BAOBAB"; ws["A1"].font = Ftitre
notes = [
 ("Source", "J05_Ventes_24_mois.xlsx, agrégé — 62 402 lignes de l'exercice"),
 ("Période", "1er octobre 2025 → 30 septembre 2026"),
 ("t_Synth", "434 lignes, à la maille mois × agence × famille"),
 ("t_Agence", "72 lignes, à la maille mois × agence"),
 ("Pourquoi deux tables",
  "Le nombre de commandes distinctes n'est PAS additif : une commande qui porte "
  "trois familles serait comptée trois fois si elle vivait dans t_Synth. "
  "Il vit donc à la maille mois × agence, où il est juste."),
 ("Ce qui est additif", "CA_USD, Quantite, Marge_USD, Nb_Lignes, Objectif_USD"),
 ("Ce qui ne l'est pas", "Nb_Clients entre agences — un client peut acheter dans deux."),
 ("Taux de marge", "fixes par famille, fournis par la comptabilité, documentés dans le module"),
]
for i, (k, v) in enumerate(notes, start=3):
    c = ws.cell(i, 1, k); c.font, c.border = Fgras, Bord
    d = ws.cell(i, 2, v); d.border = Bord
    d.alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[i].height = 30
wb.save(RACINE / "J06_Synthese_Mensuelle.xlsx")
print("  J06_Synthese_Mensuelle.xlsx")

# ══ 6 · Le rapport mensuel actuel — celui que personne ne lit ═════════
#  Ce fichier est la pièce centrale du module. Il doit être mauvais de
#  façon RECONNAISSABLE : c'est le rapport que le public produit déjà.
#  Chaque défaut est délibéré et listé dans la leçon.
ARCENCIEL = ["FFFF0000", "FF00B0F0", "FF92D050", "FFFFC000", "FF7030A0",
             "FFFF00FF", "FF00B050", "FFFF6600", "FF0070C0", "FFC00000",
             "FF00FFFF", "FFFFFF00", "FF808080", "FF002060"]

def rapport_illisible(ws=None):
    wb = None
    if ws is None:
        wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Rapport"
    ws.merge_cells("A1:L1")
    ws["A1"] = "TABLEAU DE BORD"
    ws["A1"].font = Font(name="Arial", size=22, bold=True, color="FF0070C0")
    ws["A1"].alignment = Alignment(horizontal="center")
    ws["A1"].fill = PatternFill("solid", fgColor="FFFFFF00")
    ws.merge_cells("A2:L2")
    ws["A2"] = ("GROUPE BAOBAB SARL - DIRECTION GENERALE - DOCUMENT INTERNE - "
                "NE PAS DIFFUSER - EDITION DU 01/10/2026")
    ws["A2"].font = Font(name="Arial", size=9, italic=True, color="FFFF0000")
    ws["A2"].alignment = Alignment(horizontal="center")

    #  Les quatorze indicateurs, tous de la même taille, sans hiérarchie,
    #  sans unité, et à la précision de la machine.
    marge_tot = round(sum(s["marge"] for s in synthese), 2)
    kpis = [
        ("CA TOTAL", CA_TOTAL),
        ("CA SEPT", R["ca_courant"]),
        ("CA AOUT", R["ca_precedent"]),
        ("OBJECTIF", R["objectif_courant"]),
        ("ECART OBJ", round(R["ca_courant"] - R["objectif_courant"], 2)),
        ("TX REALIS", R["atteinte_courant"]),
        ("MARGE TOT", marge_tot),
        ("TX MARGE", R["marge_courant"]),
        ("NB CDE", R["commandes_courant"]),
        ("NB CLI", R["clients_courant"]),
        ("PANIER MOY", R["panier_courant"]),
        ("QTE TOT", sum(s["qte"] for s in synthese)),
        ("NB LIGNES", sum(s["lignes"] for s in synthese)),
        ("CA MOY MENS", round(CA_TOTAL / 12, 2)),
    ]
    for k, (lib, val) in enumerate(kpis):
        col = 1 + (k % 7) * 2
        lig = 4 + (k // 7) * 2
        c = ws.cell(lig, col, lib)
        c.font = Font(name="Arial", size=9, bold=True, color="FFFFFFFF")
        c.fill = PatternFill("solid", fgColor=ARCENCIEL[k])
        v = ws.cell(lig + 1, col, val)
        v.font = Font(name="Arial", size=9)
        v.fill = PatternFill("solid", fgColor="FFF2F2F2")
        ws.merge_cells(start_row=lig, start_column=col, end_row=lig, end_column=col + 1)
        ws.merge_cells(start_row=lig + 1, start_column=col, end_row=lig + 1, end_column=col + 1)

    #  Le tableau : douze mois, six agences, aucun format, aucun total
    #  mis en avant, et les mois en colonnes parce que « ça tient mieux ».
    dep = 9
    ws.cell(dep, 1, "AGENCE").font = Font(name="Arial", size=9, bold=True)
    for j, m in enumerate(MOIS):
        c = ws.cell(dep, 2 + j, m)
        c.number_format = "mm/yy"
        c.font = Font(name="Arial", size=9, bold=True)
    for i, ag in enumerate(AGENCES):
        ws.cell(dep + 1 + i, 1, ag).font = Font(name="Arial", size=9)
        for j, m in enumerate(MOIS):
            c = ws.cell(dep + 1 + i, 2 + j, round(ca_mois_ag[(m, ag)], 6))
            c.font = Font(name="Arial", size=9)
    lt = dep + 1 + len(AGENCES)
    ws.cell(lt, 1, "TOTAL").font = Font(name="Arial", size=9)
    for j, m in enumerate(MOIS):
        ws.cell(lt, 2 + j, round(sum(ca_mois_ag[(m, a)] for a in AGENCES), 6)).font = \
            Font(name="Arial", size=9)

    #  Les données des camemberts, posées à droite, visibles, en vrac
    dep2 = lt + 3
    ws.cell(dep2, 1, "REPARTITION AGENCE").font = Font(name="Arial", size=9, bold=True)
    for i, ag in enumerate(AGENCES):
        ws.cell(dep2 + 1 + i, 1, ag).font = Font(name="Arial", size=9)
        ws.cell(dep2 + 1 + i, 2, round(sum(ca_mois_ag[(m, ag)] for m in MOIS), 2))
    dep3 = dep2 + len(AGENCES) + 3
    familles = list(R["ca_par_famille_courant"])
    ws.cell(dep3, 1, "REPARTITION FAMILLE").font = Font(name="Arial", size=9, bold=True)
    for i, f in enumerate(familles):
        ws.cell(dep3 + 1 + i, 1, f).font = Font(name="Arial", size=9)
        ws.cell(dep3 + 1 + i, 2, R["ca_par_famille_courant"][f])

    #  Trois camemberts. Celui des familles a huit parts.
    p1 = PieChart(); p1.title = "Graphique 1"
    p1.add_data(Reference(ws, min_col=2, min_row=dep2 + 1, max_row=dep2 + len(AGENCES)),
                titles_from_data=False)
    p1.set_categories(Reference(ws, min_col=1, min_row=dep2 + 1, max_row=dep2 + len(AGENCES)))
    p1.height, p1.width = 7, 9
    ws.add_chart(p1, "A" + str(dep3 + len(familles) + 3))

    p2 = PieChart(); p2.title = "Graphique 2"
    p2.add_data(Reference(ws, min_col=2, min_row=dep3 + 1, max_row=dep3 + len(familles)),
                titles_from_data=False)
    p2.set_categories(Reference(ws, min_col=1, min_row=dep3 + 1, max_row=dep3 + len(familles)))
    p2.height, p2.width = 7, 9
    ws.add_chart(p2, "G" + str(dep3 + len(familles) + 3))

    p3 = PieChart(); p3.title = "Graphique 3"
    p3.add_data(Reference(ws, min_col=2, min_row=dep2 + 1, max_row=dep2 + 3),
                titles_from_data=False)
    p3.set_categories(Reference(ws, min_col=1, min_row=dep2 + 1, max_row=dep2 + 3))
    p3.height, p3.width = 7, 9
    ws.add_chart(p3, "M" + str(dep3 + len(familles) + 3))

    #  L'histogramme dont l'axe ne part pas de zéro.
    b = BarChart(); b.type = "col"; b.title = "Graphique 4"
    b.add_data(Reference(ws, min_col=2, min_row=lt, max_col=1 + len(MOIS), max_row=lt),
               from_rows=True, titles_from_data=False)
    b.set_categories(Reference(ws, min_col=2, min_row=dep, max_col=1 + len(MOIS), max_row=dep))
    b.y_axis.scaling.min = 1_800_000        # ← le mensonge
    b.y_axis.scaling.max = 2_600_000
    #  openpyxl supprime les axes par défaut : sans ces deux lignes,
    #  Excel n'affiche aucune graduation — et le mensonge de l'axe
    #  tronqué devient invisible, donc non enseignable.
    b.y_axis.delete = False
    b.x_axis.delete = False
    b.height, b.width = 7, 18
    ws.add_chart(b, "A" + str(dep3 + len(familles) + 19))

    for col, w in (("A", 20), ("B", 13)):
        ws.column_dimensions[col].width = w
    for j in range(3, 14):
        ws.column_dimensions[get_column_letter(j)].width = 13
    if wb is not None:
        wb.save(RACINE / "J06_Rapport_Mensuel_Actuel.xlsx")
        reparer_formats(RACINE / "J06_Rapport_Mensuel_Actuel.xlsx")
        print("  J06_Rapport_Mensuel_Actuel.xlsx")

rapport_illisible()

# ══ 7 · Soigner un graphique — le socle commun ═══════════════════════
#  openpyxl écrit des graphiques bruts : titre en surimpression, axes
#  supprimés, une couleur par barre pour une seule série, et le format
#  de la colonne recopié sur l'axe (« 3000000,0 USD »). Rien de tout
#  cela n'est acceptable dans un module qui enseigne la lisibilité.
from openpyxl.chart import ScatterChart
from openpyxl.chart.marker import Marker
from openpyxl.chart.text import RichText
from openpyxl.drawing.text import (Paragraph, ParagraphProperties,
                                   CharacterProperties, RichTextProperties)

MOIS_TXT = ["oct. 25", "nov. 25", "déc. 25", "janv. 26", "févr. 26", "mars 26",
            "avr. 26", "mai 26", "juin 26", "juil. 26", "août 26", "sept. 26"]

def soigner(c, titre=None, fmt_y="#,##0", fmt_x=None, legende=None, etiquettes=False):
    """Un graphique lisible : titre au-dessus, axes visibles, une couleur."""
    if titre is not None:
        c.title = titre
        try:
            c.title.overlay = False
        except AttributeError:
            pass
    c.varyColors = False
    c.y_axis.delete = False
    c.x_axis.delete = False
    if fmt_y:
        c.y_axis.numFmt = fmt_y
    if fmt_x:
        c.x_axis.numFmt = fmt_x
    c.y_axis.majorGridlines = None if etiquettes else c.y_axis.majorGridlines
    if legende is None:
        c.legend = None
    else:
        c.legend.position = legende
        c.legend.overlay = False
    if etiquettes:
        c.dLbls = DataLabelList()
        c.dLbls.numFmt = fmt_y
        c.dLbls.showVal = True
        c.dLbls.showSerName = False
        c.dLbls.showCatName = False
        c.dLbls.showLegendKey = False
        c.dLbls.showBubbleSize = False
        c.dLbls.showPercent = False
    return c

# ══ 7 · Leçon 1 — choisir le graphique selon la question ══════════════
from openpyxl.chart import ScatterChart
from openpyxl.chart.marker import Marker

CA_AG = {ag: round(sum(ca_mois_ag[(m, ag)] for m in MOIS), 2) for ag in AGENCES}
MARGE_AG = defaultdict(float)
for s in synthese:
    MARGE_AG[s["agence"]] += s["marge"]
MARGE_AG = {a: round(v, 2) for a, v in MARGE_AG.items()}
FAM_AN = defaultdict(float)
for s in synthese:
    FAM_AN[s["famille"]] += s["ca"]
FAM_AN = dict(sorted(((f, round(v, 2)) for f, v in FAM_AN.items()), key=lambda x: -x[1]))

def axes(c):
    c.y_axis.delete = False
    c.x_axis.delete = False
    return c

def lecon01(corrige):
    wb = openpyxl.Workbook(); wb.remove(wb.active)
    ws = wb.create_sheet("Donnees")
    ws["A1"] = "Quatre questions, quatre jeux de données"; ws["A1"].font = Ftitre

    # ① évolution — 12 mois
    ws["A3"] = "① ÉVOLUTION — comment ça bouge dans le temps"; ws["A3"].font = Fgras
    entete(ws, ["Mois", "CA_USD"], ligne=4)
    for i, m in enumerate(MOIS):
        ws.cell(5 + i, 1, MOIS_TXT[i])
        ws.cell(5 + i, 2, round(sum(ca_mois_ag[(m, a)] for a in AGENCES), 2)).number_format = FMT_USD0
    ws.column_dimensions["A"].width = 12
    ws.column_dimensions["B"].width = 15

    # ② comparaison — 6 agences, triées
    ws["D3"] = "② COMPARAISON — qui fait plus que qui"; ws["D3"].font = Fgras
    entete(ws, ["Agence", "CA_USD"], ligne=4, depart=4)
    for i, (ag, v) in enumerate(sorted(CA_AG.items(), key=lambda x: x[1]), start=5):
        ws.cell(i, 4, ag)
        ws.cell(i, 5, v).number_format = FMT_USD0
    ws.column_dimensions["D"].width = 15
    ws.column_dimensions["E"].width = 15

    # ③ composition — la matrice agence × famille
    ws["G3"] = "③ COMPOSITION — de quoi est fait le CA de chaque agence"
    ws["G3"].font = Fgras
    familles = list(FAM_AN)
    entete(ws, ["Agence"] + familles, ligne=4, depart=7)
    mat = defaultdict(float)
    for s_ in synthese:
        mat[(s_["agence"], s_["famille"])] += s_["ca"]
    for i, ag in enumerate(AGENCES, start=5):
        ws.cell(i, 7, ag)
        for j2, f in enumerate(familles):
            ws.cell(i, 8 + j2, round(mat[(ag, f)], 2)).number_format = FMT_USD0
    ws.column_dimensions["G"].width = 15
    for j2 in range(len(familles)):
        ws.column_dimensions[get_column_letter(8 + j2)].width = 15

    # ④ corrélation — CA vs marge par agence
    dep4 = 8 + len(familles) + 1
    ws.cell(3, dep4, "④ CORRÉLATION — est-ce que ça va ensemble").font = Fgras
    entete(ws, ["Agence", "CA_USD", "Marge_USD"], ligne=4, depart=dep4)
    for i, ag in enumerate(AGENCES, start=5):
        ws.cell(i, dep4, ag)
        ws.cell(i, dep4 + 1, CA_AG[ag]).number_format = FMT_USD0
        ws.cell(i, dep4 + 2, MARGE_AG[ag]).number_format = FMT_USD0
    for j2 in range(3):
        ws.column_dimensions[get_column_letter(dep4 + j2)].width = 15

    if corrige:
        wg = wb.create_sheet("Graphiques")
        wg.sheet_view.showGridLines = False
        wg["A1"] = "Le bon type, question par question"; wg["A1"].font = Ftitre

        l = LineChart()
        l.add_data(Reference(ws, min_col=2, min_row=4, max_row=16), titles_from_data=True)
        l.set_categories(Reference(ws, min_col=1, min_row=5, max_row=16))
        soigner(l, "Douze mois très stables — et un recul de 9,8 % en septembre",
                fmt_y='#,##0.00,," M"')
        l.height, l.width = 7.5, 15
        wg.add_chart(l, "A3")

        b = BarChart(); b.type = "bar"
        b.add_data(Reference(ws, min_col=5, min_row=4, max_row=10), titles_from_data=True)
        b.set_categories(Reference(ws, min_col=4, min_row=5, max_row=10))
        b.y_axis.scaling.min = 0
        soigner(b, "Kinshasa pèse deux fois et demie Libreville",
                fmt_y='#,##0.00,," M"', etiquettes=True)
        b.height, b.width = 7.5, 15
        wg.add_chart(b, "M3")

        e = BarChart(); e.type = "bar"; e.grouping = "percentStacked"; e.overlap = 100
        e.add_data(Reference(ws, min_col=8, min_row=4,
                             max_col=7 + len(familles), max_row=10),
                   titles_from_data=True)
        e.set_categories(Reference(ws, min_col=7, min_row=5, max_row=10))
        soigner(e, "Douala est la seule agence au mix différent", fmt_y="0%", legende="r")
        e.height, e.width = 7.5, 15
        wg.add_chart(e, "A20")

        n = ScatterChart()
        n.x_axis.title = "Chiffre d'affaires (USD)"
        n.y_axis.title = "Marge (USD)"
        xs = Reference(ws, min_col=dep4 + 1, min_row=5, max_row=10)
        ys = Reference(ws, min_col=dep4 + 2, min_row=5, max_row=10)
        se = Series(ys, xs, title="Agences")
        se.marker = Marker(symbol="circle", size=9)
        se.graphicalProperties.line.noFill = True
        n.series.append(se)
        soigner(n, "La marge suit le volume — sauf pour une agence",
                fmt_y='#,##0.00,," M"', fmt_x='#,##0.00,," M"')
        n.height, n.width = 7.5, 15
        wg.add_chart(n, "M20")

        wm = wb.create_sheet("Axe_qui_ment")
        wm.sheet_view.showGridLines = False
        wm["A1"] = "Le même chiffre, deux axes, deux conclusions"; wm["A1"].font = Ftitre
        for mn, titre, ancre in ((0, "Axe à zéro — douze mois très stables", "A3"),
                                 (1_800_000, "Axe à 1,8 M — le même mois paraît catastrophique", "M3")):
            g = BarChart(); g.type = "col"
            g.add_data(Reference(ws, min_col=2, min_row=4, max_row=16), titles_from_data=True)
            g.set_categories(Reference(ws, min_col=1, min_row=5, max_row=16))
            g.y_axis.scaling.min = mn
            if mn:
                g.y_axis.scaling.max = 2_800_000
            soigner(g, titre, fmt_y='#,##0.00,," M"')
            g.height, g.width = 8, 15
            wm.add_chart(g, ancre)
    nom = f"M06_L01_{'CORRIGE' if corrige else 'DEPART'}.xlsx"
    wb.save(RACINE / nom)
    print(f"  {nom}  ({reparer_formats(RACINE / nom)} formats rattachés)")

lecon01(False); lecon01(True)

# ══ 8 · Leçon 2 — les visualisations que personne n'utilise ═══════════
#  Le pont de marge, décomposé par famille. Les taux étant fixes,
#  ΔMarge = Σ (ΔCA par famille × taux de la famille), à l'exact.
ca_fam_mois = defaultdict(float)
for s in synthese:
    ca_fam_mois[(s["mois"], s["famille"])] += s["ca"]
#  On garde les contributions non arrondies : huit arrondis au centime
#  font dériver le pont de cinq centimes, et un pont qui ne retombe pas
#  exactement sur sa cible n'est plus un pont.
contrib = {f: (ca_fam_mois[(COURANT, f)] - ca_fam_mois[(PRECED, f)]) * MARGE[f]
           for f in FAM_AN}
MARGE_AOUT = round(sum(s["marge"] for s in synthese if s["mois"] == PRECED), 2)
MARGE_SEPT = round(sum(s["marge"] for s in synthese if s["mois"] == COURANT), 2)
gros = sorted(contrib, key=lambda f: -abs(contrib[f]))[:4]
CASCADE = [("Marge août", MARGE_AOUT, "total")]
for f in gros:
    CASCADE.append((f, contrib[f], "pont"))
autres = sum(v for f, v in contrib.items() if f not in gros)
CASCADE.append(("Autres familles", autres, "pont"))
CASCADE.append(("Marge septembre", MARGE_SEPT, "total"))
ecart_verif = MARGE_AOUT + sum(contrib.values()) - MARGE_SEPT
assert abs(ecart_verif) < 0.5, ecart_verif
print(f"  cascade : {MARGE_AOUT:,.0f} → {MARGE_SEPT:,.0f} "
      f"({MARGE_SEPT - MARGE_AOUT:+,.0f})".replace(",", " "))

TACHES = [
    ("Cadrer la question de décision", dt.date(2026, 10, 5), dt.date(2026, 10, 7)),
    ("Inventorier les indicateurs existants", dt.date(2026, 10, 6), dt.date(2026, 10, 9)),
    ("Choisir les quatre qui restent", dt.date(2026, 10, 9), dt.date(2026, 10, 12)),
    ("Maquetter trois dispositions", dt.date(2026, 10, 12), dt.date(2026, 10, 15)),
    ("Faire arbitrer par la direction", dt.date(2026, 10, 15), dt.date(2026, 10, 16)),
    ("Construire la feuille de calculs", dt.date(2026, 10, 16), dt.date(2026, 10, 22)),
    ("Assembler le tableau de bord", dt.date(2026, 10, 21), dt.date(2026, 10, 28)),
    ("Tester les huit secondes", dt.date(2026, 10, 28), dt.date(2026, 10, 30)),
    ("Préparer la version imprimable", dt.date(2026, 10, 29), dt.date(2026, 11, 2)),
    ("Former les six agences", dt.date(2026, 11, 2), dt.date(2026, 11, 10)),
]

def lecon02(corrige):
    wb = openpyxl.Workbook(); wb.remove(wb.active)

    # ── ① Barres de données, jeux d'icônes, nuances ──────────────────
    ws = wb.create_sheet("Barres_et_icones")
    ws.sheet_view.showGridLines = False
    ws["A1"] = "Un graphique dans une colonne, sans le moindre objet"
    ws["A1"].font = Ftitre
    ws["A2"] = ("Aucun graphique ici : uniquement de la mise en forme "
                "conditionnelle. Ça ne pèse rien et ça ne se décale jamais.")
    ws["A2"].font = Faide
    entete(ws, ["Agence", "CA septembre", "Objectif", "Écart", "Atteinte"], ligne=4)
    for i, ag in enumerate(AGENCES, start=5):
        d = par_agence[ag]
        ws.cell(i, 1, ag)
        ws.cell(i, 2, d["ca"]).number_format = FMT_USD0
        ws.cell(i, 3, d["objectif"]).number_format = FMT_USD0
        ws.cell(i, 4, d["ecart"]).number_format = FMT_USD0
        ws.cell(i, 5, d["atteinte"]).number_format = FMT_PCT
    colonnes(ws, [(16, None), (16, None), (16, None), (16, None), (12, None)])
    if corrige:
        ws.conditional_formatting.add("B5:B10", DataBarRule(
            start_type="num", start_value=0, end_type="max",
            color="FF4A7EBB", showValue=True, minLength=None, maxLength=None))
        ws.conditional_formatting.add("D5:D10", ColorScaleRule(
            start_type="min", start_color="FFF8696B",
            mid_type="num", mid_value=0, mid_color="FFFFEB84",
            end_type="max", end_color="FF63BE7B"))
        ws.conditional_formatting.add("E5:E10", IconSetRule(
            "3TrafficLights1", "num", [0, 0.95, 1], showValue=True))
        ws["A12"] = "Les trois règles, dans l'ordre où on les pose"
        ws["A12"].font = Fgras
        for i, t in enumerate([
                "B — Barres de données : on compare les longueurs, pas les chiffres.",
                "D — Nuances de couleurs : le zéro est le point de bascule, pas le milieu.",
                "E — Jeu d'icônes : trois seuils, trois symboles. Lubumbashi est rouge."], start=13):
            ws.cell(i, 1, t).font = Faide

    # ── ② Le diagramme de Gantt, en mise en forme conditionnelle ─────
    wg = wb.create_sheet("Gantt")
    wg.sheet_view.showGridLines = False
    wg["A1"] = "Un planning de projet, sans aucun graphique"; wg["A1"].font = Ftitre
    wg["A2"] = "Quatre règles de mise en forme conditionnelle. C'est tout."
    wg["A2"].font = Faide
    debut = dt.date(2026, 10, 5)
    jours = 37
    wg.cell(4, 1, "Tâche").font = Fentete
    wg.cell(4, 1).fill = Rentete
    wg.cell(4, 2, "Début").font = Fentete; wg.cell(4, 2).fill = Rentete
    wg.cell(4, 3, "Fin").font = Fentete; wg.cell(4, 3).fill = Rentete
    for j in range(jours):
        d = debut + dt.timedelta(days=j)
        c = wg.cell(4, 4 + j, d)
        c.number_format = "d"
        c.font = Font(size=8, bold=True, color="FF6B7280")
        c.alignment = Alignment(horizontal="center")
        wg.column_dimensions[get_column_letter(4 + j)].width = 3.2
    for i, (t, d1, d2) in enumerate(TACHES, start=5):
        wg.cell(i, 1, t)
        wg.cell(i, 2, d1).number_format = "dd/mm"
        wg.cell(i, 3, d2).number_format = "dd/mm"
    colonnes(wg, [(34, None), (10, None), (10, None)])
    if corrige:
        plage = f"D5:{get_column_letter(3 + jours)}{4 + len(TACHES)}"
        wg.conditional_formatting.add(plage, FormulaRule(
            formula=["AND(D$4>=$B5,D$4<=$C5,WEEKDAY(D$4,2)<6)"],
            fill=remplir("FF2F6B47"), stopIfTrue=False))
        wg.conditional_formatting.add(plage, FormulaRule(
            formula=["AND(D$4>=$B5,D$4<=$C5,WEEKDAY(D$4,2)>5)"],
            fill=remplir("FFA8CDB5"), stopIfTrue=False))
        wg.conditional_formatting.add(plage, FormulaRule(
            formula=["WEEKDAY(D$4,2)>5"],
            fill=remplir("FFF2F4F6"), stopIfTrue=False))
        wg.cell(4 + len(TACHES) + 2, 1,
                "Les trois règles, dans cet ordre — celle du week-end vient EN DERNIER, "
                "sinon elle efface les barres.").font = Faide

    # ── ③ La cascade, en barres empilées dont la base est invisible ──
    wc = wb.create_sheet("Cascade")
    wc.sheet_view.showGridLines = False
    wc["A1"] = "Pourquoi la marge a reculé — en un seul graphique"
    wc["A1"].font = Ftitre
    wc["A2"] = ("La colonne « Base » est la hauteur invisible. C'est elle qui fait "
                "flotter les barres. On la remplit de blanc — ou de rien.")
    wc["A2"].font = Faide
    entete(wc, ["Poste", "Base", "Hausse", "Baisse"], ligne=4)
    cumul = 0.0
    for i, (lib, val, genre) in enumerate(CASCADE, start=5):
        wc.cell(i, 1, lib)
        if genre == "total":
            wc.cell(i, 2, 0).number_format = FMT_USD0
            wc.cell(i, 3, round(val, 2)).number_format = FMT_USD0
            wc.cell(i, 4, 0).number_format = FMT_USD0
            cumul = val
        else:
            base = cumul + min(val, 0)
            wc.cell(i, 2, round(base, 2)).number_format = FMT_USD0
            wc.cell(i, 3, round(max(val, 0), 2)).number_format = FMT_USD0
            wc.cell(i, 4, round(-min(val, 0), 2)).number_format = FMT_USD0
            cumul += val
    colonnes(wc, [(22, None), (16, None), (16, None), (16, None)])
    if corrige:
        n = len(CASCADE)
        k = BarChart(); k.type = "col"; k.grouping = "stacked"; k.overlap = 100
        k.add_data(Reference(wc, min_col=2, min_row=4, max_col=4, max_row=4 + n),
                   titles_from_data=True)
        k.set_categories(Reference(wc, min_col=1, min_row=5, max_row=4 + n))
        #  La cascade est le SEUL graphique où l'axe ne part pas de zéro,
        #  et c'est légitime : ses barres encodent des écarts, pas des
        #  quantités. Le repère de chaque barre est la précédente, pas
        #  l'origine. Posé à zéro, le pont devient cinq traits illisibles.
        k.y_axis.scaling.min = 380_000
        k.y_axis.scaling.max = 445_000
        soigner(k, "La marge recule de 39 687 USD — la farine en explique le tiers",
                fmt_y='#,##0," k"', legende="b")
        k.series[0].graphicalProperties = GraphicalProperties(noFill=True)
        k.series[1].graphicalProperties = GraphicalProperties(solidFill="2F6B47")
        k.series[2].graphicalProperties = GraphicalProperties(solidFill="C0392B")
        k.height, k.width = 9, 18
        wc.add_chart(k, "A14")

    # ── ④ Le Pareto ─────────────────────────────────────────────────
    wp = wb.create_sheet("Pareto")
    wp.sheet_view.showGridLines = False
    wp["A1"] = "Les familles qui font 80 % du chiffre d'affaires"; wp["A1"].font = Ftitre
    entete(wp, ["Famille", "CA_USD", "Cumul_Pct"], ligne=4)
    tot = sum(FAM_AN.values())
    cum = 0.0
    for i, (f, v) in enumerate(FAM_AN.items(), start=5):
        cum += v
        wp.cell(i, 1, f)
        wp.cell(i, 2, v).number_format = FMT_USD0
        wp.cell(i, 3, round(cum / tot, 6)).number_format = FMT_PCT
    colonnes(wp, [(22, None), (16, None), (14, None)])
    if corrige:
        nf = len(FAM_AN)
        pb = BarChart(); pb.type = "col"
        pb.add_data(Reference(wp, min_col=2, min_row=4, max_row=4 + nf), titles_from_data=True)
        pb.set_categories(Reference(wp, min_col=1, min_row=5, max_row=4 + nf))
        soigner(pb, "Trois familles font les trois quarts", fmt_y='#,##0.0,," M"')
        pl = LineChart()
        pl.add_data(Reference(wp, min_col=3, min_row=4, max_row=4 + nf), titles_from_data=True)
        pl.y_axis.axId = 200
        pl.y_axis.numFmt = "0%"
        pl.y_axis.delete = False
        pl.y_axis.majorGridlines = None
        pb.y_axis.crosses = "autoZero"
        pb += pl
        pb.height, pb.width = 9, 18
        wp.add_chart(pb, "A15")

    nom = f"M06_L02_{'CORRIGE' if corrige else 'DEPART'}.xlsx"
    wb.save(RACINE / nom)
    reparer_formats(RACINE / nom)
    print("  " + nom)

lecon02(False); lecon02(True)

# ══ 9 · Le travail pratique ═══════════════════════════════════════════
#  Le seul TP du programme où la note des pairs pèse plus que la machine.
#  La machine note ce qu'elle sait noter : la couche de calcul, les douze
#  cellules nommées, les contrôles. La lisibilité, elle, se juge à l'œil,
#  et c'est le test des huit secondes qui en décide.
KPIS = [
    ("KPI_CA", '=SUMIFS(t_Synth[CA_USD],t_Synth[Mois],$B$2)',
     FMT_USD0, "Chiffre d'affaires du mois analysé"),
    ("KPI_OBJECTIF", '=SUMIFS(t_Agence[Objectif_USD],t_Agence[Mois],$B$2)',
     FMT_USD0, "Objectif du mois, toutes agences"),
    ("KPI_ATTEINTE", "=J5/J6", FMT_PCT, "Taux d'atteinte de l'objectif"),
    ("KPI_VAR_M1", '=J5/SUMIFS(t_Synth[CA_USD],t_Synth[Mois],EDATE($B$2,-1))-1',
     FMT_PCT, "Variation par rapport au mois précédent"),
    ("KPI_MARGE", '=SUMIFS(t_Synth[Marge_USD],t_Synth[Mois],$B$2)/J5',
     FMT_PCT, "Taux de marge du mois"),
    ("KPI_CUMUL", "=SUM(t_Synth[CA_USD])", FMT_USD0,
     "Chiffre d'affaires cumulé de l'exercice"),
    ("KPI_COMMANDES", '=SUMIFS(t_Agence[Nb_Commandes],t_Agence[Mois],$B$2)',
     FMT_INT, "Nombre de commandes du mois"),
    ("KPI_PANIER", "=J5/J11", FMT_USD, "Panier moyen par commande"),
    ("KPI_AGENCE_ALERTE",
     "=INDEX($A$5:$A$10,MATCH(MIN($D$5:$D$10),$D$5:$D$10,0))",
     None, "L'agence la plus loin de son objectif"),
    ("KPI_ECART_ALERTE",
     "=INDEX($B$5:$B$10,MATCH(MIN($D$5:$D$10),$D$5:$D$10,0))"
     "-INDEX($C$5:$C$10,MATCH(MIN($D$5:$D$10),$D$5:$D$10,0))",
     FMT_USD0, "Son écart à l'objectif, en USD"),
    ("R_CONTROLE", "=J10-SUM($G$5:$G$16)", FMT_USD,
     "Cumul moins la somme des douze mois — doit valoir 0"),
    ("R_ECART_AGENCES", "=J5-SUM($B$5:$B$10)", FMT_USD,
     "Mois moins la somme des six agences — doit valoir 0"),
]

def feuille_calculs(wb, corrige):
    ws = wb.create_sheet("CALCULS")
    ws["A1"] = "La couche de calcul du tableau de bord"; ws["A1"].font = Ftitre
    ws["A2"] = "Mois analysé"; ws["A2"].font = Fgras
    ws["B2"] = COURANT; ws["B2"].number_format = FMT_DATE
    ws["C2"] = "← changez cette seule cellule, tout suit"; ws["C2"].font = Faide

    # Bloc A — par agence
    entete(ws, ["Agence", "CA_USD", "Objectif_USD", "Atteinte"], ligne=4)
    for i, ag in enumerate(AGENCES, start=5):
        ws.cell(i, 1, ag)
        for j, (f, fmt) in enumerate((
                ('=SUMIFS(t_Synth[CA_USD],t_Synth[Mois],$B$2,t_Synth[Agence],$A{r})', FMT_USD0),
                ('=SUMIFS(t_Agence[Objectif_USD],t_Agence[Mois],$B$2,t_Agence[Agence],$A{r})', FMT_USD0),
                ("=B{r}/C{r}", FMT_PCT)), start=2):
            c = ws.cell(i, j)
            c.number_format, c.fill = fmt, Rjaune
            if corrige:
                c.value = f.format(r=i)

    # Bloc B — par mois
    entete(ws, ["Mois", "CA_USD"], ligne=4, depart=6)
    for i, m in enumerate(MOIS, start=5):
        ws.cell(i, 6, m).number_format = FMT_DATE
        c = ws.cell(i, 7)
        c.number_format, c.fill = FMT_USD0, Rjaune
        if corrige:
            c.value = f'=SUMIFS(t_Synth[CA_USD],t_Synth[Mois],$F{i})'

    # Bloc C — les douze indicateurs nommés
    entete(ws, ["Nom", "Valeur", "Ce que c'est"], ligne=4, depart=9)
    for i, (nom, f, fmt, quoi) in enumerate(KPIS, start=5):
        ws.cell(i, 9, nom).font = Font(name="Consolas", size=10)
        c = ws.cell(i, 10)
        c.fill = Rvert if nom.startswith("R_") else Rjaune
        if fmt:
            c.number_format = fmt
        if corrige:
            c.value = f
        ws.cell(i, 11, quoi).font = Faide
    colonnes(ws, [(16, None), (16, None), (16, None), (12, None), (3, None),
                  (12, None), (16, None), (3, None), (20, None), (18, None), (44, None)])
    ws["A19"] = ("Les douze noms se créent en un geste : sélectionner I4:J16, "
                 "puis Formules > Depuis sélection > Colonne de gauche.")
    ws["A19"].font = Faide
    return ws

def feuille_tdb(wb, corrige):
    ws = wb.create_sheet("TABLEAU_DE_BORD")
    ws.sheet_view.showGridLines = False
    ws.sheet_view.showRowColHeaders = False
    for j, w in enumerate([2, 22, 22, 22, 22, 22, 22, 2], start=1):
        ws.column_dimensions[get_column_letter(j)].width = w
    if not corrige:
        ws["B2"] = "À CONSTRUIRE"
        ws["B2"].font = Font(name="Calibri", size=20, bold=True, color="FF8A94A3")
        ws["B4"] = ("Une seule page, sans défilement. Quatre indicateurs, pas quatorze. "
                    "Un titre qui affirme. Le test des huit secondes doit passer.")
        ws["B4"].font = Faide
        return ws

    ws.merge_cells("B2:G2")
    ws["B2"] = ("Septembre : 98,5 % de l'objectif — Lubumbashi décroche de 51 503 USD")
    ws["B2"].font = Font(name="Calibri", size=18, bold=True, color="FF101418")
    ws.merge_cells("B3:G3")
    ws["B3"] = ("Groupe Baobab · exercice 2025-2026 · montants en dollars · "
                "source J06_Synthese_Mensuelle.xlsx, actualisée le 1er octobre 2026")
    ws["B3"].font = Faide
    ws.row_dimensions[2].height = 30

    tuiles = [("Chiffre d'affaires", "=KPI_CA", FMT_MUSD, "B"),
              ("Atteinte de l'objectif", "=KPI_ATTEINTE", FMT_PCT, "C"),
              ("Variation sur un mois", "=KPI_VAR_M1", FMT_PCT, "D"),
              ("Taux de marge", "=KPI_MARGE", FMT_PCT, "E")]
    for lib, f, fmt, col in tuiles:
        c = ws[f"{col}5"]; c.value = lib
        c.font = Font(name="Calibri", size=10, bold=True, color="FF6B7280")
        v = ws[f"{col}6"]; v.value = f
        v.number_format = fmt
        v.font = Font(name="Calibri", size=22, bold=True, color="FF101418")
        v.alignment = Alignment(horizontal="left")
    ws.row_dimensions[6].height = 34

    ws["B8"] = "L'agence à traiter cette semaine"
    ws["B8"].font = Font(name="Calibri", size=10, bold=True, color="FF6B7280")
    ws.merge_cells("B9:C9")
    ws["B9"] = "=KPI_AGENCE_ALERTE"
    ws["B9"].font = Font(name="Calibri", size=20, bold=True, color="FFC0392B")
    ws["D9"] = "=KPI_ECART_ALERTE"
    ws["D9"].number_format = FMT_USD0
    ws["D9"].font = Font(name="Calibri", size=20, bold=True, color="FFC0392B")
    ws["E9"] = "sous son objectif"; ws["E9"].font = Faide

    entete(ws, ["Agence", "CA", "Objectif", "Atteinte"], ligne=12, depart=2)
    for i, ag in enumerate(AGENCES, start=13):
        ws.cell(i, 2, f"=CALCULS!A{i-8}")
        ws.cell(i, 3, f"=CALCULS!B{i-8}").number_format = FMT_USD0
        ws.cell(i, 4, f"=CALCULS!C{i-8}").number_format = FMT_USD0
        ws.cell(i, 5, f"=CALCULS!D{i-8}").number_format = FMT_PCT
    ws.conditional_formatting.add("C13:C18", DataBarRule(
        start_type="num", start_value=0, end_type="max",
        color="FF4A7EBB", showValue=True))
    ws.conditional_formatting.add("E13:E18", IconSetRule(
        "3TrafficLights1", "num", [0, 0.95, 1], showValue=True))

    ligne = LineChart()
    ligne.add_data(Reference(wb["CALCULS"], min_col=7, min_row=4, max_row=16),
                   titles_from_data=True)
    ligne.set_categories(Reference(wb["CALCULS"], min_col=6, min_row=5, max_row=16))
    soigner(ligne, "Douze mois — le creux de janvier est saisonnier",
            fmt_y='#,##0.0,," M"')
    ligne.height, ligne.width = 7, 17
    ws.add_chart(ligne, "B21")

    #  Le livrable doit tenir sur une page A4, sinon ce n'est pas un
    #  tableau de bord : c'est un rapport de plus.
    ws.print_area = "A1:H32"
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 1
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    return ws

TEXTES_TP = {
 "README": [
   ("Question de décision", "Quelle agence dois-je aller voir cette semaine ?"),
   ("Destinataire", "Le comité de direction — huit secondes de lecture, sur un téléphone."),
   ("Source", "J06_Synthese_Mensuelle.xlsx — t_Synth et t_Agence"),
   ("Maille", "t_Synth : mois × agence × famille. t_Agence : mois × agence."),
   ("Ce qui est additif", "CA_USD, Marge_USD, Quantite, Nb_Lignes, Objectif_USD"),
   ("Ce qui ne l'est pas",
    "Nb_Commandes : une commande portant trois familles serait comptée trois "
    "fois si on la sommait depuis t_Synth. Elle vit dans t_Agence."),
   ("Actualisation", "Changer CALCULS!B2, puis Ctrl+Alt+F5. Rien d'autre à toucher."),
   ("Contrôles", "R_CONTROLE et R_ECART_AGENCES doivent valoir 0 avant tout envoi."),
   ("Ce qui a été retiré", "Dix des quatorze indicateurs, et les trois camemberts."),
 ],
 "ANNEXE_IA": [
   ("Prompt 1", "Voici la capture de mon tableau de bord. Un directeur le regarde "
                "huit secondes puis on le masque. Quelles trois informations "
                "aura-t-il retenues, et lesquelles voulait-il ?"),
   ("Prompt 2", "Propose-moi une palette de cinq couleurs lisible par un "
                "daltopique deutan, imprimable en noir et blanc, et projetable."),
   ("Prompt 3", "Réécris ce titre pour qu'il affirme au lieu d'étiqueter. "
                "Il doit contenir un chiffre et un verbe."),
   ("Erreur détectée", "L'IA a proposé une palette rouge / vert pour distinguer "
                       "au-dessus et en dessous de l'objectif. Illisible pour environ "
                       "8 % des hommes — soit, sur un comité de six, une personne."),
   ("Quel V l'a attrapée", "V4 — Vérité métier. Le test : imprimer en noir et blanc. "
                           "Les deux couleurs deviennent le même gris."),
 ],
}

def feuille_texte_tp(wb, nom, corrige):
    ws = wb.create_sheet(nom)
    ws.column_dimensions["A"].width = 26
    ws.column_dimensions["B"].width = 96
    ws["A1"] = nom; ws["A1"].font = Ftitre
    for i, (cle, val) in enumerate(TEXTES_TP[nom], start=3):
        c = ws.cell(i, 1, cle); c.font, c.border = Fgras, Bord
        d = ws.cell(i, 2, val if corrige else ""); d.border = Bord
        d.alignment = Alignment(wrap_text=True, vertical="top")
        if not corrige:
            d.fill = Rjaune
        ws.row_dimensions[i].height = 30
    return ws

def classeur_tp(corrige):
    wb = openpyxl.Workbook(); wb.remove(wb.active)
    feuille_synthese(wb); feuille_agence(wb)
    wr = wb.create_sheet("Rapport_actuel")
    rapport_illisible(wr)
    feuille_calculs(wb, corrige)
    feuille_tdb(wb, corrige)
    feuille_texte_tp(wb, "README", corrige)
    feuille_texte_tp(wb, "ANNEXE_IA", corrige)
    if corrige:
        for nom, _f, _fmt, _q in KPIS:
            i = 5 + [k[0] for k in KPIS].index(nom)
            wb.defined_names[nom] = DefinedName(nom, attr_text=f"CALCULS!$J${i}")
    nom = "TP06_CORRIGE.xlsx" if corrige else "TP06_DEPART.xlsx"
    wb.save(RACINE / nom)
    reparer_formats(RACINE / nom)
    print("  %-20s %.2f Mo" % (nom, (RACINE / nom).stat().st_size / 1e6))

classeur_tp(False)
classeur_tp(True)

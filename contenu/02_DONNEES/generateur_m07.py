#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════
#  Données du module 7 — les douze fichiers mensuels des agences
#
#  Ce sont les fichiers DONT la synthèse du module 6 était issue. On ne
#  réinvente rien : on désagrège J05 à la maille (mois, agence, famille),
#  et on ré-émet chaque mois dans le format que l'agence a réellement
#  envoyé — c'est-à-dire trois formats différents, et pas les mêmes
#  colonnes d'un mois à l'autre.
# ══════════════════════════════════════════════════════════════════════
import datetime as dt, pathlib, sys, json, random, csv
from collections import defaultdict
import openpyxl

SRC = pathlib.Path("sortie-m05/J05_Ventes_24_mois.xlsx")
RACINE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "sortie-m07")
DOSSIER = RACINE / "J07_Agences_mensuel"
RACINE.mkdir(parents=True, exist_ok=True)
DOSSIER.mkdir(parents=True, exist_ok=True)

EXERCICE = dt.date(2025, 10, 1)
AGENCES = ["Kinshasa", "Lubumbashi", "Abidjan", "Dakar", "Douala", "Libreville"]
DEVISE = {"Kinshasa": "CDF", "Lubumbashi": "CDF", "Abidjan": "XOF",
          "Dakar": "XOF", "Douala": "XAF", "Libreville": "XAF"}
FAMILLES = ["Huiles", "Riz", "Farine", "Boissons", "Savons", "Conserves"]
RECLASSE = {"Hygiène & entretien": "Savons", "Épicerie sèche": "Conserves"}
DEBUT_REMISE = dt.date(2026, 3, 1)

RESPONSABLE = {"Kinshasa": "Nadège Kalala", "Lubumbashi": "Trésor Ilunga",
               "Abidjan": "Serge Kouadio", "Dakar": "Aïcha Ndiaye",
               "Douala": "Thomas Mbarga", "Libreville": "Josée Nguema"}

print("lecture du fichier des 24 mois…")
wb = openpyxl.load_workbook(SRC, read_only=True, data_only=True)
ws = wb["Ventes"]
it = ws.iter_rows(values_only=True)
col = {n: i for i, n in enumerate(next(it))}
brut = defaultdict(lambda: {"qte": 0, "local": 0.0})
taux_vus = defaultdict(list)
for r in it:
    d = r[col["Date_Vente"]]
    d = d.date() if hasattr(d, "date") else d
    if d < EXERCICE:
        continue
    m = dt.date(d.year, d.month, 1)
    fam = r[col["Famille"]]
    fam = RECLASSE.get(fam, fam)          # on remet les libellés du catalogue
    k = (m, r[col["Agence"]], fam)
    brut[k]["qte"] += int(r[col["Quantite"]])
    brut[k]["local"] += float(r[col["Montant_Local"]])
    if r[col["Montant_USD"]]:
        taux_vus[(m, r[col["Devise"]])].append(
            float(r[col["Montant_Local"]]) / float(r[col["Montant_USD"]]))
wb.close()

MOIS = sorted({k[0] for k in brut})
TAUX = {k: round(sum(v) / len(v), 2) for k, v in taux_vus.items()}
print(f"  {len(brut)} cellules · {len(MOIS)} mois")

# ── Le treizième mois : octobre 2026 ─────────────────────────────────
#  J05 s'arrête au 30 septembre. Octobre est produit à partir de
#  septembre, avec le facteur de saison d'octobre et un bruit à graine
#  fixe. C'est synthétique et c'est reproductible — les deux comptent.
random.seed(707)
OCT = dt.date(2026, 10, 1)
SEPT = dt.date(2026, 9, 1)
for ag in AGENCES:
    for fam in FAMILLES:
        s = brut[(SEPT, ag, fam)]
        f = 1.03 * random.uniform(0.94, 1.08)
        brut[(OCT, ag, fam)] = {"qte": int(round(s["qte"] * f)),
                                "local": round(s["local"] * f, 2)}
for dev in ("CDF", "XOF", "XAF"):
    TAUX[(OCT, dev)] = round(TAUX[(SEPT, dev)] * 1.004, 2)
MOIS.append(OCT)

# ── Les remises, à partir de mars 2026 ───────────────────────────────
random.seed(708)
REMISE = {}
for (m, ag, fam) in brut:
    if m >= DEBUT_REMISE:
        REMISE[(m, ag, fam)] = round(random.choice([0, 0, 0.02, 0.03, 0.05]), 2)

LIGNES = []
for m in MOIS:
    for ag in AGENCES:
        for fam in FAMILLES:
            d = brut[(m, ag, fam)]
            LIGNES.append({
                "mois": m, "agence": ag, "devise": DEVISE[ag], "famille": fam,
                "qte": d["qte"], "local": round(d["local"], 2),
                "remise": REMISE.get((m, ag, fam)),
                "responsable": RESPONSABLE[ag],
                "taux": TAUX[(m, DEVISE[ag])],
            })
for l in LIGNES:
    l["usd"] = round(l["local"] / l["taux"], 2)
print(f"  {len(LIGNES)} lignes consolidées de référence")

# ── Qui envoie quoi, et comment ──────────────────────────────────────
#  Trois formats, et l'ordre des colonnes change d'un mois à l'autre.
#  C'est là toute la difficulté du module, et elle est plantée ici.
FORMAT = {}
for i, m in enumerate(MOIS):
    if i in (2, 6, 10):
        FORMAT[m] = "croise"      # un tableau croisé reçu
    elif i in (1, 5):
        FORMAT[m] = "titre"       # un titre et une ligne vide avant les en-têtes
    elif i == 11:
        FORMAT[m] = "csv"         # un CSV en Windows-1252
    else:
        FORMAT[m] = "standard"
print("  formats :", {m.strftime("%Y-%m"): f for m, f in FORMAT.items()})

# ══ 2 · L'écriture des treize fichiers ════════════════════════════════
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.utils import get_column_letter

Fentete = Font(name="Calibri", size=11, bold=True, color="FFFFFFFF")
Rentete = PatternFill("solid", fgColor="FF243044")
Ftitre  = Font(name="Calibri", size=14, bold=True)
Faide   = Font(name="Calibri", size=10, italic=True, color="FF6B7280")

BASE = ["Agence", "Devise", "Famille", "Quantite", "Montant_Local", "Responsable"]
#  L'ordre des colonnes change d'un mois à l'autre. C'est la raison
#  d'être du module : une requête qui désigne une colonne par sa
#  position casse au premier mois qui n'a pas le même ordre.
ORDRES = [
    ["Agence", "Devise", "Famille", "Quantite", "Montant_Local", "Responsable"],
    ["Agence", "Famille", "Devise", "Montant_Local", "Quantite", "Responsable"],
    ["Responsable", "Agence", "Devise", "Famille", "Quantite", "Montant_Local"],
    ["Agence", "Devise", "Responsable", "Famille", "Montant_Local", "Quantite"],
]

def ordre_du_mois(i, m):
    o = list(ORDRES[i % len(ORDRES)])
    if m >= DEBUT_REMISE:
        #  La colonne Remise_Pct apparaît en mars, et jamais au même
        #  endroit : ici après Famille, là tout à la fin.
        o.insert(3 if i % 2 else len(o), "Remise_Pct")
    return o

def valeur(l, c):
    return {"Agence": l["agence"], "Devise": l["devise"], "Famille": l["famille"],
            "Quantite": l["qte"], "Montant_Local": l["local"],
            "Responsable": l["responsable"], "Remise_Pct": l["remise"]}[c]

def ecrire_standard(chemin, lignes, ordre, avec_titre, mois):
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Ventes"
    depart = 1
    if avec_titre:
        ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(ordre))
        ws.cell(1, 1, f"VENTES DU MOIS DE {mois.strftime('%m/%Y')} — DOCUMENT INTERNE")
        ws.cell(1, 1).font = Ftitre
        ws.cell(1, 1).alignment = Alignment(horizontal="center")
        depart = 3                        # ligne 2 vide, en-têtes en ligne 3
    for j, c in enumerate(ordre, start=1):
        cel = ws.cell(depart, j, c); cel.font, cel.fill = Fentete, Rentete
    for i, l in enumerate(lignes, start=depart + 1):
        for j, c in enumerate(ordre, start=1):
            ws.cell(i, j, valeur(l, c))
    for j in range(1, len(ordre) + 1):
        ws.column_dimensions[get_column_letter(j)].width = 18
    wb.save(chemin)

def ecrire_croise(chemin, lignes, mois):
    """Le tableau croisé reçu : agences en lignes, familles en colonnes.
    Ni quantité ni remise — l'agence n'envoie que des montants."""
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Ventes"
    ws.cell(1, 1, "Agence").font = Fentete; ws.cell(1, 1).fill = Rentete
    ws.cell(1, 2, "Devise").font = Fentete; ws.cell(1, 2).fill = Rentete
    for j, fam in enumerate(FAMILLES, start=3):
        cel = ws.cell(1, j, fam); cel.font, cel.fill = Fentete, Rentete
    par_ag = defaultdict(dict)
    for l in lignes:
        par_ag[l["agence"]][l["famille"]] = l["local"]
    for i, ag in enumerate(AGENCES, start=2):
        ws.cell(i, 1, ag)
        ws.cell(i, 2, DEVISE[ag])
        for j, fam in enumerate(FAMILLES, start=3):
            ws.cell(i, j, par_ag[ag].get(fam))
    for j in range(1, len(FAMILLES) + 3):
        ws.column_dimensions[get_column_letter(j)].width = 18
    wb.save(chemin)

def ecrire_csv(chemin, lignes, ordre):
    """Un CSV en Windows-1252, séparé par des points-virgules.
    Lu en UTF-8, « Nadège » devient « Nad?ge »."""
    with open(chemin, "w", encoding="cp1252", newline="") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(ordre)
        for l in lignes:
            w.writerow([valeur(l, c) for c in ordre])

par_mois = defaultdict(list)
for l in LIGNES:
    par_mois[l["mois"]].append(l)

fichiers = []
for i, m in enumerate(MOIS):
    nom = f"Ventes_{m:%Y-%m}"
    f = FORMAT[m]
    lignes = par_mois[m]
    ordre = ordre_du_mois(i, m)
    #  Le treizième fichier reste dehors : c'est l'épreuve de
    #  l'actualisation, et il arrive après coup.
    cible = RACINE if m == OCT else DOSSIER
    if m == OCT:
        nom = "Ventes_2026-10_NOUVEAU"
        ordre = ["Responsable", "Famille", "Agence", "Montant_Local",
                 "Remise_Pct", "Devise", "Quantite"]   # encore un autre ordre
    if f == "croise":
        ecrire_croise(cible / f"{nom}.xlsx", lignes, m)
    elif f == "csv":
        ecrire_csv(cible / f"{nom}.csv", lignes, ordre)
    elif f == "titre":
        ecrire_standard(cible / f"{nom}.xlsx", lignes, ordre, True, m)
    else:
        ecrire_standard(cible / f"{nom}.xlsx", lignes, ordre, False, m)
    fichiers.append((nom, f, ordre if f != "croise" else ["— tableau croisé —"]))

# ── La table des taux, hors du dossier ───────────────────────────────
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Taux"
for j, c in enumerate(["Mois", "Devise", "Taux_USD"], start=1):
    cel = ws.cell(1, j, c); cel.font, cel.fill = Fentete, Rentete
i = 2
for m in MOIS:
    for dev in ("CDF", "XOF", "XAF"):
        ws.cell(i, 1, m).number_format = "mmm\\ yyyy"
        ws.cell(i, 2, dev)
        ws.cell(i, 3, TAUX[(m, dev)])
        i += 1
for j, w in enumerate([14, 10, 14], start=1):
    ws.column_dimensions[get_column_letter(j)].width = w
from openpyxl.worksheet.table import Table, TableStyleInfo
t = Table(displayName="t_Taux", ref=f"A1:C{i-1}")
t.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
ws.add_table(t)
wb.save(RACINE / "J07_Taux_Mensuels.xlsx")

print(f"  {len(list(DOSSIER.glob('*')))} fichiers dans J07_Agences_mensuel/")
for nom, f, o in fichiers:
    print(f"    {nom:<26} {f:<10} {' · '.join(o)}")

# ══ 3 · Les valeurs de référence ══════════════════════════════════════
#  Ce que produit une requête correcte, APRÈS ajout du treizième fichier.
#  Les trois tableaux croisés n'envoient ni quantité ni remise : ces
#  colonnes sont vides pour eux, et c'est vrai, pas une perte.
for l in LIGNES:
    if FORMAT[l["mois"]] == "croise":
        l["qte"] = None
        l["remise"] = None

R = {}
R["fichiers"] = len(MOIS)
R["lignes"] = len(LIGNES)
R["mois_distincts"] = len({l["mois"] for l in LIGNES})
R["responsables_distincts"] = len({l["responsable"] for l in LIGNES})
R["ca_usd"] = round(sum(l["usd"] for l in LIGNES), 2)
R["ca_octobre"] = round(sum(l["usd"] for l in LIGNES if l["mois"] == OCT), 2)
R["lignes_sans_quantite"] = sum(1 for l in LIGNES if l["qte"] is None)
R["lignes_avec_remise"] = sum(1 for l in LIGNES if l["remise"])
R["ca_kinshasa"] = round(sum(l["usd"] for l in LIGNES if l["agence"] == "Kinshasa"), 2)
R["remises_usd"] = round(sum(l["usd"] * l["remise"] for l in LIGNES if l["remise"]), 2)
R["ca_par_agence"] = {a: round(sum(l["usd"] for l in LIGNES if l["agence"] == a), 2)
                      for a in AGENCES}
R["local_total"] = round(sum(l["local"] for l in LIGNES), 2)

CONTROLE = []
for m in MOIS:
    ls = [l for l in LIGNES if l["mois"] == m]
    CONTROLE.append({
        "fichier": ("Ventes_2026-10_NOUVEAU" if m == OCT else f"Ventes_{m:%Y-%m}")
                   + (".csv" if FORMAT[m] == "csv" else ".xlsx"),
        "format": FORMAT[m],
        "lignes": len(ls),
        "local": round(sum(l["local"] for l in ls), 2),
        "sans_qte": sum(1 for l in ls if l["qte"] is None),
        "statut": "WARNING" if FORMAT[m] == "croise" else "PASS",
    })
R["controle_lignes"] = len(CONTROLE)

json.dump(R, open(RACINE / "REFERENCES_M07.json", "w"), indent=1, ensure_ascii=False)
for k, v in R.items():
    if not isinstance(v, dict):
        print(f"  {k:<24} {v}")

# ══ 4 · Le travail pratique ═══════════════════════════════════════════
from openpyxl.styles import Border, Side
from openpyxl.workbook.defined_name import DefinedName

Fgras  = Font(name="Calibri", size=11, bold=True)
Rjaune = PatternFill("solid", fgColor="FFFFF6D8")
Rvert  = PatternFill("solid", fgColor="FFE8F6EE")
Bord   = Border(bottom=Side(style="thin", color="FFD6DBE1"))
FMT_USD  = '#,##0.00\\ "USD"'
FMT_LOC  = '#,##0.00'
FMT_DATE = "mmm\\ yyyy"
FMT_PCT  = "0.0%"
FMT_INT  = "#,##0"

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

COLS_CONSO = ["Mois", "Agence", "Devise", "Famille", "Responsable",
              "Quantite", "Remise_Pct", "Montant_Local", "Taux_USD", "Montant_USD"]
COLS_CTRL = ["Fichier", "Format", "Lignes", "Montant_Local", "Lignes_sans_quantite", "Statut"]

C = "t_Consolide"
U = f"{C}[Montant_USD]"
REPONSES = [
    ("Nombre de fichiers consolidés", "=ROWS(t_Controle[Fichier])", FMT_INT),
    ("Nombre de lignes du résultat", f"=ROWS({C}[Mois])", FMT_INT),
    ("Nombre de mois distincts", f"=COUNTA(_xlfn.UNIQUE({C}[Mois]))", FMT_INT),
    ("Nombre de responsables distincts  🔴 l'encodage",
     f"=COUNTA(_xlfn.UNIQUE({C}[Responsable]))", FMT_INT),
    ("Chiffre d'affaires total, en USD", f"=SUM({U})", FMT_USD),
    ("Chiffre d'affaires du mois ajouté (oct. 2026), en USD",
     f'=SUMIFS({U},{C}[Mois],DATE(2026,10,1))', FMT_USD),
    ("Lignes sans quantité — les trois tableaux croisés",
     f"=ROWS({C}[Quantite])-COUNT({C}[Quantite])", FMT_INT),
    ("Lignes portant une remise strictement positive",
     f'=COUNTIFS({C}[Remise_Pct],">0")', FMT_INT),
    ("Chiffre d'affaires de Kinshasa, en USD",
     f'=SUMIFS({U},{C}[Agence],"Kinshasa")', FMT_USD),
    ("Montant total des remises accordées, en USD",
     f"=SUMPRODUCT({U},{C}[Remise_Pct])", FMT_USD),
    ("R_ECART_SOURCE — résultat moins somme des fichiers  ·  doit valoir 0",
     f"=SUM({C}[Montant_Local])-SUM(t_Controle[Montant_Local])", FMT_LOC),
    ("R_CONTROLE — total moins la somme des six agences  ·  doit valoir 0",
     f"=$B$9-(" + "+".join(f'SUMIFS({U},{C}[Agence],"{a}")' for a in AGENCES) + ")", FMT_USD),
]
QUALITE = [
    ("Agences distinctes dans le résultat", f"=COUNTA(_xlfn.UNIQUE({C}[Agence]))",
     FMT_INT, "six, et six seulement"),
    ("Q_NULS — montants locaux manquants  ·  doit valoir 0",
     f"=ROWS({C}[Montant_Local])-COUNT({C}[Montant_Local])", FMT_INT,
     "un montant vide veut dire qu'une colonne a été lue au mauvais endroit"),
    ("Lignes provenant d'un fichier en WARNING",
     '=SUMIFS(t_Controle[Lignes],t_Controle[Statut],"WARNING")', FMT_INT,
     "les tableaux croisés reçus : ni quantité ni remise, et c'est normal"),
]

def feuille_conso(wb, corrige):
    ws = wb.create_sheet("CONSOLIDE")
    colonnes(ws, [(12, FMT_DATE), (14, None), (9, None), (14, None), (18, None),
                  (11, FMT_INT), (11, FMT_PCT), (17, FMT_LOC), (11, FMT_LOC), (15, FMT_USD)])
    if not corrige:
        ws["A1"] = "Le résultat de la requête de consolidation se charge ici."
        ws["A1"].font = Ftitre
        ws["A3"] = ("Données > Obtenir des données > À partir d'un fichier > "
                    "À partir d'un dossier. Puis charger dans un tableau nommé "
                    "t_Consolide, à partir de A1.")
        ws["A3"].font = Faide
        ws["A5"] = "Les colonnes attendues, dans cet ordre :"
        ws["A5"].font = Fgras
        ws["A6"] = " · ".join(COLS_CONSO)
        ws["A6"].font = Faide
        return ws
    entete(ws, COLS_CONSO)
    for i, l in enumerate(LIGNES, start=2):
        for j, v in enumerate([l["mois"], l["agence"], l["devise"], l["famille"],
                               l["responsable"], l["qte"], l["remise"], l["local"],
                               l["taux"], l["usd"]], start=1):
            ws.cell(i, j, v)
    ws.freeze_panes = "A2"
    tableau(ws, "t_Consolide", f"A1:J{len(LIGNES)+1}")
    return ws

def feuille_ctrl(wb, corrige):
    ws = wb.create_sheet("CONTROLE")
    colonnes(ws, [(30, None), (12, None), (10, FMT_INT), (20, FMT_LOC),
                  (20, FMT_INT), (12, None)])
    if not corrige:
        ws["A1"] = "Le résultat de la requête de contrôle qualité se charge ici."
        ws["A1"].font = Ftitre
        ws["A3"] = ("Une ligne par fichier lu, avec son nombre de lignes, son "
                    "total et son statut. Tableau nommé t_Controle, à partir de A1.")
        ws["A3"].font = Faide
        ws["A5"] = "Les colonnes attendues :"
        ws["A5"].font = Fgras
        ws["A6"] = " · ".join(COLS_CTRL)
        ws["A6"].font = Faide
        return ws
    entete(ws, COLS_CTRL)
    for i, c in enumerate(CONTROLE, start=2):
        for j, v in enumerate([c["fichier"], c["format"], c["lignes"], c["local"],
                               c["sans_qte"], c["statut"]], start=1):
            ws.cell(i, j, v)
    tableau(ws, "t_Controle", f"A1:F{len(CONTROLE)+1}")
    return ws

def feuille_reponses(wb, corrige):
    ws = wb.create_sheet("REPONSES")
    ws.column_dimensions["A"].width = 66
    ws.column_dimensions["B"].width = 22
    ws["A1"] = "TP 7 — Les douze agences"; ws["A1"].font = Ftitre
    ws["A2"] = ("Ces douze cellules se remplissent APRÈS avoir ajouté le "
                "treizième fichier et actualisé.")
    ws["A2"].font = Faide
    ws["A4"] = "CE QUE LA REQUÊTE DOIT PRODUIRE"; ws["A4"].font = Fgras
    for i, (lib, f, fmt) in enumerate(REPONSES, start=5):
        ws.cell(i, 1, lib).border = Bord
        c = ws.cell(i, 2)
        c.fill, c.border, c.number_format = Rjaune, Bord, fmt
        if corrige:
            c.value = f
    for i in (15, 16):
        ws.cell(i, 1).font = Fgras
        ws.cell(i, 2).fill = Rvert
    return ws

def feuille_qualite(wb, corrige):
    ws = wb.create_sheet("QUALITE")
    colonnes(ws, [(56, None), (16, None), (62, None)])
    ws["A1"] = "Contrôles de qualité"; ws["A1"].font = Ftitre
    entete(ws, ["Contrôle", "Valeur", "Ce que ça veut dire"], ligne=3)
    for i, (lib, f, fmt, quoi) in enumerate(QUALITE, start=4):
        ws.cell(i, 1, lib).border = Bord
        c = ws.cell(i, 2); c.fill, c.border, c.number_format = Rjaune, Bord, fmt
        if corrige:
            c.value = f
        ws.cell(i, 3, quoi).font = Faide
    if corrige:
        ws["A8"] = "Statut général"; ws["A8"].font = Fgras
        ws["B8"] = "PASS"
        ws["A10"] = ("Les trois tableaux croisés reçus n'apportent ni quantité ni "
                     "remise : 108 lignes sur 468. C'est une limite de la source, "
                     "pas un défaut de la requête — et c'est écrit dans le README.")
    return ws

TEXTES = {
 "README": [
   ("Source", "Le dossier J07_Agences_mensuel/ — un fichier par mois, plus "
              "J07_Taux_Mensuels.xlsx pour la conversion."),
   ("Paramètre", "Le chemin du dossier est un paramètre de requête. Sur un autre "
                 "poste, on ne change que lui."),
   ("Trois formats reçus", "standard (7 fichiers) · titre et ligne vide avant les "
                           "en-têtes (2) · tableau croisé à dépivoter (3) · "
                           "un CSV en Windows-1252 (1)."),
   ("Encodage", "Le CSV de septembre est en Windows-1252. Lu en UTF-8, les prénoms "
                "accentués se dédoublent : on passe alors de 6 responsables à 10."),
   ("Colonnes", "L'ordre des colonnes change d'un mois à l'autre, et la colonne "
                "Remise_Pct apparaît en mars 2026. Aucune colonne n'est désignée "
                "par sa position : on les choisit par leur nom."),
   ("Conversion", "Montant_USD = Montant_Local / Taux_USD, joint sur (Mois, Devise). "
                  "Le taux est le taux moyen du mois."),
   ("Écart avec le module 6", "Le total des douze mois communs vaut 28 022 769,42 USD "
                              "ici, contre 28 022 768,30 dans la synthèse du module 6 : "
                              "1,12 USD. Convertir après agrégation avec un taux moyen "
                              "ne donne pas exactement le même résultat que convertir "
                              "ligne à ligne. C'est normal, c'est documenté, et ça se dit."),
   ("Actualisation", "Déposer le nouveau fichier dans le dossier, puis "
                     "Données > Actualiser tout. Rien d'autre à toucher."),
   ("Contrôles", "R_ECART_SOURCE et R_CONTROLE doivent valoir 0 avant tout envoi."),
 ],
 "ANNEXE_IA": [
   ("Prompt 1", "Voici l'étape générée par l'interface de Power Query. Généralise-la "
                "pour qu'elle ne dépende d'aucun nom de colonne codé en dur."),
   ("Prompt 2", "Écris-moi une fonction M personnalisée qui prend un binaire de "
                "fichier et rend une table normalisée, quel que soit le format reçu."),
   ("Prompt 3", "Voici un message d'erreur de Power Query. Explique-moi ce qu'il "
                "veut dire, et donne-moi les deux causes les plus probables."),
   ("Erreur détectée", "L'IA a proposé une mesure DAX — CALCULATE(SUM(...)) — pour "
                       "une transformation qui devait se faire en M, dans la requête. "
                       "Deux langages, deux moments : le M transforme avant le "
                       "chargement, le DAX calcule après."),
   ("Quel V l'a attrapée", "V1 — Version. Le DAX n'existe pas dans l'éditeur Power "
                           "Query : le code est refusé avant même de s'exécuter."),
 ],
}

def feuille_texte(wb, nom, corrige):
    ws = wb.create_sheet(nom)
    ws.column_dimensions["A"].width = 26
    ws.column_dimensions["B"].width = 100
    ws["A1"] = nom; ws["A1"].font = Ftitre
    for i, (cle, val) in enumerate(TEXTES[nom], start=3):
        c = ws.cell(i, 1, cle); c.font, c.border = Fgras, Bord
        d = ws.cell(i, 2, val if corrige else ""); d.border = Bord
        d.alignment = Alignment(wrap_text=True, vertical="top")
        if not corrige:
            d.fill = Rjaune
        ws.row_dimensions[i].height = 34
    return ws

def feuille_taux(wb):
    """La table des taux est FOURNIE, dans les deux classeurs. Le code M
    la lit par Excel.CurrentWorkbook() : elle doit être dans le fichier
    de l'apprenant, pas à côté."""
    ws = wb.create_sheet("TAUX")
    colonnes(ws, [(14, FMT_DATE), (10, None), (14, FMT_LOC)])
    entete(ws, ["Mois", "Devise", "Taux_USD"])
    i = 2
    for m in MOIS:
        for dev in ("CDF", "XOF", "XAF"):
            ws.cell(i, 1, m).number_format = FMT_DATE
            ws.cell(i, 2, dev)
            ws.cell(i, 3, TAUX[(m, dev)])
            i += 1
    tableau(ws, "t_Taux", f"A1:C{i-1}")
    return ws

def classeur_tp(corrige):
    wb = openpyxl.Workbook(); wb.remove(wb.active)
    feuille_reponses(wb, corrige)
    feuille_taux(wb)
    feuille_conso(wb, corrige)
    feuille_ctrl(wb, corrige)
    feuille_texte(wb, "README", corrige)
    feuille_qualite(wb, corrige)
    feuille_texte(wb, "ANNEXE_IA", corrige)
    if corrige:
        for nom, cible in (("R_ECART_SOURCE", "REPONSES!$B$15"),
                           ("R_CONTROLE", "REPONSES!$B$16"),
                           ("Q_NULS", "QUALITE!$B$5")):
            wb.defined_names[nom] = DefinedName(nom, attr_text=cible)
    nom = "TP07_CORRIGE.xlsx" if corrige else "TP07_DEPART.xlsx"
    wb.save(RACINE / nom)
    print("  %-20s %.2f Mo" % (nom, (RACINE / nom).stat().st_size / 1e6))

classeur_tp(False)
classeur_tp(True)

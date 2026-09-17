#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════
#  Données du module 3 — la base client de la fusion, et les 12 agences
#
#  Graine fixe. Les défauts sont plantés volontairement et comptés ici :
#  sans ce comptage, le corrigé du TP serait invérifiable.
# ══════════════════════════════════════════════════════════════════════
import random, datetime as dt, pathlib, sys, unicodedata
import openpyxl
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

random.seed(2026)
RACINE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "sortie")
RACINE.mkdir(parents=True, exist_ok=True)

Ftitre  = Font(name="Calibri", size=14, bold=True, color="FF101418")
Fentete = Font(name="Calibri", size=11, bold=True, color="FFFFFFFF")
Faide   = Font(name="Calibri", size=10, italic=True, color="FF6B7280")
Fgras   = Font(name="Calibri", size=11, bold=True)
Rentete = PatternFill("solid", fgColor="FF243044")
Rgris   = PatternFill("solid", fgColor="FFF2F4F6")
Bord    = Border(bottom=Side(style="thin", color="FFD6DBE1"))
NBSP    = " "           # CAR(160) — l'espace insécable

def entete(ws, cols, ligne=1, depart=1):
    for i, c in enumerate(cols, start=depart):
        cel = ws.cell(ligne, i, c)
        cel.font, cel.fill = Fentete, Rentete
        cel.alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[ligne].height = 22

def largeurs(ws, t):
    for i, w in enumerate(t, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w

def tableau(ws, nom, ref):
    t = Table(displayName=nom, ref=ref)
    t.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
    ws.add_table(t)

# ══════════════════════════════════════════════════════════════════════
#  1. L'univers de la fusion
# ══════════════════════════════════════════════════════════════════════
PRENOMS = ["Nadège","Serge","Aïcha","Thomas","Aline","Junior","Grâce","Patrick",
           "Espérance","Dieudonné","Fatou","Moussa","Chantal","Blaise","Rachel",
           "Emmanuel","Joséphine","Célestin","Mariam","Olivier","Bernadette",
           "Christelle","Alphonse","Sylvie","Didier","Pascaline","Gérard","Nadia",
           "Hervé","Solange","Armand","Brigitte","Félix","Léonie","Rodrigue"]
NOMS = ["KALALA","KOUADIO","NDIAYE","MBARGA","ILUNGA","MUKENDI","LOKO","TSHIALA",
        "DIALLO","TRAORE","BAKAYOKO","NGOMA","MABIALA","SAMBA","OUEDRAOGO","KOFFI",
        "MASSAMBA","NZUZI","KIPRE","ESSONO","BANZA","YAMEOGO","SANOGO","BADIANE",
        "MWEPU","ATANGANA","OBIANG","SYLLA","CAMARA","BOLI","NGUEMA","KIBANGU"]
ENSEIGNES = ["BOUTIQUE","DEPOT","ALIMENTATION","SUPERETTE","GROSSISTE","EPICERIE",
             "MINI-MARCHE","CANTINE","RESTAURANT","BOULANGERIE","SUPERMARCHE","KIOSQUE"]

# 14 orthographes de la même ville — le cœur de la leçon 3.4
KINSHASA = ["Kinshasa", "KINSHASA", "kinshasa", "Kinshasa ", "Kin shasa",
            "Kinshassa", "Kinchasa", "Kinshasa/Gombe", "KIN", "Kinshasa RDC",
            "kinshasa ", "Kinshasa.", "KinShasa", "Kins hasa"]
AUTRES_VILLES = [("Lubumbashi","RDC","CDF"), ("Abidjan","Côte d'Ivoire","XOF"),
                 ("Dakar","Sénégal","XOF"), ("Douala","Cameroun","XAF"),
                 ("Libreville","Gabon","XAF"), ("Yaoundé","Cameroun","XAF"),
                 ("Bouaké","Côte d'Ivoire","XOF"), ("Thiès","Sénégal","XOF"),
                 ("Pointe-Noire","Congo","XAF"), ("N'Djamena","Tchad","XAF"),
                 ("Cotonou","Bénin","XOF"), ("Lomé","Togo","XOF")]

def sans_accent(t):
    return "".join(c for c in unicodedata.normalize("NFD", t)
                   if unicodedata.category(c) != "Mn")

def courriel(prenom, nom, i):
    p = sans_accent(prenom).lower().replace(" ", "")
    n = sans_accent(nom).lower().replace(" ", "").replace("'", "")
    return f"{p}.{n}{i}@exemple.cd"

# ── Les 4 660 clients distincts ───────────────────────────────────────
UNIQUES = 4660
DOUBLONS_EXACTS = 150     # même chaîne : un dédoublonnage naïf les trouve
DOUBLONS_CASSE  = 190     # ne diffèrent que par la casse ou les espaces
TOTAL = UNIQUES + DOUBLONS_EXACTS + DOUBLONS_CASSE     # 5 000

base = []
for i in range(UNIQUES):
    prenom, nom = random.choice(PRENOMS), random.choice(NOMS)
    if random.random() < 0.55:
        raison = f"{random.choice(ENSEIGNES)} {nom}"
    else:
        raison = f"{prenom} {nom}"
    if random.random() < 0.18:
        ville, pays, devise = KINSHASA[0], "RDC", "CDF"
    elif random.random() < 0.45:
        ville, pays, devise = "Kinshasa", "RDC", "CDF"
    else:
        ville, pays, devise = random.choice(AUTRES_VILLES)
    base.append({
        "id": i + 1,
        "raison": raison,
        "email": courriel(prenom, nom, i + 1),
        "tel": f"{random.randint(810000000, 999999999)}",
        "ville": ville, "pays": pays, "devise": devise,
        "creation": dt.date(random.randint(2015, 2026), random.randint(1, 12), random.randint(1, 28)),
        "ca": int(round(random.lognormvariate(9.15, 0.95) / 10) * 10),
    })
print(f"clients distincts : {len(base)}")

# ══════════════════════════════════════════════════════════════════════
#  2. On salit — volontairement, et en comptant
# ══════════════════════════════════════════════════════════════════════
lignes = [dict(c) for c in base]

# ── Les doublons ─────────────────────────────────────────────────────
#    150 à l'identique : un dédoublonnage naïf les trouve.
#    190 qui ne diffèrent que par la casse ou un espace : il ne les voit
#    pas. C'est toute la leçon 3.4.
sources_exacts = random.sample(range(UNIQUES), DOUBLONS_EXACTS)
for k in sources_exacts:
    lignes.append(dict(base[k]))

sources_casse = random.sample([i for i in range(UNIQUES) if i not in set(sources_exacts)],
                              DOUBLONS_CASSE)
for j, k in enumerate(sources_casse):
    d = dict(base[k])
    variante = j % 4
    if variante == 0:   d["email"] = d["email"].upper()
    elif variante == 1: d["email"] = d["email"].capitalize()
    elif variante == 2: d["email"] = " " + d["email"] + " "
    else:               d["email"] = d["email"].replace("@", "@").upper().strip() + NBSP
    d["raison"] = d["raison"].lower() if j % 2 else d["raison"].upper()
    lignes.append(d)

random.shuffle(lignes)
for i, l in enumerate(lignes, start=1):
    l["ordre"] = i

# ── Les espaces insécables dans la raison sociale ────────────────────
idx_nbsp = random.sample(range(len(lignes)), 412)
for k in idx_nbsp:
    r = lignes[k]["raison"]
    lignes[k]["raison"] = r.replace(" ", NBSP, 1) if " " in r else r + NBSP
NB_NBSP = len({k for k in idx_nbsp})

# ── Les villes : 14 orthographes pour Kinshasa ───────────────────────
kin = [i for i, l in enumerate(lignes) if l["ville"] == "Kinshasa"]
for j, i in enumerate(random.sample(kin, min(len(kin), 900))):
    lignes[i]["ville"] = KINSHASA[j % len(KINSHASA)]

# ── Les dates : certaines en texte, certaines impossibles ────────────
FORMATS_TEXTE = ["%d/%m/%y", "%m/%d/%Y", "%Y-%m-%d"]
idx_date_texte = random.sample(range(len(lignes)), 640)
for j, k in enumerate(idx_date_texte):
    lignes[k]["creation_texte"] = lignes[k]["creation"].strftime(FORMATS_TEXTE[j % 3])

IMPOSSIBLES = ["31/02/2023", "30/02/2021", "45/13/2020", "00/07/2019", "32/01/2022"]
idx_impossible = random.sample([i for i in range(len(lignes)) if "creation_texte" not in lignes[i]], 85)
for j, k in enumerate(idx_impossible):
    lignes[k]["creation_texte"] = IMPOSSIBLES[j % len(IMPOSSIBLES)]
NB_DATE_TEXTE = len(idx_date_texte) + len(idx_impossible)

# ── Les téléphones : six formats ─────────────────────────────────────
def salir_tel(t, k):
    return [t, f"+243 {t[:3]} {t[3:6]} {t[6:]}", f"0{t}", f"{t[:3]}-{t[3:6]}-{t[6:]}",
            f"00243{t}", f"({t[:3]}) {t[3:]}"][k % 6]
for i, l in enumerate(lignes):
    l["tel"] = salir_tel(l["tel"], i)

# ── Les montants : 210 stockés en texte ──────────────────────────────
idx_ca_texte = set(random.sample(range(len(lignes)), 210))

# ══════════════════════════════════════════════════════════════════════
#  3. Les valeurs de référence — calculées ici, une fois pour toutes
# ══════════════════════════════════════════════════════════════════════
def normaliser(e):
    return e.replace(NBSP, " ").strip().lower()

vus, propres = set(), []
for l in sorted(lignes, key=lambda x: x["ordre"]):
    cle = normaliser(l["email"])
    if cle in vus:
        continue
    vus.add(cle); propres.append(l)

DATE_SEUIL = dt.date(2020, 1, 1)
SEUIL_GRAND_COMPTE = 50_000

NB_RAW           = len(lignes)
NB_VILLES        = len({l["ville"].lower() for l in lignes})   # UNIQUE ignore la casse
NB_DATES_TEXTE   = NB_DATE_TEXTE
NB_CLEAN         = len(propres)
NB_DOUBLONS      = NB_RAW - NB_CLEAN
NB_AVANT_SEUIL   = sum(1 for l in propres if l["creation"] < DATE_SEUIL)
NB_GRANDS        = sum(1 for l in propres if l["ca"] > SEUIL_GRAND_COMPTE)
CA_TOTAL         = sum(l["ca"] for l in propres)

print(f"RAW {NB_RAW} · CLEAN {NB_CLEAN} · doublons {NB_DOUBLONS}")
print(f"villes distinctes {NB_VILLES} · noms avec espace insécable {NB_NBSP}")
print(f"dates en texte {NB_DATES_TEXTE} · créés avant 2020 {NB_AVANT_SEUIL}")
print(f"grands comptes {NB_GRANDS} · CA total {CA_TOTAL:,} USD".replace(",", " "))

# ══════════════════════════════════════════════════════════════════════
#  4. Les douze fichiers mensuels des six agences
# ══════════════════════════════════════════════════════════════════════
AGENCES_C = ["Kinshasa", "Lubumbashi", "Abidjan", "Dakar", "Douala", "Libreville"]
FAMILLES  = ["Huiles", "Riz", "Farine", "Boissons", "Savons", "Conserves"]
MOIS_2026 = [dt.date(2026, m, 1) for m in range(1, 13)]

CONSO = []
for mois in MOIS_2026:
    n = random.randint(260, 340)
    for k in range(n):
        jour = random.randint(1, 28)
        CONSO.append({
            "date": dt.date(mois.year, mois.month, jour),
            "mois": mois,
            "agence": random.choice(AGENCES_C),
            "famille": random.choice(FAMILLES),
            "client": random.choice(propres)["raison"].replace(NBSP, " ").strip(),
            "montant": int(round(random.lognormvariate(8.0, 0.85) / 10) * 10),
        })

NB_CONSO   = len(CONSO)
CA_CONSO   = sum(c["montant"] for c in CONSO)
NB_MOIS    = len({c["mois"] for c in CONSO})
NB_AGENCES = len({c["agence"] for c in CONSO})

print(f"consolidation : {NB_CONSO} lignes · {CA_CONSO:,} USD · {NB_MOIS} mois · {NB_AGENCES} agences".replace(",", " "))

def ecrire_mois(dossier: pathlib.Path):
    dossier.mkdir(parents=True, exist_ok=True)
    for mois in MOIS_2026:
        wb = openpyxl.Workbook(); ws = wb.active
        ws.title = mois.strftime("%Y-%m")
        entete(ws, ["Date", "Agence", "Famille", "Client", "Montant_USD"])
        i = 2
        for c in CONSO:
            if c["mois"] != mois: continue
            ws.cell(i, 1, c["date"]).number_format = "DD/MM/YYYY"
            ws.cell(i, 2, c["agence"]); ws.cell(i, 3, c["famille"])
            ws.cell(i, 4, c["client"]); ws.cell(i, 5, c["montant"])
            i += 1
        largeurs(ws, [12, 14, 12, 34, 14])
        ws.freeze_panes = "A2"
        wb.save(dossier / f"Ventes_{mois:%Y-%m}.xlsx")

# ══════════════════════════════════════════════════════════════════════
#  5. Les feuilles du classeur
# ══════════════════════════════════════════════════════════════════════
COLS_RAW = ["ID", "Raison_Sociale", "Email", "Telephone", "Ville",
            "Pays", "Devise", "Date_Creation", "CA_Annuel_USD"]

def ecrire_raw(ws):
    entete(ws, COLS_RAW)
    for i, l in enumerate(sorted(lignes, key=lambda x: x["ordre"]), start=2):
        ws.cell(i, 1, l["ordre"])
        ws.cell(i, 2, l["raison"])
        ws.cell(i, 3, l["email"])
        ws.cell(i, 4, l["tel"])
        ws.cell(i, 5, l["ville"])
        ws.cell(i, 6, l["pays"]); ws.cell(i, 7, l["devise"])
        if "creation_texte" in l:
            c = ws.cell(i, 8, l["creation_texte"]); c.alignment = Alignment(horizontal="left")
        else:
            ws.cell(i, 8, l["creation"]).number_format = "DD/MM/YYYY"
        if (l["ordre"] - 1) in idx_ca_texte:
            c = ws.cell(i, 9, str(l["ca"])); c.alignment = Alignment(horizontal="left")
        else:
            ws.cell(i, 9, l["ca"])
    largeurs(ws, [8, 34, 34, 20, 18, 16, 9, 15, 16])
    ws.freeze_panes = "A2"

COLS_CLEAN = ["ID", "Raison_Sociale", "Email", "Telephone", "Ville",
              "Pays", "Devise", "Date_Creation", "CA_Annuel_USD"]

def ecrire_clean(ws, rempli: bool):
    entete(ws, COLS_CLEAN)
    if not rempli:
        ws["A3"] = ("Colle ici les 5 000 lignes de RAW, applique les règles de nettoyage "
                    "de l'énoncé, dédoublonne sur l'e-mail normalisé, puis convertis en "
                    "tableau structuré nommé t_Clients (Ctrl+L).")
        ws["A3"].font = Faide
        largeurs(ws, [8, 34, 34, 20, 18, 16, 9, 15, 16]); return
    for i, l in enumerate(propres, start=2):
        ws.cell(i, 1, l["ordre"])
        ws.cell(i, 2, l["raison"].replace(NBSP, " ").strip())
        ws.cell(i, 3, normaliser(l["email"]))
        ws.cell(i, 4, l["tel"])
        ws.cell(i, 5, l["ville"])
        ws.cell(i, 6, l["pays"]); ws.cell(i, 7, l["devise"])
        ws.cell(i, 8, l["creation"]).number_format = "DD/MM/YYYY"
        ws.cell(i, 9, l["ca"])
    tableau(ws, "t_Clients", f"A1:I{len(propres)+1}")
    largeurs(ws, [8, 34, 34, 20, 18, 16, 9, 15, 16])
    ws.freeze_panes = "A2"

def ecrire_conso(ws, rempli: bool):
    entete(ws, ["Date", "Mois", "Agence", "Famille", "Client", "Montant_USD"])
    if not rempli:
        ws["A3"] = ("Charge ici le résultat de ta requête Power Query sur le dossier des "
                    "douze fichiers, puis nomme le tableau t_Conso.")
        ws["A3"].font = Faide
        largeurs(ws, [12, 12, 14, 12, 34, 14]); return
    for i, c in enumerate(CONSO, start=2):
        ws.cell(i, 1, c["date"]).number_format = "DD/MM/YYYY"
        ws.cell(i, 2, c["mois"]).number_format = "MMM YYYY"
        ws.cell(i, 3, c["agence"]); ws.cell(i, 4, c["famille"])
        ws.cell(i, 5, c["client"]); ws.cell(i, 6, c["montant"])
    tableau(ws, "t_Conso", f"A1:F{len(CONSO)+1}")
    largeurs(ws, [12, 12, 14, 12, 34, 14])
    ws.freeze_panes = "A2"

def feuille_readme(wb, rempli=False):
    ws = wb.create_sheet("README")
    ws["A1"] = "README — la carte d'identité du classeur"; ws["A1"].font = Ftitre
    for i, (k, v) in enumerate([
        ("Objectif", "Assainir la base client issue de la fusion et consolider les ventes 2026."),
        ("Source des données", "Export CRM du concurrent (5 000 lignes) + 12 fichiers mensuels des agences."),
        ("Date de mise à jour", ""), ("Auteur", ""),
        ("Procédure d'actualisation", "Remplacer RAW, réappliquer les règles, actualiser la requête Power Query."),
        ("Règle de dédoublonnage", "Clé = e-mail normalisé (minuscules, sans espace insécable, sans espaces de bord). On garde la première occurrence par ID."),
        ("Hypothèses", "Les dates impossibles sont laissées vides. Les montants en texte sont convertis en nombres."),
        ("Définition — Grand compte", "CA annuel strictement supérieur au seuil de la feuille REPONSES."),
        ("Limites connues", ""), ("Contact", ""),
    ], start=3):
        ws.cell(i, 1, k).font = Fgras; ws.cell(i, 2, v)
        ws.cell(i, 1).border = Bord; ws.cell(i, 2).border = Bord
    largeurs(ws, [32, 92])

def feuille_qualite(wb, rempli=False):
    ws = wb.create_sheet("QUALITE")
    ws["A1"] = "QUALITE — les contrôles"; ws["A1"].font = Ftitre
    ws["A2"] = "Un contrôle qui ne peut pas échouer ne contrôle rien."
    ws["A2"].font = Faide
    entete(ws, ["Contrôle", "Attendu", "Constaté", "Statut"], ligne=4)
    for i, (c, a) in enumerate([
        ("Lignes reprises depuis RAW", NB_RAW),
        ("Doublons supprimés", NB_DOUBLONS),
        ("Espaces insécables restants dans t_Clients", 0),
        ("Dates de création non valides restantes", 0),
        ("Montants encore stockés en texte", 0),
        ("Fichiers mensuels consolidés", 12),
        ("Écart de contrôle : RAW − CLEAN − doublons", 0),
    ], start=5):
        ws.cell(i, 1, c); ws.cell(i, 2, a)
        if rempli: ws.cell(i, 3, a); ws.cell(i, 4, "PASS")
    largeurs(ws, [50, 12, 12, 10])

def feuille_annexe(wb):
    ws = wb.create_sheet("ANNEXE_IA")
    ws["A1"] = "ANNEXE_IA — le protocole d'échantillonnage, appliqué et documenté"
    ws["A1"].font = Ftitre
    ws["A2"] = ("Une IA qui nettoie 5 000 lignes peut en corriger 40 de travers sans le dire. "
                "30 lignes au hasard, les 10 valeurs les plus atypiques, le total de contrôle.")
    ws["A2"].font = Faide
    entete(ws, ["Étape", "Le prompt utilisé", "Ce que l'IA a rendu",
                "L'erreur détectée", "Le V qui l'a attrapée", "La correction"], ligne=4)
    ws.cell(5, 1, "Diagnostic qualité"); ws.cell(6, 1, "Ordre des opérations")
    ws.cell(7, 1, "Échantillon de 30 lignes"); ws.cell(8, 1, "Les 10 valeurs atypiques")
    for i in range(5, 11):
        for j in range(1, 7): ws.cell(i, j).border = Bord
    largeurs(ws, [30, 46, 34, 34, 20, 40])

# ══════════════════════════════════════════════════════════════════════
#  6. LE TP 3
# ══════════════════════════════════════════════════════════════════════
REPONSES = [
    (4,  "Nombre de lignes dans RAW",
         '=COUNTA(RAW!A2:A5001)'),
    (5,  "Nombre de raisons sociales contenant un espace insécable (RAW)",
         '=SUMPRODUCT(--(LEN(RAW!B2:B5001)<>LEN(SUBSTITUTE(RAW!B2:B5001,_xlfn.UNICHAR(160),""))))'),
    (6,  "Nombre de valeurs distinctes dans la colonne Ville (RAW)",
         '=COUNTA(_xlfn.UNIQUE(RAW!E2:E5001))'),
    (7,  "Nombre de dates de création qui ne sont pas des dates (RAW)",
         '=SUMPRODUCT(--NOT(ISNUMBER(RAW!H2:H5001)))'),
    (8,  "Nombre de clients dans t_Clients après dédoublonnage",
         '=COUNTA(t_Clients[Email])'),
    (9,  "Nombre de doublons supprimés",
         '=COUNTA(RAW!A2:A5001)-COUNTA(t_Clients[Email])'),
    (10, "Nombre de clients créés avant la date seuil",
         '=COUNTIFS(t_Clients[Date_Creation],"<"&DateSeuil)'),
    (11, "Nombre de grands comptes (CA strictement supérieur au seuil)",
         '=COUNTIFS(t_Clients[CA_Annuel_USD],">"&SeuilGrandCompte)'),
    (12, "CA annuel total des clients uniques, en USD",
         '=SUM(t_Clients[CA_Annuel_USD])'),
    (13, "Nombre de lignes consolidées depuis les douze fichiers",
         '=ROWS(t_Conso[Montant_USD])'),
    (14, "CA consolidé des douze fichiers, en USD",
         '=SUM(t_Conso[Montant_USD])'),
    (15, "Nombre de mois distincts dans la consolidation",
         '=COUNTA(_xlfn.UNIQUE(t_Conso[Mois]))'),
    (16, "Contrôle : lignes RAW − lignes t_Clients − doublons  →  doit valoir 0",
         '=COUNTA(RAW!A2:A5001)-COUNTA(t_Clients[Email])-B9'),
    (17, "Contrôle : espaces insécables restants dans t_Clients  →  doit valoir 0",
         '=SUMPRODUCT(--(LEN(t_Clients[Raison_Sociale])<>LEN(SUBSTITUTE(t_Clients[Raison_Sociale],_xlfn.UNICHAR(160),""))))'),
]

def tp03(corrige: bool):
    wb = openpyxl.Workbook()
    ecrire_raw(wb.active); wb.active.title = "RAW"
    ecrire_clean(wb.create_sheet("CLEAN"), corrige)
    ecrire_conso(wb.create_sheet("CONSO"), corrige)

    rep = wb.create_sheet("REPONSES")
    rep["A1"] = "REPONSES — une formule par cellule"; rep["A1"].font = Ftitre
    rep["A2"] = "Une valeur tapée à la main ne rapporte que la moitié des points."
    rep["A2"].font = Faide
    for ligne, libelle, formule in REPONSES:
        rep.cell(ligne, 1, libelle).border = Bord
        cel = rep.cell(ligne, 2); cel.border = Bord; cel.fill = Rgris
        if corrige: cel.value = formule
    rep["A19"] = "Date seuil"; rep["B19"] = DATE_SEUIL
    rep["B19"].number_format = "DD/MM/YYYY"; rep["B19"].font = Fgras
    rep["A20"] = "Seuil grand compte (USD)"; rep["B20"] = SEUIL_GRAND_COMPTE
    rep["B20"].font = Fgras
    if corrige:
        wb.defined_names.add(DefinedName("DateSeuil", attr_text="REPONSES!$B$19"))
        wb.defined_names.add(DefinedName("SeuilGrandCompte", attr_text="REPONSES!$B$20"))
    else:
        rep["D19"] = "← nomme cette cellule  DateSeuil"
        rep["D20"] = "← nomme cette cellule  SeuilGrandCompte"
        rep["D19"].font = Faide; rep["D20"].font = Faide
    largeurs(rep, [64, 22, 4, 42])

    feuille_readme(wb, corrige); feuille_qualite(wb, corrige); feuille_annexe(wb)
    wb.save(RACINE / ("TP03_CORRIGE.xlsx" if corrige else "TP03_DEPART.xlsx"))

# ══════════════════════════════════════════════════════════════════════
#  7. Les classeurs des leçons
# ══════════════════════════════════════════════════════════════════════
def lecon_01():
    """Le nettoyage : on travaille sur un extrait de 200 lignes."""
    extrait = sorted(lignes, key=lambda x: x["ordre"])[:200]
    for suf, corrige in (("DEPART", False), ("CORRIGE", True)):
        wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Extrait"
        entete(ws, COLS_RAW + (["Nom_Propre", "Email_Normalise", "Anciennete"] if corrige else []))
        for i, l in enumerate(extrait, start=2):
            ws.cell(i, 1, l["ordre"]); ws.cell(i, 2, l["raison"]); ws.cell(i, 3, l["email"])
            ws.cell(i, 4, l["tel"]);   ws.cell(i, 5, l["ville"]); ws.cell(i, 6, l["pays"])
            ws.cell(i, 7, l["devise"])
            if "creation_texte" in l:
                ws.cell(i, 8, l["creation_texte"]).alignment = Alignment(horizontal="left")
            else:
                ws.cell(i, 8, l["creation"]).number_format = "DD/MM/YYYY"
            ws.cell(i, 9, l["ca"])
            if corrige:
                ws.cell(i, 10, l["raison"].replace(NBSP, " ").strip())
                ws.cell(i, 11, normaliser(l["email"]))
                ws.cell(i, 12, (dt.date(2026, 9, 1) - l["creation"]).days // 365)
        largeurs(ws, [8, 34, 34, 20, 18, 16, 9, 15, 16, 34, 34, 12])
        wb.save(RACINE / f"M03_L01_{suf}.xlsx")

def lecon_03():
    """Le tableau de bord, branché sur la consolidation."""
    for suf, corrige in (("DEPART", False), ("CORRIGE", True)):
        wb = openpyxl.Workbook(); ws = wb.active; ws.title = "CONSO"
        ecrire_conso(ws, True)
        b = wb.create_sheet("Bord")
        b["A1"] = "Le tableau de bord de Serge"; b["A1"].font = Ftitre
        b["A3"] = "Agence pilote"; b["B3"] = "Kinshasa"
        b["A5"] = "CA total consolidé"
        b["A6"] = "CA de l'agence pilote"
        b["A7"] = "Part de l'agence pilote"
        b["A8"] = "Nombre de mois consolidés"
        b["A9"] = "Nombre de familles vendues"
        b["A10"] = "Contrôle — doit valoir 0"
        if corrige:
            b["B5"] = '=SUM(t_Conso[Montant_USD])'
            b["B6"] = '=SUMIFS(t_Conso[Montant_USD],t_Conso[Agence],$B$3)'
            b["B7"] = '=B6/B5'
            b["B8"] = '=COUNTA(_xlfn.UNIQUE(t_Conso[Mois]))'
            b["B9"] = '=COUNTA(_xlfn.UNIQUE(t_Conso[Famille]))'
            b["B10"] = '=SUM(t_Conso[Montant_USD])-B5'
            b["B7"].number_format = "0,0 %"
        largeurs(b, [34, 22])
        wb.save(RACINE / f"M03_L03_{suf}.xlsx")

if __name__ == "__main__":
    ecrire_mois(RACINE / "J03_Ventes_12_mois")
    wb = openpyxl.Workbook(); ecrire_raw(wb.active); wb.active.title = "Clients"
    wb.save(RACINE / "J03_CRM_Fusion.xlsx")
    lecon_01(); lecon_03(); tp03(False); tp03(True)
    print("classeurs écrits dans", RACINE)

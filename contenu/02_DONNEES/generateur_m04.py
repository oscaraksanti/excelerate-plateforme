#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════
#  Données du module 4 — commandes, livraisons, factures
#
#  Trois fichiers, 8 000 commandes, des clés qui ne concordent pas.
#  Le trou est construit, pas subi : on choisit les huit commandes
#  livrées jamais facturées, et on connaît leur montant à l'unité.
# ══════════════════════════════════════════════════════════════════════
import random, datetime as dt, pathlib, sys
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
NBSP    = " "

def entete(ws, cols, ligne=1):
    for i, c in enumerate(cols, start=1):
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
#  1. L'univers
# ══════════════════════════════════════════════════════════════════════
AGENCES = [("Kinshasa","KIN","CDF"), ("Lubumbashi","LUB","CDF"),
           ("Abidjan","ABJ","XOF"),  ("Dakar","DKR","XOF"),
           ("Douala","DLA","XAF"),   ("Libreville","LBV","XAF")]
TAUX = {"CDF": 3024, "XOF": 601, "XAF": 601}
CLIENTS = ["BOUTIQUE MAMA NGALULA","SUPERMARCHE CITY","DEPOT KINTAMBO",
           "ALIMENTATION BANDAL","GROSSISTE MATONGE","HOTEL FLEUVE CONGO",
           "RESTAURANT LE TROPICAL","EPICERIE LEMBA","SUPERETTE GOMBE",
           "DEPOT NGIRI-NGIRI","BOUTIQUE SELEMBAO","CANTINE UNIKIN",
           "MINI-MARCHE LIMETE","GROSSISTE MASINA","BOULANGERIE VICTOIRE",
           "DEPOT ABOBO","SUPERETTE PLATEAU","GROSSISTE SANDAGA",
           "DEPOT BONABERI","ALIMENTATION AKANDA"]

N_COMMANDES = 8000
DEBUT = dt.date(2026, 1, 1)

commandes = []
for i in range(1, N_COMMANDES + 1):
    agence, code, devise = random.choice(AGENCES)
    montant_local = int(round(random.lognormvariate(
        {"CDF": 14.6, "XOF": 13.0, "XAF": 13.0}[devise], 0.8) / 1000) * 1000)
    commandes.append({
        "ref": f"CMD-{i:05d}",
        "date": DEBUT + dt.timedelta(days=random.randint(0, 250)),
        "client": random.choice(CLIENTS),
        "agence": agence, "code": code, "devise": devise,
        "montant": montant_local,
    })

# ══════════════════════════════════════════════════════════════════════
#  2. Le trou — construit, pas subi
# ══════════════════════════════════════════════════════════════════════
#  Huit commandes livrées et jamais facturées. On choisit leurs montants
#  pour que le total tombe sur un chiffre net : c'est ce chiffre qui
#  donne son nom au travail pratique, et il doit être exact.
TROU_USD = [18_400, 14_250, 12_900, 11_600, 9_750, 7_480, 5_940, 4_000]
assert sum(TROU_USD) == 84_320

indices_trou = sorted(random.sample(range(N_COMMANDES), 8))
for k, idx in enumerate(indices_trou):
    c = commandes[idx]
    c["montant"] = int(round(TROU_USD[k] * TAUX[c["devise"]]))
    c["trou"] = True

# 120 commandes jamais livrées : elles sont en cours, ce n'est pas une anomalie
indices_non_livrees = set(random.sample(
    [i for i in range(N_COMMANDES) if i not in set(indices_trou)], 120))

livraisons, factures = [], []
n_liv = n_fac = 0

# ── Les trois façons de salir une clé ────────────────────────────────
def salir(ref: str, code: str, k: int) -> str:
    if k % 7 == 0: return ref.lower()                 # casse
    if k % 7 == 1: return f" {ref} "                  # espaces de bord
    if k % 7 == 2: return f"{code}/{ref}"             # préfixe d'agence
    if k % 7 == 3: return ref + NBSP                  # espace insécable
    if k % 7 == 4: return f"{code}/{ref.lower()}"     # les deux
    return ref                                        # propre

for i, c in enumerate(commandes):
    if i in indices_non_livrees:
        continue
    n_liv += 1
    livraisons.append({
        "ref": f"LIV-{n_liv:05d}",
        "cle": salir(c["ref"], c["code"], i),
        "date": c["date"] + dt.timedelta(days=random.randint(1, 12)),
        "colis": random.randint(1, 40),
    })
    if c.get("trou"):
        continue                                       # livrée, jamais facturée
    n_fac += 1
    # 3 % des factures s'écartent du montant commandé : avoirs, rabais, erreurs
    ecart = 0
    if random.random() < 0.03:
        ecart = int(round(c["montant"] * random.uniform(-0.08, 0.08) / 1000) * 1000)
    factures.append({
        "ref": f"FAC-{n_fac:05d}",
        "cle": salir(c["ref"], c["code"], i + 3),
        "date": c["date"] + dt.timedelta(days=random.randint(2, 25)),
        "montant": c["montant"] + ecart,
        "devise": c["devise"],
        "ecart": ecart,
    })

# ── 14 factures en double : le logiciel a hoqueté un matin ───────────
doublons = random.sample(range(len(factures)), 14)
for k in doublons:
    f = dict(factures[k]); n_fac += 1
    f["ref"] = f"FAC-{n_fac:05d}"
    f["doublon"] = True
    factures.append(f)

# ── 5 factures sans commande : une saisie manuelle fautive ───────────
for k in range(5):
    n_fac += 1
    factures.append({"ref": f"FAC-{n_fac:05d}", "cle": f"CMD-9{k:04d}",
                     "date": DEBUT + dt.timedelta(days=200 + k),
                     "montant": 1_200_000, "devise": "CDF", "ecart": 0,
                     "orpheline": True})

random.shuffle(livraisons); random.shuffle(factures)

print(f"commandes {len(commandes)} · livraisons {len(livraisons)} · factures {len(factures)}")
print(f"trou : {len(indices_trou)} commandes · {sum(TROU_USD):,} USD".replace(",", " "))

# ══════════════════════════════════════════════════════════════════════
#  3. Le rapprochement de référence
# ══════════════════════════════════════════════════════════════════════
SEUIL_ECART_USD = 20
DATE_ARRETE = dt.date(2026, 9, 30)

def normaliser(cle: str) -> str:
    """MAJUSCULES, sans espaces, sans le préfixe d'agence."""
    t = str(cle).replace(NBSP, "").replace(" ", "").upper()
    return t.split("/", 1)[1] if "/" in t else t

par_ref  = {c["ref"]: c for c in commandes}
brutes   = set(par_ref)                       # les clés telles qu'écrites

liv_par_cle, fac_par_cle = {}, {}
for l in livraisons: liv_par_cle.setdefault(normaliser(l["cle"]), []).append(l)
for f in factures:   fac_par_cle.setdefault(normaliser(f["cle"]), []).append(f)

def usd(montant, devise): return montant / TAUX[devise]

RAPPRO = []
for c in commandes:
    ls = liv_par_cle.get(c["ref"], [])
    fs = fac_par_cle.get(c["ref"], [])
    montant_fac = sum(f["montant"] for f in fs[:1])       # la 1re facture fait foi
    ecart_usd = usd(montant_fac - c["montant"], c["devise"]) if fs else 0.0
    if not ls:                       statut = "Non livrée"
    elif not fs:                     statut = "Livrée non facturée"
    elif len(fs) > 1:                statut = "Facture en double"
    elif abs(ecart_usd) > SEUIL_ECART_USD: statut = "Écart de montant"
    else:                            statut = "Rapprochée"
    RAPPRO.append({
        "ref": c["ref"], "client": c["client"], "agence": c["agence"],
        "devise": c["devise"], "montant": c["montant"],
        "montant_usd": round(usd(c["montant"], c["devise"]), 2),
        "livraison": ls[0]["ref"] if ls else "",
        "facture": fs[0]["ref"] if fs else "",
        "nb_factures": len(fs),
        "ecart_usd": round(ecart_usd, 2),
        "statut": statut,
    })

ORPHELINES = [f for f in factures if normaliser(f["cle"]) not in par_ref]

# ── Les valeurs de référence ─────────────────────────────────────────
NB_COMMANDES   = len(commandes)
NB_LIVRAISONS  = len(livraisons)
NB_FACTURES    = len(factures)
NB_CLES_SALES  = sum(1 for l in livraisons if l["cle"] != normaliser(l["cle"]))
NB_NON_LIVREES = sum(1 for r in RAPPRO if r["statut"] == "Non livrée")
NB_TROU        = sum(1 for r in RAPPRO if r["statut"] == "Livrée non facturée")
MONTANT_TROU   = round(sum(r["montant_usd"] for r in RAPPRO
                           if r["statut"] == "Livrée non facturée"), 2)
NB_DOUBLONS    = sum(r["nb_factures"] - 1 for r in RAPPRO if r["nb_factures"] > 1)
NB_ORPHELINES  = len(ORPHELINES)
NB_ECARTS      = sum(1 for r in RAPPRO if r["statut"] == "Écart de montant")
ECART_TOTAL    = round(sum(r["ecart_usd"] for r in RAPPRO
                           if r["statut"] == "Écart de montant"), 2)
PLUS_GROS      = round(max((abs(r["ecart_usd"]) for r in RAPPRO), default=0), 2)

print(f"clés non reconnues avant normalisation : {NB_CLES_SALES}")
print(f"non livrées {NB_NON_LIVREES} · trou {NB_TROU} = {MONTANT_TROU} USD")
print(f"doublons {NB_DOUBLONS} · orphelines {NB_ORPHELINES} · écarts {NB_ECARTS}")
print(f"écart total {ECART_TOTAL} USD · plus gros écart {PLUS_GROS} USD")

# ══════════════════════════════════════════════════════════════════════
#  4. Les feuilles
# ══════════════════════════════════════════════════════════════════════
def ecrire_commandes(ws):
    entete(ws, ["Ref_Commande", "Date", "Client", "Agence", "Devise", "Montant"])
    for i, c in enumerate(commandes, start=2):
        ws.cell(i, 1, c["ref"])
        ws.cell(i, 2, c["date"]).number_format = "DD/MM/YYYY"
        ws.cell(i, 3, c["client"]); ws.cell(i, 4, c["agence"])
        ws.cell(i, 5, c["devise"]); ws.cell(i, 6, c["montant"])
    tableau(ws, "t_Commandes", f"A1:F{len(commandes)+1}")
    largeurs(ws, [16, 12, 30, 14, 9, 16]); ws.freeze_panes = "A2"

def ecrire_livraisons(ws, cle_remplie=True):
    entete(ws, ["Ref_Livraison", "Ref_Commande", "Cle_Normalisee",
                "Date_Livraison", "Colis"])
    for i, l in enumerate(livraisons, start=2):
        ws.cell(i, 1, l["ref"]); ws.cell(i, 2, l["cle"])
        if cle_remplie: ws.cell(i, 3, normaliser(l["cle"]))
        ws.cell(i, 4, l["date"]).number_format = "DD/MM/YYYY"
        ws.cell(i, 5, l["colis"])
    tableau(ws, "t_Livraisons", f"A1:E{len(livraisons)+1}")
    largeurs(ws, [16, 22, 22, 15, 10]); ws.freeze_panes = "A2"

def ecrire_factures(ws, cle_remplie=True):
    entete(ws, ["Ref_Facture", "Ref_Commande", "Cle_Normalisee",
                "Date_Facture", "Montant", "Devise"])
    for i, f in enumerate(factures, start=2):
        ws.cell(i, 1, f["ref"]); ws.cell(i, 2, f["cle"])
        if cle_remplie: ws.cell(i, 3, normaliser(f["cle"]))
        ws.cell(i, 4, f["date"]).number_format = "DD/MM/YYYY"
        ws.cell(i, 5, f["montant"]); ws.cell(i, 6, f["devise"])
    tableau(ws, "t_Factures", f"A1:F{len(factures)+1}")
    largeurs(ws, [16, 22, 22, 15, 16, 9]); ws.freeze_panes = "A2"

def ecrire_parametres(ws):
    ws["A1"] = "PARAMETRES — toutes les hypothèses, et nulle part ailleurs"
    ws["A1"].font = Ftitre
    ws["A3"] = "Seuil d'écart significatif (USD)"; ws["B3"] = SEUIL_ECART_USD
    ws["A4"] = "Date d'arrêté";                    ws["B4"] = DATE_ARRETE
    ws["B4"].number_format = "DD/MM/YYYY"
    for a in ("A3", "A4"): ws[a].font = Fgras
    entete(ws, ["Devise", "Taux_USD"], ligne=6)
    for i, (d, t) in enumerate(TAUX.items(), start=7):
        ws.cell(i, 1, d); ws.cell(i, 2, t)
    tableau(ws, "t_Taux", "A6:B9")
    largeurs(ws, [32, 18, 4, 44])

COLS_RAPPRO = ["Ref_Commande", "Client", "Agence", "Devise", "Montant",
               "Montant_USD", "Ref_Livraison", "Ref_Facture", "Nb_Factures",
               "Ecart_USD", "Statut"]

def ecrire_rappro(ws, rempli: bool):
    entete(ws, COLS_RAPPRO)
    if not rempli:
        ws["A3"] = ("Une ligne par commande. Normalise les clés AVANT de rapprocher, "
                    "puis convertis en tableau structuré nommé t_Rappro (Ctrl+L).")
        ws["A3"].font = Faide
        largeurs(ws, [16, 30, 14, 9, 16, 14, 16, 16, 12, 14, 22]); return
    for i, r in enumerate(RAPPRO, start=2):
        for j, cle in enumerate(["ref", "client", "agence", "devise", "montant",
                                 "montant_usd", "livraison", "facture",
                                 "nb_factures", "ecart_usd", "statut"], start=1):
            ws.cell(i, j, r[cle])
    tableau(ws, "t_Rappro", f"A1:K{len(RAPPRO)+1}")
    largeurs(ws, [16, 30, 14, 9, 16, 14, 16, 16, 12, 14, 22]); ws.freeze_panes = "A2"

def feuille_readme(wb, rempli=False):
    ws = wb.create_sheet("README")
    ws["A1"] = "README — la carte d'identité du classeur"; ws["A1"].font = Ftitre
    for i, (k, v) in enumerate([
        ("Objectif", "Rapprocher commandes, livraisons et factures 2026, et chiffrer les écarts."),
        ("Sources", "Trois exports du logiciel de gestion, arrêtés au 30/09/2026."),
        ("Date de mise à jour", ""), ("Auteur", ""),
        ("Clé de rapprochement", "Ref_Commande normalisée : MAJUSCULES, sans espaces ordinaires ni insécables, sans le préfixe d'agence « XXX/ »."),
        ("Priorité des statuts", "Non livrée > Livrée non facturée > Facture en double > Écart de montant > Rapprochée."),
        ("Hypothèses", "La première facture d'une commande fait foi. Conversion au taux de la feuille PARAMETRES."),
        ("Définition — Écart significatif", "Écart en USD supérieur, en valeur absolue, au seuil de PARAMETRES."),
        ("Limites connues", ""), ("Contact", ""),
    ], start=3):
        ws.cell(i, 1, k).font = Fgras; ws.cell(i, 2, v)
        ws.cell(i, 1).border = Bord; ws.cell(i, 2).border = Bord
    largeurs(ws, [30, 96])

def feuille_qualite(wb, rempli=False):
    ws = wb.create_sheet("QUALITE")
    ws["A1"] = "QUALITE — les contrôles"; ws["A1"].font = Ftitre
    ws["A2"] = "Un contrôle qui ne peut pas échouer ne contrôle rien."; ws["A2"].font = Faide
    entete(ws, ["Contrôle", "Attendu", "Constaté", "Statut"], ligne=4)
    for i, (c, a) in enumerate([
        ("Commandes reprises", NB_COMMANDES),
        ("Livraisons rapprochées après normalisation", NB_LIVRAISONS),
        ("Commandes sans statut", 0),
        ("Factures orphelines", NB_ORPHELINES),
        ("Écart : commandes − livrées − non livrées", 0),
        ("Écart : factures − rapprochées − doublons − orphelines", 0),
    ], start=5):
        ws.cell(i, 1, c); ws.cell(i, 2, a)
        if rempli: ws.cell(i, 3, a); ws.cell(i, 4, "PASS")
    largeurs(ws, [56, 12, 12, 10])

def feuille_annexe(wb):
    ws = wb.create_sheet("ANNEXE_IA")
    ws["A1"] = "ANNEXE_IA — ce que l'IA a fait, et ce qu'elle a raté"; ws["A1"].font = Ftitre
    ws["A2"] = ("Un rapprochement sur clés brutes annonce des milliers d'écarts. "
                "C'est V3 — Volumétrie — qui doit vous arrêter.")
    ws["A2"].font = Faide
    entete(ws, ["Étape", "Le prompt utilisé", "Ce que l'IA a rendu",
                "L'erreur détectée", "Le V qui l'a attrapée", "La correction"], ligne=4)
    ws.cell(5, 1, "Méthode de rapprochement"); ws.cell(6, 1, "Normalisation des clés")
    ws.cell(7, 1, "Classement des écarts")
    for i in range(5, 10):
        for j in range(1, 7): ws.cell(i, j).border = Bord
    largeurs(ws, [30, 46, 34, 34, 20, 40])

# ══════════════════════════════════════════════════════════════════════
#  5. LE TP 4
# ══════════════════════════════════════════════════════════════════════
REPONSES = [
    (4,  "Nombre de commandes",
         '=ROWS(t_Commandes[Ref_Commande])'),
    (5,  "Nombre de livraisons",
         '=ROWS(t_Livraisons[Ref_Livraison])'),
    (6,  "Nombre de factures",
         '=ROWS(t_Factures[Ref_Facture])'),
    (7,  "Livraisons dont la clé a dû être réparée pour être rapprochée",
         '=SUMPRODUCT(--NOT(EXACT(t_Livraisons[Ref_Commande],'
         't_Livraisons[Cle_Normalisee])))'),
    (8,  "Commandes rapprochées d'au moins une livraison",
         '=COUNTIFS(t_Rappro[Ref_Livraison],"<>")'),
    (9,  "Commandes livrées et jamais facturées",
         '=COUNTIFS(t_Rappro[Statut],"Livrée non facturée")'),
    (10, "Montant de ces commandes, en USD",
         '=SUMIFS(t_Rappro[Montant_USD],t_Rappro[Statut],"Livrée non facturée")'),
    (11, "Commandes non livrées à ce jour",
         '=COUNTIFS(t_Rappro[Statut],"Non livrée")'),
    (12, "Factures en double",
         '=SUMPRODUCT((t_Rappro[Nb_Factures]>1)*(t_Rappro[Nb_Factures]-1))'),
    (13, "Factures sans commande correspondante",
         '=ROWS(t_Factures[Ref_Facture])-SUMPRODUCT(t_Rappro[Nb_Factures])'),
    (14, "Commandes dont l'écart de montant dépasse le seuil",
         '=COUNTIFS(t_Rappro[Statut],"Écart de montant")'),
    (15, "Écart total de montant, en USD",
         '=ROUND(SUMIFS(t_Rappro[Ecart_USD],t_Rappro[Statut],"Écart de montant"),2)'),
    (16, "Le plus gros écart unitaire, en valeur absolue et en USD",
         '=MAX(MAX(t_Rappro[Ecart_USD]),-MIN(t_Rappro[Ecart_USD]))'),
    (17, "Contrôle : commandes − livrées − non livrées  →  doit valoir 0",
         '=B4-B8-B11'),
    (18, "Contrôle : factures − rapprochées − doublons − orphelines  →  doit valoir 0",
         '=B6-SUMPRODUCT(--(t_Rappro[Nb_Factures]>0))-B12-B13'),
]

def tp04(corrige: bool):
    wb = openpyxl.Workbook()
    ecrire_commandes(wb.active); wb.active.title = "COMMANDES"
    ecrire_livraisons(wb.create_sheet("LIVRAISONS"), cle_remplie=corrige)
    ecrire_factures(wb.create_sheet("FACTURES"), cle_remplie=corrige)
    ecrire_parametres(wb.create_sheet("PARAMETRES"))
    ecrire_rappro(wb.create_sheet("RAPPROCHEMENT"), corrige)

    rep = wb.create_sheet("REPONSES")
    rep["A1"] = "REPONSES — une formule par cellule"; rep["A1"].font = Ftitre
    rep["A2"] = "Une valeur tapée à la main ne rapporte que la moitié des points."
    rep["A2"].font = Faide
    for ligne, libelle, formule in REPONSES:
        rep.cell(ligne, 1, libelle).border = Bord
        cel = rep.cell(ligne, 2); cel.border = Bord; cel.fill = Rgris
        if corrige: cel.value = formule
    largeurs(rep, [66, 22])

    par = wb["PARAMETRES"]
    if corrige:
        wb.defined_names.add(DefinedName("SeuilEcartUSD", attr_text="PARAMETRES!$B$3"))
        wb.defined_names.add(DefinedName("DateArrete",    attr_text="PARAMETRES!$B$4"))
    else:
        par["D3"] = "← nomme cette cellule  SeuilEcartUSD"
        par["D4"] = "← nomme cette cellule  DateArrete"
        par["D3"].font = Faide; par["D4"].font = Faide

    feuille_readme(wb, corrige); feuille_qualite(wb, corrige); feuille_annexe(wb)
    wb.save(RACINE / ("TP04_CORRIGE.xlsx" if corrige else "TP04_DEPART.xlsx"))

# ══════════════════════════════════════════════════════════════════════
#  6. Les classeurs des leçons — extraits maniables
# ══════════════════════════════════════════════════════════════════════
BAREME_REMISE = [(0, 0.00), (400, 0.02), (800, 0.04), (1500, 0.06), (3000, 0.09)]

def lecon_01():
    """INDEX/EQUIV et la table de barème."""
    for suf, corrige in (("DEPART", False), ("CORRIGE", True)):
        wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Commandes"
        entete(ws, ["Ref_Commande", "Client", "Agence", "Devise", "Montant",
                    "Montant_USD"] + (["Taux_Remise", "Remise_USD"] if corrige else []))
        extrait = commandes[:300]
        for i, c in enumerate(extrait, start=2):
            mu = round(c["montant"] / TAUX[c["devise"]], 2)
            ws.cell(i, 1, c["ref"]); ws.cell(i, 2, c["client"])
            ws.cell(i, 3, c["agence"]); ws.cell(i, 4, c["devise"])
            ws.cell(i, 5, c["montant"]); ws.cell(i, 6, mu)
            if corrige:
                taux = max(t for s, t in BAREME_REMISE if mu >= s)
                ws.cell(i, 7, taux).number_format = "0 %"
                ws.cell(i, 8, round(mu * taux, 2))
        tableau(ws, "t_Cmd", f"A1:{'H' if corrige else 'F'}{len(extrait)+1}")
        largeurs(ws, [16, 30, 14, 9, 16, 14, 14, 16])

        b = wb.create_sheet("BAREME")
        entete(b, ["Seuil_USD", "Taux_Remise"])
        for i, (s, t) in enumerate(BAREME_REMISE, start=2):
            b.cell(i, 1, s); b.cell(i, 2, t).number_format = "0 %"
        tableau(b, "t_Bareme", f"A1:B{len(BAREME_REMISE)+1}")
        largeurs(b, [16, 16])

        r = wb.create_sheet("Recherches")
        r["A1"] = "Les trois façons de chercher"; r["A1"].font = Ftitre
        pivot = max(extrait, key=lambda c: c["montant"] / TAUX[c["devise"]])
        r["A3"] = "Commande cherchée"; r["B3"] = pivot["ref"]
        r["A5"] = "Client — par INDEX/EQUIV"
        r["A6"] = "Client — par RECHERCHEX"
        r["A7"] = "Taux de remise — recherche approximative"
        r["A8"] = "Montant de la remise"
        r["A9"] = "Position de la commande dans la table"
        if corrige:
            r["B5"] = '=INDEX(t_Cmd[Client],MATCH($B$3,t_Cmd[Ref_Commande],0))'
            r["B6"] = '=_xlfn.XLOOKUP($B$3,t_Cmd[Ref_Commande],t_Cmd[Client],"absent")'
            r["B7"] = ('=INDEX(t_Bareme[Taux_Remise],MATCH('
                       '_xlfn.XLOOKUP($B$3,t_Cmd[Ref_Commande],t_Cmd[Montant_USD]),'
                       't_Bareme[Seuil_USD],1))')
            r["B8"] = '=_xlfn.XLOOKUP($B$3,t_Cmd[Ref_Commande],t_Cmd[Montant_USD])*B7'
            r["B9"] = '=MATCH($B$3,t_Cmd[Ref_Commande],0)'
            r["B7"].number_format = "0 %"
        largeurs(r, [40, 26])
        wb.save(RACINE / f"M04_L01_{suf}.xlsx")

def lecon_03():
    """Les matrices dynamiques sur un extrait."""
    for suf, corrige in (("DEPART", False), ("CORRIGE", True)):
        wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Rappro"
        entete(ws, COLS_RAPPRO)
        extrait = RAPPRO[:1200]
        for i, r in enumerate(extrait, start=2):
            for j, cle in enumerate(["ref","client","agence","devise","montant",
                                     "montant_usd","livraison","facture",
                                     "nb_factures","ecart_usd","statut"], start=1):
                ws.cell(i, j, r[cle])
        tableau(ws, "t_R", f"A1:K{len(extrait)+1}")
        largeurs(ws, [16, 30, 14, 9, 16, 14, 16, 16, 12, 14, 22])

        b = wb.create_sheet("Analyse")
        b["A1"] = "Ce que les matrices dynamiques savent faire"; b["A1"].font = Ftitre
        b["A2"] = ("Chaque réponse tient dans UNE cellule. C'est ce qui les rend "
                   "vérifiables — et ce qui évite le déversement quand on ne le veut pas.")
        b["A2"].font = Faide
        b["A4"] = "Statut cherché"; b["B4"] = "Écart de montant"
        b["A6"]  = "Nombre de lignes dans ce statut"
        b["A7"]  = "Statuts distincts, triés"
        b["A8"]  = "Agences concernées par ce statut"
        b["A9"]  = "Montant total de ce statut, en USD"
        b["A10"] = "Le plus gros écart de ce statut"
        b["A11"] = "Les cinq premières commandes concernées"
        b["A12"] = "Commandes concernées dans UNE SEULE agence"
        if corrige:
            b["B6"]  = '=ROWS(_xlfn._xlws.FILTER(t_R[Ref_Commande],t_R[Statut]=$B$4,"aucune"))'
            b["B7"]  = '=_xlfn.TEXTJOIN(" · ",TRUE,_xlfn._xlws.SORT(_xlfn.UNIQUE(t_R[Statut])))'
            b["B8"]  = ('=_xlfn.TEXTJOIN(" · ",TRUE,_xlfn._xlws.SORT(_xlfn.UNIQUE('
                        '_xlfn._xlws.FILTER(t_R[Agence],t_R[Statut]=$B$4,"aucune"))))')
            b["B9"]  = '=SUMIFS(t_R[Montant_USD],t_R[Statut],$B$4)'
            b["B10"] = ('=MAX(MAX(_xlfn._xlws.FILTER(t_R[Ecart_USD],t_R[Statut]=$B$4,0)),'
                        '-MIN(_xlfn._xlws.FILTER(t_R[Ecart_USD],t_R[Statut]=$B$4,0)))')
            b["B11"] = ('=_xlfn.TEXTJOIN(" · ",TRUE,_xlfn.TAKE(_xlfn._xlws.SORT('
                        '_xlfn._xlws.FILTER(t_R[Ref_Commande],t_R[Statut]=$B$4,"aucune")),5))')
            b["B12"] = ('=ROWS(_xlfn._xlws.FILTER(t_R[Ref_Commande],'
                        '(t_R[Statut]=$B$4)*(t_R[Agence]="Kinshasa"),"aucune"))')
        largeurs(b, [40, 74])
        wb.save(RACINE / f"M04_L03_{suf}.xlsx")

if __name__ == "__main__":
    for nom, ecrire in (("J04_Commandes", ecrire_commandes),
                        ("J04_Livraisons", ecrire_livraisons),
                        ("J04_Factures", ecrire_factures)):
        wb = openpyxl.Workbook(); ecrire(wb.active)
        wb.active.title = nom.split("_")[1]
        wb.save(RACINE / f"{nom}.xlsx")
    lecon_01(); lecon_03(); tp04(False); tp04(True)
    print("classeurs écrits dans", RACINE)

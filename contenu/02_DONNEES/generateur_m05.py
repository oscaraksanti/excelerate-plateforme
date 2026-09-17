#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════
#  Données du module 5 — 24 mois de ventes détaillées
#
#  Un volume qui rend le tableau croisé indispensable.
#  Trois faits sont CONSTRUITS, pas subis :
#    · le reclassement du plan comptable de Douala au 1er mars 2026,
#      qui fabrique une fausse baisse
#    · les 37 références vendues une seule fois dans l'exercice
#    · les 9 quantités stockées en texte, qui font qu'un TCD affiche
#      « Nombre de » au lieu de « Somme de »
# ══════════════════════════════════════════════════════════════════════
import random, datetime as dt, pathlib, sys, json, math
from collections import defaultdict

random.seed(2026)
RACINE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "sortie-m05")
RACINE.mkdir(parents=True, exist_ok=True)

# ══ 1 · L'univers ═════════════════════════════════════════════════════
AGENCES = [
    ("Kinshasa",   "KIN", "CDF", 0.27, 0.006),
    ("Lubumbashi", "LUB", "CDF", 0.16, 0.004),
    ("Abidjan",    "ABJ", "XOF", 0.17, 0.019),   # la plus en progression
    ("Dakar",      "DKR", "XOF", 0.13, 0.008),
    ("Douala",     "DLA", "XAF", 0.16, 0.002),   # celle du reclassement
    ("Libreville", "LBV", "XAF", 0.11, 0.005),
]
FAMILLES = ["Huiles", "Riz", "Farine", "Boissons", "Savons", "Conserves"]
#  Prix unitaire moyen en USD, et PART DE CHIFFRE D'AFFAIRES visée.
#  On raisonne en part de CA, pas en nombre de lignes : c'est la part de
#  CA qui donne son amplitude au reclassement de Douala, et c'est elle
#  qu'on veut piloter.
PU = {"Huiles": 21.8, "Riz": 44.8, "Farine": 29.5,
      "Boissons": 14.1, "Savons": 11.2, "Conserves": 18.8}
PART_CA = {"Huiles": 0.21, "Riz": 0.27, "Farine": 0.17,
           "Boissons": 0.12, "Savons": 0.10, "Conserves": 0.13}
#  Douala : Savons + Conserves pèsent 26,5 % du CA de l'agence. Ce sont
#  les deux familles que le reclassement fera disparaître des tableaux.
PART_CA_DLA = {"Huiles": 0.189, "Riz": 0.250, "Farine": 0.153,
               "Boissons": 0.158, "Savons": 0.127, "Conserves": 0.123}

def poids_lignes(parts):
    """Une part de CA se convertit en part de lignes en divisant par le prix."""
    b = {f: parts[f] / PU[f] for f in FAMILLES}
    t = sum(b.values())
    return {f: v / t for f, v in b.items()}

POIDS = poids_lignes(PART_CA)
POIDS_DLA = poids_lignes(PART_CA_DLA)

RECLASSEMENT = {"Savons": "Hygiène & entretien", "Conserves": "Épicerie sèche"}
DATE_RECLASSEMENT = dt.date(2026, 3, 1)

DEBUT = dt.date(2024, 10, 1)
MOIS = [dt.date(2024 + (9 + m) // 12, (9 + m) % 12 + 1, 1) for m in range(24)]
EXERCICE = dt.date(2025, 10, 1)          # début des 12 mois du TP
SEUIL_S2 = dt.date(2026, 4, 1)           # coupure semestre du TP

N_LIGNES = 120_000
SAISON = {1: 0.92, 2: 0.90, 3: 1.02, 4: 1.06, 5: 1.01, 6: 0.97,
          7: 0.99, 8: 1.07, 9: 1.00, 10: 1.03, 11: 1.08, 12: 1.21}

# ── Les taux mensuels, un par mois et par devise ─────────────────────
taux = {}
cdf, xof, xaf = 2780.0, 597.0, 597.0
for m in MOIS:
    cdf *= 1 + random.uniform(0.002, 0.014)
    xof *= 1 + random.uniform(-0.004, 0.006)
    xaf *= 1 + random.uniform(-0.004, 0.006)
    taux[m] = {"CDF": round(cdf, 2), "XOF": round(xof, 2), "XAF": round(xaf, 2)}

# ── Les 980 références ───────────────────────────────────────────────
FORMATS = {"Huiles": ["Huile végétale {} L", "Huile de palme {} L"],
           "Riz": ["Riz parfumé {} kg", "Riz brisé {} kg"],
           "Farine": ["Farine de blé {} kg", "Farine de maïs {} kg"],
           "Boissons": ["Jus concentré {} L", "Eau minérale pack {}"],
           "Savons": ["Savon de ménage lot {}", "Détergent {} kg"],
           "Conserves": ["Tomate concentrée {} g", "Sardines boîte {} g"]}
CALIBRES = {"Huiles": [1, 2, 5, 20], "Riz": [5, 10, 25, 50],
            "Farine": [1, 5, 25, 50], "Boissons": [1, 6, 12, 24],
            "Savons": [6, 12, 24, 48], "Conserves": [70, 125, 400, 800]}

references = []
for i in range(1, 981):
    fam = random.choices(FAMILLES, weights=[POIDS[f] for f in FAMILLES])[0]
    cal = random.choice(CALIBRES[fam])
    references.append({
        "ref": f"REF-{i:04d}",
        "produit": random.choice(FORMATS[fam]).format(cal),
        "famille": fam,
        "pu_usd": round(PU[fam] * random.uniform(0.55, 1.75), 2),
    })
# Les 37 dernières sont « en fin de vie » : une seule vente dans l'exercice.
FIN_DE_VIE = references[-37:]
ACTIVES = references[:-37]
PAR_FAMILLE = defaultdict(list)
for r in ACTIVES:
    PAR_FAMILLE[r["famille"]].append(r)

# ── Les clients et les commerciaux ───────────────────────────────────
TETES = ["BOUTIQUE", "DEPOT", "SUPERETTE", "ALIMENTATION", "GROSSISTE",
         "MINI-MARCHE", "EPICERIE", "CANTINE", "RESTAURANT", "HOTEL",
         "BOULANGERIE", "SUPERMARCHE", "KIOSQUE", "MAGASIN"]
QUARTIERS = ["NGALULA", "KINTAMBO", "BANDAL", "MATONGE", "LEMBA", "GOMBE",
             "MASINA", "LIMETE", "SELEMBAO", "NGIRI", "VICTOIRE", "ABOBO",
             "PLATEAU", "SANDAGA", "BONABERI", "AKANDA", "TREICHVILLE",
             "YOPOUGON", "MEDINA", "BONAPRISO", "KATUBA", "RUASHI",
             "MAKELEKELE", "OWENDO", "PIKINE", "COCODY", "DEIDO", "LIKASI",
             "NDJILI", "BINZA", "KALAMU", "BARUMBU", "MONT-NGAFULA"]
#  3 600 clients au fichier, repartis au prorata du poids des agences.
clients_par_agence = {}
for nom, code, devise, part, _c in AGENCES:
    cible = round(3600 * part)
    pool = set()
    k = 0
    while len(pool) < cible:
        pool.add(f"{random.choice(TETES)} {random.choice(QUARTIERS)} {k % 40 + 1:02d}")
        k += 1
    clients_par_agence[nom] = sorted(pool)

PRENOMS = ["Nadège", "Serge", "Aïcha", "Thomas", "Grace", "Patrick", "Sylvie",
           "Bernard", "Chantal", "Emmanuel", "Josée", "Marcel", "Nadia",
           "Olivier", "Prisca", "Rachel", "Samuel", "Trésor", "Viviane", "Yves",
           "Zola"]
NOMS = ["Kalala", "Kouadio", "Ndiaye", "Mbarga", "Ilunga", "Tshibangu",
        "Mukendi", "Diallo", "Traoré", "Nguema", "Bakala", "Mutombo",
        "Sow", "Fall", "Eyenga", "Obiang", "Kabongo", "Lumbala",
        "Nzuzi", "Bemba", "Kasongo"]
commerciaux = {}
k = 0
for nom, code, *_ in AGENCES:
    commerciaux[nom] = []
    for _ in range(7):
        commerciaux[nom].append(f"{PRENOMS[k % len(PRENOMS)]} {NOMS[(k*5) % len(NOMS)]}")
        k += 1

# ══ 2 · Les ventes ════════════════════════════════════════════════════
def poids_mois(m_index, croissance):
    m = MOIS[m_index]
    return (1 + croissance * m_index) * SAISON[m.month]

lignes = []
n_commande = 0

for a_i, (agence, code, devise, part, croiss) in enumerate(AGENCES):
    quota = int(N_LIGNES * part)
    poids = [poids_mois(i, croiss) for i in range(24)]
    total_poids = sum(poids)
    clients = clients_par_agence[agence]
    vendeurs = commerciaux[agence]
    for i, mois in enumerate(MOIS):
        n = int(round(quota * poids[i] / total_poids))
        jours = (dt.date(mois.year + (mois.month == 12), mois.month % 12 + 1, 1) - mois).days
        # on regroupe les lignes en commandes de 1 à 5 lignes
        reste = n
        while reste > 0:
            taille = min(reste, random.choices([1, 2, 3, 4, 5],
                                               weights=[30, 28, 20, 14, 8])[0])
            reste -= taille
            n_commande += 1
            ref_cmd = f"CMD-{code}-{n_commande:06d}"
            jour = mois + dt.timedelta(days=random.randint(0, jours - 1))
            client = random.choice(clients)
            vendeur = random.choice(vendeurs)
            poids_fam = POIDS_DLA if agence == "Douala" else POIDS
            for _ in range(taille):
                fam = random.choices(FAMILLES, weights=[poids_fam[f] for f in FAMILLES])[0]
                art = random.choice(PAR_FAMILLE[fam])
                qte = max(1, int(round(random.lognormvariate(2.6, 0.75))))
                t = taux[mois][devise]
                pu_local = round(art["pu_usd"] * t * random.uniform(0.96, 1.05), 2)
                montant_local = round(pu_local * qte, 2)
                famille = art["famille"]
                if agence == "Douala" and jour >= DATE_RECLASSEMENT and famille in RECLASSEMENT:
                    famille = RECLASSEMENT[famille]
                lignes.append({
                    "date": jour, "agence": agence, "devise": devise,
                    "commercial": vendeur, "client": client,
                    "commande": ref_cmd, "ref": art["ref"],
                    "produit": art["produit"], "famille": famille,
                    "qte": qte, "pu": pu_local, "local": montant_local,
                    "usd": round(montant_local / t, 2),
                })

PERIMETRE_TP = ("Abidjan", "Dakar", "Douala")
# ── Les 37 références en fin de vie : une vente, une seule, dans l'exercice
for art in FIN_DE_VIE:
    agence, code, devise, *_ = random.choice(
        [a for a in AGENCES if a[0] in ("Abidjan", "Dakar", "Douala")])
    mois = random.choice(MOIS[12:])
    jours = (dt.date(mois.year + (mois.month == 12), mois.month % 12 + 1, 1) - mois).days
    jour = mois + dt.timedelta(days=random.randint(0, jours - 1))
    n_commande += 1
    qte = random.randint(1, 6)
    t = taux[mois][devise]
    pu_local = round(art["pu_usd"] * t, 2)
    montant_local = round(pu_local * qte, 2)
    lignes.append({
        "date": jour, "agence": agence, "devise": devise,
        "commercial": random.choice(commerciaux[agence]),
        "client": random.choice(clients_par_agence[agence]),
        "commande": f"CMD-{code}-{n_commande:06d}", "ref": art["ref"],
        "produit": art["produit"], "famille": art["famille"],
        "qte": qte, "pu": pu_local, "local": montant_local,
        "usd": round(montant_local / t, 2),
    })

#  On ramene le fichier a exactement 120 000 lignes : le chiffre est
#  annonce dans le module, il doit etre vrai.
if len(lignes) > 120_000:
    protegees = {a["ref"] for a in FIN_DE_VIE}
    surnumeraires = [i for i, l in enumerate(lignes)
                     if l["ref"] not in protegees and l["date"] < EXERCICE]
    random.shuffle(surnumeraires)
    a_retirer = set(surnumeraires[: len(lignes) - 120_000])
    lignes = [l for i, l in enumerate(lignes) if i not in a_retirer]
assert len(lignes) == 120_000, len(lignes)

lignes.sort(key=lambda x: (x["date"], x["agence"], x["commande"]))
print(f"{len(lignes):>8,} lignes · {n_commande:,} commandes".replace(",", " "))

# ══ 3 · L'extrait du comité ══════════════════════════════════════════
#  Le DG a demandé le détail de trois agences seulement : la meilleure,
#  la moyenne, et celle qui inquiète. C'est le périmètre du TP, et c'est
#  ce qui garde le classeur sous les 30 000 lignes — le correcteur
#  automatique doit pouvoir le relire en moins de deux secondes.
PERIMETRE = ["Abidjan", "Dakar", "Douala"]
extrait = [l for l in lignes
           if l["date"] >= EXERCICE and l["agence"] in PERIMETRE]
print(f"{len(extrait):>8,} lignes dans l'extrait du comité".replace(",", " "))
print("  périmètre :", ", ".join(PERIMETRE))

# ── Vérification du fait construit n° 2 ──────────────────────────────
compte_ref = defaultdict(int)
for l in extrait:
    compte_ref[l["ref"]] += 1
une_fois = sorted(r for r, c in compte_ref.items() if c == 1)
print(f"  références vendues une seule fois : {len(une_fois)}")

# ── Les 9 quantités stockées en texte ────────────────────────────────
random.seed(505)
idx_texte = sorted(random.sample(range(len(extrait)), 9))
for i in idx_texte:
    extrait[i]["qte_texte"] = True

json.dump({"lignes": len(lignes), "commandes": n_commande,
           "extrait": len(extrait), "une_fois": len(une_fois),
           "idx_texte": idx_texte},
          open(RACINE / "_brut.json", "w"), indent=1)

# ══ 4 · Les valeurs de référence, calculées en Python ════════════════
#  Tout ce que le corrigé devra retrouver. Ces nombres sont la vérité :
#  si Excel en renvoie d'autres, c'est Excel qu'on corrige, pas eux.
def somme(rows, f=lambda l: True, k="usd"):
    return round(sum(l[k] for l in rows if f(l)), 2)

R = {}
R["lignes_total"] = len(lignes)
R["lignes_extrait"] = len(extrait)
R["commandes_extrait"] = len({l["commande"] for l in extrait})
R["ca_total"] = somme(extrait)
R["ca_24_mois"] = somme(lignes)

# — par mois
ca_mois = defaultdict(float)
for l in extrait:
    ca_mois[dt.date(l["date"].year, l["date"].month, 1)] += l["usd"]
ca_mois = {m: round(v, 2) for m, v in sorted(ca_mois.items())}
mois_fort = max(ca_mois, key=ca_mois.get)
R["mois_fort"] = mois_fort.isoformat()
R["ca_mois_fort"] = ca_mois[mois_fort]
R["ca_par_mois"] = {m.isoformat(): v for m, v in ca_mois.items()}

sept = dt.date(2026, 9, 1); aout = dt.date(2026, 8, 1)
R["var_sept_vs_aout"] = round(ca_mois[sept] / ca_mois[aout] - 1, 6)

# — par agence, S1 (oct→mars) et S2 (avr→sept)
prog = {}
for agence in PERIMETRE:
    s1 = somme(extrait, lambda l, a=agence: l["agence"] == a and l["date"] < SEUIL_S2)
    s2 = somme(extrait, lambda l, a=agence: l["agence"] == a and l["date"] >= SEUIL_S2)
    prog[agence] = {"s1": s1, "s2": s2, "var": round(s2 / s1 - 1, 6)}
R["progression_agences"] = prog
agence_top = max(prog, key=lambda a: prog[a]["var"])
R["agence_top"] = agence_top
R["progression_top"] = prog[agence_top]["var"]

# — par famille
ca_fam = defaultdict(float)
for l in extrait:
    ca_fam[l["famille"]] += l["usd"]
ca_fam = {f: round(v, 2) for f, v in sorted(ca_fam.items(), key=lambda x: -x[1])}
R["ca_par_famille"] = ca_fam
famille_top = next(iter(ca_fam))
R["famille_top"] = famille_top
R["part_famille_top"] = round(ca_fam[famille_top] / R["ca_total"], 6)

# — le reste des réponses
R["clients_distincts"] = len({l["client"] for l in extrait})
R["panier_moyen"] = round(R["ca_total"] / R["commandes_extrait"], 2)
R["ca_cumul_s1"] = somme(extrait, lambda l: l["date"] < SEUIL_S2)
R["refs_une_fois"] = len(une_fois)
R["ca_abidjan"] = somme(extrait, lambda l: l["agence"] == "Abidjan")
R["ca_abidjan_local"] = somme(extrait, lambda l: l["agence"] == "Abidjan", "local")
R["qte_totale"] = sum(l["qte"] for l in extrait)
R["ca_par_agence"] = {a: somme(extrait, lambda l, x=a: l["agence"] == x)
                      for a in PERIMETRE}
R["libelles_famille"] = sorted({l["famille"] for l in extrait})
R["clients_au_fichier"] = sum(len(v) for v in clients_par_agence.values())

# — le fait construit n° 1 : la fausse baisse de Douala
HISTO = set(FAMILLES)
dla_recent = somme(lignes, lambda l: l["agence"] == "Douala" and l["date"] >= EXERCICE)
dla_avant = somme(lignes, lambda l: l["agence"] == "Douala" and l["date"] < EXERCICE)
dla_recent_h = somme(lignes, lambda l: l["agence"] == "Douala"
                     and l["date"] >= EXERCICE and l["famille"] in HISTO)
dla_avant_h = somme(lignes, lambda l: l["agence"] == "Douala"
                    and l["date"] < EXERCICE and l["famille"] in HISTO)
R["douala"] = {
    "reel_12m": dla_recent, "reel_12m_precedents": dla_avant,
    "variation_reelle": round(dla_recent / dla_avant - 1, 6),
    "familles_historiques_12m": dla_recent_h,
    "familles_historiques_precedents": dla_avant_h,
    "variation_apparente": round(dla_recent_h / dla_avant_h - 1, 6),
    "reclasse": round(dla_recent - dla_recent_h, 2),
}

json.dump(R, open(RACINE / "REFERENCES_M05.json", "w"), indent=1, ensure_ascii=False)
for k in ("lignes_total", "lignes_extrait", "commandes_extrait", "ca_total",
          "mois_fort", "ca_mois_fort", "var_sept_vs_aout", "agence_top",
          "progression_top", "famille_top", "part_famille_top",
          "clients_distincts", "panier_moyen", "ca_cumul_s1", "refs_une_fois",
          "ca_abidjan", "qte_totale"):
    print(f"  {k:<26} {R[k]}")
print("  agences   ", {a: round(v["var"]*100, 1) for a, v in
      sorted(prog.items(), key=lambda x: -x[1]["var"])})
print("  familles  ", {f: round(v/R["ca_total"]*100, 1) for f, v in ca_fam.items()})
print("  mois      ", {m[:7]: round(v/1e6, 2) for m, v in R["ca_par_mois"].items()})
print("  clients au fichier", R["clients_au_fichier"])
print("  douala apparent", R["douala"]["variation_apparente"],
      "· réel", R["douala"]["variation_reelle"])

# ══ 5 · Les classeurs ═════════════════════════════════════════════════
import openpyxl
from openpyxl.worksheet.table import Table, TableStyleInfo, TableColumn
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

Ftitre  = Font(name="Calibri", size=14, bold=True, color="FF101418")
Fentete = Font(name="Calibri", size=11, bold=True, color="FFFFFFFF")
Faide   = Font(name="Calibri", size=10, italic=True, color="FF6B7280")
Fgras   = Font(name="Calibri", size=11, bold=True)
Rentete = PatternFill("solid", fgColor="FF243044")
Rjaune  = PatternFill("solid", fgColor="FFFFF6D8")
Rvert   = PatternFill("solid", fgColor="FFE8F6EE")
Bord    = Border(bottom=Side(style="thin", color="FFD6DBE1"))

FMT_USD = '#,##0.00\\ "USD"'
FMT_LOC = '#,##0.00'
FMT_DATE = "dd/mm/yyyy"
FMT_PCT = "0.00%"
FMT_INT = "#,##0"

def table_wo(ws, nom, ref, entetes):
    """Un tableau structuré dans une feuille écrite en mode flux."""
    t = Table(displayName=nom, ref=ref)
    t.tableColumns = [TableColumn(id=i, name=n) for i, n in enumerate(entetes, 1)]
    t.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
    ws.add_table(t)

def colonnes(ws, specs):
    """(largeur, format) par colonne — posé sur la colonne, pas sur 1,5 M de cellules."""
    for i, (w, fmt) in enumerate(specs, start=1):
        d = ws.column_dimensions[get_column_letter(i)]
        d.width = w
        if fmt:
            d.number_format = fmt

def entete_simple(ws, cols, ligne=1, depart=1):
    for i, c in enumerate(cols, start=depart):
        cel = ws.cell(ligne, i, c)
        cel.font, cel.fill = Fentete, Rentete
        cel.alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[ligne].height = 22

# ── 5.1 · Le fichier des 24 mois ─────────────────────────────────────
COLS_J05 = ["Date_Vente", "Agence", "Devise", "Commercial", "Client",
            "N_Commande", "Reference", "Produit", "Famille", "Quantite",
            "Montant_Local", "Montant_USD"]

wb = openpyxl.Workbook(write_only=True)
ws = wb.create_sheet("Ventes")
colonnes(ws, [(12, FMT_DATE), (13, None), (8, None), (19, None), (26, None),
              (18, None), (11, None), (24, None), (18, None), (10, FMT_INT),
              (16, FMT_LOC), (15, FMT_USD)])
ws.append(COLS_J05)
for l in lignes:
    ws.append([l["date"], l["agence"], l["devise"], l["commercial"], l["client"],
               l["commande"], l["ref"], l["produit"], l["famille"], l["qte"],
               l["local"], l["usd"]])
table_wo(ws, "t_Ventes", f"A1:L{len(lignes)+1}", COLS_J05)

wt = wb.create_sheet("Taux")
colonnes(wt, [(12, FMT_DATE), (12, FMT_LOC), (12, FMT_LOC), (12, FMT_LOC)])
wt.append(["Mois", "CDF_USD", "XOF_USD", "XAF_USD"])
for m in MOIS:
    wt.append([m, taux[m]["CDF"], taux[m]["XOF"], taux[m]["XAF"]])
table_wo(wt, "t_Taux", f"A1:D{len(MOIS)+1}",
         ["Mois", "CDF_USD", "XOF_USD", "XAF_USD"])
wb.save(RACINE / "J05_Ventes_24_mois.xlsx")
print("  J05_Ventes_24_mois.xlsx  %.1f Mo"
      % ((RACINE / "J05_Ventes_24_mois.xlsx").stat().st_size / 1e6))

# ══ 6 · Le travail pratique ═══════════════════════════════════════════
COLS_TP = ["Date_Vente", "Agence", "Devise", "Commercial", "Client",
           "N_Commande", "Reference", "Famille", "Quantite",
           "Montant_Local", "Montant_USD"]
LARG_TP = [(12, FMT_DATE), (13, None), (8, None), (19, None), (26, None),
           (18, None), (11, None), (20, None), (10, FMT_INT),
           (16, FMT_LOC), (15, FMT_USD)]
N_TP = len(extrait)
FIN = N_TP + 1

def feuille_ventes(wb, corrige):
    ws = wb.create_sheet("Ventes")
    colonnes(ws, LARG_TP)
    entete_simple(ws, COLS_TP)
    for i, l in enumerate(extrait, start=2):
        qte = l["qte"]
        if l.get("qte_texte") and not corrige:
            qte = str(qte)                    # le piège : une quantité en texte
        for j, v in enumerate([l["date"], l["agence"], l["devise"], l["commercial"],
                               l["client"], l["commande"], l["ref"], l["famille"],
                               qte, l["local"], l["usd"]], start=1):
            ws.cell(i, j, v)
    ws.freeze_panes = "A2"
    if corrige:
        table_wo(ws, "t_Ventes", f"A1:K{FIN}", COLS_TP)
    return ws

TITRES_LECTURE = [
    ("Le mois le plus fort de l'exercice  (1er du mois)", dt.date(2025, 12, 1), FMT_DATE),
    ("L'agence la plus en progression  (2e semestre vs 1er)", "Abidjan", None),
    ("La première famille de produits", "Riz", None),
    ("Le chiffre d'affaires total lu dans le TCD  (USD)", R["ca_total"], FMT_USD),
]

V = "t_Ventes"
U = f"{V}[Montant_USD]"
D = f"{V}[Date_Vente]"
TITRES_FORMULE = [
    ("Chiffre d'affaires total de l'exercice  (USD)",
     f"=SUM({U})", FMT_USD),
    ("Chiffre d'affaires du mois le plus fort  (USD)",
     f'=SUMIFS({U},{D},">="&$B$5,{D},"<"&EDATE($B$5,1))', FMT_USD),
    ("Progression de l'agence citée en B6  (2e sem. vs 1er)",
     f'=SUMIFS({U},{V}[Agence],$B$6,{D},">="&DATE(2026,4,1))'
     f'/SUMIFS({U},{V}[Agence],$B$6,{D},"<"&DATE(2026,4,1))-1', FMT_PCT),
    ("Variation de septembre par rapport à août  (tout le périmètre)",
     f'=SUMIFS({U},{D},">="&DATE(2026,9,1))'
     f'/SUMIFS({U},{D},">="&DATE(2026,8,1),{D},"<"&DATE(2026,9,1))-1', FMT_PCT),
    ("Part de la famille citée en B7 dans le CA total",
     f"=SUMIFS({U},{V}[Famille],$B$7)/$B$11", FMT_PCT),
    ("Nombre de clients distincts servis",
     f"=COUNTA(_xlfn.UNIQUE({V}[Client]))", FMT_INT),
    ("Nombre de commandes distinctes",
     f"=ROWS(_xlfn.UNIQUE({V}[N_Commande]))", FMT_INT),
    ("Panier moyen par commande  (USD)",
     "=$B$11/$B$17", FMT_USD),
    ("Chiffre d'affaires cumulé au 31 mars  (USD)",
     f'=SUMIFS({U},{D},"<"&DATE(2026,4,1))', FMT_USD),
    ("Nombre de références vendues une seule fois dans l'exercice",
     f"=SUMPRODUCT(--(COUNTIF({V}[Reference],{V}[Reference])=1))", FMT_INT),
    ("Chiffre d'affaires d'Abidjan  (USD)",
     f'=SUMIFS({U},{V}[Agence],"Abidjan")', FMT_USD),
    ("Quantité totale vendue",
     f"=SUM({V}[Quantite])", FMT_INT),
    ("R_ECART_TCD — écart entre le TCD et la formule  ·  doit valoir 0",
     "=$B$8-$B$11", FMT_USD),
    ("R_CONTROLE — total moins la somme des trois agences  ·  doit valoir 0",
     f'=$B$11-(SUMIFS({U},{V}[Agence],"Abidjan")'
     f'+SUMIFS({U},{V}[Agence],"Dakar")'
     f'+SUMIFS({U},{V}[Agence],"Douala"))', FMT_USD),
]

TITRES_QUALITE = [
    ("Lignes présentes dans le tableau", f"=ROWS({V}[Date_Vente])", FMT_INT,
     "doit valoir 29 046 — si le tableau s'arrête avant, le TCD aussi"),
    ("Q_TEXTE — quantités encore stockées en texte  ·  doit valoir 0",
     f"=COUNTA({V}[Quantite])-COUNT({V}[Quantite])", FMT_INT,
     "tant que ce n'est pas 0, le TCD affiche « Nombre de » et la somme est fausse"),
    ("Libellés de famille distincts",
     f"=COUNTA(_xlfn.UNIQUE({V}[Famille]))", FMT_INT,
     "il y a six familles au catalogue. Si vous en trouvez plus, expliquez pourquoi."),
]

def feuille_reponses(wb, corrige):
    ws = wb.create_sheet("REPONSES")
    ws.column_dimensions["A"].width = 62
    ws.column_dimensions["B"].width = 22
    ws["A1"] = "TP 5 — Le comité de direction de jeudi"; ws["A1"].font = Ftitre
    ws["A2"] = ("Ne remplissez que la colonne B. Les six tableaux croisés vont "
                "sur la feuille TCD.")
    ws["A2"].font = Faide
    ws["A4"] = "①  CE QUE VOUS LISEZ DANS LE TABLEAU CROISÉ"; ws["A4"].font = Fgras
    for i, (lib, val, fmt) in enumerate(TITRES_LECTURE, start=5):
        ws.cell(i, 1, lib).border = Bord
        c = ws.cell(i, 2)
        c.fill, c.border = Rjaune, Bord
        if fmt: c.number_format = fmt
        if corrige: c.value = val
    ws["A10"] = "②  CE QUE LA FORMULE VÉRIFIE"; ws["A10"].font = Fgras
    for i, (lib, f, fmt) in enumerate(TITRES_FORMULE, start=11):
        ws.cell(i, 1, lib).border = Bord
        c = ws.cell(i, 2)
        c.fill, c.border = Rjaune, Bord
        if fmt: c.number_format = fmt
        if corrige: c.value = f
    for i in (23, 24):
        ws.cell(i, 1).font = Fgras
        ws.cell(i, 2).fill = Rvert
    return ws

def feuille_qualite(wb, corrige):
    ws = wb.create_sheet("QUALITE")
    ws.column_dimensions["A"].width = 58
    ws.column_dimensions["B"].width = 16
    ws.column_dimensions["C"].width = 62
    ws["A1"] = "Contrôles de qualité"; ws["A1"].font = Ftitre
    entete_simple(ws, ["Contrôle", "Valeur", "Ce que ça veut dire"], ligne=3)
    for i, (lib, f, fmt, quoi) in enumerate(TITRES_QUALITE, start=4):
        ws.cell(i, 1, lib).border = Bord
        c = ws.cell(i, 2); c.fill, c.border, c.number_format = Rjaune, Bord, fmt
        if corrige: c.value = f
        ws.cell(i, 3, quoi).font = Faide
    ws["A8"] = "Statut général"; ws["A8"].font = Fgras
    if corrige:
        ws["B8"] = "PASS"
        ws["A10"] = ("Les neuf quantités stockées en texte ont été converties "
                     "(Données > Convertir, ou multiplication par 1).")
        ws["A11"] = ("Huit libellés de famille pour six familles : Douala a "
                     "reclassé Savons et Conserves au 1er mars 2026. "
                     "Les deux nouveaux libellés sont conservés tels quels et "
                     "regroupés dans le TCD, jamais réécrits dans la source.")
    return ws

TEXTES = {
 "README": [
   ("Source", "J05_Ventes_24_mois.xlsx — extrait des trois agences sous revue"),
   ("Périmètre", "Abidjan, Dakar, Douala · 1er octobre 2025 → 30 septembre 2026"),
   ("Volume", "29 046 lignes · 12 108 commandes · 1 607 clients"),
   ("Devise de restitution", "USD. Montant_Local n'est jamais additionné entre agences."),
   ("Hypothèse 1", "Le 2e semestre court du 1er avril au 30 septembre 2026."),
   ("Hypothèse 2", "Une commande = une valeur distincte de N_Commande."),
   ("Hypothèse 3", "Les deux libellés introduits par Douala au 1er mars 2026 "
                   "sont regroupés avec leurs familles d'origine dans l'analyse."),
   ("Actualisation", "Coller le nouvel extrait dans le tableau t_Ventes, puis "
                     "Données > Actualiser tout. Les six TCD suivent."),
   ("Contrôles", "R_ECART_TCD et R_CONTROLE doivent valoir 0 avant tout envoi."),
 ],
 "ANNEXE_IA": [
   ("Prompt 1", "Voici les en-têtes et 30 lignes d'un extrait de ventes. "
                "Quelles questions ce jeu permet-il de trancher, que le comité "
                "n'a pas posées ?"),
   ("Prompt 2", "Donne-moi la configuration de tableau croisé (lignes, colonnes, "
                "valeurs, filtres) qui répond à : quelle agence progresse le plus "
                "d'un semestre à l'autre ? Ne me donne pas le chiffre, donne-moi "
                "le tableau."),
   ("Prompt 3", "Rédige une note de synthèse de trois phrases pour un comité de "
                "direction, à partir de ces six chiffres. Une phrase de constat, "
                "une de cause, une de décision."),
   ("Erreur détectée", "L'IA a conclu à une baisse de 12,2 % à Douala. "
                       "La baisse n'existe pas : l'agence a reclassé deux familles "
                       "au 1er mars 2026. Le chiffre réel est +2,9 %."),
   ("Quel V l'a attrapée", "V4 — Vérité métier. Ni V1, ni V2, ni V3 ne pouvaient "
                           "la voir : la formule était juste, l'ordre de grandeur "
                           "plausible, la version sans importance."),
 ],
}

def feuille_texte(wb, nom, corrige):
    ws = wb.create_sheet(nom)
    ws.column_dimensions["A"].width = 26
    ws.column_dimensions["B"].width = 92
    ws["A1"] = nom; ws["A1"].font = Ftitre
    for i, (cle, val) in enumerate(TEXTES[nom], start=3):
        c = ws.cell(i, 1, cle); c.font, c.border = Fgras, Bord
        d = ws.cell(i, 2, val if corrige else ""); d.border = Bord
        d.alignment = Alignment(wrap_text=True, vertical="top")
        if not corrige: d.fill = Rjaune
    return ws

def feuille_tcd(wb, corrige):
    ws = wb.create_sheet("TCD")
    ws.column_dimensions["A"].width = 100
    ws["A1"] = "Les six tableaux croisés"; ws["A1"].font = Ftitre
    lignes_txt = [
        "Un tableau croisé par question, les uns sous les autres, titrés.",
        "",
        "1 — Chiffre d'affaires par mois.  Mois en lignes, Montant_USD en valeurs.",
        "2 — Chiffre d'affaires par agence et par semestre, avec « % de différence ».",
        "3 — Chiffre d'affaires par famille, en % du total général.",
        "4 — Nombre de clients distincts par agence.",
        "5 — Chiffre d'affaires cumulé mois par mois.",
        "6 — Références triées du moins vendu au plus vendu.",
        "",
        "Un segment Agence et une chronologie Date_Vente, connectés aux six.",
    ]
    for i, t in enumerate(lignes_txt, start=3):
        ws.cell(i, 1, t)
    return ws

def classeur_tp(corrige):
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    feuille_ventes(wb, corrige)
    feuille_tcd(wb, corrige)
    feuille_reponses(wb, corrige)
    feuille_texte(wb, "README", corrige)
    feuille_qualite(wb, corrige)
    feuille_texte(wb, "ANNEXE_IA", corrige)
    if corrige:
        for nom, cible in (("R_ECART_TCD", "REPONSES!$B$23"),
                           ("R_CONTROLE", "REPONSES!$B$24"),
                           ("Q_TEXTE", "QUALITE!$B$5")):
            wb.defined_names[nom] = DefinedName(nom, attr_text=cible)
    nom = "TP05_CORRIGE.xlsx" if corrige else "TP05_DEPART.xlsx"
    wb.save(RACINE / nom)
    print("  %-22s %.1f Mo" % (nom, (RACINE / nom).stat().st_size / 1e6))

classeur_tp(False)
classeur_tp(True)

# ══ 7 · Les classeurs de leçon ════════════════════════════════════════
#  Leçon 1 — le rapport qu'on reçoit, et la table qu'il aurait dû être.
KIN_DEC = [l for l in lignes
           if l["agence"] == "Kinshasa" and l["date"].year == 2025
           and l["date"].month == 12]
print(f"  leçon 1 : {len(KIN_DEC)} lignes (Kinshasa, décembre 2025)")

def rapport_recu(ws):
    """Le rapport mensuel tel qu'il circule : increvable à l'œil, impivotable."""
    ws.merge_cells("A1:F1")
    ws["A1"] = "GROUPE BAOBAB SARL — RAPPORT MENSUEL DES VENTES"
    ws["A1"].font = Ftitre
    ws["A1"].alignment = Alignment(horizontal="center")
    ws.merge_cells("A2:F2")
    ws["A2"] = "Agence de Kinshasa — décembre 2025 — montants en CDF"
    ws["A2"].font = Faide
    ws["A2"].alignment = Alignment(horizontal="center")

    par_fam = defaultdict(lambda: defaultdict(float))
    for l in KIN_DEC:
        par_fam[l["famille"]][l["commercial"]] += l["local"]

    r = 4
    total_general = 0.0
    for k, (fam, vendeurs) in enumerate(sorted(par_fam.items())):
        if k in (0, 3):                       # l'en-tête est répété au milieu
            for i, t in enumerate(["Famille", "Commercial", "Montant CDF"], start=1):
                c = ws.cell(r, i, t); c.font, c.fill = Fentete, Rentete
            r += 1
        ws.cell(r, 1, fam).font = Fgras
        r += 1
        s = 0.0
        for vendeur, m in sorted(vendeurs.items()):
            ws.cell(r, 2, vendeur)
            c = ws.cell(r, 3, round(m, 2)); c.number_format = FMT_LOC
            s += m
            r += 1
        ws.cell(r, 2, f"Sous-total {fam}").font = Fgras
        c = ws.cell(r, 3, round(s, 2)); c.font, c.number_format = Fgras, FMT_LOC
        total_general += s
        r += 2                                 # la ligne vide entre deux blocs
    ws.cell(r, 2, "TOTAL GÉNÉRAL").font = Ftitre
    c = ws.cell(r, 3, round(total_general, 2)); c.font, c.number_format = Ftitre, FMT_LOC
    ws.column_dimensions["A"].width = 22
    ws.column_dimensions["B"].width = 24
    ws.column_dimensions["C"].width = 18

COLS_L01 = ["Date_Vente", "Commercial", "Client", "N_Commande", "Reference",
            "Famille", "Quantite", "Montant_CDF", "Montant_USD"]

def lecon01(corrige):
    wb = openpyxl.Workbook(); wb.remove(wb.active)
    ws = wb.create_sheet("Rapport_recu"); rapport_recu(ws)

    wv = wb.create_sheet("Ventes")
    colonnes(wv, [(12, FMT_DATE), (19, None), (26, None), (18, None), (11, None),
                  (13, None), (10, FMT_INT), (16, FMT_LOC), (14, FMT_USD)])
    entete_simple(wv, COLS_L01)
    for i, l in enumerate(KIN_DEC, start=2):
        for j, v in enumerate([l["date"], l["commercial"], l["client"], l["commande"],
                               l["ref"], l["famille"], l["qte"], l["local"],
                               l["usd"]], start=1):
            wv.cell(i, j, v)
    wv.freeze_panes = "A2"
    if corrige:
        table_wo(wv, "t_Kin", f"A1:I{len(KIN_DEC)+1}", COLS_L01)
        wa = wb.create_sheet("Attendu")
        wa.column_dimensions["A"].width = 46
        wa.column_dimensions["B"].width = 20
        wa["A1"] = "Ce que le tableau croisé doit produire"; wa["A1"].font = Ftitre
        wa["A2"] = ("Le TCD se construit à l'écran. Ces formules disent ce qu'il "
                    "doit afficher — si les deux divergent, c'est le TCD qui a tort.")
        wa["A2"].font = Faide
        att = [("Chiffre d'affaires total (CDF)", "=SUM(t_Kin[Montant_CDF])", FMT_LOC),
               ("Nombre de lignes de vente", "=ROWS(t_Kin[Date_Vente])", FMT_INT),
               ("Nombre de commandes distinctes",
                "=ROWS(_xlfn.UNIQUE(t_Kin[N_Commande]))", FMT_INT),
               ("Nombre de clients distincts",
                "=COUNTA(_xlfn.UNIQUE(t_Kin[Client]))", FMT_INT),
               ("CA de la famille Riz (CDF)",
                '=SUMIFS(t_Kin[Montant_CDF],t_Kin[Famille],"Riz")', FMT_LOC),
               ("Part du Riz dans le total", "=B8/B4", FMT_PCT),
               ("Panier moyen par commande (CDF)", "=B4/B6", FMT_LOC),
               ("Quantité totale vendue", "=SUM(t_Kin[Quantite])", FMT_INT)]
        for i, (lib, f, fmt) in enumerate(att, start=4):
            wa.cell(i, 1, lib).border = Bord
            c = wa.cell(i, 2, f); c.number_format, c.border = fmt, Bord
    nom = f"M05_L01_{'CORRIGE' if corrige else 'DEPART'}.xlsx"
    wb.save(RACINE / nom); print("  " + nom)

lecon01(False); lecon01(True)

#  Leçon 3 — SOUS.TOTAL, AGREGAT, et ce que chacun ignore.
SUIVI = [l for l in extrait if l["agence"] == "Dakar"][:420]

def lecon03(corrige):
    wb = openpyxl.Workbook(); wb.remove(wb.active)
    ws = wb.create_sheet("Suivi")
    cols = ["Date_Vente", "Commercial", "Client", "Reference", "Famille",
            "Quantite", "Montant_USD", "Cout_USD", "Marge_Pct"]
    colonnes(ws, [(12, FMT_DATE), (19, None), (26, None), (11, None), (13, None),
                  (10, FMT_INT), (14, FMT_USD), (14, FMT_USD), (12, FMT_PCT)])
    entete_simple(ws, cols)
    for i, l in enumerate(SUIVI, start=2):
        # trois lignes ont un coût nul : la marge y devient #DIV/0!
        cout = 0 if i in (37, 154, 288) else round(l["usd"] * random.uniform(0.62, 0.88), 2)
        for j, v in enumerate([l["date"], l["commercial"], l["client"], l["ref"],
                               l["famille"], l["qte"], l["usd"], cout], start=1):
            ws.cell(i, j, v)
        ws.cell(i, 9, f"=(G{i}-H{i})/H{i}").number_format = FMT_PCT
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:I{len(SUIVI)+1}"
    for r in (12, 13, 14, 15, 16):             # cinq lignes masquées à la main
        ws.row_dimensions[r].hidden = True

    wc = wb.create_sheet("Comparaison")
    wc.column_dimensions["A"].width = 52
    wc.column_dimensions["B"].width = 18
    wc.column_dimensions["C"].width = 62
    wc["A1"] = "Six façons de faire une somme, et ce que chacune ignore"
    wc["A1"].font = Ftitre
    P = f"Suivi!$G$2:$G${len(SUIVI)+1}"
    M = f"Suivi!$I$2:$I${len(SUIVI)+1}"
    blocs = [
        ("SOMME — ignore tout le monde", f"=SUM({P})", FMT_USD,
         "compte les lignes masquées et les lignes filtrées"),
        ("SOUS.TOTAL(9) — ignore le filtre", f"=SUBTOTAL(9,{P})", FMT_USD,
         "suit le filtre, mais compte les lignes masquées à la main"),
        ("SOUS.TOTAL(109) — ignore le filtre ET le masquage",
         f"=SUBTOTAL(109,{P})", FMT_USD,
         "c'est le seul qui suit les deux"),
        ("AGREGAT(9;5) — ignore les lignes masquées",
         f"=_xlfn.AGGREGATE(9,5,{P})", FMT_USD,
         "même résultat que SOUS.TOTAL(109), écrit autrement"),
        ("SOMME sur la colonne Marge_Pct", f"=SUM({M})", FMT_PCT,
         "rend #DIV/0! : trois erreurs contaminent toute la somme"),
        ("MOYENNE des marges", f"=AVERAGE({M})", FMT_PCT,
         "rend #DIV/0! elle aussi — aucune fonction classique ne s'en sort"),
        ("AGREGAT(1;6) — la moyenne qui survit",
         f"=_xlfn.AGGREGATE(1,6,{M})", FMT_PCT,
         "1 = MOYENNE, 6 = ignorer les erreurs. C'est la seule qui répond."),
        ("AGREGAT(1;7) — erreurs ET lignes masquées",
         f"=_xlfn.AGGREGATE(1,7,{M})", FMT_PCT,
         "7 = les deux à la fois. C'est celle des tableaux de bord."),
    ]
    entete_simple(wc, ["Formule", "Résultat", "Ce qu'elle ignore"], ligne=3)
    for i, (lib, f, fmt, quoi) in enumerate(blocs, start=4):
        wc.cell(i, 1, lib).border = Bord
        c = wc.cell(i, 2); c.border, c.number_format = Bord, fmt
        if corrige: c.value = f
        else: c.fill = Rjaune
        wc.cell(i, 3, quoi).font = Faide
    nom = f"M05_L03_{'CORRIGE' if corrige else 'DEPART'}.xlsx"
    wb.save(RACINE / nom); print("  " + nom)

random.seed(53)
lecon03(False)
random.seed(53)
lecon03(True)

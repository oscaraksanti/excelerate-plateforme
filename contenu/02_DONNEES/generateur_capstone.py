#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════
#  CAPSTONE — « EXCEL AI BUSINESS ANALYST »
#
#  Vingt et un fichiers sources, hétérogènes, et cohérents entre eux.
#
#  Périmètre : les GRANDS COMPTES du groupe BAOBAB, exercice clos au
#  30 septembre 2026. C'est un sous-ensemble assumé — il ne se compare
#  pas au consolidé du module 5, qui est au grain du ticket et couvre
#  toute l'activité.
#
#  Le cœur de l'épreuve est la RÉCONCILIATION entre la vue commerciale
#  (quatre classeurs trimestriels, au grain de la ligne de facture) et
#  la vue comptable (un CSV, au grain de la facture). Les quatre
#  familles d'écarts y sont injectées délibérément, et leur somme doit
#  refermer l'écart brut à l'unité près.
# ══════════════════════════════════════════════════════════════════════
import datetime as dt, pathlib, sys, json, random, csv, math, unicodedata

random.seed(11)
RACINE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "sortie-capstone")
SOURCES = RACINE / "CAPSTONE_Sources"
if SOURCES.exists():
    import shutil; shutil.rmtree(SOURCES)
SOURCES.mkdir(parents=True, exist_ok=True)

DEBUT, FIN = dt.date(2025, 10, 1), dt.date(2026, 9, 30)

# ══ 1 · Le référentiel ════════════════════════════════════════════════
AGENCES = [
    ("AG01", "Kinshasa",   "RD Congo",      "CDF", "Nadège Kalala",  0.26),
    ("AG02", "Lubumbashi", "RD Congo",      "CDF", "Trésor Ilunga",  0.15),
    ("AG03", "Abidjan",    "Côte d'Ivoire", "XOF", "Serge Kouadio",  0.19),
    ("AG04", "Dakar",      "Sénégal",       "XOF", "Aïcha Ndiaye",   0.13),
    ("AG05", "Douala",     "Cameroun",      "XAF", "Thomas Mbarga",  0.16),
    ("AG06", "Libreville", "Gabon",         "XAF", "Josée Nguema",   0.11),
]
DEV = {a[0]: a[3] for a in AGENCES}

FAMILLES = {
    "Huiles":    (["Huile végétale", "Huile de palme", "Huile d'arachide"],
                  ["2 L", "5 L", "20 L"], (3.10, 24.50), 0.172),
    "Riz":       (["Riz parfumé", "Riz brisé", "Riz étuvé"],
                  ["10 kg", "25 kg", "50 kg"], (9.80, 41.00), 0.118),
    "Farine":    (["Farine de blé", "Farine de maïs", "Farine de manioc"],
                  ["5 kg", "25 kg", "50 kg"], (2.90, 31.50), 0.143),
    "Boissons":  (["Jus concentré", "Eau minérale", "Boisson gazeuse"],
                  ["pack 6", "pack 12", "pack 24"], (1.90, 12.40), 0.221),
    "Savons":    (["Savon de ménage", "Détergent", "Savon de toilette"],
                  ["lot 12", "lot 24", "lot 48"], (4.60, 21.80), 0.264),
    "Conserves": (["Tomate concentrée", "Sardines", "Haricots"],
                  ["125 g", "400 g", "800 g"], (0.82, 2.40), 0.195),
}
PART_FAMILLE = {"Huiles": 0.21, "Riz": 0.27, "Farine": 0.17,
                "Boissons": 0.12, "Savons": 0.10, "Conserves": 0.13}

produits = []
k = 0
for fam, (noms, calibres, (pmin, pmax), marge) in FAMILLES.items():
    for nom in noms:
        for cal in calibres:
            k += 1
            pu = round(random.uniform(pmin, pmax), 2)
            produits.append({
                "code": f"P{k:04d}", "libelle": f"{nom} {cal}",
                "famille": fam, "calibre": cal, "pu_usd": pu,
                "taux_marge": round(marge * random.uniform(0.9, 1.1), 4),
            })
PROD = {p["code"]: p for p in produits}
par_famille = {f: [p for p in produits if p["famille"] == f] for f in FAMILLES}

# ══ 2 · Les clients — et leurs imperfections de saisie ════════════════
PREFIXES = ["Établissements", "Société", "Comptoir", "Maison", "Ets",
            "Groupe", "Alimentation", "Distribution", "Négoce", "Entreprise"]
NOMS = ["Kalala", "Ilunga", "Kouadio", "Ndiaye", "Mbarga", "Nguema", "Mutombo",
        "Traoré", "Diallo", "Bakayoko", "Essomba", "Ondo", "Kabila", "Sylla",
        "Camara", "Fall", "Sarr", "Owona", "Mba", "Tshibangu", "Mukendi",
        "Koffi", "Yao", "Bamba", "Cissé", "Gueye", "Diop", "Ndong", "Biya",
        "Atangana", "Kamga", "Fotso", "Nzé", "Moussavou", "Lubaki", "Mwanza",
        "Kasongo", "Bemba", "Tchicaya", "Sankara", "Konaté", "Touré"]
SUFFIXES = ["SARL", "SA", "& Fils", "SARLU", "", "", "SA", "SPRL"]
SEGMENTS = ["Grossiste", "Semi-grossiste", "Centrale d'achat", "Institutionnel"]

clients = []
for i in range(1, 601):
    ag = random.choices(AGENCES, weights=[a[5] for a in AGENCES])[0]
    nom = f"{random.choice(PREFIXES)} {random.choice(NOMS)} {random.choice(SUFFIXES)}"
    clients.append({
        "code": f"C{i:04d}", "nom": " ".join(nom.split()),
        "agence": ag[0], "ville": ag[1],
        "segment": random.choices(SEGMENTS, weights=[.45, .3, .15, .10])[0],
        "poids": random.lognormvariate(0, 0.66),
    })
CLI = {c["code"]: c for c in clients}

#  Les imperfections du référentiel clients. Elles ne changent AUCUN
#  montant : elles cassent les rapprochements faits sur le nom, et
#  c'est tout l'intérêt — on rapproche sur le code, pas sur le libellé.
IMPERFECTIONS = []
for c in random.sample(clients, 18):
    genre = random.choice(["insecable", "casse", "espaces", "accent"])
    if genre == "insecable":
        c["nom_affiche"] = c["nom"].replace(" ", " ", 1)
    elif genre == "casse":
        c["nom_affiche"] = c["nom"].upper()
    elif genre == "espaces":
        c["nom_affiche"] = "  " + c["nom"] + "  "
    else:
        c["nom_affiche"] = "".join(
            ch for ch in unicodedata.normalize("NFD", c["nom"])
            if unicodedata.category(ch) != "Mn")
    IMPERFECTIONS.append((c["code"], genre))
for c in clients:
    c.setdefault("nom_affiche", c["nom"])

# ══ 3 · Les taux de change, mensuels ══════════════════════════════════
#  Le XOF et le XAF sont arrimés à l'euro à la même parité : leur taux
#  face au dollar est IDENTIQUE. C'est la définition, pas une coquille.
taux = {}
cdf, cfa = 2960.0, 612.0
m = dt.date(2025, 10, 1)
while m <= dt.date(2026, 9, 1):
    cdf *= 1 + random.uniform(0.003, 0.013)
    cfa *= 1 + random.uniform(-0.004, 0.007)
    taux[(m, "CDF")] = round(cdf, 2)
    taux[(m, "XOF")] = round(cfa, 2)
    taux[(m, "XAF")] = round(cfa, 2)
    m = dt.date(m.year + (m.month == 12), m.month % 12 + 1, 1)

def tx(d, devise):
    return taux[(dt.date(d.year, d.month, 1), devise)]

print(f"  référentiel : {len(AGENCES)} agences · {len(produits)} produits · "
      f"{len(clients)} clients · {len(taux)} taux")

# ══ 4 · Les factures — vue commerciale ════════════════════════════════
#  Une facture porte de une à six lignes. Le grain commercial est la
#  LIGNE ; le grain comptable est la FACTURE. C'est ce décalage qui
#  oblige à agréger avant de rapprocher.
JOURS = [DEBUT + dt.timedelta(days=d) for d in range((FIN - DEBUT).days + 1)]
JOURS = [j for j in JOURS if j.weekday() < 6]
CANAUX = ["Comptoir", "Livraison", "Enlèvement"]

factures, lignes = [], []
num = 0
poids_total = sum(c["poids"] for c in clients)
for c in clients:
    #  Entre 4 et 40 factures par client sur l'exercice, selon son poids.
    n = max(3, min(42, int(random.gauss(15, 6) * c["poids"] ** 0.7)))
    for _ in range(n):
        num += 1
        d = random.choice(JOURS)
        ref = f"FC{d.year}{num:05d}"
        devise = DEV[c["agence"]]
        t = tx(d, devise)
        nl = random.choices([1, 2, 3, 4, 5, 6], weights=[.22, .26, .22, .15, .09, .06])[0]
        #  On tire la famille d'abord, pour respecter le mix commercial.
        choisis = []
        for _i in range(nl):
            fam = random.choices(list(FAMILLES),
                                 weights=[PART_FAMILLE[f] for f in FAMILLES])[0]
            choisis.append(random.choice(par_famille[fam]))
        tot_local = 0
        mes_lignes = []
        for p in choisis:
            qte = max(1, int(random.lognormvariate(3.1, 0.9) * c["poids"] ** 0.4))
            remise = random.choices([0, 0.02, 0.05, 0.08],
                                    weights=[.70, .14, .11, .05])[0]
            pu_local = round(p["pu_usd"] * t * random.uniform(0.97, 1.04))
            montant = round(pu_local * qte * (1 - remise))
            tot_local += montant
            mes_lignes.append({
                "date": d, "facture": ref, "code_client": c["code"],
                "code_agence": c["agence"], "code_produit": p["code"],
                "quantite": qte, "pu_local": pu_local, "remise": remise,
                "montant_local": montant, "devise": devise, "taux": t,
                "montant_usd": round(montant / t, 2),
                "canal": random.choice(CANAUX),
            })
        lignes.extend(mes_lignes)
        factures.append({
            "ref": ref, "date": d, "code_client": c["code"],
            "code_agence": c["agence"], "devise": devise, "taux": t,
            "nb_lignes": nl, "montant_local": tot_local,
            "montant_usd": round(sum(x["montant_usd"] for x in mes_lignes), 2),
        })

lignes.sort(key=lambda x: (x["date"], x["facture"], x["code_produit"]))
factures.sort(key=lambda x: (x["date"], x["ref"]))
FACT = {f["ref"]: f for f in factures}

CA_COMMERCIAL = round(sum(x["montant_usd"] for x in lignes), 2)
print(f"  commercial  : {len(factures)} factures · {len(lignes)} lignes · "
      f"{CA_COMMERCIAL:,.2f} USD")

# ══ 5 · La vue comptable, et les quatre familles d'écarts ═════════════
#  Elles sont injectées ici, comptées ici, et c'est la seule vérité.
N_A_SANS_B, N_B_SANS_A, N_MONTANTS, N_DOUBLONS = 12, 8, 23, 5

pioche = random.sample(factures, N_A_SANS_B + N_MONTANTS + N_DOUBLONS)
A_SANS_B = pioche[:N_A_SANS_B]
MONTANTS = pioche[N_A_SANS_B:N_A_SANS_B + N_MONTANTS]
DOUBLONS = pioche[N_A_SANS_B + N_MONTANTS:]
refs_a_sans_b = {f["ref"] for f in A_SANS_B}

compta = []
for f in factures:
    if f["ref"] in refs_a_sans_b:
        continue                      # ① chez A, pas chez B
    compta.append({"piece": f"EC{f['ref'][2:]}", "facture": f["ref"],
                   "date": f["date"], "code_client": f["code_client"],
                   "code_agence": f["code_agence"], "devise": f["devise"],
                   "taux": f["taux"], "montant_local": f["montant_local"],
                   "montant_usd": f["montant_usd"], "origine": ""})

#  ② montants différents : une remise de fin d'année accordée après la
#     facturation, saisie en compta et jamais redescendue au commercial.
ecart_montants_usd = 0.0
detail_montants = []
idx = {e["facture"]: e for e in compta}
for f in MONTANTS:
    e = idx[f["ref"]]
    remise = random.choice([0.03, 0.05, 0.075, 0.10])
    avant_usd = e["montant_usd"]
    e["montant_local"] = round(e["montant_local"] * (1 - remise))
    e["montant_usd"] = round(avant_usd * (1 - remise), 2)
    e["origine"] = "remise de fin d'année"
    delta_usd = round(e["montant_usd"] - avant_usd, 2)
    ecart_montants_usd += delta_usd
    detail_montants.append((f["ref"], delta_usd))
ecart_montants_usd = round(ecart_montants_usd, 2)

#  ③ doublons : la même facture saisie deux fois, avec une pièce
#     différente. Le montant est donc compté deux fois côté comptable.
montant_doublons_usd = 0.0
for f in DOUBLONS:
    e = idx[f["ref"]]
    compta.append({**e, "piece": e["piece"] + "B", "origine": "doublon de saisie"})
    montant_doublons_usd += e["montant_usd"]
montant_doublons_usd = round(montant_doublons_usd, 2)

#  ④ chez B, pas chez A : des écritures comptables sans facture
#     commerciale — régularisations de fin d'exercice.
montant_b_sans_a_usd = 0.0
for i in range(N_B_SANS_A):
    c = random.choice(clients)
    d = dt.date(2026, 9, random.randint(25, 30))
    devise = DEV[c["agence"]]
    t = tx(d, devise)
    m = round(random.uniform(400, 4200) * t)
    compta.append({"piece": f"EC2026R{i+1:03d}", "facture": "",
                   "date": d, "code_client": c["code"],
                   "code_agence": c["agence"], "devise": devise, "taux": t,
                   "montant_local": m, "montant_usd": round(m / t, 2),
                   "origine": "régularisation de clôture"})
    montant_b_sans_a_usd += round(m / t, 2)
montant_b_sans_a_usd = round(montant_b_sans_a_usd, 2)

compta.sort(key=lambda x: (x["date"], x["piece"]))
CA_COMPTABLE = round(sum(e["montant_usd"] for e in compta), 2)
montant_a_sans_b_usd = round(sum(f["montant_usd"] for f in A_SANS_B), 2)

ECART_BRUT = round(CA_COMPTABLE - CA_COMMERCIAL, 2)
SOMME_FAMILLES = round(-montant_a_sans_b_usd + montant_b_sans_a_usd
                       + ecart_montants_usd + montant_doublons_usd, 2)

print(f"  comptable   : {len(compta)} écritures · {CA_COMPTABLE:,.2f} USD")
print(f"  écart brut  : {ECART_BRUT:,.2f} USD")
print(f"    ① A sans B      {N_A_SANS_B:>3}  {-montant_a_sans_b_usd:>12,.2f}")
print(f"    ② B sans A      {N_B_SANS_A:>3}  {montant_b_sans_a_usd:>12,.2f}")
print(f"    ③ montants ≠    {N_MONTANTS:>3}  {ecart_montants_usd:>12,.2f}")
print(f"    ④ doublons      {N_DOUBLONS:>3}  {montant_doublons_usd:>12,.2f}")
print(f"    somme                {SOMME_FAMILLES:>12,.2f}")
print(f"    résidu               {round(ECART_BRUT - SOMME_FAMILLES, 2):>12,.2f}"
      "   ← doit valoir 0")

# ══ 6 · Ce que le modèle devra retrouver ══════════════════════════════
def mois_de(d): return dt.date(d.year, d.month, 1)
MOIS = sorted({mois_de(x["date"]) for x in lignes})
NOM_MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
            "août", "septembre", "octobre", "novembre", "décembre"]

ca_agence, marge_agence, ca_mois, ca_famille = {}, {}, {}, {}
for x in lignes:
    p = PROD[x["code_produit"]]
    marge = round(x["montant_usd"] * p["taux_marge"], 2)
    ca_agence[x["code_agence"]] = ca_agence.get(x["code_agence"], 0) + x["montant_usd"]
    marge_agence[x["code_agence"]] = marge_agence.get(x["code_agence"], 0) + marge
    ca_mois[mois_de(x["date"])] = ca_mois.get(mois_de(x["date"]), 0) + x["montant_usd"]
    ca_famille[p["famille"]] = ca_famille.get(p["famille"], 0) + x["montant_usd"]
ca_agence = {k: round(v, 2) for k, v in ca_agence.items()}
marge_agence = {k: round(v, 2) for k, v in marge_agence.items()}
ca_mois = {k: round(v, 2) for k, v in ca_mois.items()}
ca_famille = {k: round(v, 2) for k, v in ca_famille.items()}

MARGE_BRUTE = round(sum(marge_agence.values()), 2)
TAUX_MARGE = round(MARGE_BRUTE / CA_COMMERCIAL, 6)
CLIENTS_ACTIFS = len({x["code_client"] for x in lignes})
PRODUITS_VENDUS = len({x["code_produit"] for x in lignes})
NOM_AG = {a[0]: a[1] for a in AGENCES}
AG_PLUS_RENTABLE = NOM_AG[max(marge_agence, key=marge_agence.get)]
MOIS_RECORD = max(ca_mois, key=ca_mois.get)
MOIS_RECORD_LIB = f"{NOM_MOIS[MOIS_RECORD.month-1]} {MOIS_RECORD.year}"
PANIER_FACTURE = round(CA_COMMERCIAL / len(factures), 2)

# ══ 7 · L'exercice précédent ══════════════════════════════════════════
#  Il n'est pas inventé : c'est le même profil, moins 8,4 % en moyenne,
#  avec une saisonnalité légèrement différente. Le but est que la
#  comparaison N-1 ait un sens.
hist = {}
for i, m in enumerate(MOIS):
    mprec = dt.date(m.year - 1, m.month, 1)
    for a, _n, _p, _d, _r, _w in AGENCES:
        base = ca_mois[m] * (ca_agence[a] / CA_COMMERCIAL)
        hist[(mprec, a)] = round(base * random.uniform(0.86, 0.98), 2)
CA_N1 = round(sum(hist.values()), 2)
EVOLUTION = round(CA_COMMERCIAL / CA_N1 - 1, 6)

# ══ 8 · Le budget — en tableau croisé, mois en colonnes ═══════════════
budget = {}
for a, _n, _p, _d, _r, _w in AGENCES:
    for m in MOIS:
        reel = round(ca_mois[m] * (ca_agence[a] / CA_COMMERCIAL), 2)
        budget[(a, m)] = round(reel * random.uniform(0.94, 1.12), 2)
BUDGET_TOTAL = round(sum(budget.values()), 2)
ECART_BUDGET = round(CA_COMMERCIAL - BUDGET_TOTAL, 2)

# ══ 9 · Charges fixes et objectifs ════════════════════════════════════
charges = {}
for a, _n, _p, dev, _r, w in AGENCES:
    base_usd = 18_000 * (0.6 + w * 2.2)
    for m in MOIS:
        charges[(a, m)] = round(base_usd * random.uniform(0.95, 1.06)
                                * tx(m, dev))
CHARGES_USD = round(sum(charges[(a, m)] / tx(m, DEV[a])
                        for a, _n, _p, _d, _r, _w in AGENCES for m in MOIS), 2)

COMMERCIAUX = []
for i, (a, nom_ag, _p, _d, resp, w) in enumerate(AGENCES, start=1):
    for j in range(1, 3):
        COMMERCIAUX.append({
            "matricule": f"COM{i}{j}", "nom": f"{random.choice(NOMS)} "
                                              f"{random.choice(['Jean','Marie','Paul','Grace','Serge','Alice'])}",
            "agence": a, "objectif": round(ca_agence[a] / 2
                                           * random.uniform(0.9, 1.1), -2),
        })

R = {
 "factures_commerciales": len(factures),
 "lignes_commerciales": len(lignes),
 "ecritures_comptables": len(compta),
 "ca_commercial_usd": CA_COMMERCIAL,
 "ca_comptable_usd": CA_COMPTABLE,
 "ecart_brut_usd": ECART_BRUT,
 "n_a_sans_b": N_A_SANS_B, "montant_a_sans_b": montant_a_sans_b_usd,
 "n_b_sans_a": N_B_SANS_A, "montant_b_sans_a": montant_b_sans_a_usd,
 "n_montants": N_MONTANTS, "ecart_montants": ecart_montants_usd,
 "n_doublons": N_DOUBLONS, "montant_doublons": montant_doublons_usd,
 "somme_familles": SOMME_FAMILLES,
 "residu": round(ECART_BRUT - SOMME_FAMILLES, 2),
 "clients_actifs": CLIENTS_ACTIFS,
 "produits_vendus": PRODUITS_VENDUS,
 "marge_brute_usd": MARGE_BRUTE,
 "taux_marge": TAUX_MARGE,
 "panier_facture": PANIER_FACTURE,
 "ca_n1_usd": CA_N1,
 "evolution": EVOLUTION,
 "agence_plus_rentable": AG_PLUS_RENTABLE,
 "mois_record": MOIS_RECORD_LIB,
 "ca_mois_record": ca_mois[MOIS_RECORD],
 "budget_total_usd": BUDGET_TOTAL,
 "ecart_budget_usd": ECART_BUDGET,
 "charges_usd": CHARGES_USD,
 "ca_par_agence": {NOM_AG[k]: v for k, v in sorted(ca_agence.items())},
 "ca_par_famille": dict(sorted(ca_famille.items(), key=lambda kv: -kv[1])),
 "clients_imparfaits": len(IMPERFECTIONS),
}
for k, v in R.items():
    if not isinstance(v, dict): print(f"  {k:<24} {v}")

# ══ 10 · Les vingt et un fichiers ═════════════════════════════════════
import openpyxl
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

Ftitre  = Font(name="Calibri", size=14, bold=True)
Fentete = Font(name="Calibri", size=11, bold=True, color="FFFFFFFF")
Faide   = Font(name="Calibri", size=10, italic=True, color="FF6B7280")
Fgras   = Font(name="Calibri", size=11, bold=True)
Fbleu   = Font(name="Calibri", size=11, color="FF0000FF")
Fnoir   = Font(name="Calibri", size=11, color="FF000000")
Rentete = PatternFill("solid", fgColor="FF243044")
Rjaune  = PatternFill("solid", fgColor="FFFFF6D8")
Bord    = Border(bottom=Side(style="thin", color="FFD6DBE1"))
USD, USD0, LOC, PCT, INT = ('#,##0.00\\ "USD"', '#,##0\\ "USD"', "#,##0",
                            "0.00%", "#,##0")
DATEF = "dd/mm/yyyy"

def entete(ws, cols, ligne=1):
    for k, c in enumerate(cols, start=1):
        cel = ws.cell(ligne, k, c); cel.font, cel.fill = Fentete, Rentete
        cel.alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[ligne].height = 22

def larg(ws, specs):
    for k, w in enumerate(specs, start=1):
        ws.column_dimensions[get_column_letter(k)].width = w

def tableau(ws, nom, ref):
    t = Table(displayName=nom, ref=ref)
    t.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
    ws.add_table(t)

def ecrire(nom, wb):
    wb.save(SOURCES / nom)
    print(f"    {nom}  {(SOURCES/nom).stat().st_size/1e3:.0f} ko")

# ── V01 à V04 · les ventes, quatre trimestres, quatre formats ────────
TRIMESTRES = [
 ("V01_Ventes_2025T4.xlsx", dt.date(2025, 10, 1), dt.date(2025, 12, 31), "standard"),
 ("V02_Ventes_2026T1.xlsx", dt.date(2026, 1, 1),  dt.date(2026, 3, 31),  "titre"),
 ("V03_Ventes_2026T2.xlsx", dt.date(2026, 4, 1),  dt.date(2026, 6, 30),  "ordre"),
 ("V04_Ventes_2026T3.xlsx", dt.date(2026, 7, 1),  dt.date(2026, 9, 30),  "canal"),
]
COLS_V = ["Date", "Facture", "Code_Client", "Code_Agence", "Code_Produit",
          "Quantite", "PU_Local", "Remise_Pct", "Montant_Local", "Devise"]
ORDRE_V3 = ["Facture", "Date", "Code_Agence", "Code_Client", "Code_Produit",
            "Quantite", "Remise_Pct", "PU_Local", "Montant_Local", "Devise"]

for nom, d1, d2, genre in TRIMESTRES:
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Ventes"
    cols = list(COLS_V)
    if genre == "ordre": cols = list(ORDRE_V3)
    if genre == "canal": cols = COLS_V + ["Canal"]
    larg(ws, [11, 14, 13, 13, 13, 11, 13, 12, 16, 9, 13][:len(cols)])
    l0 = 1
    if genre == "titre":
        ws["A1"] = "GROUPE BAOBAB — Grands comptes"; ws["A1"].font = Ftitre
        ws["A2"] = "Ventes du 1er trimestre 2026, extraction du 3 octobre 2026"
        ws["A2"].font = Faide
        l0 = 4
    entete(ws, cols, ligne=l0)
    r = l0 + 1
    for x in lignes:
        if not (d1 <= x["date"] <= d2): continue
        vals = {"Date": x["date"], "Facture": x["facture"],
                "Code_Client": x["code_client"], "Code_Agence": x["code_agence"],
                "Code_Produit": x["code_produit"], "Quantite": x["quantite"],
                "PU_Local": x["pu_local"], "Remise_Pct": x["remise"],
                "Montant_Local": x["montant_local"], "Devise": x["devise"],
                "Canal": x["canal"]}
        for j, c in enumerate(cols, start=1):
            cel = ws.cell(r, j, vals[c])
            if c == "Date": cel.number_format = DATEF
            elif c == "Remise_Pct": cel.number_format = PCT
            elif c in ("Quantite", "PU_Local", "Montant_Local"):
                cel.number_format = LOC
        r += 1
    tableau(ws, "t_Ventes", f"A{l0}:{get_column_letter(len(cols))}{r-1}")
    ws.freeze_panes = ws.cell(l0 + 1, 1).coordinate
    ecrire(nom, wb)

# ── S01 à S03 · les stocks, en tableaux croisés ──────────────────────
STOCK_AG = [("S01_Stocks_Kinshasa.xlsx", "AG01", "simple"),
            ("S02_Stocks_Abidjan.xlsx",  "AG03", "inverse"),
            ("S03_Stocks_Douala.xlsx",   "AG05", "titre")]
stocks = {}
for _n, ag, _g in STOCK_AG:
    for p in produits:
        base = max(20, int(random.lognormvariate(5.4, 0.8)))
        for m in MOIS:
            stocks[(ag, p["code"], m)] = max(0, int(base * random.uniform(0.5, 1.6)))

for nom, ag, genre in STOCK_AG:
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Stocks"
    mois_cols = MOIS if genre != "inverse" else list(reversed(MOIS))
    larg(ws, [14, 30] + [12] * len(mois_cols))
    l0 = 1
    if genre == "titre":
        ws["A1"] = f"Stocks de fin de mois — agence de {NOM_AG[ag]}"
        ws["A1"].font = Ftitre
        ws["A2"] = "en unités · source : logiciel de gestion de stock"
        ws["A2"].font = Faide
        l0 = 4
    entete(ws, ["Code_Produit", "Produit"]
           + [f"{NOM_MOIS[m.month-1][:4]}-{str(m.year)[2:]}" for m in mois_cols],
           ligne=l0)
    for i, p in enumerate(produits, start=l0 + 1):
        ws.cell(i, 1, p["code"]); ws.cell(i, 2, p["libelle"])
        for j, m in enumerate(mois_cols, start=3):
            ws.cell(i, j, stocks[(ag, p["code"], m)]).number_format = LOC
    ecrire(nom, wb)

# ── R01 à R04 · les référentiels ─────────────────────────────────────
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Produits"
larg(ws, [13, 30, 14, 12, 14, 14])
entete(ws, ["Code_Produit", "Libelle", "Famille", "Calibre", "PU_Standard_USD",
            "Taux_Marge"], ligne=1)
for i, p in enumerate(produits, start=2):
    ws.cell(i, 1, p["code"]); ws.cell(i, 2, p["libelle"])
    ws.cell(i, 3, p["famille"]); ws.cell(i, 4, p["calibre"])
    ws.cell(i, 5, p["pu_usd"]).number_format = USD
    ws.cell(i, 6, p["taux_marge"]).number_format = PCT
tableau(ws, "t_Produits", f"A1:F{1+len(produits)}")
ecrire("R01_Produits.xlsx", wb)

wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Clients"
larg(ws, [12, 36, 13, 16, 20])
entete(ws, ["Code_Client", "Nom", "Code_Agence", "Ville", "Segment"], ligne=1)
for i, c in enumerate(clients, start=2):
    ws.cell(i, 1, c["code"]); ws.cell(i, 2, c["nom_affiche"])
    ws.cell(i, 3, c["agence"]); ws.cell(i, 4, c["ville"])
    ws.cell(i, 5, c["segment"])
tableau(ws, "t_Clients", f"A1:E{1+len(clients)}")
ecrire("R02_Clients.xlsx", wb)

wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Agences"
larg(ws, [13, 16, 18, 10, 22])
entete(ws, ["Code_Agence", "Agence", "Pays", "Devise", "Responsable"], ligne=1)
for i, (code, nom, pays, dev, resp, _w) in enumerate(AGENCES, start=2):
    for j, v in enumerate([code, nom, pays, dev, resp], start=1):
        ws.cell(i, j, v)
tableau(ws, "t_Agences", f"A1:E{1+len(AGENCES)}")
ecrire("R03_Agences.xlsx", wb)

wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Taux"
larg(ws, [14, 14, 14, 14])
ws["A1"] = "Taux de change moyens mensuels — 1 USD = …"; ws["A1"].font = Ftitre
ws["A2"] = ("Le XOF et le XAF sont arrimés à l'euro à la même parité : "
            "leur taux face au dollar est identique. Ce n'est pas une coquille.")
ws["A2"].font = Faide
entete(ws, ["Mois", "CDF", "XOF", "XAF"], ligne=4)
for i, m in enumerate(MOIS, start=5):
    ws.cell(i, 1, m).number_format = DATEF
    for j, d in enumerate(["CDF", "XOF", "XAF"], start=2):
        ws.cell(i, j, taux[(m, d)]).number_format = "#,##0.00"
tableau(ws, "t_Taux", f"A4:D{4+len(MOIS)}")
ecrire("R04_Taux_Change.xlsx", wb)

# ── B01 · le budget, en tableau croisé ───────────────────────────────
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Budget"
larg(ws, [16] + [14] * len(MOIS))
ws["A1"] = "Budget de chiffre d'affaires — exercice 2025/2026"
ws["A1"].font = Ftitre
ws["A2"] = "en USD · voté par le conseil le 12 septembre 2025"
ws["A2"].font = Faide
entete(ws, ["Agence"] + [f"{NOM_MOIS[m.month-1][:4]}-{str(m.year)[2:]}"
                         for m in MOIS], ligne=4)
for i, (a, nom, *_r) in enumerate(AGENCES, start=5):
    ws.cell(i, 1, nom)
    for j, m in enumerate(MOIS, start=2):
        ws.cell(i, j, budget[(a, m)]).number_format = USD0
ecrire("B01_Budget_2026.xlsx", wb)

# ── B02 · les objectifs commerciaux ──────────────────────────────────
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Objectifs"
larg(ws, [13, 26, 14, 18])
entete(ws, ["Matricule", "Nom", "Code_Agence", "Objectif_Annuel_USD"], ligne=1)
for i, c in enumerate(COMMERCIAUX, start=2):
    ws.cell(i, 1, c["matricule"]); ws.cell(i, 2, c["nom"])
    ws.cell(i, 3, c["agence"])
    ws.cell(i, 4, c["objectif"]).number_format = USD0
tableau(ws, "t_Objectifs", f"A1:D{1+len(COMMERCIAUX)}")
ecrire("B02_Objectifs.xlsx", wb)

# ── C01 · les charges fixes, en devise locale ────────────────────────
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Charges"
larg(ws, [16, 11, 13, 18])
ws["A1"] = "Charges fixes mensuelles par agence"; ws["A1"].font = Ftitre
ws["A2"] = ("en DEVISE LOCALE — c'est la colonne Devise qui le dit, "
            "pas le nom de la colonne du montant.")
ws["A2"].font = Faide
entete(ws, ["Code_Agence", "Mois", "Devise", "Montant_Local"], ligne=4)
r = 5
for a, _n, _p, dev, _r, _w in AGENCES:
    for m in MOIS:
        ws.cell(r, 1, a); ws.cell(r, 2, m).number_format = DATEF
        ws.cell(r, 3, dev)
        ws.cell(r, 4, charges[(a, m)]).number_format = LOC
        r += 1
tableau(ws, "t_Charges", f"A4:D{r-1}")
ecrire("C01_Charges_Fixes.xlsx", wb)

# ── H01 · l'exercice précédent ───────────────────────────────────────
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Historique"
larg(ws, [13, 13, 18])
ws["A1"] = "Chiffre d'affaires de l'exercice précédent"; ws["A1"].font = Ftitre
ws["A2"] = "1er octobre 2024 → 30 septembre 2025 · en USD, déjà converti"
ws["A2"].font = Faide
entete(ws, ["Mois", "Code_Agence", "CA_USD"], ligne=4)
r = 5
for (m, a), v in sorted(hist.items()):
    ws.cell(r, 1, m).number_format = DATEF
    ws.cell(r, 2, a)
    ws.cell(r, 3, v).number_format = USD
    r += 1
tableau(ws, "t_Historique", f"A4:C{r-1}")
ecrire("H01_Exercice_N-1.xlsx", wb)

# ══ 11 · Les cinq CSV comptables ══════════════════════════════════════
#  Chacun a son défaut d'encodage ou de format. Ils sont réalistes :
#  ce sont ceux qu'on reçoit d'un logiciel comptable qui a dix ans.
def fr(n, dec=2):
    return f"{n:,.{dec}f}".replace(",", "").replace(".", ",")

#  ① CPT_Factures.csv — cp1252, séparateur ;, décimale virgule.
#     C'est LA source du rapprochement.
with open(SOURCES / "CPT_Factures.csv", "w", encoding="cp1252",
          newline="", errors="replace") as fh:
    w = csv.writer(fh, delimiter=";")
    w.writerow(["Piece", "Date", "Facture", "Code_Client", "Code_Agence",
                "Devise", "Montant_Local", "Montant_USD", "Libelle"])
    for e in compta:
        w.writerow([e["piece"], e["date"].strftime("%d/%m/%Y"), e["facture"],
                    e["code_client"], e["code_agence"], e["devise"],
                    fr(e["montant_local"], 0), fr(e["montant_usd"]),
                    e["origine"] or "vente marchandises"])
print(f"    CPT_Factures.csv  {(SOURCES/'CPT_Factures.csv').stat().st_size/1e3:.0f} ko"
      "  (cp1252, séparateur ;)")

#  ② CPT_Reglements.csv — utf-8 avec BOM, dates ISO.
reglements = []
for f in random.sample(factures, int(len(factures) * 0.82)):
    d = f["date"] + dt.timedelta(days=random.randint(3, 75))
    if d > FIN: continue
    part = random.choices([1.0, 1.0, 1.0, 0.5, 0.3], weights=[.72,.1,.06,.08,.04])[0]
    reglements.append({
        "piece": "RG" + f["ref"][2:], "date": d, "facture": f["ref"],
        "mode": random.choice(["Virement", "Espèces", "Mobile money", "Chèque"]),
        "montant_local": round(f["montant_local"] * part),
        "devise": f["devise"]})
reglements.sort(key=lambda x: (x["date"], x["piece"]))
with open(SOURCES / "CPT_Reglements.csv", "w", encoding="utf-8-sig",
          newline="") as fh:
    w = csv.writer(fh, delimiter=";")
    w.writerow(["Piece", "Date", "Facture", "Mode", "Devise", "Montant_Local"])
    for x in reglements:
        w.writerow([x["piece"], x["date"].isoformat(), x["facture"],
                    x["mode"], x["devise"], fr(x["montant_local"], 0)])
print(f"    CPT_Reglements.csv  {len(reglements)} lignes  (utf-8 BOM, dates ISO)")

#  ③ CPT_Avoirs.csv — des montants négatifs, et c'est normal.
avoirs = []
for f in random.sample(factures, 64):
    avoirs.append({"piece": "AV" + f["ref"][2:], "date": f["date"]
                   + dt.timedelta(days=random.randint(5, 40)),
                   "facture": f["ref"], "devise": f["devise"],
                   "montant_local": -round(f["montant_local"]
                                           * random.uniform(0.05, 0.35)),
                   "motif": random.choice(["Retour marchandise",
                                           "Erreur de facturation",
                                           "Geste commercial", "Casse transport"])})
avoirs.sort(key=lambda x: (x["date"], x["piece"]))
MONTANT_AVOIRS_USD = round(sum(a["montant_local"] / FACT[a["facture"]]["taux"]
                               for a in avoirs), 2)
with open(SOURCES / "CPT_Avoirs.csv", "w", encoding="utf-8", newline="") as fh:
    w = csv.writer(fh, delimiter=";")
    w.writerow(["Piece", "Date", "Facture", "Devise", "Montant_Local", "Motif"])
    for a in avoirs:
        w.writerow([a["piece"], a["date"].strftime("%d/%m/%Y"), a["facture"],
                    a["devise"], fr(a["montant_local"], 0), a["motif"]])
print(f"    CPT_Avoirs.csv  {len(avoirs)} avoirs  ({MONTANT_AVOIRS_USD:,.2f} USD)")

#  ④ CPT_Plan_Comptable.csv — utf-8, virgules, le plus propre des cinq.
PLAN = [("411000", "Clients", "Actif"), ("401000", "Fournisseurs", "Passif"),
        ("512000", "Banque", "Actif"), ("531000", "Caisse", "Actif"),
        ("701000", "Ventes de marchandises", "Produit"),
        ("709000", "Rabais, remises et ristournes accordés", "Produit"),
        ("607000", "Achats de marchandises", "Charge"),
        ("613000", "Locations", "Charge"), ("641000", "Rémunérations", "Charge"),
        ("665000", "Pertes de change", "Charge"),
        ("766000", "Gains de change", "Produit")]
with open(SOURCES / "CPT_Plan_Comptable.csv", "w", encoding="utf-8",
          newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["Compte", "Libelle", "Nature"])
    w.writerows(PLAN)
print(f"    CPT_Plan_Comptable.csv  {len(PLAN)} comptes  (utf-8, virgules)")

#  ⑤ CPT_Journal_Caisse.csv — dates au format américain. Le piège.
caisse = []
for m in MOIS:
    for _ in range(random.randint(18, 34)):
        jour = dt.date(m.year, m.month, random.randint(1, 28))
        a = random.choice(AGENCES)
        caisse.append({"date": jour, "agence": a[0], "devise": a[3],
                       "sens": random.choices(["Entrée", "Sortie"],
                                              weights=[.62, .38])[0],
                       "montant": round(random.uniform(50, 2600) * tx(jour, a[3])),
                       "libelle": random.choice(
                           ["Encaissement client", "Frais de transport",
                            "Carburant", "Petit équipement", "Frais bancaires",
                            "Avance sur salaire", "Fourniture de bureau"])})
caisse.sort(key=lambda x: x["date"])
with open(SOURCES / "CPT_Journal_Caisse.csv", "w", encoding="utf-8",
          newline="") as fh:
    w = csv.writer(fh, delimiter=";")
    w.writerow(["Date", "Code_Agence", "Sens", "Devise", "Montant_Local",
                "Libelle"])
    for x in caisse:
        #  mm/dd/yyyy : les douze premiers jours de chaque mois sont
        #  ambigus, les autres deviennent du texte à l'import.
        w.writerow([x["date"].strftime("%m/%d/%Y"), x["agence"], x["sens"],
                    x["devise"], fr(x["montant"], 0), x["libelle"]])
print(f"    CPT_Journal_Caisse.csv  {len(caisse)} lignes  (dates mm/dd/yyyy)")

R["reglements"] = len(reglements)
R["avoirs"] = len(avoirs)
R["montant_avoirs_usd"] = MONTANT_AVOIRS_USD
R["lignes_caisse"] = len(caisse)

# ══ 12 · La facture fournisseur scannée ═══════════════════════════════
#  Vingt et unième fichier. Elle est photographiée de travers : la
#  lecture par l'IA est donc faillible, et le total imprimé sert de
#  contrôle. Sans ce risque, l'exercice n'enseignerait rien.
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas as rl_canvas
from PIL import Image, ImageFilter, ImageEnhance
import fitz

NUM_FF = "KIV-2026-0917"
DATE_FF = dt.date(2026, 9, 17)
TAUX_FF = tx(DATE_FF, "CDF")
FF_LIGNES = []
for p in random.sample(produits, 12):
    q = random.choice([40, 60, 80, 100, 120, 150, 200])
    pu = round(p["pu_usd"] * TAUX_FF * random.uniform(0.82, 0.92))
    FF_LIGNES.append((p["libelle"], q, pu, q * pu))
TOTAL_FF = sum(x[3] for x in FF_LIGNES)

def fmt_cdf(n): return f"{n:,}".replace(",", " ")

PDF_FF = SOURCES / "F01_Facture_Fournisseur.pdf"
c = rl_canvas.Canvas(str(PDF_FF), pagesize=A4)
L, H = A4
c.setFont("Helvetica-Bold", 17)
c.drawString(20*mm, H - 24*mm, "ETS KIVU DISTRIBUTION SARL")
c.setFont("Helvetica", 8.5)
for i, t in enumerate([
    "Avenue du Commerce 142, Gombe — Kinshasa, R.D. Congo",
    "RCCM CD/KIN/RCCM/19-B-02841  ·  Id. Nat. 01-F4300-N88215V",
    "Tél. +243 81 000 00 00  ·  contact@kivudistribution.cd"]):
    c.drawString(20*mm, H - (31 + i*4.2)*mm, t)
c.setLineWidth(1.1); c.line(20*mm, H - 46*mm, L - 20*mm, H - 46*mm)
c.setFont("Helvetica-Bold", 13)
c.drawString(20*mm, H - 55*mm, f"FACTURE  N° {NUM_FF}")
c.setFont("Helvetica", 9)
c.drawString(20*mm, H - 61*mm, f"Date : {DATE_FF.strftime('%d/%m/%Y')}")
c.drawString(20*mm, H - 66*mm, "Client : GROUPE BAOBAB — agence de Kinshasa")
c.drawString(20*mm, H - 71*mm, "Conditions : 30 jours fin de mois  ·  Montants en CDF")

y = H - 84*mm
c.setFont("Helvetica-Bold", 8.5)
for x, t in ((20, "DÉSIGNATION"), (112, "QTÉ"), (132, "P.U."), (168, "MONTANT")):
    c.drawString(x*mm, y, t) if x < 100 else c.drawRightString((x+18)*mm, y, t)
c.setLineWidth(0.6); c.line(20*mm, y - 2*mm, L - 20*mm, y - 2*mm)
y -= 8*mm
c.setFont("Helvetica", 8.5)
for lib, q, pu, mt in FF_LIGNES:
    c.drawString(20*mm, y, lib[:44])
    c.drawRightString(130*mm, y, str(q))
    c.drawRightString(150*mm, y, fmt_cdf(pu))
    c.drawRightString(186*mm, y, fmt_cdf(mt))
    y -= 6.2*mm
c.setLineWidth(0.9); c.line(110*mm, y - 1*mm, L - 20*mm, y - 1*mm)
y -= 8*mm
c.setFont("Helvetica-Bold", 11)
c.drawString(112*mm, y, "TOTAL CDF")
c.drawRightString(186*mm, y, fmt_cdf(TOTAL_FF))
c.setFont("Helvetica-Oblique", 7.5)
c.drawString(20*mm, 24*mm, "Marchandise vendue ne peut être ni reprise ni échangée.")
c.drawString(20*mm, 20*mm, "Paiement par virement — Compte 00012-34567890-11 / RAWBANK")
c.save()

doc = fitz.open(PDF_FF)
pix = doc[0].get_pixmap(dpi=185)
img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
img = img.rotate(1.6, resample=Image.BICUBIC, expand=True, fillcolor=(230, 228, 224))
img = img.filter(ImageFilter.GaussianBlur(1.0))
img = ImageEnhance.Contrast(img).enhance(0.84)
img = ImageEnhance.Brightness(img).enhance(1.03)
w, h = img.size
ombre = Image.new("L", (w, h)); px = ombre.load()
for yy in range(0, h, 2):
    for xx in range(0, w, 2):
        v = int(238 - 52 * ((1 - xx / w) ** 1.4) - 24 * ((yy / h) ** 2))
        for dy in range(2):
            for dx in range(2):
                if yy + dy < h and xx + dx < w:
                    px[xx + dx, yy + dy] = max(148, min(255, v))
img = Image.composite(img, Image.new("RGB", (w, h), (94, 92, 90)), ombre)
img = img.crop((0, 0, w, int(h * 0.80)))
w, h = img.size
img = img.resize((int(w * 0.64), int(h * 0.64)), Image.LANCZOS)
img.save(SOURCES / "F01_Facture_photo.jpg", quality=72, optimize=True)
doc.close()

R["facture_fournisseur"] = {"numero": NUM_FF, "date": DATE_FF.isoformat(),
                            "lignes": len(FF_LIGNES), "total_cdf": TOTAL_FF,
                            "taux": TAUX_FF,
                            "total_usd": round(TOTAL_FF / TAUX_FF, 2)}
print(f"    F01_Facture_Fournisseur.pdf  +  photo  ·  {len(FF_LIGNES)} lignes · "
      f"{fmt_cdf(TOTAL_FF)} CDF  ({TOTAL_FF/TAUX_FF:,.2f} USD)")

# ══ 13 · L'archive livrée ═════════════════════════════════════════════
import zipfile
zc = RACINE / "CAPSTONE_Sources.zip"
with zipfile.ZipFile(zc, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for f in sorted(SOURCES.iterdir()):
        if f.suffix == ".pdf":
            continue          # le PDF propre reste chez moi : on livre le scan
        z.write(f, f"CAPSTONE_Sources/{f.name}")
R["fichiers_sources"] = len([f for f in SOURCES.iterdir() if f.suffix != ".pdf"])
R["taille_zip_mo"] = round(zc.stat().st_size / 1e6, 2)
print(f"\n  CAPSTONE_Sources.zip  {R['fichiers_sources']} fichiers · "
      f"{R['taille_zip_mo']} Mo")
json.dump(R, open(RACINE / "REFERENCES_CAPSTONE.json", "w"), indent=1,
          ensure_ascii=False)

# ══ 14 · Le classeur de réponses ══════════════════════════════════════
#  Le capstone laisse l'architecture entièrement libre : schéma en
#  étoile ou tableaux structurés, DAX ou SOMME.SI.ENS, peu importe.
#  La machine ne note donc que DEUX choses : les feuilles imposées, et
#  les valeurs de REPONSES.
#
#  Les formules du corrigé sont de simples renvois « =C10 » : elles
#  n'appellent AUCUNE fonction. Le correcteur accorde alors le point de
#  méthode dès qu'une formule est présente — autrement dit : « vous
#  l'avez calculé, par le chemin de votre choix », ce qui est
#  exactement la question posée. La colonne C porte la référence ; elle
#  ne quitte jamais le dépôt privé des corrigés.
REPONSES = [
 ("— LE RAPPROCHEMENT COMMERCIAL / COMPTABLE —", None, None),
 ("Lignes de vente consolidées", INT, R["lignes_commerciales"]),
 ("Factures commerciales distinctes", INT, R["factures_commerciales"]),
 ("Écritures comptables de vente", INT, R["ecritures_comptables"]),
 ("Chiffre d'affaires commercial, en USD", USD, R["ca_commercial_usd"]),
 ("Chiffre d'affaires comptable, en USD", USD, R["ca_comptable_usd"]),
 ("Écart brut, en USD", USD, R["ecart_brut_usd"]),
 ("① Factures sans écriture comptable — nombre", INT, R["n_a_sans_b"]),
 ("① … montant, en USD", USD, R["montant_a_sans_b"]),
 ("② Écritures sans facture commerciale — nombre", INT, R["n_b_sans_a"]),
 ("② … montant, en USD", USD, R["montant_b_sans_a"]),
 ("③ Factures aux montants différents — nombre", INT, R["n_montants"]),
 ("③ … écart net, en USD", USD, R["ecart_montants"]),
 ("④ Doublons de saisie comptable — nombre", INT, R["n_doublons"]),
 ("④ … montant, en USD", USD, R["montant_doublons"]),
 ("R_RECONCILIATION — écart brut moins les quatre familles  ·  doit valoir 0",
  USD, 0),
 ("— L'ACTIVITÉ DE L'EXERCICE —", None, None),
 ("Clients ayant acheté", INT, R["clients_actifs"]),
 ("Références vendues", INT, R["produits_vendus"]),
 ("Marge brute, en USD", USD, R["marge_brute_usd"]),
 ("Taux de marge brute", "0.0000%", R["taux_marge"]),
 ("Panier moyen par facture, en USD", USD, R["panier_facture"]),
 ("Chiffre d'affaires de l'exercice N-1, en USD", USD, R["ca_n1_usd"]),
 ("Évolution N / N-1", "0.00%", R["evolution"]),
 ("Agence dégageant la plus forte marge", None, R["agence_plus_rentable"]),
 ("Mois record en chiffre d'affaires", None, R["mois_record"]),
 ("Écart au budget, en USD", USD, R["ecart_budget_usd"]),
 ("R_CONTROLE — somme des six agences moins le total  ·  doit valoir 0",
  USD, 0),
]

QUALITE = [
 ("Lignes de vente dont le client est absent du référentiel", INT, 0,
  "un code client orphelin sort de tous les tableaux sans prévenir"),
 ("Lignes de vente dont le produit est absent du référentiel", INT, 0,
  "même chose, et ça fausse la marge"),
 ("Lignes de vente hors de l'exercice", INT, 0,
  "du 1er octobre 2025 au 30 septembre 2026, bornes comprises"),
 ("Montants de vente négatifs", INT, 0,
  "les avoirs sont dans leur propre fichier, pas dans les ventes"),
 ("Mois sans taux de change", INT, 0,
  "douze mois, trois devises : un trou et la conversion est fausse"),
 ("Doublons de code client au référentiel", INT, 0,
  "le code est la clé — s'il se répète, la relation est impossible"),
 ("Clients dont le nom porte un défaut de saisie", INT,
  R["clients_imparfaits"],
  "espaces insécables, casse, accents perdus : c'est pour ça qu'on "
  "rapproche sur le code, jamais sur le libellé"),
 ("Factures présentes des deux côtés dont les montants diffèrent", INT,
  R["n_montants"], "les vingt-trois de la famille ③, et elles seules"),
 ("Le rapprochement se referme-t-il ?", None, "PASS",
  "écart brut = somme des quatre familles, au centime"),
 ("Le total par agence égale-t-il le total général ?", None, "PASS",
  "la somme des six doit redonner le consolidé"),
]

FEUILLES_IMPOSEES = [
 ("README", "Ce que ce classeur fait, d'où viennent les données, comment "
            "l'actualiser, et ce qu'il ne dit pas."),
 ("RECONCILIATION", "Le rapport de rapprochement : les quatre familles "
                    "d'écarts, ligne à ligne, avec leur montant."),
 ("DASHBOARD", "Une page. Ce que le conseil regarde."),
 ("QUALITE", "Les dix contrôles. Aucun ne peut échouer."),
 ("ANNEXE_IA", "Les prompts, au moins TROIS erreurs de l'IA détectées et "
               "corrigées, et quel V a attrapé chacune."),
 ("NOTE_DE_SYNTHESE", "Une page pour le conseil. La recommandation en "
                      "premier."),
]

LIGNES_REPONSES = {}

def feuille_reponses(wb, corrige):
    ws = wb.create_sheet("REPONSES")
    larg(ws, [66, 24, 24])
    ws["A1"] = "CAPSTONE — les réponses"; ws["A1"].font = Ftitre
    ws["A2"] = ("Chaque cellule jaune doit porter une FORMULE qui pointe vers "
                "votre modèle. Un chiffre tapé à la main vaut la moitié des "
                "points.")
    ws["A2"].font = Faide
    r = 5
    for lib, fmt, val in REPONSES:
        if fmt is None and val is None:
            ws.cell(r, 1, lib).font = Fgras
            r += 1
            continue
        ws.cell(r, 1, lib).border = Bord
        c = ws.cell(r, 2); c.fill, c.border = Rjaune, Bord
        if fmt: c.number_format = fmt
        if corrige:
            c.value, c.font = f"=C{r}", Fnoir
            d = ws.cell(r, 3, val); d.font = Faide
            if fmt: d.number_format = fmt
        LIGNES_REPONSES[lib.split(" —")[0]] = r
        r += 1
    if corrige:
        ws.cell(r + 1, 1, "La colonne C est la référence du corrigé. Elle ne "
                          "sort jamais du dépôt privé.").font = Faide
    return ws

def feuille_qualite(wb, corrige):
    ws = wb.create_sheet("QUALITE")
    larg(ws, [58, 18, 20, 62])
    ws["A1"] = "Les dix contrôles"; ws["A1"].font = Ftitre
    ws["A2"] = ("Aucun ne peut échouer. Un contrôle qui ne passe pas interdit "
                "la livraison — c'est la règle du module 9, et elle tient ici.")
    ws["A2"].font = Faide
    entete(ws, ["Contrôle", "Valeur", "Référence", "Ce que ça veut dire"],
           ligne=4)
    for i, (lib, fmt, val, quoi) in enumerate(QUALITE, start=5):
        ws.cell(i, 1, lib).border = Bord
        c = ws.cell(i, 2); c.fill, c.border = Rjaune, Bord
        if fmt: c.number_format = fmt
        if corrige:
            c.value, c.font = f"=C{i}", Fnoir
            d = ws.cell(i, 3, val); d.font = Faide
            if fmt: d.number_format = fmt
        ws.cell(i, 4, quoi).font = Faide
    return ws

def classeur_capstone(corrige):
    wb = openpyxl.Workbook(); wb.remove(wb.active)
    for nom, aide in FEUILLES_IMPOSEES:
        if nom == "QUALITE":
            feuille_qualite(wb, corrige); continue
        ws = wb.create_sheet(nom)
        larg(ws, [110])
        ws["A1"] = nom; ws["A1"].font = Ftitre
        ws["A2"] = aide; ws["A2"].font = Faide
        ws["A2"].alignment = Alignment(wrap_text=True)
        ws.row_dimensions[2].height = 34
    feuille_reponses(wb, corrige)
    #  L'ordre de lecture : la documentation d'abord, les réponses à la fin.
    wb.move_sheet("REPONSES", offset=len(wb.sheetnames))
    if corrige:
        for nom, cible in (
                ("R_RECONCILIATION",
                 f"REPONSES!$B${LIGNES_REPONSES['R_RECONCILIATION']}"),
                ("R_CONTROLE",
                 f"REPONSES!$B${LIGNES_REPONSES['R_CONTROLE']}")):
            wb.defined_names[nom] = DefinedName(nom, attr_text=cible)
    nom = "CAPSTONE_CORRIGE.xlsx" if corrige else "CAPSTONE_DEPART.xlsx"
    wb.save(RACINE / nom)
    print(f"  {nom}")

classeur_capstone(False)
classeur_capstone(True)
json.dump(R, open(RACINE / "REFERENCES_CAPSTONE.json", "w"), indent=1,
          ensure_ascii=False)

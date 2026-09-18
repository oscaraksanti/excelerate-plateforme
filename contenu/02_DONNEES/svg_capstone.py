import sys, pathlib, json
sys.path.insert(0, "/tmp")
from svg_base import svg
from html import escape as e
OUT = pathlib.Path("public/lecons/capstone"); OUT.mkdir(parents=True, exist_ok=True)
R = json.load(open("contenu/02_DONNEES/sortie-capstone/REFERENCES_CAPSTONE.json"))

ST = ("<style>.ok{fill:#15803d}.ko{fill:#c0392b}.bl{fill:#1d4ed8}"
      "@media (prefers-color-scheme: dark){"
      ".ok{fill:#5fd68f}.ko{fill:#f87171}.bl{fill:#8ab4ff}}</style>")

def carte(x, y, w, h, cls="carte", r=6, bord=True):
    o = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="{cls}"/>'
    if bord:
        o += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="bord"/>'
    return o

def txt(x, y, s, cls="p", t=12.5, p=None, a=None):
    an = f' text-anchor="{a}"' if a else ""
    po = f' font-weight="{p}"' if p else ""
    return f'<text x="{x}" y="{y}" class="{cls}" font-size="{t}"{po}{an}>{e(s)}</text>'

def euros(n): return f"{n:,.0f}".replace(",", " ")

# ══ 1 · Les vingt et une sources ═════════════════════════════════════
c = [ST, '<text x="24" y="30" class="eti">Vingt et un fichiers, et aucun au même format</text>']
BLOCS = [
 ("4 classeurs de ventes", "V01 à V04",
  ["un standard", "un avec titre et ligne vide", "un aux colonnes réordonnées",
   "un avec une colonne en plus"], "vfill"),
 ("3 classeurs de stocks", "S01 à S03",
  ["croisés : les mois en colonnes", "un en ordre inverse",
   "un avec un titre au-dessus"], "carte"),
 ("6 référentiels et budgets", "R01 à R04 · B01 · B02",
  ["produits, clients, agences", "taux de change mensuels",
   "budget croisé, objectifs"], "carte"),
 ("2 autres classeurs", "C01 · H01",
  ["charges en devise locale", "exercice N-1, déjà en USD"], "carte"),
 ("5 exports comptables", "CPT_*.csv",
  ["cp1252, séparateur point-virgule", "utf-8 avec BOM, dates ISO",
   "dates au format américain"], "rfill"),
 ("1 facture scannée", "F01",
  ["photographiée de travers", "le total imprimé est le contrôle"], "rfill"),
]
y = 52
for titre, refs, points, cls in BLOCS:
    h = 30 + 20 * len(points)
    c.append(carte(24, y, 656, h, cls))
    c.append(txt(44, y + 24, titre, "h", 13.5))
    c.append(txt(300, y + 24, refs, "mono t3", 10.5))
    for k, p in enumerate(points):
        c.append(txt(440, y + 24 + k * 20, "· " + p, "p", 11.5))
    y += h + 10
c.append(carte(24, y, 656, 76, "vfill"))
c.append(txt(44, y + 26, "Ce qu'il y a dedans", "h", 13.5))
c.append(txt(44, y + 50, f"{R['lignes_commerciales']:,} lignes de vente  ·  "
                         f"{R['factures_commerciales']:,} factures  ·  "
                         f"{R['ecritures_comptables']:,} écritures comptables  ·  "
                         f"600 clients".replace(",", " "), "mono t2", 11.5))
c.append(txt(44, y + 68, "Exercice du 1er octobre 2025 au 30 septembre 2026  ·  "
                         "six agences  ·  trois devises", "mono t3", 10.5))
(OUT / "01-sources.svg").write_text(svg(704, y + 108, "".join(c)))

# ══ 2 · Les quatre familles d'écarts ═════════════════════════════════
c = [ST, '<text x="24" y="30" class="eti">Le rapprochement, et les quatre seules façons dont deux sources diffèrent</text>']
c.append(carte(24, 52, 316, 82, "carte"))
c.append(txt(44, 78, "Vue commerciale", "h", 14))
c.append(txt(44, 100, f"{R['factures_commerciales']} factures", "mono t2", 12))
c.append(txt(44, 122, f"{euros(R['ca_commercial_usd'])} USD", "mono bl", 12))
c.append(carte(364, 52, 316, 82, "carte"))
c.append(txt(384, 78, "Vue comptable", "h", 14))
c.append(txt(384, 100, f"{R['ecritures_comptables']} écritures", "mono t2", 12))
c.append(txt(384, 122, f"{euros(R['ca_comptable_usd'])} USD", "mono bl", 12))
c.append(f'<path d="M 340 93 L 364 93" stroke="var(--b)" stroke-width="2"/>')
c.append(carte(24, 146, 656, 46, "rfill"))
c.append(txt(44, 175, f"Écart brut   {euros(R['ecart_brut_usd'])} USD   "
                      "— et il faut l'expliquer en entier", "h", 13.5))

FAM = [
 ("①", "Chez A, pas chez B", "factures sans écriture comptable",
  R["n_a_sans_b"], -R["montant_a_sans_b"]),
 ("②", "Chez B, pas chez A", "régularisations de clôture",
  R["n_b_sans_a"], R["montant_b_sans_a"]),
 ("③", "Montants différents", "remise de fin d'année saisie d'un seul côté",
  R["n_montants"], R["ecart_montants"]),
 ("④", "Doublons", "la même facture saisie deux fois en comptabilité",
  R["n_doublons"], R["montant_doublons"]),
]
y = 206
for sym, titre, quoi, n, montant in FAM:
    c.append(carte(24, y, 656, 56, "carte"))
    c.append(txt(48, y + 34, sym, "vtext", 17))
    c.append(txt(80, y + 24, titre, "h", 13.5))
    c.append(txt(80, y + 44, quoi, "p", 11.5))
    c.append(txt(508, y + 34, f"{n}", "mono t2", 12, a="end"))
    cl = "ok" if montant >= 0 else "ko"
    c.append(txt(656, y + 34, f"{euros(montant)} USD", f"mono {cl}", 12, a="end"))
    y += 62
c.append(carte(24, y, 656, 50, "vfill"))
c.append(txt(44, y + 31, "Somme des quatre", "h", 13.5))
c.append(txt(656, y + 31, f"{euros(R['somme_familles'])} USD", "mono ok", 13,
             a="end"))
y += 58
c.append(carte(24, y, 656, 74, "carte"))
c.append(txt(44, y + 28, "R_RECONCILIATION  =  écart brut − somme des quatre  "
                         "=  0", "h", 14))
c.append(txt(44, y + 52, "Tant qu'il ne vaut pas zéro, une cinquième cause "
                         "existe et vous ne l'avez pas trouvée.", "p", 12.5))
(OUT / "02-quatre-familles.svg").write_text(svg(704, y + 104, "".join(c)))

# ══ 3 · Les douze livrables, et d'où ils viennent ════════════════════
c = [ST, '<text x="24" y="30" class="eti">Douze livrables — un par compétence du programme</text>']
LIV = [
 (1, "Import Power Query des 21 sources", "M7"),
 (2, "Nettoyage documenté, dans l'ordre", "M3"),
 (3, "Modèle en étoile + calendrier", "M8"),
 (4, "Dix mesures en français métier", "M8"),
 (5, "Réconciliation, quatre familles", "M4"),
 (6, "Tableau de bord d'une page", "M6"),
 (7, "Scénarios, table à deux entrées", "M9"),
 (8, "Automatisation qui rejoue tout", "M10"),
 (9, "README complet", "M9"),
 (10, "QUALITE — dix contrôles", "M2"),
 (11, "ANNEXE_IA — trois erreurs d'IA", "tous"),
 (12, "Note de synthèse d'une page", "M6"),
]
for k, (n, quoi, mod) in enumerate(LIV):
    x = 24 + (k % 2) * 336
    y = 52 + (k // 2) * 62
    c.append(carte(x, y, 320, 52, "carte"))
    c.append(f'<circle cx="{x+26}" cy="{y+26}" r="12" class="vfill"/>')
    c.append(f'<circle cx="{x+26}" cy="{y+26}" r="12" class="vstroke"/>')
    c.append(txt(x + 26, y + 30, str(n), "vtext mono", 11, p=600, a="middle"))
    c.append(txt(x + 48, y + 24, quoi, "h", 12))
    c.append(txt(x + 48, y + 42, mod, "mono t3", 10))
y = 52 + 6 * 62 + 8
c.append(carte(24, y, 656, 86, "vfill"))
c.append(txt(44, y + 28, "Et la condition qui compte plus que les douze",
             "h", 14.5))
c.append(txt(44, y + 54, "Vous devez pouvoir expliquer CHAQUE élément de votre "
                         "fichier. Chaque formule, chaque", "p", 12.5))
c.append(txt(44, y + 74, "relation, chaque mesure, chaque étape de requête. "
                         "Jamais « c'est Claude qui l'a fait ».", "p", 12.5))
(OUT / "03-livrables.svg").write_text(svg(704, y + 118, "".join(c)))

# ══ 4 · Le barème et le calendrier ═══════════════════════════════════
c = [ST, '<text x="24" y="30" class="eti">Cent points, et trois semaines</text>']
BAREME = [
 ("Exactitude et cohérence des chiffres", 25),
 ("Architecture et modélisation", 20),
 ("Qualité et traçabilité des données", 15),
 ("Restitution et lisibilité", 15),
 ("Reproductibilité et documentation", 10),
 ("Usage critique de l'IA", 10),
 ("Soutenance — expliquer son propre fichier", 5),
]
y = 52
LARG = 240
for titre, pts in BAREME:
    c.append(carte(24, y, 656, 40, "carte"))
    c.append(txt(44, y + 26, titre, "h", 13))
    w = LARG * pts / 25
    c.append(f'<rect x="380" y="{y+13}" width="{w:.0f}" height="14" rx="3" '
             f'class="vfill"/>')
    c.append(f'<rect x="380" y="{y+13}" width="{w:.0f}" height="14" rx="3" '
             f'class="vstroke"/>')
    c.append(txt(656, y + 26, str(pts), "mono t2", 12, a="end"))
    y += 46
c.append(carte(24, y, 656, 44, "vfill"))
c.append(txt(44, y + 28, "Total", "h", 13.5))
c.append(txt(656, y + 28, "100", "mono ok", 13.5, a="end"))
y += 58

CAL = [("ven. 2 octobre", "lancement — les 21 fichiers sont en ligne"),
       ("dim. 11 octobre", "dépôt de la copie, 23 h 59"),
       ("12 → 15 octobre", "trois corrections croisées à rendre"),
       ("16 → 20 octobre", "soutenances de dix minutes, en visioconférence"),
       ("mer. 22 octobre", "certificats délivrés")]
c.append(carte(24, y, 656, 48 + 26 * len(CAL), "carte"))
c.append(txt(44, y + 28, "Le calendrier", "h", 14))
for k, (quand, quoi) in enumerate(CAL):
    c.append(txt(44, y + 54 + k * 26, quand, "mono t2", 11.5))
    c.append(txt(200, y + 54 + k * 26, quoi, "p", 12))
y += 48 + 26 * len(CAL) + 12
c.append(carte(24, y, 656, 64, "rfill"))
c.append(txt(44, y + 28, "La condition du certificat « Avancé »", "h", 13.5))
c.append(txt(44, y + 50, "Un capstone rendu · trois corrections faites · "
                         "une note d'au moins 12 sur 20.", "p", 12.5))
(OUT / "04-bareme.svg").write_text(svg(704, y + 94, "".join(c)))

print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))

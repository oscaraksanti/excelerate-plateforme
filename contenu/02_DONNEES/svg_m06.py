import sys, pathlib, math
sys.path.insert(0, "/tmp")
from svg_base import svg, grille
from html import escape as e
OUT = pathlib.Path("public/lecons/m06"); OUT.mkdir(parents=True, exist_ok=True)

def carte(x, y, w, h, cls="carte", r=6, bord=True):
    o = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="{cls}"/>'
    if bord:
        o += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="bord"/>'
    return o

def txt(x, y, s, cls="p", taille=12.5, poids=None, ancre=None):
    a = f' text-anchor="{ancre}"' if ancre else ""
    p = f' font-weight="{poids}"' if poids else ""
    return f'<text x="{x}" y="{y}" class="{cls}" font-size="{taille}"{p}{a}>{e(s)}</text>'

# ══ 1 · La question décide du type ═══════════════════════════════════
c = ['<text x="24" y="30" class="eti">Le type de graphique ne se choisit pas au goût</text>']
Q = [("« Comment ça bouge ? »", "ÉVOLUTION", "courbe", "une ligne, le temps en abscisse"),
     ("« Qui fait plus que qui ? »", "COMPARAISON", "barres triées", "horizontales si les noms sont longs"),
     ("« De quoi c'est fait ? »", "COMPOSITION", "barres empilées à 100 %", "jamais un camembert au-delà de 3 parts"),
     ("« Est-ce que ça va ensemble ? »", "CORRÉLATION", "nuage de points", "deux mesures, un point par individu")]
for i, (q, fam, typ, note) in enumerate(Q):
    y = 54 + i * 84
    c.append(carte(24, y, 300, 70))
    c.append(txt(44, y + 30, q, "h", 13.5))
    c.append(txt(44, y + 52, fam, "eti", 10.5))
    c.append(f'<path d="M332 {y+35} L 364 {y+35}" class="vstroke" stroke-width="1.5"/>')
    c.append(f'<path d="M358 {y+30} L 366 {y+35} L 358 {y+40} Z" fill="var(--vb)"/>')
    c.append(carte(374, y, 306, 70, "vfill"))
    c.append(txt(394, y + 30, typ, "h", 14))
    c.append(txt(394, y + 52, note, "mono t3", 10.5))
c.append(carte(24, 390, 656, 58, "vfill"))
c.append(txt(44, 416, "La règle, et elle n'a pas d'exception", "h", 13.5))
c.append(txt(44, 438, "On écrit d'abord la question en français. Le type de graphique "
                      "en découle.", "p", 12.5))
(OUT / "01-quel-graphique.svg").write_text(svg(704, 470, "".join(c)))

# ══ 2 · Le camembert à huit parts ════════════════════════════════════
VALS = [27.1, 21.1, 16.6, 12.1, 11.6, 9.4, 1.1, 1.0]
NOMS = ["Riz", "Huiles", "Farine", "Boissons", "Conserves", "Savons", "Hygiène", "Épicerie"]
COUL = ["#4A7EBB", "#C0392B", "#7FA653", "#6E4B9E", "#3E9AA8", "#D98026", "#9BB7DB", "#D88A8A"]
c = ['<text x="24" y="30" class="eti">Les mêmes huit chiffres, deux fois</text>']
cx, cy, r = 150, 175, 96
ang = -90.0
for v, nom, col in zip(VALS, NOMS, COUL):
    a2 = ang + v * 3.6
    x1, y1 = cx + r * math.cos(math.radians(ang)), cy + r * math.sin(math.radians(ang))
    x2, y2 = cx + r * math.cos(math.radians(a2)), cy + r * math.sin(math.radians(a2))
    grand = 1 if v * 3.6 > 180 else 0
    c.append(f'<path d="M{cx} {cy} L{x1:.1f} {y1:.1f} A{r} {r} 0 {grand} 1 '
             f'{x2:.1f} {y2:.1f} Z" fill="{col}" stroke="var(--f)" stroke-width="1.5"/>')
    ang = a2
c.append(txt(150, 300, "Camembert — 8 parts", "h", 13, ancre="middle"))
c.append(txt(150, 322, "Classez Farine, Boissons et Conserves.", "p", 12, ancre="middle"))
c.append(txt(150, 342, "Personne n'y arrive.", "mono rtext", 11.5, ancre="middle"))

x0, bw = 330, 300
for i, (v, nom, col) in enumerate(zip(VALS, NOMS, COUL)):
    y = 72 + i * 27
    c.append(f'<rect x="{x0+96}" y="{y-13}" width="{v/27.1*(bw-120):.1f}" height="18" '
             f'rx="2" fill="#4A7EBB"/>')
    c.append(txt(x0 + 88, y, nom, "p", 12, ancre="end"))
    c.append(txt(x0 + 102 + v / 27.1 * (bw - 120), y, f"{v:.1f} %".replace(".", ","),
                 "mono t3", 11))
c.append(txt(330, 300, "Barres triées — les mêmes données", "h", 13))
c.append(txt(330, 322, "L'ordre se lit. Les écarts se mesurent.", "p", 12))
c.append(txt(330, 342, "Et elles tiennent dans une colonne.", "mono vtext", 11.5))

c.append(carte(24, 364, 656, 80, "vfill"))
c.append(txt(44, 390, "Les deux seuls cas où le camembert est défendable", "h", 13.5))
c.append(txt(44, 412, "1.  Deux ou trois parts, et l'une écrase les autres.", "p", 12.5))
c.append(txt(44, 432, "2.  Une part contre le reste — « 8 % de nos clients font 60 % du CA ».",
             "p", 12.5))
(OUT / "02-camembert.svg").write_text(svg(704, 462, "".join(c)))

# ══ 3 · L'axe qui ment ═══════════════════════════════════════════════
MOIS6 = ["avr", "mai", "juin", "juil", "août", "sept"]
CA6 = [2394443, 2377362, 2280617, 2342158, 2548932, 2299043]
c = ['<text x="24" y="30" class="eti">Les six mêmes mois, deux axes, deux conclusions</text>']
for k, (x0, mn, mx, titre, cls) in enumerate((
        (24, 0, 2_800_000, "Axe à zéro — six mois très stables", "vfill"),
        (374, 2_200_000, 2_600_000, "Axe à 2,2 M — la chute de septembre", "rfill"))):
    c.append(carte(x0, 50, 306, 238, cls))
    c.append(txt(x0 + 20, 76, titre, "h", 13))
    bx, by, bw2, bh = x0 + 46, 96, 240, 140
    c.append(f'<line x1="{bx}" y1="{by+bh}" x2="{bx+bw2}" y2="{by+bh}" class="bord"/>')
    c.append(f'<line x1="{bx}" y1="{by}" x2="{bx}" y2="{by+bh}" class="bord"/>')
    for i, (m, v) in enumerate(zip(MOIS6, CA6)):
        h = max(2, (v - mn) / (mx - mn) * bh)
        xx = bx + 8 + i * 38
        coul = "#C0392B" if (k == 1 and i == 5) else "#4A7EBB"
        c.append(f'<rect x="{xx}" y="{by+bh-h:.1f}" width="24" height="{h:.1f}" fill="{coul}"/>')
        c.append(f'<text x="{xx+12}" y="{by+bh+16}" class="mono t3" font-size="9.5" '
                 f'text-anchor="middle">{m}</text>')
    legende = "l’axe part de zéro" if not mn else f"l’axe part de 2 200 000"
    c.append(txt(x0 + 20, 268, legende, "mono t3", 10.5))
c.append(carte(24, 304, 656, 92, "vfill"))
c.append(txt(44, 330, "Le même chiffre : −9,8 %", "h", 13.5))
c.append(txt(44, 354, "À gauche, un creux. À droite, un effondrement. "
                      "Aucun des deux graphiques n'est faux.", "p", 12.5))
c.append(txt(44, 376, "Un axe tronqué se signale — ou ne se fait pas. "
                      "La seule exception est la cascade.", "mono vtext", 11.5))
(OUT / "03-axe-qui-ment.svg").write_text(svg(704, 414, "".join(c)))

# ══ 4 · Le ratio données / encre ═════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Tout ce qui n’informe pas encombre</text>']
A_RETIRER = ["le quadrillage horizontal", "le contour du graphique", "la légende à une seule série",
             "les effets d'ombre et de relief", "l'axe vertical quand il y a des étiquettes",
             "les décimales d'un montant en millions", "le titre « Graphique 1 »",
             "une couleur par barre pour une seule série"]
A_GARDER = ["un titre qui affirme quelque chose", "les étiquettes des catégories",
            "une valeur par barre, arrondie", "une couleur d'accent, une seule",
            "l'unité, dite une fois"]
c.append(carte(24, 50, 330, 274, "rfill"))
c.append(txt(44, 78, "À retirer", "h", 14))
for i, t in enumerate(A_RETIRER):
    c.append(txt(44, 106 + i * 24, "✕  " + t, "p", 12))
c.append(carte(374, 50, 306, 274, "vfill"))
c.append(txt(394, 78, "À garder", "h", 14))
for i, t in enumerate(A_GARDER):
    c.append(txt(394, 106 + i * 24, "✓  " + t, "p", 12))
c.append(txt(394, 240, "Et une chose de plus :", "eti", 10.5))
c.append(txt(394, 266, "ce que le lecteur doit", "p", 12))
c.append(txt(394, 286, "faire après avoir lu.", "p", 12))
c.append(carte(24, 340, 656, 58, "carte"))
c.append(txt(44, 366, "Le test", "h", 13.5))
c.append(txt(44, 388, "Retirez un élément. Si la compréhension ne baisse pas, "
                      "il n'avait rien à faire là.", "p", 12.5))
(OUT / "04-ratio-encre.svg").write_text(svg(704, 416, "".join(c)))

print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))

# ══ 5 · La cascade ═══════════════════════════════════════════════════
PONT = [("Marge août", 434374, None, "total"), ("Farine", -13400, None, "baisse"),
        ("Riz", -8894, None, "baisse"), ("Huiles", -8224, None, "baisse"),
        ("Savons", -6834, None, "baisse"), ("Autres", -2334, None, "baisse"),
        ("Marge sept.", 394687, None, "total")]
c = ['<text x="24" y="30" class="eti">Pourquoi la marge a reculé — en un seul graphique</text>']
bx, by, bh = 54, 62, 190
mn, mx = 380_000, 445_000
def hy(v): return by + bh - (v - mn) / (mx - mn) * bh
for v in (380_000, 400_000, 420_000, 440_000):
    c.append(f'<line x1="{bx}" y1="{hy(v):.1f}" x2="{bx+600}" y2="{hy(v):.1f}" class="bord2"/>')
    c.append(f'<text x="{bx-10}" y="{hy(v)+4:.1f}" class="mono t3" font-size="10" '
             f'text-anchor="end">{v//1000} k</text>')
cum = 0.0
for i, (lib, val, _x, genre) in enumerate(PONT):
    xx = bx + 20 + i * 84
    if genre == "total":
        haut, bas, coul = hy(val), hy(mn), "#2F6B47"
        cum = val
    else:
        haut, bas, coul = hy(cum), hy(cum + val), "#C0392B"
        cum += val
    c.append(f'<rect x="{xx}" y="{haut:.1f}" width="46" height="{max(3, bas-haut):.1f}" '
             f'fill="{coul}"/>')
    c.append(f'<text x="{xx+23}" y="{by+bh+18}" class="mono t3" font-size="10" '
             f'text-anchor="middle">{e(lib)}</text>')
    if genre != "total":
        c.append(f'<text x="{xx+23}" y="{haut-7:.1f}" class="mono rtext" font-size="10" '
                 f'text-anchor="middle">{val:+,}'.replace(",", " ") + '</text>')
c.append(carte(24, 296, 330, 92, "carte"))
c.append(txt(44, 322, "Ce que ça remplace", "h", 13.5))
c.append(txt(44, 346, "Un tableau de huit lignes que personne", "p", 12.5))
c.append(txt(44, 366, "ne lit, et une phrase d'explication.", "p", 12.5))
c.append(carte(374, 296, 306, 92, "vfill"))
c.append(txt(394, 322, "La seule entorse autorisée", "h", 13.5))
c.append(txt(394, 346, "L'axe ne part pas de zéro — et c'est", "p", 12.5))
c.append(txt(394, 366, "juste : ces barres sont des écarts.", "p", 12.5))
(OUT / "05-cascade.svg").write_text(svg(704, 406, "".join(c)))

# ══ 6 · La grille de composition ═════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Une page, et l’ordre dans lequel l’œil la parcourt</text>']
c.append(carte(24, 50, 656, 290, "carte"))
ZONES = [(44, 70, 616, 46, "1", "LE TITRE QUI AFFIRME",
          "« Septembre : 98,5 % de l'objectif — Lubumbashi décroche de 51 503 USD »"),
         (44, 128, 616, 56, "2", "LES QUATRE INDICATEURS",
          "valeur · comparaison · tendance · exception — jamais quatorze"),
         (44, 196, 300, 60, "3", "L'EXCEPTION, EN GRAND",
          "ce qu'il faut traiter cette semaine"),
         (360, 196, 300, 60, "4", "LE DÉTAIL QUI LA JUSTIFIE",
          "six lignes, des barres de données"),
         (44, 268, 616, 54, "5", "LA TENDANCE",
          "douze mois, une courbe, pas de quadrillage")]
for x, y, w, h, n, t, d in ZONES:
    c.append(carte(x, y, w, h, "vfill" if n in "12" else "carte", r=4))
    c.append(f'<circle cx="{x+20}" cy="{y+h/2}" r="11" fill="var(--vb)"/>')
    c.append(f'<text x="{x+20}" y="{y+h/2+4}" class="mono" font-size="11" '
             f'fill="var(--f)" text-anchor="middle" font-weight="600">{n}</text>')
    c.append(txt(x + 42, y + h / 2 - 3, t, "eti", 10.5))
    c.append(txt(x + 42, y + h / 2 + 15, d, "p", 12))
c.append(carte(24, 356, 656, 86, "rfill"))
c.append(txt(44, 382, "Le test des huit secondes", "h", 13.5))
c.append(txt(44, 406, "Ouvrir. Regarder huit secondes. Fermer. "
                      "« Quelle agence est en difficulté ? »", "p", 12.5))
c.append(txt(44, 428, "Si la personne hésite, ce n'est pas elle qui a mal lu.",
             "mono rtext", 11.5))
(OUT / "06-grille.svg").write_text(svg(704, 460, "".join(c)))

# ══ 7 · Les quatre indicateurs ═══════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Un tableau de bord tient en quatre questions</text>']
IND = [("VALEUR", "Où en est-on ?", "2,30 M USD", "le chiffre nu, sans contexte", "t"),
       ("COMPARAISON", "Par rapport à quoi ?", "98,5 %", "de l'objectif — c'est ça qui fait sens", "vtext"),
       ("TENDANCE", "Dans quel sens ?", "−9,8 %", "sur un mois", "rtext"),
       ("EXCEPTION", "Qu'est-ce qui cloche ?", "Lubumbashi", "−51 503 USD sous son objectif", "rtext")]
for i, (fam, q, val, note, cls) in enumerate(IND):
    x = 24 + (i % 2) * 340
    y = 54 + (i // 2) * 130
    c.append(carte(x, y, 316, 112, "vfill" if i == 3 else "carte"))
    c.append(txt(x + 20, y + 26, fam, "eti", 10.5))
    c.append(txt(x + 20, y + 48, q, "p", 12.5))
    c.append(txt(x + 20, y + 80, val, "mono " + cls, 22, "600"))
    c.append(txt(x + 20, y + 100, note, "mono t3", 10.5))
c.append(carte(24, 322, 656, 96, "carte"))
c.append(txt(44, 348, "Pourquoi quatre et pas quatorze", "h", 13.5))
c.append(txt(44, 372, "Quatorze indicateurs de même taille ne hiérarchisent rien : "
                      "l'œil ne sait pas où aller.", "p", 12.5))
c.append(txt(44, 394, "Le quatrième — l'exception — est celui que presque "
                      "aucun rapport ne contient.", "mono vtext", 11.5))
(OUT / "07-quatre-indicateurs.svg").write_text(svg(704, 436, "".join(c)))

# ══ 8 · La palette accessible ════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Ce que voit une personne sur douze dans la salle</text>']
PAIRES = [("Rouge / vert", "#C0392B", "#2F6B47", "#7E6B5A", "#6E6B5E",
           "en deutéranopie, et à l'impression, les deux deviennent le même brun", "r"),
          ("Bleu / orange", "#2B6CB0", "#DD6B20", "#4A6FA5", "#9A8B4F",
           "restent distincts en daltonisme comme en noir et blanc", "v")]
y = 54
for nom, c1, c2, d1, d2, note, k in PAIRES:
    fond = "rfill" if k == "r" else "vfill"
    c.append(carte(24, y, 656, 128, fond))
    c.append(txt(44, y + 28, nom, "h", 14))
    c.append(txt(44, y + 50, note, "p", 12))
    for j, (coul, lib) in enumerate(((c1, "au-dessus"), (c2, "en dessous"))):
        c.append(f'<rect x="{44+j*112}" y="{y+64}" width="96" height="42" rx="4" fill="{coul}"/>')
        c.append(f'<text x="{92+j*112}" y="{y+120}" class="mono t3" font-size="10" '
                 f'text-anchor="middle">{lib}</text>')
    c.append(txt(292, y + 80, "ce que voit", "mono t3", 10))
    c.append(txt(292, y + 96, "un deutéranope :", "mono t3", 10))
    for j, coul in enumerate((d1, d2)):
        c.append(f'<rect x="{400+j*112}" y="{y+64}" width="96" height="42" rx="4" fill="{coul}"/>')
    y += 148
c.append(carte(24, y, 656, 92, "carte"))
c.append(txt(44, y + 26, "Le test qui tient en un geste", "h", 13.5))
c.append(txt(44, y + 50, "Imprimez la page en noir et blanc. Si les deux couleurs "
                         "deviennent le même gris,", "p", 12.5))
c.append(txt(44, y + 70, "elles ne codent plus rien — et une réunion sur deux "
                         "se tient sur un document imprimé.", "p", 12.5))
(OUT / "08-palette.svg").write_text(svg(704, y + 108, "".join(c)))

print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))

# ══ 9 · Ce qui traverse la maquette, et ce qui reste dedans ══════════
c = ['<text x="24" y="30" class="eti">Une maquette promet des choses qu’Excel ne tient pas</text>']
OUI = ["les tuiles d'indicateurs", "les barres, les courbes, la cascade",
       "les barres de données et les icônes", "les sparklines dans une cellule",
       "les segments et la chronologie", "le tri et le filtre à la volée",
       "l'impression sur une page A4", "la mise en page libre — par l'appareil photo"]
NON = ["les animations et les transitions", "les infobulles riches au survol",
       "le défilement fluide d'une page web", "les polices qui ne sont pas installées",
       "les ombres douces et les dégradés fins", "les coins arrondis sur une plage",
       "l'adaptation automatique au téléphone"]
c.append(carte(24, 50, 330, 268, "vfill"))
c.append(txt(44, 78, "Ce qui traverse", "h", 14))
for i, t in enumerate(OUI):
    c.append(txt(44, 106 + i * 24, "✓  " + t, "p", 12))
c.append(carte(374, 50, 306, 268, "rfill"))
c.append(txt(394, 78, "Ce qui reste dans la maquette", "h", 14))
for i, t in enumerate(NON):
    c.append(txt(394, 106 + i * 24, "✕  " + t, "p", 12))
c.append(carte(24, 334, 656, 96, "carte"))
c.append(txt(44, 360, "La phrase à dire au commanditaire, avant de montrer", "h", 13.5))
c.append(txt(44, 384, "« C'est une maquette : elle sert à choisir la disposition "
                      "et la hiérarchie,", "p", 12.5))
c.append(txt(44, 404, "pas le rendu. Le fichier final sera un classeur Excel. »",
             "p", 12.5))
c.append(txt(44, 424, "Dite avant, elle évite une réunion. Dite après, elle ne sert "
                      "plus à rien.", "mono vtext", 11.5))
(OUT / "09-maquette-vers-excel.svg").write_text(svg(704, 448, "".join(c)))
print("09 écrit")

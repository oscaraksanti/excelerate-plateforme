import sys, pathlib, math, json
sys.path.insert(0, "/tmp")
from svg_base import svg, grille
from html import escape as e
OUT = pathlib.Path("public/lecons/m09"); OUT.mkdir(parents=True, exist_ok=True)
R = json.load(open("contenu/02_DONNEES/sortie-m09/REFERENCES_M09.json"))

def carte(x, y, w, h, cls="carte", r=6, bord=True):
    o = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="{cls}"/>'
    if bord:
        o += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="bord"/>'
    return o

def txt(x, y, s, cls="p", taille=12.5, poids=None, ancre=None):
    a = f' text-anchor="{ancre}"' if ancre else ""
    p = f' font-weight="{poids}"' if poids else ""
    return f'<text x="{x}" y="{y}" class="{cls}" font-size="{taille}"{p}{a}>{e(s)}</text>'

STYLE9 = ("<style>"
  ".c-bl{fill:#1d4ed8}.c-no{fill:#101418}.c-ve{fill:#15803d}.c-ro{fill:#c0392b}"
  ".r-bl{fill:#1d4ed8}.r-no{fill:#101418}.r-ve{fill:#15803d}.r-ro{fill:#c0392b}"
  "@media (prefers-color-scheme: dark){"
  ".c-bl{fill:#8ab4ff}.c-no{fill:#eef1f5}.c-ve{fill:#5fd68f}.c-ro{fill:#f87171}"
  ".r-bl{fill:#3b6fd4}.r-no{fill:#c8ced8}.r-ve{fill:#2f9e5d}.r-ro{fill:#d05c56}}"
  "</style>")
CL = {"Bleu": "c-bl", "Noir": "c-no", "Vert": "c-ve", "Rouge": "c-ro"}

# ══ 1 · Les hypothèses au même endroit ═══════════════════════════════
c = [STYLE9, '<text x="24" y="30" class="eti">Le même modèle, deux fois</text>']
c.append(carte(24, 50, 316, 264, "rfill"))
c.append(txt(44, 78, "Éparpillées", "h", 14.5))
c.append(txt(44, 100, "Chaque chiffre vit dans une formule.", "p", 12))
MAUVAIS = ["=B12*4350", "=B12*4,55*631,4", "=SOMME(D:D)-11150000",
           "=E20/631,4", "=F8*(1+0,45%)^24", "=G3*0,14"]
for k, f in enumerate(MAUVAIS):
    y = 128 + k * 28
    c.append(f'<rect x="44" y="{y-15}" width="276" height="23" rx="3" class="carte"/>')
    c.append(f'<text x="54" y="{y}" class="mono c-ro" font-size="11">{e(f)}</text>')
c.append(txt(44, 300, "Changer le taux : six cellules à retrouver.", "p", 12))

c.append(carte(364, 50, 316, 264, "vfill"))
c.append(txt(384, 78, "Rassemblées", "h", 14.5))
c.append(txt(384, 100, "Les formules ne portent que des noms.", "p", 12))
BON = ["=B12*H_PRIX_XOF", "=B12*H_COUT_USD*H_TAUX_XOF",
       "=SOMME(D:D)-H_CHARGES", "=E20/H_TAUX_XOF",
       "=F8*(1+H_DERIVE_TAUX)^24", "=G3*H_ACTUALISATION"]
for k, f in enumerate(BON):
    y = 128 + k * 28
    c.append(f'<rect x="384" y="{y-15}" width="276" height="23" rx="3" class="carte"/>')
    c.append(f'<text x="394" y="{y}" class="mono c-bl" font-size="11">{e(f)}</text>')
c.append(txt(384, 300, "Changer le taux : une cellule, sur HYPOTHESES.", "p", 12))

c.append(carte(24, 332, 656, 62, "carte"))
c.append(txt(44, 358, "Les quatorze hypothèses de ce plan tiennent sur une feuille, "
                      "et elles y sont toutes.", "h", 13.5))
c.append(txt(44, 380, "Une cellule bleue ailleurs dans le classeur est un bug — "
                      "pas un choix de présentation.", "p", 12.5))
(OUT / "01-hypotheses.svg").write_text(svg(704, 414, "".join(c)))

# ══ 2 · Valeur cible ═════════════════════════════════════════════════
c = [STYLE9, '<text x="24" y="30" class="eti">Valeur cible — la question posée à l’envers</text>']
c.append(carte(24, 50, 316, 176, "carte"))
c.append(txt(44, 78, "La formule va dans ce sens", "h", 14))
c.append(txt(44, 112, "prix", "mono t2", 12.5))
c.append(txt(120, 112, "→", "mono t3", 14))
c.append(txt(152, 112, "marge", "mono t2", 12.5))
c.append(txt(44, 148, "On change le prix, on regarde la marge bouger.", "p", 12))
c.append(txt(44, 172, "C’est ce qu’Excel fait naturellement.", "p", 12))
c.append(txt(44, 204, "Et on tâtonne.", "mono t3", 12))

c.append(carte(364, 50, 316, 176, "vfill"))
c.append(txt(384, 78, "Valeur cible le retourne", "h", 14))
c.append(txt(384, 112, "marge = 15 %", "mono vtext", 12.5))
c.append(txt(520, 112, "→", "mono t3", 14))
c.append(txt(552, 112, "prix ?", "mono vtext", 12.5))
c.append(txt(384, 148, "On fixe le résultat, Excel trouve la saisie.", "p", 12))
c.append(txt(384, 172, "Une itération, quelques millisecondes.", "p", 12))
c.append(txt(384, 204, "16,04 USD.", "mono vtext", 12.5))

c.append(carte(24, 244, 656, 96, "carte"))
c.append(txt(44, 270, "Les trois champs, dans cet ordre", "h", 13.5))
c.append(txt(44, 296, "Cellule à définir  =  celle qui porte la FORMULE  "
                      "·  Valeur à atteindre  =  le résultat voulu", "mono t2", 11.5))
c.append(txt(44, 318, "Cellule à modifier  =  une SAISIE, jamais une formule "
                      "— sinon Excel refuse", "mono t2", 11.5))
c.append(carte(24, 356, 656, 58, "rfill"))
c.append(txt(44, 382, "Valeur cible ne déplace qu’UNE cellule. Pour en faire "
                      "bouger plusieurs sous contraintes :", "p", 12.5))
c.append(txt(44, 402, "c’est le Solveur, et c’est la leçon suivante.",
             "p", 12.5))
(OUT / "02-valeur-cible.svg").write_text(svg(704, 434, "".join(c)))

# ══ 3 · La table de données à deux entrées ═══════════════════════════
c = [STYLE9, '<text x="24" y="30" class="eti">420 simulations dans un rectangle</text>']
CW, CH, X0, Y0 = 30, 22, 112, 92
TAUX = [600 + 10 * k for k in range(11)]
VOLS = [15000 + 1000 * k for k in range(10)]
INV = 204500.0
def van_pt(t0, vc):
    v1, mo, cout, prix = 4200, 14, 4.55, 4350
    d, i, ch = 0.0045, R["taux_mensuel"], 11_150_000
    tot = -INV
    for m in range(1, 25):
        v = min(vc, v1 + (vc - v1) * (m - 1) / (mo - 1))
        tot += ((v * prix - ch) / (t0 * (1 + d) ** m) - v * cout) / (1 + i) ** m
    return tot
c.append(txt(X0, Y0 - 30, "volume de croisière  →", "eti", 10.5))
c.append(f'<text x="{X0-52}" y="{Y0+128}" class="eti" font-size="10.5" '
         f'text-anchor="middle" transform="rotate(-90 {X0-52} {Y0+128})">'
         f'taux de départ  →</text>')
for j, v in enumerate(VOLS):
    c.append(txt(X0 + j * CW + CW / 2, Y0 - 10, f"{v//1000}k", "mono t3", 9.5,
                 ancre="middle"))
for k, t in enumerate(TAUX):
    c.append(txt(X0 - 8, Y0 + k * CH + 15, str(t), "mono t3", 9.5, ancre="end"))
    for j, v in enumerate(VOLS):
        van = van_pt(t, v)
        cls = "vfill" if van > 0 else "rfill"
        c.append(f'<rect x="{X0+j*CW}" y="{Y0+k*CH}" width="{CW-1.5}" '
                 f'height="{CH-1.5}" rx="2" class="{cls}"/>')
#  La frontière : pour chaque volume, le taux où la VAN change de signe.
pts = []
for j, v in enumerate(VOLS):
    prev = None
    for k, t in enumerate(TAUX):
        if van_pt(t, v) < 0 and prev is not None:
            pts.append((X0 + j * CW + CW / 2, Y0 + (k - 0.5) * CH)); break
        prev = t
if pts:
    d = "M " + " L ".join(f"{x:.0f} {y:.0f}" for x, y in pts)
    c.append(f'<path d="{d}" stroke="var(--t)" stroke-width="2" fill="none" '
             f'stroke-dasharray="6 3"/>')
c.append(txt(X0 + 10 * CW + 14, Y0 + 30, "VAN > 0", "vtext", 12, poids=600))
c.append(txt(X0 + 10 * CW + 14, Y0 + 52, "le projet paie", "t3", 11))
c.append(txt(X0 + 10 * CW + 14, Y0 + 186, "VAN < 0", "rtext", 12, poids=600))
c.append(txt(X0 + 10 * CW + 14, Y0 + 208, "il ne paie plus", "t3", 11))
c.append(carte(24, 372, 656, 92, "carte"))
c.append(txt(44, 398, "Le geste, en entier", "h", 13.5))
c.append(txt(44, 424, "La formule dans le COIN haut-gauche. Les valeurs à essayer "
                      "sur la ligne du haut et la colonne", "p", 12.5))
c.append(txt(44, 444, "de gauche. On sélectionne tout le rectangle, puis "
                      "Données > Analyse de scénarios > Table de données.",
             "p", 12.5))
(OUT / "03-table-deux-entrees.svg").write_text(svg(704, 484, "".join(c)))

# ══ 4 · VAN, TRI, et l’erreur silencieuse ════════════════════════════
c = [STYLE9, '<text x="24" y="30" class="eti">Deux fonctions, deux plages — c’est là que tout se joue</text>']
ANS = ["0", "1", "2", "3", "4", "5", "6"]
FLX = ["−320 000", "68 000", "94 000", "121 000", "138 000", "142 000", "126 000"]
CW2, X1, Y1 = 84, 50, 78
for k, (a, f) in enumerate(zip(ANS, FLX)):
    x = X1 + k * CW2
    c.append(f'<rect x="{x}" y="{Y1}" width="{CW2-4}" height="46" rx="4" '
             f'class="{"rfill" if k == 0 else "carte"}"/>')
    c.append(f'<rect x="{x}" y="{Y1}" width="{CW2-4}" height="46" rx="4" class="bord"/>')
    c.append(txt(x + (CW2 - 4) / 2, Y1 + 18, "année " + a, "t3", 10, ancre="middle"))
    c.append(txt(x + (CW2 - 4) / 2, Y1 + 36, f, "mono t", 11, ancre="middle"))
c.append(f'<rect x="{X1+CW2-2}" y="{Y1+56}" width="{6*CW2-2}" height="26" rx="4" '
         f'class="vfill"/>')
c.append(txt(X1 + CW2 + 12, Y1 + 74, "VAN( taux ; ces six-là )   puis  + année 0",
             "vtext", 12))
c.append(f'<rect x="{X1-4}" y="{Y1+92}" width="{7*CW2-2}" height="26" rx="4" '
         f'class="vfill"/>')
c.append(txt(X1 + 12, Y1 + 110, "TRI( toute la plage, année 0 comprise )",
             "vtext", 12))
c.append(txt(X1 - 4, Y1 + 146, "VAN exclut le flux du présent. TRI l’exige. "
                               "C’est l’inverse, et c’est tout le piège.",
             "p", 13))

c.append(carte(24, 258, 320, 150, "rfill"))
c.append(txt(44, 286, "L’erreur silencieuse", "h", 14))
c.append(txt(44, 312, "=VAN(t ; TOUTE la plage)", "mono rtext", 11.5))
c.append(txt(44, 340, "Toute la série glisse d’une période.", "p", 12))
c.append(txt(44, 362, "La VAN est divisée par (1 + t).", "p", 12))
c.append(txt(44, 390, "Ici : −12,3 %, et le signe ne change jamais.",
             "mono rtext", 11))

c.append(carte(360, 258, 320, 150, "vfill"))
c.append(txt(380, 286, "Pourquoi elle survit des années", "h", 14))
c.append(txt(380, 312, "Un projet rentable le reste.", "p", 12))
c.append(txt(380, 334, "Un classement de projets ne bouge pas.", "p", 12))
c.append(txt(380, 356, "Rien ne crie. Rien ne casse.", "p", 12))
c.append(txt(380, 390, "Jusqu’au comité qui exige 100 000 de VAN.",
             "mono vtext", 11))
(OUT / "04-van-tri.svg").write_text(svg(704, 428, "".join(c)))

# ══ 5 · L’architecture en huit feuilles ══════════════════════════════
c = [STYLE9, '<text x="24" y="30" class="eti">Huit feuilles, un seul sens de lecture</text>']
FEUILLES = [
 ("README",     "d’où ça vient", "carte"),
 ("HYPOTHESES", "on ne tape que là", "vfill"),
 ("RAW",        "les sources, intactes", "carte"),
 ("CLEAN",      "les mêmes, utilisables", "carte"),
 ("CALCULS",    "zéro saisie, que du calcul", "carte"),
 ("ANALYSE",    "scénarios, sensibilités", "carte"),
 ("DASHBOARD",  "une page, pas deux", "vfill"),
 ("QUALITE",    "les contrôles bloquants", "carte"),
]
for k, (nom, quoi, cls) in enumerate(FEUILLES):
    x = 24 + (k % 4) * 168
    y = 56 + (k // 4) * 116
    c.append(carte(x, y, 156, 96, cls))
    c.append(txt(x + 16, y + 30, nom, "h", 13.5))
    c.append(txt(x + 16, y + 54, quoi, "p", 11.5))
    c.append(txt(x + 16, y + 80, f"{k+1}", "mono t3", 11))
    if k % 4 != 3:
        c.append(f'<path d="M {x+156} {y+48} L {x+166} {y+48}" '
                 f'stroke="var(--b)" stroke-width="2"/>')
c.append('<path d="M 684 104 C 698 104, 698 162, 684 162 L 38 162 '
         'C 24 162, 24 176, 24 196" stroke="var(--b)" stroke-width="1.8" '
         'fill="none"/>')
c.append('<path d="M 20 190 L 24 198 L 28 190" stroke="var(--b)" '
         'stroke-width="1.8" fill="none"/>')
c.append(carte(24, 296, 320, 118, "vfill"))
c.append(txt(44, 324, "Le flux ne remonte jamais", "h", 13.5))
c.append(txt(44, 350, "RAW nourrit CLEAN, CLEAN nourrit CALCULS.", "p", 12))
c.append(txt(44, 372, "Aucune feuille ne lit une feuille", "p", 12))
c.append(txt(44, 392, "située après elle.", "p", 12))
c.append(carte(360, 296, 320, 118, "carte"))
c.append(txt(380, 324, "Deux feuilles pour le TP", "h", 13.5))
c.append(txt(380, 350, "REPONSES — ce que la machine note.", "p", 12))
c.append(txt(380, 372, "ANNEXE_IA — vos prompts, et l’erreur", "p", 12))
c.append(txt(380, 392, "de l’IA que vous avez attrapée.", "p", 12))
(OUT / "05-architecture.svg").write_text(svg(704, 434, "".join(c)))

# ══ 6 · La convention de couleurs ════════════════════════════════════
c = [STYLE9, '<text x="24" y="30" class="eti">Universelle en finance, inconnue partout ailleurs</text>']
COUL = [("Bleu",  None,  "une saisie",
         "4 350", "elle vit sur HYPOTHESES, et nulle part ailleurs"),
        ("Noir",  None,  "une formule",
         "=C7*H_PRIX_XOF", "elle se recalcule ; on n’y touche pas"),
        ("Vert",  None,  "un lien vers une autre feuille",
         "=CALCULS!M30", "il traverse le classeur, il ne le quitte pas"),
        ("Rouge", None, "un lien vers un AUTRE classeur",
         "='[Budget.xlsx]T1'!B4", "il casse le jour où le fichier bouge")]
for k, (nom, coul, quoi, ex, note) in enumerate(COUL):
    y = 58 + k * 82
    c.append(carte(24, y, 656, 70, "carte"))
    c.append(f'<rect x="24" y="{y}" width="7" height="70" rx="3" class="r-{CL[nom][2:]}"/>')
    c.append(f'<text x="52" y="{y+30}" font-size="14" font-weight="600" '
             f'class="{CL[nom]}">{nom}</text>')
    c.append(txt(128, y + 30, quoi, "h", 13.5))
    c.append(f'<text x="128" y="{y+54}" class="mono {CL[nom]}" '
             f'font-size="11.5">{e(ex)}</text>')
    c.append(txt(380, y + 54, note, "p", 12))
c.append(carte(24, 392, 656, 92, "vfill"))
c.append(txt(44, 418, "💎  Le geste qui met tout en bleu d’un coup", "h", 13.5))
c.append(txt(44, 444, "F5 > Cellules > Constantes sélectionne toutes les valeurs "
                      "tapées de la feuille. On les", "p", 12.5))
c.append(txt(44, 464, "colore en une fois — et le même geste, lancé ailleurs que "
                      "sur HYPOTHESES, doit ne rien trouver.", "p", 12.5))
(OUT / "06-couleurs.svg").write_text(svg(704, 504, "".join(c)))

# ══ 7 · Verrouiller, dans le bon ordre ═══════════════════════════════
c = [STYLE9, '<text x="24" y="30" class="eti">Toutes les cellules sont verrouillées d’avance — c’est le piège</text>']
ETAPES = [
 ("1", "Ctrl+A, puis Format de cellule > Protection",
  "on COCHE « Verrouillée » — en réalité elle l’est déjà par défaut"),
 ("2", "Sélectionner les saisies de HYPOTHESES",
  "on DÉCOCHE « Verrouillée » : ce sont les seules cellules à laisser libres"),
 ("3", "Révision > Protéger la feuille",
  "sans mot de passe. Laisser cochée « Sélectionner les cellules déverrouillées »"),
 ("4", "Révision > Protéger le classeur",
  "empêche d’ajouter, de renommer ou de démasquer une feuille"),
]
for k, (n, quoi, note) in enumerate(ETAPES):
    y = 56 + k * 86
    c.append(carte(24, y, 656, 74, "carte"))
    c.append(f'<circle cx="56" cy="{y+37}" r="17" class="vfill"/>')
    c.append(f'<circle cx="56" cy="{y+37}" r="17" class="vstroke"/>')
    c.append(txt(56, y + 42, n, "vtext mono", 14, poids=600, ancre="middle"))
    c.append(txt(92, y + 32, quoi, "h", 13.5))
    c.append(txt(92, y + 56, note, "p", 12))
c.append(carte(24, 400, 656, 84, "rfill"))
c.append(txt(44, 426, "🔴  L’ordre compte", "h", 13.5))
c.append(txt(44, 452, "« Verrouillée » ne fait rien tant que la feuille n’est pas "
                      "protégée. Protéger d’abord et", "p", 12.5))
c.append(txt(44, 472, "déverrouiller ensuite est impossible : tout est figé, y "
                      "compris la case à cocher.", "p", 12.5))
c.append(carte(24, 500, 656, 62, "vfill"))
c.append(txt(44, 526, "Sans mot de passe : on empêche l’accident, on n’enferme "
                      "personne dehors.", "h", 13.5))
c.append(txt(44, 548, "Un modèle qu’une seule personne peut ouvrir est un modèle "
                      "qui mourra avec elle.", "p", 12.5))
(OUT / "07-verrouillage.svg").write_text(svg(704, 582, "".join(c)))

# ══ 8 · La VAN en fonction du taux, et le point de bascule ═══════════
c = [STYLE9, '<text x="24" y="30" class="eti">La question d’après : à partir de quand ça ne paie plus</text>']
X0, Y0, W, Hh = 88, 66, 496, 236
T_MIN, T_MAX = 600.0, 700.0
def van_taux(t0):
    v1, mo, cout, prix, vc = 4200, 14, 4.55, 4350, 19500
    d, i, ch = 0.0045, R["taux_mensuel"], 11_150_000
    tot = -204500.0
    for m in range(1, 25):
        v = min(vc, v1 + (vc - v1) * (m - 1) / (mo - 1))
        tot += ((v * prix - ch) / (t0 * (1 + d) ** m) - v * cout) / (1 + i) ** m
    return tot
VMAX, VMIN = van_taux(T_MIN), van_taux(T_MAX)
def px(t): return X0 + (t - T_MIN) / (T_MAX - T_MIN) * W
def py(v): return Y0 + (VMAX - v) / (VMAX - VMIN) * Hh
c.append(carte(X0, Y0, W, Hh, "carte"))
y0 = py(0)
c.append(f'<rect x="{X0}" y="{Y0}" width="{W}" height="{y0-Y0:.1f}" class="vfill"/>')
c.append(f'<rect x="{X0}" y="{y0:.1f}" width="{W}" height="{Y0+Hh-y0:.1f}" class="rfill"/>')
c.append(f'<line x1="{X0}" y1="{y0:.1f}" x2="{X0+W}" y2="{y0:.1f}" '
         f'stroke="var(--b)" stroke-width="1.2"/>')
d = "M " + " L ".join(f"{px(T_MIN + k):.1f} {py(van_taux(T_MIN + k)):.1f}"
                      for k in range(0, 101, 2))
c.append(f'<path d="{d}" stroke="var(--t)" stroke-width="2.4" fill="none"/>')
TL = R["taux_limite"]
c.append(f'<line x1="{px(TL):.1f}" y1="{Y0}" x2="{px(TL):.1f}" y2="{Y0+Hh}" '
         f'stroke="var(--r)" stroke-width="1.8" stroke-dasharray="5 4"/>')
c.append(f'<circle cx="{px(TL):.1f}" cy="{y0:.1f}" r="5" fill="var(--r)"/>')
c.append(f'<line x1="{px(631.4):.1f}" y1="{Y0}" x2="{px(631.4):.1f}" y2="{Y0+Hh}" '
         f'stroke="var(--vb)" stroke-width="1.8"/>')
c.append(f'<circle cx="{px(631.4):.1f}" cy="{py(van_taux(631.4)):.1f}" r="5" '
         f'fill="var(--v)"/>')
c.append(txt(px(631.4), Y0 - 10, "aujourd’hui  631,40", "vtext mono", 10.5,
             ancre="middle"))
c.append(txt(px(TL) + 6, Y0 + 20, f"bascule  {TL:.0f}", "rtext mono", 10.5))
for t in (600, 625, 650, 675, 700):
    c.append(txt(px(t), Y0 + Hh + 18, str(t), "mono t3", 10, ancre="middle"))
c.append(txt(X0 + W / 2, Y0 + Hh + 40, "taux de départ, en XOF pour 1 USD",
             "t3", 11, ancre="middle"))
c.append(txt(X0 - 12, py(0) + 4, "0", "mono t3", 10, ancre="end"))
c.append(txt(X0 - 12, Y0 + 12, f"+{VMAX/1000:.0f}k", "mono t3", 10, ancre="end"))
c.append(txt(X0 - 12, Y0 + Hh, f"{VMIN/1000:.0f}k", "mono t3", 10, ancre="end"))
c.append(carte(24, 344, 656, 108, "carte"))
c.append(txt(44, 370, "Ce que la courbe dit, et qu’aucun tableau ne dit", "h", 13.5))
_ms = f"{R['marge_securite_taux']*100:.1f}".replace(".", ",")
c.append(txt(44, 396, f"Le plan tient à {_ms} % près. "
                      "Le franc CFA est arrimé à l’euro : ce n’est donc pas",
             "p", 12.5))
c.append(txt(44, 416, "un risque malien, c’est un risque EUR/USD. Personne à "
                      "Bamako ne le pilote — et c’est", "p", 12.5))
c.append(txt(44, 436, "exactement pour ça qu’il faut le chiffrer avant, pas après.",
             "p", 12.5))
(OUT / "08-taux-limite.svg").write_text(svg(704, 472, "".join(c)))

print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))

import sys, pathlib
sys.path.insert(0, "/tmp")
from svg_base import svg
from html import escape as e
OUT = pathlib.Path("public/lecons/m00"); OUT.mkdir(parents=True, exist_ok=True)

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

# ══ 1 · Le parcours entier ═══════════════════════════════════════════
c = [ST, '<text x="24" y="30" class="eti">D’où vous partez, et où vous arrivez</text>']
ETAPES = [
 ("Module 0", "Se préparer", "gratuit", "vous êtes ici", "vfill"),
 ("Modules 1 → 3", "Les trois soirées", "gratuit",
  "structurer, l’IA comme copilote, automatiser", "vfill"),
 ("Modules 4 → 10", "La masterclass", "37 $",
  "croiser, TCD, tableaux de bord, Power Query, modèle, décider, livrer",
  "carte"),
 ("Capstone", "Le projet final", "37 $",
  "21 fichiers, un brief de quatre phrases, et rien d’autre", "carte"),
 ("Certificat", "Excelerate IA — Avancé", "",
  "vérifiable en ligne, avec son code unique", "vfill"),
]
y = 52
for titre, quoi, prix, note, cls in ETAPES:
    c.append(carte(24, y, 656, 74, cls))
    c.append(txt(44, y + 28, titre, "h", 14))
    c.append(txt(44, y + 50, quoi, "p", 12.5))
    if prix:
        c.append(txt(656, y + 28, prix, "mono " + ("ok" if prix == "gratuit" else "t2"),
                     11.5, a="end"))
    c.append(txt(240, y + 50, note, "mono t3", 10.5))
    if titre != "Certificat":
        c.append(f'<path d="M 352 {y+74} L 352 {y+84}" stroke="var(--b)" '
                 f'stroke-width="2"/>')
    y += 84
c.append(carte(24, y, 656, 78, "carte"))
c.append(txt(44, y + 28, "Ce que vous emportez, quoi qu’il arrive", "h", 13.5))
c.append(txt(44, y + 52, "Les trois premiers modules sont gratuits et le "
                         "restent. Dix heures de fondations aussi.", "p", 12.5))
c.append(txt(44, y + 70, "Personne ne vous demandera votre carte pour "
                         "commencer.", "mono t3", 11))
(OUT / "01-parcours.svg").write_text(svg(704, y + 116, "".join(c)))

# ══ 2 · Quelle version d'Excel ═══════════════════════════════════════
c = [ST, '<text x="24" y="30" class="eti">Ce qui marche, et où — la seule page à lire avant de commencer</text>']
COLS = ["2016 / 2019", "2021", "2024 · 365", "Excel web", "Mac"]
LIGNES = [
 ("Tableaux structurés",      [1, 1, 1, 1, 1]),
 ("RECHERCHEX",               [0, 1, 1, 1, 1]),
 ("FILTRE · TRIER · UNIQUE",  [0, 1, 1, 1, 1]),
 ("LET · LAMBDA",             [0, 0, 1, 1, 1]),
 ("Power Query",              [1, 1, 1, 0, 1]),
 ("Tableaux croisés",         [1, 1, 1, 1, 1]),
 ("Solveur · Valeur cible",   [1, 1, 1, 0, 1]),
 ("Power Pivot · DAX",        [1, 1, 1, 0, 0]),
 ("Macros VBA",               [1, 1, 1, 0, 1]),
]
X0, CW, CH = 240, 88, 30
for j, t in enumerate(COLS):
    c.append(txt(X0 + j * CW + CW / 2, 66, t, "mono t3", 10, a="middle"))
y = 76
for nom, dispo in LIGNES:
    c.append(f'<rect x="24" y="{y}" width="656" height="{CH-2}" rx="3" '
             f'class="carte"/>')
    c.append(txt(44, y + 20, nom, "p", 12))
    for j, ok in enumerate(dispo):
        cx = X0 + j * CW + CW / 2
        if ok:
            c.append(f'<path d="M {cx-6} {y+14} L {cx-1} {y+19} L {cx+7} {y+9}" '
                     f'stroke="var(--v)" stroke-width="2.2" fill="none" '
                     f'stroke-linecap="round"/>')
        else:
            c.append(f'<path d="M {cx-5} {y+9} L {cx+5} {y+19} M {cx+5} {y+9} '
                     f'L {cx-5} {y+19}" stroke="var(--r)" stroke-width="2.2" '
                     f'stroke-linecap="round"/>')
    y += CH
y += 12
c.append(carte(24, y, 656, 80, "vfill"))
c.append(txt(44, y + 28, "Le test en dix secondes", "h", 13.5))
c.append(txt(44, y + 54, "Dans une cellule vide, tapez  =RECHERCHEX(  —  si "
                         "l’autocomplétion la propose,", "p", 12.5))
c.append(txt(44, y + 72, "votre version suffit pour la quasi-totalité du "
                         "programme.", "p", 12.5))
y += 92
c.append(carte(24, y, 656, 76, "rfill"))
c.append(txt(44, y + 28, "Les deux seules leçons qui demandent Windows", "h", 13.5))
c.append(txt(44, y + 52, "Le module 8 (Power Pivot) et l’éditeur VBA du module "
                         "10. Tout le reste marche sur Mac,", "p", 12.5))
c.append(txt(44, y + 70, "et les deux modules ont un chemin de repli écrit "
                         "dans leur énoncé.", "p", 12.5))
(OUT / "02-versions.svg").write_text(svg(704, y + 112, "".join(c)))

# ══ 3 · Le groupe BAOBAB ═════════════════════════════════════════════
c = [ST, '<text x="24" y="30" class="eti">Le fil rouge — une seule entreprise, du premier soir au certificat</text>']
c.append(carte(232, 52, 240, 82, "vfill"))
c.append(txt(352, 82, "GROUPE BAOBAB", "h", 15, a="middle"))
c.append(txt(352, 104, "distribution de produits", "p", 12, a="middle"))
c.append(txt(352, 122, "de grande consommation", "p", 12, a="middle"))
AG = [("Kinshasa", "CDF", 24, 186), ("Lubumbashi", "CDF", 248, 186),
      ("Abidjan", "XOF", 472, 186), ("Dakar", "XOF", 24, 268),
      ("Douala", "XAF", 248, 268), ("Libreville", "XAF", 472, 268)]
for nom, dev, x, y in AG:
    c.append(carte(x, y, 208, 62, "carte"))
    c.append(txt(x + 104, y + 28, nom, "h", 13.5, a="middle"))
    c.append(txt(x + 104, y + 48, dev, "mono t3", 11, a="middle"))
for x in (128, 352, 576):
    c.append(f'<path d="M 352 134 C 352 160, {x} 160, {x} 186" '
             f'stroke="var(--vb)" stroke-width="1.5" fill="none"/>')
c.append(carte(24, 346, 320, 96, "carte"))
c.append(txt(44, 374, "Trois devises, un reporting", "h", 13.5))
c.append(txt(44, 400, "Franc congolais, franc CFA Ouest et", "p", 12))
c.append(txt(44, 420, "Central. Consolidé en dollars.", "p", 12))
c.append(carte(360, 346, 320, 96, "vfill"))
c.append(txt(380, 374, "Pourquoi une seule entreprise", "h", 13.5))
c.append(txt(380, 400, "Parce qu’on ne réapprend pas le", "p", 12))
c.append(txt(380, 420, "contexte à chaque module.", "p", 12))
c.append(carte(24, 456, 656, 82, "carte"))
c.append(txt(44, 484, "Et surtout : prenez vos propres données", "h", 14))
c.append(txt(44, 510, "BAOBAB sert d’exemple commun. Le vrai bénéfice arrive "
                      "quand vous refaites chaque geste", "p", 12.5))
c.append(txt(44, 528, "sur VOS chiffres. La leçon 0.3 donne le prompt qui "
                      "fabrique un jeu de données de votre métier.", "p", 12.5))
(OUT / "03-baobab.svg").write_text(svg(704, 562, "".join(c)))

# ══ 4 · Une semaine type ═════════════════════════════════════════════
c = [ST, '<text x="24" y="30" class="eti">Comment un module se suit — comptez deux heures</text>']
ETAPES = [
 ("1", "Les cinq leçons", "15 min chacune",
  "à lire ou à regarder, dans l’ordre"),
 ("2", "Le QCM", "5 min",
  "six ou sept questions, corrigées et expliquées sur-le-champ"),
 ("3", "Le travail pratique", "60 à 90 min",
  "un classeur à trous : chaque réponse est une cellule"),
 ("4", "Le dépôt", "instantané",
  "la note automatique s’affiche en quelques secondes"),
 ("5", "Trois corrections", "15 min chacune",
  "vous corrigez trois copies avant de voir votre note finale"),
]
y = 52
for n, titre, duree, quoi in ETAPES:
    c.append(carte(24, y, 656, 66, "carte"))
    c.append(f'<circle cx="56" cy="{y+33}" r="15" class="vfill"/>')
    c.append(f'<circle cx="56" cy="{y+33}" r="15" class="vstroke"/>')
    c.append(txt(56, y + 38, n, "vtext mono", 13, p=600, a="middle"))
    c.append(txt(88, y + 28, titre, "h", 13.5))
    c.append(txt(88, y + 50, quoi, "p", 12))
    c.append(txt(656, y + 28, duree, "mono t3", 10.5, a="end"))
    if n != "5":
        c.append(f'<path d="M 352 {y+66} L 352 {y+74}" stroke="var(--b)" '
                 f'stroke-width="2"/>')
    y += 74
c.append(carte(24, y, 656, 78, "vfill"))
c.append(txt(44, y + 28, "Pourquoi vous corrigez les autres", "h", 13.5))
c.append(txt(44, y + 54, "Parce qu’on apprend plus en relisant trois copies "
                         "qu’en recevant une note. Et parce que", "p", 12.5))
c.append(txt(44, y + 72, "la moitié de ce qui compte — la lisibilité, la "
                         "documentation — ne se note pas à la machine.",
             "p", 12.5))
y += 90
c.append(carte(24, y, 656, 78, "carte"))
c.append(txt(44, y + 28, "Les directs", "h", 13.5))
c.append(txt(44, y + 54, "Sur Teams, de 19 h à 21 h GMT — soit 20 h à 22 h à "
                         "Kinshasa, Douala et Libreville,", "p", 12.5))
c.append(txt(44, y + 72, "19 h à 21 h à Abidjan et Dakar. Le lien est sur "
                         "votre tableau de bord.", "p", 12.5))
(OUT / "04-semaine.svg").write_text(svg(704, y + 114, "".join(c)))

print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))

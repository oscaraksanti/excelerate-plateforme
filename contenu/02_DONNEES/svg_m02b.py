import sys, pathlib
sys.path.insert(0, "/tmp")
from svg_base import svg
OUT = pathlib.Path("public/lecons/m02")

# ══ 4 · Les cinq anomalies — la carte du classeur saboté ═════════════
c = []
c.append('<text x="24" y="30" class="eti">Où se cachent les cinq anomalies</text>')
CW, CH, X0, Y0 = 108, 26, 66, 58
cols = ["A", "B", "C", "D", "E"]
lignes = [
  ("6",  ["Agence", "CA_CDF", "Charges", "Résultat", "Rés. USD"], "tete"),
  ("7",  ["Kinshasa", "4 820 000", "3 140 000", "1 680 000", "555,56"], ""),
  ("8",  ["Lubumbashi", "2 960 000", "2 105 000", "855 000", "282,74"], ""),
  ("9",  ["Abidjan", "3 540 000", "2 390 000", "1 680 000", "555,56"], "d9"),
  ("10", ["Dakar", "2 780 000", "1 920 000", "860 000", "317,34"], "e10"),
  ("11", ["Douala", "3 110 000", "2 260 000", "850 000", "281,08"], ""),
  ("12", ["Libreville", "1 940 000", "1 505 000", "435 000", "143,85"], ""),
  ("", [], "vide"),
  ("14", ["TOTAL", "14 100 000", "13 320 000", "5 830 000", "2 136,13"], "b14"),
  ("", [], "vide"),
  ("16", ["Contrôle général", "", "", "", "4 272,25"], "e16"),
  ("", [], "vide"),
  ("18", ["Report exercice précédent", "#REF!", "", "", ""], "b18"),
]
# en-tetes de colonnes
for j, col in enumerate(cols):
    c.append(f'<rect x="{X0+j*CW}" y="{Y0-CH}" width="{CW}" height="{CH}" class="carte"/>')
    c.append(f'<rect x="{X0+j*CW}" y="{Y0-CH}" width="{CW}" height="{CH}" class="bord2"/>')
    c.append(f'<text x="{X0+j*CW+CW/2}" y="{Y0-8}" text-anchor="middle" class="mono t3" font-size="10.5">{col}</text>')

ROUGES = {"d9": 3, "e10": 4, "b14": 1, "e16": 4, "b18": 1}
y = Y0
for num, cells, marque in lignes:
    if marque == "vide":
        y += 10; continue
    c.append(f'<text x="{X0-12}" y="{y+17}" text-anchor="end" class="mono t3" font-size="10.5">{num}</text>')
    for j in range(5):
        v = cells[j] if j < len(cells) else ""
        faute = marque in ROUGES and ROUGES[marque] == j
        fond = "vfill" if marque == "tete" else ("rfill" if faute else "carte")
        c.append(f'<rect x="{X0+j*CW}" y="{y}" width="{CW}" height="{CH}" class="{fond}"/>')
        c.append(f'<rect x="{X0+j*CW}" y="{y}" width="{CW}" height="{CH}" class="{"vstroke" if faute else "bord2"}" '
                 f'stroke-width="{2 if faute else 1}"/>')
        coul = "var(--r)" if faute else ("var(--t2)" if marque == "tete" else "var(--t)")
        anc = "start" if j == 0 else "end"
        px = X0+j*CW+8 if j == 0 else X0+(j+1)*CW-8
        c.append(f'<text x="{px}" y="{y+17}" text-anchor="{anc}" class="mono" font-size="10.5" fill="{coul}">{v}</text>')
    y += CH

reperes = [("1", "B14", "la somme s’arrête à B10 — Douala et Libreville manquent"),
           ("2", "D9",  "une valeur en dur au milieu d’une colonne de formules"),
           ("3", "E10", "le taux 2710 écrit en dur au lieu de $B$4"),
           ("4", "E16", "le contrôle général avale la ligne de TOTAL"),
           ("5", "B18", "un lien vers le poste d’un collègue parti")]
y += 18
for n, ou, quoi in reperes:
    c.append(f'<circle cx="{X0-18}" cy="{y+5}" r="10" class="rfill"/>')
    c.append(f'<text x="{X0-18}" y="{y+9}" text-anchor="middle" class="mono rtext" font-size="11" font-weight="600">{n}</text>')
    c.append(f'<text x="{X0}" y="{y+9}" class="mono t" font-size="11.5">{ou}</text>')
    c.append(f'<text x="{X0+52}" y="{y+9}" class="p" font-size="12">{quoi}</text>')
    y += 26
(OUT/"04-cinq-anomalies.svg").write_text(svg(704, y+16, "".join(c)))

# ══ 5 · Le Protocole V4 ══════════════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Quatre contrôles, quatre minutes, pour toute la formation</text>')
V = [("V1", "Version",       "Cette fonction existe-t-elle dans MON Excel ?\nLe séparateur est-il le bon ?", "10 s"),
     ("V2", "Valeurs",       "Juste sur trois cas connus — ET sur un cas\nlimite : vide, zéro, négatif, texte ?", "2 min"),
     ("V3", "Volumétrie",    "Ça tient sur toute la plage ?\nCombien de lignes en entrée, combien en sortie ?", "1 min"),
     ("V4", "Vérité métier", "L’ordre de grandeur est-il plausible ?\nUn collègue du métier validerait-il ?", "1 min")]
y = 52
for code, titre, quoi, temps in V:
    c.append(f'<rect x="24" y="{y}" width="656" height="74" rx="6" class="carte"/>')
    c.append(f'<rect x="24" y="{y}" width="656" height="74" rx="6" class="bord"/>')
    c.append(f'<rect x="24" y="{y}" width="5" height="74" rx="2" class="vfill"/>')
    c.append(f'<text x="50" y="{y+34}" class="mono vtext" font-size="20" font-weight="600">{code}</text>')
    c.append(f'<text x="50" y="{y+56}" class="p" font-size="11.5">{titre}</text>')
    for i, l in enumerate(quoi.split("\n")):
        c.append(f'<text x="150" y="{y+30+i*20}" class="h" font-size="13">{l}</text>')
    c.append(f'<text x="660" y="{y+30}" text-anchor="end" class="mono t3" font-size="12">{temps}</text>')
    y += 82

c.append(f'<rect x="24" y="{y+4}" width="656" height="76" rx="6" class="vfill"/>')
c.append(f'<text x="44" y="{y+30}" class="h" font-size="13.5" fill="var(--v)">'
         'La ligne que les autres formations ne montrent jamais</text>')
c.append(f'<text x="44" y="{y+52}" class="p" font-size="12.5">'
         'Classique 35 min · IA 5 min · <tspan font-weight="600">Vérification 6 min</tspan>.</text>')
c.append(f'<text x="44" y="{y+70}" class="p" font-size="12">'
         '5 + 6 ne fait pas 5. Ça fait quand même 24 minutes de gagnées, et c’est défendable.</text>')
(OUT/"05-protocole-v4.svg").write_text(svg(704, y+96, "".join(c)))

# ══ 6 · Ce que SIERREUR cache ════════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Pourquoi SIERREUR posé partout est une faute professionnelle</text>')
cas = [("#DIV/0!",  "un objectif nul, une vraie donnée manquante", True),
       ("#N/A",     "un matricule absent de la table de référence", True),
       ("#VALEUR!", "un nombre stocké en texte, à réparer", True),
       ("#REF!",    "une colonne supprimée : la formule est cassée", True),
       ("#NOM?",    "une fonction qui n’existe pas dans cette version", True)]
y = 58
for code, quoi, _ in cas:
    c.append(f'<text x="44" y="{y}" class="mono rtext" font-size="12.5">{code}</text>')
    c.append(f'<text x="160" y="{y}" class="p" font-size="12.5">{quoi}</text>')
    c.append(f'<path d="M 470 {y-5} L 500 {y-5}" class="bord" stroke-width="1.2"/>')
    y += 28
c.append(f'<rect x="508" y="36" width="172" height="{y-46}" rx="6" class="rfill"/>')
c.append(f'<text x="594" y="{36+(y-46)/2-6}" text-anchor="middle" class="mono rtext" font-size="12">SIERREUR</text>')
c.append(f'<text x="594" y="{36+(y-46)/2+14}" text-anchor="middle" class="p" font-size="11.5">les avale toutes</text>')

c.append(f'<rect x="24" y="{y+8}" width="656" height="98" rx="6" class="vfill"/>')
c.append(f'<text x="44" y="{y+34}" class="h" font-size="13.5" fill="var(--v)">Ce qu’il faut faire à la place</text>')
c.append(f'<text x="44" y="{y+58}" class="mono t" font-size="11.5">'
         '=SI.NON.DISP(…)        n’attrape QUE l’absence</text>')
c.append(f'<text x="44" y="{y+78}" class="mono t" font-size="11.5">'
         '=RECHERCHEX(… ; "absent")   le filet est dans la fonction</text>')
c.append(f'<text x="44" y="{y+96}" class="p" font-size="11.5">'
         'Une formule qui ne se plaint jamais est une formule dont personne ne sait si elle est juste.</text>')
(OUT/"06-sierreur.svg").write_text(svg(704, y+124, "".join(c)))
print("6 schémas")

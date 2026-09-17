import sys, pathlib
sys.path.insert(0, "/tmp")
from svg_base import svg
from html import escape as e  # & et < cassent le XML
OUT = pathlib.Path("public/lecons/m02"); OUT.mkdir(parents=True, exist_ok=True)

# ══ 1 · L'arbre de décision ══════════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">On dessine l\'arbre AVANT d\'écrire la formule</text>')
c.append('<text x="24" y="56" class="p" font-size="12.5">'
         '« 4 % à partir de 80 % de l\'objectif, 6 % à partir de 100 %, 8 % au-delà de 120 %. »</text>')

def boite(x, y, w, h, titre, sous="", fond="carte", bord="bord", ep=1.4):
    o = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" class="{fond}"/>',
         f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" class="{bord}" stroke-width="{ep}"/>',
         f'<text x="{x+w/2}" y="{y+(24 if sous else h/2+5)}" text-anchor="middle" class="h" font-size="12.5">{titre}</text>']
    if sous:
        o.append(f'<text x="{x+w/2}" y="{y+42}" text-anchor="middle" class="p" font-size="11.5">{sous}</text>')
    return "".join(o)

# Première question
c.append(boite(252, 76, 200, 40, "L’objectif est-il nul ?"))
c.append('<path d="M 252 96 L 150 96 L 150 134" class="bord" stroke-width="1.4" fill="none"/>')
c.append('<path d="M 452 96 L 554 96 L 554 134" class="bord" stroke-width="1.4" fill="none"/>')
c.append('<text x="186" y="90" class="mono t3" font-size="10.5">OUI</text>')
c.append('<text x="494" y="90" class="mono t3" font-size="10.5">NON</text>')

c.append(boite(60, 134, 180, 52, "Taux = 0 %", "et on le signale", "rfill"))
c.append(boite(464, 134, 180, 52, "Réalisé ÷ Objectif", "le taux de réalisation"))

# La colonne des paliers, alignée sous la seconde boîte
c.append('<path d="M 554 186 L 554 216" class="bord" stroke-width="1.4" fill="none"/>')
paliers = [("moins de 80 %", "0 %"), ("de 80 % à 100 %", "4 %"),
           ("de 100 % à 120 %", "6 %"), ("plus de 120 %", "8 %")]
y = 216
for cond, taux in paliers:
    c.append(f'<rect x="288" y="{y}" width="392" height="32" rx="4" class="carte"/>')
    c.append(f'<rect x="288" y="{y}" width="392" height="32" rx="4" class="bord"/>')
    c.append(f'<text x="306" y="{y+21}" class="p" font-size="12.5">{cond}</text>')
    c.append(f'<rect x="580" y="{y+4}" width="88" height="24" rx="3" class="vfill"/>')
    c.append(f'<text x="624" y="{y+21}" text-anchor="middle" class="mono vtext" font-size="12.5" font-weight="600">{taux}</text>')
    y += 38
c.append(f'<path d="M 554 216 L 554 {y-22} M 268 232 L 286 232" class="bord" stroke-width="1.2" fill="none"/>')
c.append(f'<path d="M 268 {y-22} L 286 {y-22}" class="bord" stroke-width="1.2" fill="none"/>')
c.append(f'<path d="M 268 232 L 268 {y-22}" class="bord" stroke-width="1.2" fill="none"/>')
c.append(f'<path d="M 268 {(232+y-22)/2} L 250 {(232+y-22)/2}" class="bord" stroke-width="1.2" fill="none"/>')
c.append(f'<path d="M 250 {(232+y-22)/2} L 250 186 L 554 186" class="bord" stroke-width="0" fill="none"/>')

c.append(f'<rect x="24" y="{y+10}" width="656" height="72" rx="6" class="vfill"/>')
c.append(f'<text x="44" y="{y+36}" class="h" font-size="13.5" fill="var(--v)">'
         'Deux minutes de dessin évitent neuf SI imbriqués</text>')
c.append(f'<text x="44" y="{y+58}" class="p" font-size="12.5">'
         'Et surtout : la branche « objectif nul » ne se voit qu’en dessinant.</text>')
(OUT/"01-arbre-decision.svg").write_text(svg(704, y+102, "".join(c)))

# ══ 2 · L'anatomie d'un critère ══════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">La syntaxe qui bloque tout le monde</text>')
c.append('<rect x="24" y="48" width="656" height="46" rx="5" class="carte"/>')
c.append('<rect x="24" y="48" width="656" height="46" rx="5" class="bord"/>')
bouts = [("=SOMME.SI.ENS(", 38, "t3"), ("plage_à_sommer", 168, "t"), (" ; ", 288, "t3"),
         ("plage_critère", 312, "t"), (" ; ", 414, "t3"), ('">="&$B$1', 422, "vtext"), (")", 540, "t3")]
bouts = [(e(t), x, k) for t, x, k in bouts]
for txt, x, cls in bouts:
    poids = "600" if cls == "vtext" else "400"
    c.append(f'<text x="{x}" y="77" class="mono {cls}" font-size="14" font-weight="{poids}">{txt}</text>')
c.append('<rect x="446" y="52" width="86" height="38" rx="4" class="vstroke" stroke-width="2"/>')

lignes = [
  ('">=1000"',        "le seuil écrit en dur — faux dès le mois prochain", True),
  ('">="&$B$1',       "le seuil vit dans une cellule : on change B1, tout suit", False),
  ('"<>"',            "tout ce qui n’est pas vide", False),
  ('"Kin*"',          "tout ce qui commence par Kin", False),
  ('">="&DATE(2026;1;1)', "une date — jamais \">=01/01/2026\" en dur", False),
]
y = 126
for code, quoi, mauvais in lignes:
    code = e(code)
    coul = "var(--r)" if mauvais else "var(--t)"
    c.append(f'<text x="40" y="{y}" class="mono" font-size="12" fill="{coul}">{code}</text>')
    c.append(f'<text x="250" y="{y}" class="p" font-size="12.5">{quoi}</text>')
    c.append(f'<line x1="24" y1="{y+9}" x2="680" y2="{y+9}" class="bord2"/>')
    y += 28

c.append(f'<rect x="24" y="{y+10}" width="656" height="94" rx="6" class="rfill"/>')
c.append(f'<text x="44" y="{y+36}" class="h" font-size="13.5" fill="var(--r)">'
         'L’erreur qui ne dit rien</text>')
c.append(f'<text x="44" y="{y+58}" class="p" font-size="12.5">'
         'Une plage à sommer plus courte que la plage de critère donne un résultat faux.</text>')
c.append(f'<text x="44" y="{y+78}" class="p" font-size="12.5">'
         'Aucune erreur, aucun avertissement. Le contrôle : comparer leur hauteur.</text>')
(OUT/"02-critere-somme-si-ens.svg").write_text(svg(704, y+126, "".join(c)))

# ══ 3 · Le total de contrôle ═════════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">La pratique qui distingue un professionnel</text>')
c.append('<rect x="24" y="52" width="300" height="150" rx="6" class="carte"/>')
c.append('<rect x="24" y="52" width="300" height="150" rx="6" class="bord"/>')
c.append('<text x="44" y="80" class="h" font-size="13.5">Le détail</text>')
for i, (lab, val) in enumerate([("Kinshasa", "2 994,18"), ("Abidjan", "1 402,10"),
                                ("Dakar", "1 341,50"), ("Douala", "1 208,44"),
                                ("Libreville", "1 128,73")]):
    c.append(f'<text x="44" y="{104+i*19}" class="p" font-size="12">{lab}</text>')
    c.append(f'<text x="304" y="{104+i*19}" text-anchor="end" class="mono t" font-size="11.5">{val}</text>')

c.append('<rect x="380" y="52" width="300" height="150" rx="6" class="carte"/>')
c.append('<rect x="380" y="52" width="300" height="150" rx="6" class="bord"/>')
c.append('<text x="400" y="80" class="h" font-size="13.5">La synthèse</text>')
c.append('<text x="400" y="112" class="p" font-size="12">Commission totale</text>')
c.append('<text x="660" y="112" text-anchor="end" class="mono t" font-size="13">8 093,33</text>')
c.append('<text x="400" y="150" class="p" font-size="12">Calculée autrement :</text>')
c.append('<text x="400" y="170" class="mono t3" font-size="11">somme des trois devises</text>')
c.append('<text x="660" y="170" text-anchor="end" class="mono t" font-size="13">8 093,33</text>')

c.append('<rect x="24" y="222" width="656" height="58" rx="6" class="vfill"/>')
c.append('<rect x="24" y="222" width="656" height="58" rx="6" class="vstroke" stroke-width="2"/>')
c.append('<text x="44" y="248" class="mono" font-size="13" fill="var(--v)">'
         '=SOMME(détail) − SOMME(synthèse)</text>')
c.append('<text x="440" y="248" class="p" font-size="12.5">doit valoir exactement</text>')
c.append('<text x="660" y="250" text-anchor="end" class="mono vtext" font-size="20" font-weight="600">0</text>')
c.append('<text x="44" y="270" class="p" font-size="11.5">'
         'Deux chemins différents vers le même chiffre. S’ils divergent, l’un des deux ment.</text>')
(OUT/"03-total-controle.svg").write_text(svg(704, 302, "".join(c)))
print("3 schémas")

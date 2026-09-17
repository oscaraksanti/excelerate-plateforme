import sys, pathlib
sys.path.insert(0, "/tmp")
from svg_base import svg, grille

OUT = pathlib.Path("public/lecons/m01"); OUT.mkdir(parents=True, exist_ok=True)

# ══ 1 · Plage morte contre tableau vivant ════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Ce qui change quand on appuie sur Ctrl + L</text>')
c.append('<text x="24" y="62" class="h">Une plage</text>')
c.append('<text x="24" y="82" class="p">Un rectangle. Excel n\'en sait rien d\'autre.</text>')
c.append(grille(24, 98, 3, 4, 96, 26,
    entetes=["A", "B", "C"],
    cellules=[(0,1,"Ticket","t2"),(1,1,"Qté","t2"),(2,1,"Montant","t2"),
              (0,2,"KIN-0001","t"),(1,2,"12","t"),(2,2,"410 400","t"),
              (0,3,"KIN-0002","t"),(1,3,"4","t"),(2,3,"648 000","t"),
              (0,4,"KIN-0003","t"),(1,4,"18","t"),(2,4,"367 200","t")]))
c.append('<text x="24" y="252" class="mono" font-size="11" fill="var(--r)">+ 1 ligne</text>')
c.append('<text x="96" y="252" class="p" font-size="12">le graphique ne la voit pas</text>')
c.append('<text x="24" y="272" class="mono" font-size="11" fill="var(--r)">+ 1 ligne</text>')
c.append('<text x="96" y="272" class="p" font-size="12">le TCD ne la voit pas</text>')
c.append('<text x="24" y="292" class="mono" font-size="11" fill="var(--r)">+ 1 ligne</text>')
c.append('<text x="96" y="292" class="p" font-size="12">la formule s\'arrête avant</text>')

c.append('<line x1="352" y1="46" x2="352" y2="300" class="bord2"/>')

c.append('<text x="384" y="62" class="h">Un tableau structuré</text>')
c.append('<text x="384" y="82" class="p">Un objet nommé, qui connaît sa taille.</text>')
c.append(grille(384, 98, 3, 4, 96, 26,
    entetes=["Ticket", "Qté", "Montant"],
    cellules=[(0,1,"KIN-0001","t"),(1,1,"12","t"),(2,1,"410 400","t"),
              (0,2,"KIN-0002","t"),(1,2,"4","t"),(2,2,"648 000","t"),
              (0,3,"KIN-0003","t"),(1,3,"18","t"),(2,3,"367 200","t"),
              (0,4,"KIN-0004","vtext"),(1,4,"7","vtext"),(2,4,"238 000","vtext")],
    surligne=(0,0,3,5)))
c.append('<text x="384" y="252" class="mono" font-size="11" fill="var(--v)">+ 1 ligne</text>')
c.append('<text x="456" y="252" class="p" font-size="12">le graphique la prend</text>')
c.append('<text x="384" y="272" class="mono" font-size="11" fill="var(--v)">+ 1 ligne</text>')
c.append('<text x="456" y="272" class="p" font-size="12">le TCD la prend</text>')
c.append('<text x="384" y="292" class="mono" font-size="11" fill="var(--v)">+ 1 ligne</text>')
c.append('<text x="456" y="292" class="p" font-size="12">la formule s\'étend toute seule</text>')
c.append('<text x="384" y="326" class="mono" font-size="11.5" fill="var(--t3)">'
         '=SOMME(t_Caisse[Montant])  ne bouge jamais</text>')
(OUT/"01-plage-vs-tableau.svg").write_text(svg(720, 348, "".join(c)))

# ══ 2 · L'anatomie de RECHERCHEX ═════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Les six arguments — les trois derniers sont facultatifs</text>')
c.append('<rect x="24" y="48" width="672" height="52" rx="5" class="carte"/>')
c.append('<rect x="24" y="48" width="672" height="52" rx="5" class="bord"/>')
morceaux = [
  ("=RECHERCHEX(", 36, "t3"), ("valeur", 132, "t"), (" ; ", 190, "t3"),
  ("où chercher", 212, "t"), (" ; ", 306, "t3"), ("quoi renvoyer", 328, "t"),
  (" ; ", 438, "t3"), ("si absent", 460, "t2"), (" ; ", 536, "t3"),
  ("0", 558, "t2"), (" ; ", 572, "t3"), ("-1", 594, "vtext"), (")", 616, "t3"),
]
for txt, x, cls in morceaux:
    poids = "600" if cls == "vtext" else "400"
    c.append(f'<text x="{x}" y="80" class="mono {cls}" font-size="14" font-weight="{poids}">{txt}</text>')
legende = [
  ("valeur",        "ce qu'on cherche",                      False),
  ("où chercher",   "la colonne des clés",                   False),
  ("quoi renvoyer", "la colonne du résultat",                False),
  ("si absent",     "ce qu'on affiche au lieu de #N/A",      False),
  ("0",             "correspondance exacte",                 False),
  ("-1",            "on cherche de bas en haut",             True),
]
yy = 122
for arg, quoi, phare in legende:
    coul = "var(--v)" if phare else "var(--t3)"
    poids = "600" if phare else "400"
    c.append(f'<text x="40" y="{yy}" class="mono" font-size="12" fill="{coul}" '
             f'font-weight="{poids}">{arg}</text>')
    c.append(f'<text x="172" y="{yy}" class="p" font-size="12.5">{quoi}</text>')
    c.append(f'<line x1="24" y1="{yy+9}" x2="696" y2="{yy+9}" class="bord2"/>')
    yy += 26
c.append('<rect x="586" y="52" width="46" height="44" rx="4" class="vstroke" stroke-width="2"/>')
c.append('<rect x="24" y="288" width="672" height="92" rx="5" class="vfill"/>')
c.append('<text x="42" y="314" class="h" font-size="14" fill="var(--v)">'
         'Le sixième argument est la pépite</text>')
c.append('<text x="42" y="338" class="p" font-size="12.5">'
         'Sans lui, on trouve le PREMIER prix appliqué au client.</text>')
c.append('<text x="42" y="358" class="p" font-size="12.5">'
         'Avec -1, on cherche de bas en haut : on trouve le DERNIER.</text>')
c.append('<text x="42" y="378" class="mono" font-size="11.5" fill="var(--t3)">'
         'SUPERMARCHE CITY : premier 38 400 CDF · dernier 36 800 CDF</text>')
(OUT/"02-anatomie-recherchex.svg").write_text(svg(720, 404, "".join(c)))

# ══ 3 · Le déversement ═══════════════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Une formule, une cellule, un tableau entier</text>')
c.append('<text x="24" y="60" class="p">On écrit la formule ici, et seulement ici :</text>')
c.append('<rect x="24" y="76" width="300" height="30" rx="4" class="carte"/>')
c.append('<rect x="24" y="76" width="300" height="30" rx="4" class="vstroke" stroke-width="2"/>')
c.append('<text x="36" y="96" class="mono t" font-size="12">=TRIER(UNIQUE(t_Caisse[Client]))</text>')
c.append('<path d="M 174 112 L 174 132" class="vstroke" stroke-width="2"/>')
c.append('<path d="M 168 126 L 174 134 L 180 126" class="vstroke" stroke-width="2"/>')
c.append(grille(24, 142, 1, 5, 300, 26,
    cellules=[(0,0,"ALIMENTATION BANDAL","t"),(0,1,"BOUTIQUE MAMA NGALULA","t"),
              (0,2,"CANTINE UNIKIN","t"),(0,3,"DEPOT KINTAMBO","t"),
              (0,4,"EPICERIE LEMBA","t"),(0,5,"GROSSISTE MASINA","t")],
    surligne=(0,0,1,6)))
c.append('<text x="24" y="330" class="mono" font-size="11" fill="var(--t3)">'
         'le cadre bleu = la plage de déversement</text>')
c.append('<line x1="356" y1="46" x2="356" y2="340" class="bord2"/>')
c.append('<text x="388" y="66" class="h" font-size="14">Les deux règles</text>')
c.append('<rect x="388" y="82" width="308" height="76" rx="5" class="rfill"/>')
c.append('<text x="404" y="106" class="mono rtext" font-size="12.5">#DEBORDEMENT!</text>')
c.append('<text x="404" y="128" class="p" font-size="12">Une seule cause : quelque chose</text>')
c.append('<text x="404" y="146" class="p" font-size="12">occupe la place. Videz, ça repart.</text>')
c.append('<rect x="388" y="176" width="308" height="76" rx="5" class="vfill"/>')
c.append('<text x="404" y="200" class="mono vtext" font-size="12.5">E2#</text>')
c.append('<text x="404" y="222" class="p" font-size="12">« tout ce que cette formule a</text>')
c.append('<text x="404" y="240" class="p" font-size="12">déversé » — même si ça grandit.</text>')
c.append('<text x="388" y="284" class="p" font-size="12">On ne recopie jamais une formule</text>')
c.append('<text x="388" y="302" class="p" font-size="12">de déversement vers le bas :</text>')
c.append('<text x="388" y="320" class="p" font-size="12">elle se déverse déjà toute seule.</text>')
(OUT/"03-deversement.svg").write_text(svg(720, 356, "".join(c)))
print("3 schémas écrits")

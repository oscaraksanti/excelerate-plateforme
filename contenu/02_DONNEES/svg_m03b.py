import sys, pathlib
sys.path.insert(0, "/tmp")
from svg_base import svg, grille
OUT = pathlib.Path("public/lecons/m03")

# ══ 4 · Dépivoter ════════════════════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Quatre clics qui rendent analysable un tableau reçu</text>')
c.append('<text x="24" y="58" class="h" font-size="13.5">Ce qu’on reçoit</text>')
c.append('<text x="24" y="78" class="p" font-size="12">Illisible par un TCD, inutilisable par une formule.</text>')
c.append(grille(24, 92, 5, 3, 124, 26,
    entetes=["Agence", "Janv.", "Févr.", "Mars", "Avril"],
    cellules=[(0,1,"Kinshasa","t"),(1,1,"412 300","t"),(2,1,"388 100","t"),(3,1,"455 900","t"),(4,1,"401 200","t"),
              (0,2,"Abidjan","t"),(1,2,"284 500","t"),(2,2,"301 700","t"),(3,2,"276 400","t"),(4,2,"312 800","t"),
              (0,3,"Dakar","t"),(1,3,"198 600","t"),(2,3,"214 300","t"),(3,3,"205 100","t"),(4,3,"221 900","t")]))
c.append('<path d="M 352 216 L 352 244" class="vstroke" stroke-width="2" fill="none"/>')
c.append('<path d="M 344 238 L 352 246 L 360 238" class="vstroke" stroke-width="2" fill="none"/>')
c.append('<text x="368" y="238" class="mono vtext" font-size="11">Sélectionner les colonnes de mois</text>')
c.append('<text x="368" y="254" class="mono vtext" font-size="11">→ Transformer → Dépivoter les AUTRES colonnes</text>')

c.append('<text x="24" y="292" class="h" font-size="13.5">Ce qu’on obtient</text>')
c.append('<text x="24" y="312" class="p" font-size="12">Trois colonnes. Une ligne par croisement. Analysable.</text>')
c.append(grille(24, 326, 3, 5, 132, 26,
    entetes=["Agence", "Mois", "Montant"],
    cellules=[(0,1,"Kinshasa","t"),(1,1,"Janvier","t"),(2,1,"412 300","t"),
              (0,2,"Kinshasa","t"),(1,2,"Février","t"),(2,2,"388 100","t"),
              (0,3,"Kinshasa","t"),(1,3,"Mars","t"),(2,3,"455 900","t"),
              (0,4,"Kinshasa","t"),(1,4,"Avril","t"),(2,4,"401 200","t"),
              (0,5,"Abidjan","t3"),(1,5,"Janvier","t3"),(2,5,"284 500","t3")],
    surligne=(0,0,3,6)))
c.append('<text x="430" y="352" class="p" font-size="12.5">12 tableaux croisés reçus</text>')
c.append('<text x="430" y="372" class="p" font-size="12.5">redeviennent des données</text>')
c.append('<text x="430" y="392" class="p" font-size="12.5">en quatre clics.</text>')
c.append('<rect x="430" y="412" width="250" height="60" rx="6" class="vfill"/>')
c.append('<text x="446" y="436" class="mono vtext" font-size="11">Dépivoter les AUTRES colonnes</text>')
c.append('<text x="446" y="456" class="p" font-size="11.5">survit à l’arrivée d’un mois de plus</text>')
(OUT/"04-depivoter.svg").write_text(svg(704, 496, "".join(c)))

# ══ 5 · Le protocole d'échantillonnage ═══════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Une IA qui nettoie 5 000 lignes peut en corriger 40 de travers sans le dire</text>')
blocs = [("30", "lignes tirées au hasard", "attrape l’erreur systématique"),
         ("10", "valeurs les plus atypiques", "attrape l’erreur sur les cas rares — la plus fréquente"),
         ("1",  "total de contrôle avant / après", "attrape la perte de lignes")]
y = 56
for n, quoi, pourquoi in blocs:
    c.append(f'<rect x="24" y="{y}" width="656" height="64" rx="6" class="carte"/>')
    c.append(f'<rect x="24" y="{y}" width="656" height="64" rx="6" class="bord"/>')
    c.append(f'<rect x="24" y="{y}" width="5" height="64" rx="2" class="vfill"/>')
    c.append(f'<text x="70" y="{y+42}" text-anchor="middle" class="mono vtext" font-size="24" font-weight="600">{n}</text>')
    c.append(f'<text x="120" y="{y+28}" class="h" font-size="13.5">{quoi}</text>')
    c.append(f'<text x="120" y="{y+48}" class="p" font-size="12">{pourquoi}</text>')
    y += 72

c.append(f'<rect x="24" y="{y+6}" width="656" height="96" rx="6" class="rfill"/>')
c.append(f'<text x="44" y="{y+32}" class="h" font-size="13.5" fill="var(--r)">'
         'Pourquoi les cinquante premières lignes ne prouvent rien</text>')
c.append(f'<text x="44" y="{y+56}" class="p" font-size="12.5">'
         'Elles sont toujours propres. Ce sont les cas rares qu’une IA rate — et par</text>')
c.append(f'<text x="44" y="{y+76}" class="p" font-size="12.5">'
         'construction, les cas rares ne sont pas au début du fichier.</text>')
c.append(f'<text x="44" y="{y+94}" class="mono t3" font-size="11">'
         'D’où les dix valeurs les plus longues, les plus courtes, les plus grandes.</text>')
(OUT/"05-echantillonnage.svg").write_text(svg(704, y+126, "".join(c)))

# ══ 6 · Le tableau de décision ═══════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Quel outil, pour quel volume — et surtout : une fois ou tous les mois</text>')
CW, CH, X0, Y0 = 216, 44, 32, 78
c.append(f'<text x="{X0+8}" y="{Y0-14}" class="mono t3" font-size="10.5">VOLUME</text>')
c.append(f'<text x="{X0+CW+8}" y="{Y0-14}" class="mono t3" font-size="10.5">UNE SEULE FOIS</text>')
c.append(f'<text x="{X0+2*CW+8}" y="{Y0-14}" class="mono t3" font-size="10.5">TOUS LES MOIS</text>')
rangs = [("moins de 100 lignes", "À la main", "Formules", 0),
         ("100 à 5 000", "Formules ou Ctrl+E", "Power Query", 1),
         ("5 000 à 100 000", "IA, puis on vérifie", "Power Query", 1),
         ("plus de 100 000", "IA", "Power Query + automatisation", 2)]
y = Y0
for vol, ponct, recur, poids in rangs:
    for j, (txt, phare) in enumerate([(vol, False), (ponct, False), (recur, True)]):
        fond = "vfill" if phare else "carte"
        c.append(f'<rect x="{X0+j*CW}" y="{y}" width="{CW}" height="{CH}" rx="4" class="{fond}"/>')
        c.append(f'<rect x="{X0+j*CW}" y="{y}" width="{CW}" height="{CH}" rx="4" class="bord2"/>')
        coul = "var(--v)" if phare else ("var(--t2)" if j == 0 else "var(--t)")
        poidsf = "600" if phare else "400"
        c.append(f'<text x="{X0+j*CW+14}" y="{y+27}" class="h" font-size="12.5" fill="{coul}" font-weight="{poidsf}">{txt}</text>')
    y += CH + 6

c.append(f'<rect x="32" y="{y+10}" width="648" height="76" rx="6" class="vfill"/>')
c.append(f'<text x="52" y="{y+36}" class="h" font-size="13.5" fill="var(--v)">'
         'Ce n’est pas le volume qui décide. C’est la récurrence.</text>')
c.append(f'<text x="52" y="{y+58}" class="p" font-size="12.5">'
         'Cinq cents lignes une seule fois : une formule suffit.</text>')
c.append(f'<text x="52" y="{y+76}" class="p" font-size="12.5">'
         'Cinq cents lignes chaque mois : une requête, et on n’en reparle plus jamais.</text>')
(OUT/"06-decision-outil.svg").write_text(svg(704, y+110, "".join(c)))
print("6 schémas")

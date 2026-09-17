import sys, pathlib
sys.path.insert(0, "/tmp")
from svg_base import svg
from html import escape as e
OUT = pathlib.Path("public/lecons/m03"); OUT.mkdir(parents=True, exist_ok=True)

# ══ 1 · L'espace insécable ═══════════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Pourquoi SUPPRESPACE ne nettoie pas cette cellule</text>')
c.append('<rect x="24" y="50" width="656" height="58" rx="6" class="carte"/>')
c.append('<rect x="24" y="50" width="656" height="58" rx="6" class="bord"/>')
for x, t, cls in [(44,"G",'t'),(58,"É",'t'),(72,"R",'t'),(86,"A",'t'),(100,"R",'t'),(114,"D",'t')]:
    c.append(f'<text x="{x}" y="82" class="mono {cls}" font-size="15">{t}</text>')
c.append('<rect x="128" y="62" width="20" height="26" rx="3" class="rfill"/>')
c.append('<rect x="128" y="62" width="20" height="26" rx="3" class="vstroke" stroke-width="1.6" stroke="var(--r)"/>')
c.append('<text x="138" y="82" text-anchor="middle" class="mono rtext" font-size="13">·</text>')
for i, t in enumerate("YAMEOGO"):
    c.append(f'<text x="{158+i*14}" y="82" class="mono t" font-size="15">{t}</text>')
c.append('<text x="290" y="82" class="p" font-size="12.5">← ce caractère n’est pas un espace</text>')
c.append('<text x="290" y="100" class="mono t3" font-size="11">U+00A0 · insécable · code 160</text>')

lignes = [
  ('=SUPPRESPACE(A1)',                          "ne l’enlève pas : il ne connaît que le code 32", "r"),
  ('=SUBSTITUE(A1;CAR(160);" ")',               "dépend de la plateforme — sur Mac, CAR(160) rend « † »", "r"),
  ('=CHERCHE(UNICAR(160);A1)',                  "trop laxiste : CHERCHE assimile l’insécable à un espace", "r"),
  ('=TROUVE(UNICAR(160);A1)',                   "exact, partout", "v"),
  ('=SUPPRESPACE(SUBSTITUE(A1;UNICAR(160);" "))', "la formule qui répare — à garder", "v"),
]
y = 136
for code, quoi, k in lignes:
    coul = "var(--r)" if k == "r" else "var(--v)"
    c.append(f'<text x="40" y="{y}" class="mono" font-size="11.5" fill="{coul}">{e(code)}</text>')
    c.append(f'<text x="392" y="{y}" class="p" font-size="11.5">{quoi}</text>')
    c.append(f'<line x1="24" y1="{y+9}" x2="680" y2="{y+9}" class="bord2"/>')
    y += 28

c.append(f'<rect x="24" y="{y+10}" width="656" height="76" rx="6" class="vfill"/>')
c.append(f'<text x="44" y="{y+36}" class="h" font-size="13.5" fill="var(--v)">Le détecteur fiable</text>')
c.append(f'<text x="44" y="{y+58}" class="mono t" font-size="11">'
         '=NBCAR(plage) &lt;&gt; NBCAR(SUBSTITUE(plage;UNICAR(160);""))</text>')
c.append(f'<text x="44" y="{y+76}" class="p" font-size="11.5">'
         'Identique sur Windows, sur Mac et dans le navigateur. Vérifié sur les deux moteurs.</text>')
(OUT/"01-espace-insecable.svg").write_text(svg(704, y+104, "".join(c)))

# ══ 2 · L'ordre des opérations ═══════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">L’ordre n’est pas une préférence : il change le résultat</text>')
etapes = [("1", "Supprimer les caractères invisibles", "insécables, retours à la ligne, tabulations"),
          ("2", "Normaliser la casse et les espaces", "MAJUSCULE / MINUSCULE / SUPPRESPACE"),
          ("3", "Typer les dates et les nombres", "le texte qui ressemble à un nombre n’en est pas un"),
          ("4", "Dédoublonner", "sur une clé déjà normalisée"),
          ("5", "Rapprocher", "les clés se correspondent enfin")]
y = 52
for n, titre, quoi in etapes:
    c.append(f'<rect x="24" y="{y}" width="656" height="52" rx="6" class="carte"/>')
    c.append(f'<rect x="24" y="{y}" width="656" height="52" rx="6" class="bord"/>')
    c.append(f'<circle cx="52" cy="{y+26}" r="14" class="vfill"/>')
    c.append(f'<circle cx="52" cy="{y+26}" r="14" class="vstroke" stroke-width="1.5"/>')
    c.append(f'<text x="52" y="{y+31}" text-anchor="middle" class="mono vtext" font-size="12" font-weight="600">{n}</text>')
    c.append(f'<text x="82" y="{y+23}" class="h" font-size="13.5">{titre}</text>')
    c.append(f'<text x="82" y="{y+41}" class="p" font-size="12">{quoi}</text>')
    if n != "5":
        c.append(f'<path d="M 52 {y+52} L 52 {y+60}" class="bord" stroke-width="1.4"/>')
    y += 60

c.append(f'<rect x="24" y="{y+4}" width="656" height="100" rx="6" class="rfill"/>')
c.append(f'<text x="44" y="{y+30}" class="h" font-size="13.5" fill="var(--r)">'
         'Ce qui se passe si on intervertit 2 et 4</text>')
c.append(f'<text x="44" y="{y+54}" class="p" font-size="12.5">'
         '« KALALA Nadège » et « kalala nadege » sont deux clients différents.</text>')
c.append(f'<text x="44" y="{y+74}" class="p" font-size="12.5">'
         'Excel trouve <tspan font-weight="600">150 doublons</tspan> au lieu de '
         '<tspan font-weight="600">340</tspan>. Et il ne le signale pas.</text>')
c.append(f'<text x="44" y="{y+94}" class="mono t3" font-size="11">'
         'Le fichier a l’air propre. Il est faux.</text>')
(OUT/"02-ordre-nettoyage.svg").write_text(svg(704, y+128, "".join(c)))

# ══ 3 · Formule contre requête ═══════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">La différence entre faire le travail et le décrire</text>')
c.append('<rect x="24" y="50" width="316" height="188" rx="6" class="carte"/>')
c.append('<rect x="24" y="50" width="316" height="188" rx="6" class="bord"/>')
c.append('<text x="44" y="78" class="h" font-size="14">Une formule</text>')
c.append('<text x="44" y="100" class="p" font-size="12.5">recalcule.</text>')
c.append('<text x="44" y="132" class="p" font-size="12">Elle vit dans une cellule.</text>')
c.append('<text x="44" y="152" class="p" font-size="12">Elle voit une plage.</text>')
c.append('<text x="44" y="172" class="p" font-size="12">Elle refait le même calcul</text>')
c.append('<text x="44" y="190" class="p" font-size="12">sur les mêmes données.</text>')
c.append('<text x="44" y="220" class="mono t3" font-size="11">le mois prochain : à refaire</text>')

c.append('<rect x="364" y="50" width="316" height="188" rx="6" class="vfill"/>')
c.append('<rect x="364" y="50" width="316" height="188" rx="6" class="vstroke" stroke-width="2"/>')
c.append('<text x="384" y="78" class="h" font-size="14">Une requête</text>')
c.append('<text x="384" y="100" class="p" font-size="12.5">rejoue.</text>')
c.append('<text x="384" y="132" class="p" font-size="12">Elle décrit une suite</text>')
c.append('<text x="384" y="152" class="p" font-size="12">d’opérations.</text>')
c.append('<text x="384" y="172" class="p" font-size="12">Elle s’applique à n’importe</text>')
c.append('<text x="384" y="190" class="p" font-size="12">quelles données du même format.</text>')
c.append('<text x="384" y="220" class="mono vtext" font-size="11">le mois prochain : un clic</text>')

c.append('<rect x="24" y="256" width="656" height="70" rx="6" class="carte"/>')
c.append('<rect x="24" y="256" width="656" height="70" rx="6" class="bord"/>')
c.append('<text x="44" y="282" class="h" font-size="13.5">Aïcha, premier lundi du mois</text>')
c.append('<text x="44" y="306" class="p" font-size="12.5">'
         'Douze fichiers, ouvrir, copier, coller, empiler, nettoyer, recalculer :</text>')
c.append('<text x="560" y="306" text-anchor="end" class="mono rtext" font-size="13">3 h</text>')
c.append('<text x="580" y="306" class="p" font-size="12.5">→</text>')
c.append('<text x="660" y="306" text-anchor="end" class="mono vtext" font-size="15" font-weight="600">1 clic</text>')
(OUT/"03-formule-vs-requete.svg").write_text(svg(704, 348, "".join(c)))
print("3 schémas")

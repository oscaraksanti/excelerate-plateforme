import sys, pathlib
sys.path.insert(0, "/tmp")
from svg_base import svg

OUT = pathlib.Path("public/lecons/m01")

# ══ 4 · C.L.E.A.R. ═══════════════════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Les cinq blocs d\'un prompt qui marche du premier coup</text>')
blocs = [
 ("C", "Contexte", "Qui vous êtes, quel métier, quel enjeu.",
  "« Contrôleur de gestion, distributeur, 6 agences, 3 devises. »", False),
 ("L", "Logique", "Ce que vous voulez obtenir, en français.",
  "« Le taux du mois de la vente, puis le montant en USD. »", False),
 ("E", "Environnement", "Votre version, vos séparateurs, vos tableaux.",
  "« Excel 2024 français, séparateur ; décimale , — tableau t_Caisse. »", True),
 ("A", "Action", "La forme exacte de la réponse attendue.",
  "« La formule en français ET en anglais, plus deux lignes d'explication. »", False),
 ("R", "Revue", "De quoi vérifier sans faire confiance.",
  "« Trois cas de test avec le résultat attendu, dont un cas limite. »", False),
]
y = 50
for lettre, titre, quoi, exemple, phare in blocs:
    h = 66
    fond = "vfill" if phare else "carte"
    c.append(f'<rect x="24" y="{y}" width="672" height="{h}" rx="6" class="{fond}"/>')
    c.append(f'<rect x="24" y="{y}" width="672" height="{h}" rx="6" '
             f'class="{"vstroke" if phare else "bord"}" stroke-width="{2 if phare else 1}"/>')
    c.append(f'<text x="46" y="{y+40}" class="mono" font-size="26" font-weight="600" '
             f'fill="{"var(--v)" if phare else "var(--t3)"}">{lettre}</text>')
    c.append(f'<text x="86" y="{y+26}" class="h" font-size="14">{titre}</text>')
    c.append(f'<text x="86" y="{y+44}" class="p" font-size="12">{quoi}</text>')
    c.append(f'<text x="86" y="{y+60}" class="mono t3" font-size="11">{exemple}</text>')
    y += h + 8
c.append(f'<text x="24" y="{y+18}" class="p" font-size="12.5">'
         'Le bloc E est celui que personne n\'écrit. Il cause 70 % des formules inutilisables.</text>')
(OUT/"04-clear.svg").write_text(svg(720, y + 34, "".join(c)))

# ══ 5 · Le contrôle en trois points ══════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">On ne fait jamais confiance à une lecture d\'image</text>')
etapes = [
 ("1", "Le total recalculé tombe-t-il\nsur le total imprimé ?", "attrape l'erreur de chiffre"),
 ("2", "Le nombre de lignes\ncorrespond-il ?", "attrape la ligne sautée"),
 ("3", "Un montant est-il\naberrant ?", "attrape la virgule décalée"),
]
x = 24
for num, question, quoi in etapes:
    c.append(f'<rect x="{x}" y="52" width="216" height="128" rx="6" class="carte"/>')
    c.append(f'<rect x="{x}" y="52" width="216" height="128" rx="6" class="bord"/>')
    c.append(f'<circle cx="{x+30}" cy="82" r="15" class="vfill"/>')
    c.append(f'<circle cx="{x+30}" cy="82" r="15" class="vstroke" stroke-width="1.5"/>')
    c.append(f'<text x="{x+30}" y="87" text-anchor="middle" class="mono vtext" '
             f'font-size="13" font-weight="600">{num}</text>')
    for i, l in enumerate(question.split("\n")):
        c.append(f'<text x="{x+18}" y="{124+i*19}" class="h" font-size="13.5">{l}</text>')
    c.append(f'<text x="{x+18}" y="{168}" class="p" font-size="11.5">{quoi}</text>')
    x += 232

c.append('<rect x="24" y="200" width="672" height="96" rx="6" class="rfill"/>')
c.append('<text x="46" y="228" class="h" font-size="14" fill="var(--r)">'
         'Ce qui se passe si on saute l\'étape</text>')
c.append('<text x="46" y="252" class="p" font-size="12.5">'
         'L\'IA lit un 8 comme un 3. La facture tombe à 4 949 000 au lieu de 5 659 000.</text>')
c.append('<text x="46" y="272" class="p" font-size="12.5">'
         'Rien ne clignote. Aucune erreur. Juste 710 000 CDF qui n\'existent pas.</text>')
c.append('<text x="46" y="290" class="mono t3" font-size="11">'
         'Le contrôle, lui, affiche un écart. Il vous le dit avant votre comptable.</text>')
(OUT/"05-controle-trois-points.svg").write_text(svg(720, 316, "".join(c)))

# ══ 6 · L'Échelle ════════════════════════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Les huit niveaux — vous êtes au bout du premier soir</text>')
niveaux = [
 (1, "Je le fais à la main", "acquis"),
 (2, "Je le fais avec une formule", "acquis"),
 (3, "Je rends la formule dynamique", "ici"),
 (4, "J'automatise dans Excel", ""),
 (5, "J'industrialise", ""),
 (6, "Je fais raisonner l'IA avec moi", "ici"),
 (7, "Le flux complet tourne seul", ""),
 (8, "Je contrôle, je valide, j'assume", ""),
]
y = 48
for n, titre, etat in niveaux:
    plein = etat in ("acquis", "ici")
    c.append(f'<rect x="24" y="{y}" width="672" height="34" rx="4" '
             f'class="{"vfill" if plein else "carte"}"/>')
    c.append(f'<rect x="24" y="{y}" width="672" height="34" rx="4" '
             f'class="{"vstroke" if etat=="ici" else "bord"}" stroke-width="{2 if etat=="ici" else 1}"/>')
    c.append(f'<text x="44" y="{y+22}" class="mono" font-size="12" '
             f'fill="{"var(--v)" if plein else "var(--t3)"}">{n}</text>')
    c.append(f'<text x="72" y="{y+22}" class="h" font-size="13" '
             f'{"" if plein else "fill=\"var(--t2)\""}>{titre}</text>')
    if etat == "ici":
        c.append(f'<text x="676" y="{y+22}" text-anchor="end" class="mono vtext" '
                 f'font-size="10.5" letter-spacing=".1em">CE SOIR</text>')
    y += 38
c.append(f'<text x="24" y="{y+16}" class="p" font-size="12.5">'
         'Le niveau 8 n\'est pas au-dessus de l\'IA : il en est la condition.</text>')
(OUT/"06-echelle.svg").write_text(svg(720, y + 32, "".join(c)))
print("6 schémas au total")

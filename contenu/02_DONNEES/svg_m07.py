import sys, pathlib
sys.path.insert(0, "/tmp")
from svg_base import svg, grille
from html import escape as e
OUT = pathlib.Path("public/lecons/m07"); OUT.mkdir(parents=True, exist_ok=True)

def carte(x, y, w, h, cls="carte", r=6, bord=True):
    o = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="{cls}"/>'
    if bord:
        o += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="bord"/>'
    return o

def txt(x, y, s, cls="p", taille=12.5, poids=None, ancre=None):
    a = f' text-anchor="{ancre}"' if ancre else ""
    p = f' font-weight="{poids}"' if poids else ""
    return f'<text x="{x}" y="{y}" class="{cls}" font-size="{taille}"{p}{a}>{e(s)}</text>'

# ══ 1 · Une requête est une recette ══════════════════════════════════
c = ['<text x="24" y="30" class="eti">Une requête n’est pas un résultat : c’est une recette</text>']
ETAPES = ["Source — le dossier", "Fichiers filtrés", "Mois depuis le nom du fichier",
          "Format normalisé", "Colonnes choisies par leur nom", "Types posés explicitement",
          "Taux joints sur (Mois ; Devise)", "Montant USD calculé"]
c.append(carte(24, 52, 300, 290))
c.append(txt(44, 78, "Étapes appliquées", "h", 13.5))
for i, s in enumerate(ETAPES):
    y = 104 + i * 29
    c.append(f'<circle cx="{52}" cy="{y-4}" r="4" fill="var(--vb)"/>')
    c.append(txt(66, y, s, "mono t" if i else "mono vtext", 11))
c.append(txt(44, 336, "Chacune se renomme. En français.", "mono t3", 10.5))

c.append(carte(348, 52, 332, 138, "vfill"))
c.append(txt(368, 78, "Ce qu'on gagne à les renommer", "h", 13.5))
c.append(txt(368, 104, "« Type modifié2 » ne dit rien à personne,", "p", 12))
c.append(txt(368, 124, "et surtout pas à vous dans six mois.", "p", 12))
c.append(txt(368, 154, "La requête devient sa propre", "p", 12))
c.append(txt(368, 174, "documentation. C'est gratuit.", "p", 12))

c.append(carte(348, 204, 332, 138, "carte"))
c.append(txt(368, 230, "Le mois prochain", "h", 13.5))
c.append(txt(368, 256, "On dépose le fichier dans le dossier.", "p", 12))
c.append(txt(368, 276, "On clique sur Actualiser.", "p", 12))
c.append(txt(368, 306, "Les huit étapes se rejouent", "mono vtext", 11.5))
c.append(txt(368, 324, "dans l'ordre, à l'identique.", "mono vtext", 11.5))
(OUT / "01-les-etapes.svg").write_text(svg(704, 362, "".join(c)))

# ══ 2 · Charger vers ═════════════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Quatre destinations, et trois erreurs de débutant</text>']
DEST = [("Tableau dans une feuille", "jusqu'à ~500 000 lignes, et encore",
         "on voit les données, le fichier grossit", "t"),
        ("Tableau croisé dynamique", "quand on ne veut que la synthèse",
         "les lignes de détail ne sont jamais écrites", "t"),
        ("Connexion seule", "la requête existe, rien n'est chargé",
         "le cas le plus fréquent", "vtext"),
        ("Connexion seule + modèle de données", "des millions de lignes, compressées",
         "💎 c'est ça qui ouvre le module 8", "vtext")]
for i, (t, q, n, cls) in enumerate(DEST):
    y = 54 + i * 82
    c.append(carte(24, y, 656, 70, "vfill" if cls == "vtext" else "carte"))
    c.append(txt(44, y + 26, t, "h", 13.5))
    c.append(txt(44, y + 48, q, "p", 12))
    c.append(txt(392, y + 48, n, "mono t3", 10.5))
c.append(carte(24, 386, 656, 74, "rfill"))
c.append(txt(44, 412, "L'erreur qui coûte le plus cher", "h", 13.5))
c.append(txt(44, 436, "Charger chaque requête intermédiaire dans une feuille. "
                      "Le fichier passe de 2 à 60 Mo,", "p", 12.5))
c.append(txt(44, 454, "l'actualisation de deux secondes à deux minutes.", "p", 12.5))
(OUT / "02-charger-vers.svg").write_text(svg(704, 478, "".join(c)))

# ══ 3 · Dépivoter les AUTRES colonnes ════════════════════════════════
c = ['<text x="24" y="30" class="eti">Un mot de différence, des années de tranquillité</text>']
c.append(txt(24, 58, "Le tableau croisé reçu", "h", 13.5))
c.append(grille(24, 74, 5, 2, 130, 27,
    entetes=["Agence", "Huiles", "Riz", "Farine", "Boissons"],
    cellules=[(0,1,"Kinshasa","t"),(1,1,"133 920","t3"),(2,1,"199 205","t3"),
              (3,1,"101 608","t3"),(4,1,"71 475","t3"),
              (0,2,"Abidjan","t"),(1,2,"79 622","t3"),(2,2,"84 901","t3"),
              (3,2,"70 310","t3"),(4,2,"50 163","t3")]))

c.append(carte(24, 188, 330, 150, "rfill"))
c.append(txt(44, 214, "Dépivoter les colonnes", "h", 13.5))
c.append(txt(44, 240, "On sélectionne Huiles, Riz, Farine,", "p", 12))
c.append(txt(44, 260, "Boissons. Les quatre noms sont", "p", 12))
c.append(txt(44, 280, "écrits dans le code de l'étape.", "p", 12))
c.append(txt(44, 312, "Une septième famille arrive →", "mono rtext", 11))
c.append(txt(44, 330, "elle est ignorée. Sans erreur.", "mono rtext", 11))

c.append(carte(374, 188, 306, 150, "vfill"))
c.append(txt(394, 214, "Dépivoter les AUTRES colonnes", "h", 13.5))
c.append(txt(394, 240, "On sélectionne Agence, et on dit :", "p", 12))
c.append(txt(394, 260, "« tout le reste est une famille ».", "p", 12))
c.append(txt(394, 292, "Une septième famille arrive →", "mono vtext", 11))
c.append(txt(394, 310, "elle est reprise toute seule.", "mono vtext", 11))
c.append(txt(394, 330, "Table.UnpivotOtherColumns", "mono t3", 10.5))

c.append(carte(24, 356, 656, 62, "carte"))
c.append(txt(44, 382, "La règle générale du module", "h", 13.5))
c.append(txt(44, 404, "Entre deux étapes qui font la même chose, choisir celle qui "
                      "nomme le MOINS de colonnes.", "p", 12.5))
(OUT / "03-depivoter.svg").write_text(svg(704, 436, "".join(c)))

# ══ 4 · Les six jointures ════════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Fusionner : six façons, et une seule répond à votre question</text>']
J = [("Externe gauche", "tout A, et ce qui concorde dans B", "le défaut, et le bon 9 fois sur 10", "g"),
     ("Externe droite", "tout B, et ce qui concorde dans A", "rare — on inverse les tables plutôt", "d"),
     ("Externe complète", "tout A et tout B", "pour voir les deux côtés des manques", "c"),
     ("Interne", "seulement ce qui concorde", "attention : elle fait disparaître des lignes", "i"),
     ("Anti gauche", "ce qui est dans A et PAS dans B", "💎 la réconciliation du module 4", "ag"),
     ("Anti droite", "ce qui est dans B et PAS dans A", "les orphelins de l'autre côté", "ad")]
for i, (nom, quoi, note, k) in enumerate(J):
    y = 54 + i * 66
    fond = "vfill" if k in ("g", "ag") else "carte"
    c.append(carte(24, y, 656, 56, fond))
    #  Deux disques, et la partie retenue en plein
    cx1, cx2, cy, r = 62, 88, y + 28, 17
    pleinA = k in ("g", "c", "ag")
    pleinB = k in ("d", "c", "ad")
    if pleinA:
        c.append(f'<circle cx="{cx1}" cy="{cy}" r="{r}" fill="var(--vb)"/>')
    if pleinB:
        c.append(f'<circle cx="{cx2}" cy="{cy}" r="{r}" fill="var(--vb)"/>')
    if k == "i":
        #  L'intersection seule : on découpe le disque B par le disque A.
        c.append(f'<defs><clipPath id="ci{i}"><circle cx="{cx1}" cy="{cy}" r="{r}"/>'
                 f'</clipPath></defs>')
        c.append(f'<circle cx="{cx2}" cy="{cy}" r="{r}" fill="var(--vb)" '
                 f'clip-path="url(#ci{i})"/>')
    if k in ("ag", "ad"):
        #  L'anti : le disque plein, moins son intersection avec l'autre.
        c.append(f'<defs><clipPath id="ca{i}"><circle cx="{cx1 if k=="ag" else cx2}" '
                 f'cy="{cy}" r="{r}"/></clipPath></defs>')
        c.append(f'<circle cx="{cx2 if k=="ag" else cx1}" cy="{cy}" r="{r}" '
                 f'fill="var(--f)" clip-path="url(#ca{i})"/>')
    for cx in (cx1, cx2):
        c.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" '
                 f'stroke="var(--t3)" stroke-width="1.2"/>')
    c.append(txt(126, y + 24, nom, "h", 13))
    c.append(txt(126, y + 44, quoi, "p", 11.5))
    c.append(txt(392, y + 34, note, "mono t3", 10.5))
(OUT / "04-jointures.svg").write_text(svg(704, 466, "".join(c)))

print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))

# ══ 5 · Par position ou par nom ══════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Le mois où quelqu’un déplace une colonne</text>']
c.append(txt(24, 58, "Janvier — la requête est écrite", "h", 13.5))
c.append(grille(24, 74, 5, 1, 130, 27,
    entetes=["Agence", "Devise", "Famille", "Quantite", "Montant_Local"],
    cellules=[(0,1,"Kinshasa","t"),(1,1,"CDF","t3"),(2,1,"Riz","t3"),
              (3,1,"3 741","t3"),(4,1,"199 205","vtext")],
    surligne=(4,0,1,2)))
c.append(txt(24, 158, "Octobre — le fichier arrive dans un autre ordre", "h", 13.5))
c.append(grille(24, 174, 7, 1, 93, 27,
    entetes=["Respons.", "Famille", "Agence", "Montant", "Remise", "Devise", "Qté"],
    cellules=[(0,1,"Nadège K.","t3"),(1,1,"Riz","t3"),(2,1,"Kinshasa","t"),
              (3,1,"205 181","vtext"),(4,1,"3 %","t3"),(5,1,"CDF","t3"),(6,1,"3 852","t3")],
    surligne=(4,0,1,2)))

c.append(carte(24, 258, 330, 132, "rfill"))
c.append(txt(44, 284, "Par position", "h", 13.5))
c.append(txt(44, 310, "Column5, la cinquième colonne.", "mono rtext", 11.5))
c.append(txt(44, 336, "En janvier c'était le montant.", "p", 12))
c.append(txt(44, 356, "En octobre c'est la remise.", "p", 12))
c.append(txt(44, 380, "Le total est divisé par trente.", "mono rtext", 11))

c.append(carte(374, 258, 306, 132, "vfill"))
c.append(txt(394, 284, "Par nom", "h", 13.5))
c.append(txt(394, 310, "Table.SelectColumns(…,", "mono vtext", 11.5))
c.append(txt(394, 328, '  {"Montant_Local", …})', "mono vtext", 11.5))
c.append(txt(394, 356, "L'ordre n'a plus d'importance.", "p", 12))
c.append(txt(394, 380, "La requête survit.", "mono vtext", 11))

c.append(carte(24, 406, 656, 72, "carte"))
c.append(txt(44, 432, "Et si la colonne est renommée, pas déplacée ?", "h", 13.5))
c.append(txt(44, 456, "Alors la requête s'arrête, avec une erreur claire. "
                      "C'est très préférable à un total faux.", "p", 12.5))
(OUT / "05-position-ou-nom.svg").write_text(svg(704, 496, "".join(c)))

# ══ 6 · La requête de contrôle ═══════════════════════════════════════
c = ['<text x="24" y="30" class="eti">L’actualisation qui se raconte elle-même</text>']
LIG = [("Ventes_2025-10.xlsx", "36", "PASS", "v"),
       ("Ventes_2025-11.xlsx", "36", "PASS", "v"),
       ("Ventes_2025-12.xlsx", "36", "WARNING", "o"),
       ("Ventes_2026-09.csv",  "36", "PASS", "v"),
       ("Ventes_2026-10_NOUVEAU.xlsx", "36", "PASS", "v"),
       ("Ventes_2026-11.xlsx", "0", "FAIL", "r")]
c.append(carte(24, 52, 656, 40, "vfill", r=6))
for x, t in ((44, "Fichier"), (330, "Lignes"), (430, "Sans quantité"), (580, "Statut")):
    c.append(txt(x, 77, t, "eti", 10.5))
for i, (f, n, s, k) in enumerate(LIG):
    y = 92 + i * 34
    c.append(f'<line x1="24" y1="{y+34}" x2="680" y2="{y+34}" class="bord2"/>')
    c.append(txt(44, y + 22, f, "mono t", 11.5))
    c.append(txt(330, y + 22, n, "mono t3", 11.5))
    c.append(txt(430, y + 22, "36" if s == "WARNING" else "0", "mono t3", 11.5))
    coul = {"v": "vtext", "o": "t", "r": "rtext"}[k]
    c.append(txt(580, y + 22, s, "mono " + coul, 11.5, "600"))
c.append(carte(24, 308, 656, 100, "carte"))
c.append(txt(44, 334, "Ce qu'elle remplace", "h", 13.5))
c.append(txt(44, 358, "« Est-ce que l'actualisation s'est bien passée ? » — "
                      "la question qu'on se pose", "p", 12.5))
c.append(txt(44, 378, "chaque mois, et à laquelle on répondait en regardant le total.",
             "p", 12.5))
c.append(txt(44, 400, "R_ECART_SOURCE = total du résultat − total des fichiers → 0",
             "mono vtext", 11.5))
(OUT / "06-requete-controle.svg").write_text(svg(704, 426, "".join(c)))

# ══ 7 · M ou DAX ═════════════════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Deux langages, deux moments — l’erreur n° 6 de l’IA</text>']
c.append(carte(24, 54, 330, 200, "vfill"))
c.append(txt(44, 80, "Le langage M", "h", 15))
c.append(txt(44, 104, "AVANT le chargement", "eti", 10.5))
for i, t in enumerate(["il transforme la donnée",
                       "il vit dans l'éditeur Power Query",
                       "il s'exécute à l'actualisation",
                       "sensible à la casse",
                       "Table.SelectColumns, each, let … in"]):
    c.append(txt(44, 134 + i * 23, "· " + t, "p", 12))

c.append(carte(374, 54, 306, 200, "carte"))
c.append(txt(394, 80, "Le langage DAX", "h", 15))
c.append(txt(394, 104, "APRÈS le chargement", "eti", 10.5))
for i, t in enumerate(["il calcule sur la donnée",
                       "il vit dans le modèle de données",
                       "il s'exécute à chaque clic",
                       "insensible à la casse",
                       "CALCULATE, SUMX, RELATED"]):
    c.append(txt(394, 134 + i * 23, "· " + t, "p", 12))

c.append(carte(24, 272, 656, 96, "rfill"))
c.append(txt(44, 298, "Ce que l'IA propose, et qui ne peut pas marcher", "h", 13.5))
c.append(txt(44, 322, "= CALCULATE(SUM(Ventes[Montant]) ; Ventes[Agence] = \"Kinshasa\")",
             "mono rtext", 11.5))
c.append(txt(44, 346, "collé dans l'éditeur Power Query. Le code est refusé avant "
                      "même de s'exécuter.", "p", 12.5))
c.append(carte(24, 384, 656, 56, "vfill"))
c.append(txt(44, 418, "V1 — Version. La question à se poser : « dans quel éditeur "
                      "est-ce que je colle ça ? »", "p", 12.5))
(OUT / "07-m-ou-dax.svg").write_text(svg(704, 458, "".join(c)))

# ══ 8 · L'arbre de décision ══════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Power Query n’est pas toujours la réponse</text>']
D = [("Une seule fois, jamais à refaire", "les formules, ou même à la main",
      "monter une requête coûte 45 min", "r"),
     ("Tous les mois, mêmes fichiers", "**Power Query**",
      "45 min une fois, puis un clic", "v"),
     ("Plusieurs tables à relier, millions de lignes", "le modèle de données",
      "module 8 — PQ charge, DAX calcule", "t"),
     ("Mise en page figée, mêmes cellules", "SOMME.SI.ENS",
      "module 2 — PQ ne met pas en forme", "t"),
     ("200 fichiers de formats vraiment différents", "un script",
      "module 10 — PQ n'aime pas l'hétérogène extrême", "t"),
     ("Personne d'autre ne saura la reprendre", "y réfléchir à deux fois",
      "une requête non documentée est une dette", "r")]
for i, (cas, outil, note, k) in enumerate(D):
    y = 54 + i * 68
    fond = {"v": "vfill", "r": "rfill", "t": "carte"}[k]
    c.append(carte(24, y, 656, 58, fond))
    c.append(txt(44, y + 26, cas, "h", 13))
    c.append(txt(44, y + 46, note, "mono t3", 10.5))
    c.append(txt(392, y + 34, outil.replace("**", ""), "mono " +
                 ("vtext" if k == "v" else "t"), 12.5,
                 "600" if k == "v" else None))
c.append(carte(24, 462, 656, 74, "carte"))
c.append(txt(44, 488, "Le vrai calcul, et il n'est pas technique", "h", 13.5))
c.append(txt(44, 512, "3 h par mois, indéfiniment  →  45 min une fois, puis un clic. "
                      "Le point d'équilibre", "p", 12.5))
c.append(txt(44, 530, "est atteint au bout de deux mois.", "p", 12.5))
(OUT / "08-arbre-decision.svg").write_text(svg(704, 554, "".join(c)))

print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))

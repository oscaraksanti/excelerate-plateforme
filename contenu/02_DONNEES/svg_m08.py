import sys, pathlib, math
sys.path.insert(0, "/tmp")
from svg_base import svg, grille
from html import escape as e
OUT = pathlib.Path("public/lecons/m08"); OUT.mkdir(parents=True, exist_ok=True)

def carte(x, y, w, h, cls="carte", r=6, bord=True):
    o = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="{cls}"/>'
    if bord:
        o += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="bord"/>'
    return o

def txt(x, y, s, cls="p", taille=12.5, poids=None, ancre=None):
    a = f' text-anchor="{ancre}"' if ancre else ""
    p = f' font-weight="{poids}"' if poids else ""
    return f'<text x="{x}" y="{y}" class="{cls}" font-size="{taille}"{p}{a}>{e(s)}</text>'

# ══ 1 · Le schéma en étoile ══════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Une table de faits, cinq dimensions, cinq relations</text>']
cx, cy = 352, 218
c.append(carte(cx - 92, cy - 44, 184, 88, "vfill"))
c.append(txt(cx, cy - 20, "f_Ventes", "h", 15, ancre="middle"))
c.append(txt(cx, cy + 2, "1 200 000 lignes", "mono vtext", 11.5, ancre="middle"))
c.append(txt(cx, cy + 24, "clés + mesures, rien d’autre", "mono t3", 10, ancre="middle"))

DIMS = [("d_Calendrier", "1 096 j · Date_Cle", 40, 58, "vfill"),
        ("d_Agence", "6 · Agence_Cle", 480, 58, "carte"),
        ("d_Client", "3 600 · Client_Cle", 40, 330, "carte"),
        ("d_Produit", "980 · Produit_Cle", 480, 330, "carte"),
        ("d_Taux", "36 · Debut_Mois", 480, 194, "carte")]
#  d_Taux ne se relie pas aux faits : il se relie au calendrier.
for nom, quoi, x, y, cls in DIMS:
    c.append(carte(x, y, 184, 62, cls))
    c.append(txt(x + 92, y + 26, nom, "h", 13.5, ancre="middle"))
    c.append(txt(x + 92, y + 46, quoi, "mono t3", 10, ancre="middle"))

LIENS = [(132, 120, cx - 60, cy - 44), (572, 120, cx + 60, cy - 44),
         (132, 330, cx - 60, cy + 44), (572, 330, cx + 60, cy + 44)]
for x1, y1, x2, y2 in LIENS:
    c.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
             f'stroke="var(--vb)" stroke-width="1.6"/>')
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    c.append(f'<circle cx="{x2}" cy="{y2}" r="4" fill="var(--vb)"/>')
    c.append(f'<text x="{mx}" y="{my-6}" class="mono t3" font-size="9.5" '
             f'text-anchor="middle">∗ → 1</text>')
#  Le flocon passe PAR-DESSUS, en contournant la table de faits :
#  une ligne droite traverserait f_Ventes et laisserait croire à une
#  relation qui n'existe pas.
c.append('<path d="M224 76 C 330 36, 430 36, 530 58" stroke="var(--vb)" '
         'stroke-width="1.6" fill="none" stroke-dasharray="5 4"/>')
c.append('<circle cx="530" cy="58" r="4" fill="var(--vb)"/>')
c.append(txt(378, 40, "flocon  ∗ → 1", "mono t3", 9.5, ancre="middle"))

c.append(carte(24, 412, 656, 84, "carte"))
c.append(txt(44, 438, "La règle du sens", "h", 13.5))
c.append(txt(44, 462, "Le filtre descend toujours du côté « 1 » vers le côté "
                      "« plusieurs ». Une dimension filtre", "p", 12.5))
c.append(txt(44, 482, "les faits ; les faits ne filtrent jamais une dimension.",
             "p", 12.5))
(OUT / "01-etoile.svg").write_text(svg(704, 514, "".join(c)))

# ══ 2 · La granularité ═══════════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">« Une ligne, c’est quoi exactement ? » — la question qui décide de tout</text>']
G = [("Une ligne = un mois × une agence", "434", "on ne peut plus descendre au produit", "r"),
     ("Une ligne = une commande", "612 000", "on ne sait plus ce qui a été vendu", "t"),
     ("Une ligne = une ligne de ticket", "1 200 000", "on peut tout agréger vers le haut", "v"),
     ("Une ligne = un mouvement de stock", "4 800 000", "plus fin que ce que la question demande", "t")]
for i, (quoi, n, note, k) in enumerate(G):
    y = 54 + i * 80
    fond = {"v": "vfill", "r": "rfill", "t": "carte"}[k]
    c.append(carte(24, y, 656, 68, fond))
    c.append(txt(44, y + 28, quoi, "h", 13.5))
    c.append(txt(44, y + 52, note, "p", 12))
    cls = {"v": "vtext", "r": "rtext", "t": "t3"}[k]
    c.append(txt(660, y + 40, n, "mono " + cls, 19, "600", ancre="end"))
c.append(carte(24, 378, 656, 88, "vfill"))
c.append(txt(44, 404, "La règle, et elle n’a qu’un sens", "h", 13.5))
c.append(txt(44, 428, "On agrège toujours vers le haut, jamais vers le bas. "
                      "Choisissez la maille la plus fine", "p", 12.5))
c.append(txt(44, 448, "dont vous aurez besoin — et pas une de plus.", "p", 12.5))
(OUT / "02-granularite.svg").write_text(svg(704, 484, "".join(c)))

# ══ 3 · Mesure ou colonne calculée ═══════════════════════════════════
c = ['<text x="24" y="30" class="eti">La distinction la plus mal comprise de la BI</text>']
c.append(carte(24, 54, 330, 232, "carte"))
c.append(txt(44, 82, "Colonne calculée", "h", 15))
c.append(txt(44, 106, "CALCULÉE À L’ACTUALISATION", "eti", 10.5))
for i, t in enumerate(["une valeur par ligne, stockée",
                       "occupe de la mémoire · 1,2 M de valeurs",
                       "se calcule une fois, puis dort",
                       "utilisable en ligne, colonne, filtre",
                       "quand il faut GROUPER par elle"]):
    c.append(txt(44, 136 + i * 24, "· " + t, "p", 12))
c.append(txt(44, 266, "Cle_Taux, Tranche_Age, Segment", "mono t3", 10.5))

c.append(carte(374, 54, 306, 232, "vfill"))
c.append(txt(394, 82, "Mesure", "h", 15))
c.append(txt(394, 106, "CALCULÉE À L’AFFICHAGE", "eti", 10.5))
for i, t in enumerate(["aucune valeur stockée",
                       "n’occupe rien du tout",
                       "se recalcule à chaque clic",
                       "utilisable UNIQUEMENT en valeurs",
                       "quand il faut AGRÉGER"]):
    c.append(txt(394, 136 + i * 24, "· " + t, "p", 12))
c.append(txt(394, 266, "CA USD, Marge %, Clients actifs", "mono vtext", 10.5))

c.append(carte(24, 304, 656, 98, "vfill"))
c.append(txt(44, 330, "La question qui tranche, en une phrase", "h", 13.5))
c.append(txt(44, 356, "« Est-ce que j’ai besoin de METTRE ÇA EN LIGNE dans un "
                      "tableau croisé ? »", "p", 12.5))
c.append(txt(44, 380, "Oui → colonne calculée.   Non → mesure. Et dans le doute, "
                      "c’est une mesure.", "mono vtext", 11.5))
(OUT / "03-mesure-ou-colonne.svg").write_text(svg(704, 420, "".join(c)))

# ══ 4 · Le contexte de filtre ════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Une mesure ne connaît pas sa valeur : elle connaît son contexte</text>']
c.append(txt(24, 58, "Le même [CA USD], quatre fois, dans le même tableau", "h", 13.5))
c.append(grille(24, 76, 3, 4, 214, 30,
    entetes=["Agence", "2025", "2026"],
    cellules=[(0,1,"Kinshasa","t"),(1,1,"7 465 210","t3"),(2,1,"8 131 116","vtext"),
              (0,2,"Abidjan","t"),(1,2,"4 602 887","t3"),(2,2,"5 293 440","t3"),
              (0,3,"Dakar","t"),(1,3,"3 401 118","t3"),(2,3,"3 728 904","t3"),
              (0,4,"Total","t"),(1,4,"27 852 544","t"),(2,4,"30 317 123","t")],
    surligne=(2,0,1,2)))
c.append(txt(24, 246, "Une seule mesure est écrite. Douze valeurs sont calculées.",
             "mono t3", 11))

c.append(carte(24, 268, 330, 128, "vfill"))
c.append(txt(44, 294, "Ce que voit la mesure en haut", "h", 13))
c.append(txt(44, 320, "Agence = Kinshasa", "mono vtext", 11.5))
c.append(txt(44, 340, "Année = 2026", "mono vtext", 11.5))
c.append(txt(44, 372, "Elle somme ce qui reste après", "p", 12))
c.append(txt(44, 390, "ces deux filtres. C’est tout.", "p", 12))

c.append(carte(374, 268, 306, 128, "carte"))
c.append(txt(394, 294, "CALCULATE change le contexte", "h", 13))
c.append(txt(394, 320, "CALCULATE ( [CA USD] ;", "mono t", 11))
c.append(txt(394, 338, "  ALL ( d_Agence ) )", "mono t", 11))
c.append(txt(394, 370, "retire le filtre d’agence :", "p", 12))
c.append(txt(394, 388, "on obtient le total, sur chaque ligne.", "p", 11.5))
(OUT / "04-contexte-filtre.svg").write_text(svg(704, 416, "".join(c)))

print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))

# ══ 5 · La table de calendrier ═══════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Le clic qui débloque la moitié du DAX</text>']
c.append(carte(24, 52, 330, 170, "rfill"))
c.append(txt(44, 78, "Sans le clic", "h", 14))
c.append(txt(44, 104, "Conception > Marquer comme table", "p", 12))
c.append(txt(44, 124, "de dates → pas fait.", "p", 12))
c.append(txt(44, 156, "SAMEPERIODLASTYEAR", "mono rtext", 11.5))
c.append(txt(44, 176, "TOTALYTD · DATEADD · DATESYTD", "mono rtext", 11.5))
c.append(txt(44, 204, "rendent vide. Sans erreur.", "mono rtext", 11.5))

c.append(carte(374, 52, 306, 170, "vfill"))
c.append(txt(394, 78, "Avec le clic", "h", 14))
c.append(txt(394, 104, "Une colonne de dates, continue,", "p", 12))
c.append(txt(394, 124, "unique, sans trou, désignée.", "p", 12))
c.append(txt(394, 156, "Toute la time intelligence", "mono vtext", 11.5))
c.append(txt(394, 176, "fonctionne.", "mono vtext", 11.5))
c.append(txt(394, 204, "Trois secondes de travail.", "mono t3", 11))

c.append(carte(24, 240, 656, 156, "carte"))
c.append(txt(44, 266, "Les quatre conditions d’une table de dates valable", "h", 13.5))
for i, t in enumerate([
        "① Une ligne par jour — pas par mois, pas par semaine.",
        "② Sans aucun trou, du 1er janvier de la première année au 31 décembre de la dernière.",
        "③ Une colonne de type Date, unique, qui sert de clé.",
        "④ Générée par la requête, jamais saisie à la main.",
    ]):
    c.append(txt(44, 294 + i * 24, t, "p", 12.5))
c.append(txt(44, 386, "Et l’année doit être COMPLÈTE, même si les ventes "
                      "s’arrêtent en septembre.", "mono vtext", 11.5))
(OUT / "05-calendrier.svg").write_text(svg(704, 414, "".join(c)))

# ══ 6 · La compression ═══════════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Pourquoi 1,2 million de lignes pèsent moins que 120 000</text>']
BARRES = [("Le fichier CSV en entrée", 39.1, "#C0392B"),
          ("Le même, dans une feuille Excel", 62.0, "#C0392B"),
          ("Le même, dans le modèle de données", 4.0, "#2F6B47")]
for i, (lib, v, coul) in enumerate(BARRES):
    y = 62 + i * 62
    c.append(txt(44, y + 18, lib, "h", 13))
    larg = v / 62.0 * 430
    c.append(f'<rect x="44" y="{y+26}" width="{larg:.0f}" height="20" rx="3" fill="{coul}"/>')
    c.append(txt(44 + larg + 12, y + 42, f"{v:.1f} Mo".replace(".", ","),
                 "mono " + ("vtext" if coul.startswith("#2F") else "rtext"), 12.5, "600"))
c.append(txt(44, 252, "Une feuille ne peut de toute façon pas contenir 1,2 million "
                      "de lignes : la limite est 1 048 576.", "mono t3", 11))

c.append(carte(24, 274, 656, 152, "vfill"))
c.append(txt(44, 300, "Comment il fait", "h", 13.5))
for i, t in enumerate([
        "Il stocke COLONNE par colonne, pas ligne par ligne.",
        "Dans chaque colonne, il ne garde qu’une fois chaque valeur distincte.",
        "Agence_Cle : 1,2 million de cases, six valeurs. Presque rien.",
        "Montant_Local : beaucoup de valeurs distinctes. C’est lui qui pèse.",
    ]):
    c.append(txt(44, 328 + i * 24, "· " + t, "p", 12.5))
c.append(txt(44, 416, "D’où la règle : une colonne à peu de valeurs distinctes "
                      "est presque gratuite.", "mono vtext", 11.5))
(OUT / "06-compression.svg").write_text(svg(704, 444, "".join(c)))

# ══ 7 · Qui fait quoi ════════════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Trois outils, trois moments, et ils s’enchaînent</text>']
ETAPES = [("Power Query", "le langage M", "AVANT le chargement",
           ["nettoyer, recoller,", "typer, joindre"], 24, "vfill"),
          ("Power Pivot", "le langage DAX", "APRÈS le chargement",
           ["relations, mesures,", "time intelligence"], 248, "vfill"),
          ("Excel ou Power BI", "TCD · CUBEVALEUR", "RESTITUTION",
           ["la page que", "quelqu’un lit"], 472, "carte")]
for nom, lang, quand, quoi, x, cls in ETAPES:
    c.append(carte(x, 54, 208, 170, cls))
    c.append(txt(x + 20, 82, nom, "h", 14.5))
    c.append(txt(x + 20, 104, lang, "mono t3", 10.5))
    c.append(txt(x + 20, 136, quand, "eti", 10))
    for k, ligne in enumerate(quoi):
        c.append(txt(x + 20, 166 + k * 19, ligne, "p", 12))
for x in (236, 460):
    c.append(f'<path d="M{x} 139 L {x+11} 139" class="vstroke" stroke-width="1.6"/>')
    c.append(f'<path d="M{x+6} 134 L {x+13} 139 L {x+6} 144 Z" fill="var(--vb)"/>')

c.append(carte(24, 242, 656, 96, "rfill"))
c.append(txt(44, 268, "L’erreur n° 7 de l’IA, et elle est systématique", "h", 13.5))
c.append(txt(44, 292, "Elle propose du DAX que Power BI accepte et que Power Pivot "
                      "refuse : les deux moteurs", "p", 12.5))
c.append(txt(44, 312, "ne suivent pas le même rythme de mise à jour. La formule "
                      "est rejetée à la saisie.", "p", 12.5))
c.append(txt(44, 332, "V1 — la phrase à mettre dans le prompt : « pour Power Pivot "
                      "dans Excel 2024 ».", "mono rtext", 11.5))

c.append(carte(24, 354, 656, 58, "vfill"))
c.append(txt(44, 388, "Et le modèle Excel s’importe tel quel dans Power BI Desktop. "
                      "Le travail n’est jamais perdu.", "p", 12.5))
(OUT / "07-qui-fait-quoi.svg").write_text(svg(704, 430, "".join(c)))

# ══ 8 · CUBEVALEUR ═══════════════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Sortir du carcan du tableau croisé</text>']
c.append(carte(24, 52, 330, 178, "carte"))
c.append(txt(44, 78, "Le tableau croisé", "h", 14))
c.append(grille(44, 94, 2, 3, 130, 26,
    entetes=["Agence", "CA USD"],
    cellules=[(0,1,"Kinshasa","t"),(1,1,"8 131 116","t3"),
              (0,2,"Abidjan","t"),(1,2,"5 293 440","t3"),
              (0,3,"Dakar","t"),(1,3,"3 728 904","t3")]))
c.append(txt(44, 214, "Sa forme dépend de ses données.", "mono t3", 11))

c.append(carte(374, 52, 306, 178, "vfill"))
c.append(txt(394, 78, "La même chose en CUBEVALEUR", "h", 14))
c.append(txt(394, 106, "=CUBEVALEUR(", "mono vtext", 11))
c.append(txt(394, 124, '  "ThisWorkbookDataModel";', "mono vtext", 11))
c.append(txt(394, 142, '  "[Measures].[CA USD]";', "mono vtext", 11))
c.append(txt(394, 160, '  "[d_Agence].[Agence].&[Kinshasa]")', "mono vtext", 11))
c.append(txt(394, 192, "Une cellule. N’importe où.", "p", 12))
c.append(txt(394, 212, "La mise en page est à vous.", "p", 12))

c.append(carte(24, 248, 656, 106, "carte"))
c.append(txt(44, 274, "Comment on les obtient sans les écrire", "h", 13.5))
c.append(txt(44, 300, "Faire le TCD d’abord, puis : Analyse du TCD > Outils OLAP > "
                      "Convertir en formules.", "p", 12.5))
c.append(txt(44, 322, "Excel remplace chaque cellule du tableau par son CUBEVALEUR. "
                      "Il n’y a plus qu’à", "p", 12.5))
c.append(txt(44, 342, "déplacer les cellules où l’on veut.", "p", 12.5))
c.append(carte(24, 370, 656, 56, "vfill"))
c.append(txt(44, 404, "C’est le tableau de bord du module 6, alimenté par un modèle "
                      "d’un million de lignes.", "p", 12.5))
(OUT / "08-cubevaleur.svg").write_text(svg(704, 444, "".join(c)))

print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))

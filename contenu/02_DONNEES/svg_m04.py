import sys, pathlib
sys.path.insert(0, "/tmp")
from svg_base import svg, grille
from html import escape as e
OUT = pathlib.Path("public/lecons/m04"); OUT.mkdir(parents=True, exist_ok=True)

# ══ 1 · Pourquoi INDEX/EQUIV survit ══════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Ce qui se passe quand quelqu’un insère une colonne</text>')
c.append('<text x="24" y="58" class="h" font-size="13.5">Avant</text>')
c.append(grille(24, 72, 4, 2, 128, 26,
    entetes=["A · Réf", "B · Client", "C · Agence", "D · Montant"],
    cellules=[(0,1,"CMD-00220","t"),(1,1,"GROSSISTE MASINA","t"),(2,1,"Dakar","t"),(3,1,"18 400","t"),
              (0,2,"CMD-00221","t"),(1,2,"DEPOT ABOBO","t"),(2,2,"Abidjan","t"),(3,2,"9 750","t")],
    surligne=(3,0,1,3)))
c.append('<text x="24" y="188" class="mono t3" font-size="11">'
         '=RECHERCHEV(ref ; A:D ; 4 ; FAUX)   → la 4ᵉ colonne</text>')

c.append('<text x="24" y="228" class="h" font-size="13.5">Après — on a inséré « Devise » en C</text>')
c.append(grille(24, 242, 5, 2, 104, 26,
    entetes=["A · Réf", "B · Client", "C · Devise", "D · Agence", "E · Montant"],
    cellules=[(0,1,"CMD-00220","t"),(1,1,"GROSSISTE…","t"),(2,1,"XOF","t"),(3,1,"Dakar","t"),(4,1,"18 400","t"),
              (0,2,"CMD-00221","t"),(1,2,"DEPOT ABOBO","t"),(2,2,"XOF","t"),(3,2,"Abidjan","t"),(4,2,"9 750","t")],
    surligne=(3,0,1,3)))
c.append('<rect x="24" y="358" width="330" height="76" rx="6" class="rfill"/>')
c.append('<text x="42" y="382" class="mono rtext" font-size="11.5">=RECHERCHEV(… ; 4 ; FAUX)</text>')
c.append('<text x="42" y="404" class="p" font-size="12">rend maintenant « Dakar »</text>')
c.append('<text x="42" y="424" class="p" font-size="12">au lieu de 18 400. Sans erreur.</text>')
c.append('<rect x="374" y="358" width="306" height="76" rx="6" class="vfill"/>')
c.append('<text x="392" y="382" class="mono vtext" font-size="11.5">=INDEX(colonne ; EQUIV(…))</text>')
c.append('<text x="392" y="404" class="p" font-size="12">désigne la colonne par son nom,</text>')
c.append('<text x="392" y="424" class="p" font-size="12">pas par son rang. Elle suit.</text>')
(OUT/"01-index-equiv.svg").write_text(svg(704, 456, "".join(c)))

# ══ 2 · RECHERCHEX à deux dimensions ═════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Croiser une ligne et une colonne, sans INDEX/EQUIV</text>')
c.append(grille(24, 60, 5, 3, 128, 28,
    entetes=["Produit", "Kinshasa", "Abidjan", "Dakar", "Douala"],
    cellules=[(0,1,"Huile 5 L","t"),(1,1,"34 200","t3"),(2,1,"33 900","t3"),(3,1,"34 500","vtext"),(4,1,"33 700","t3"),
              (0,2,"Riz 25 kg","t"),(1,2,"126 500","t3"),(2,2,"125 800","t3"),(3,2,"127 100","t3"),(4,2,"126 000","t3"),
              (0,3,"Savon lot","t"),(1,3,"18 200","t3"),(2,3,"18 600","t3"),(3,3,"18 400","t3"),(4,3,"18 100","t3")]))
c.append('<rect x="408" y="88" width="128" height="28" class="vstroke" stroke-width="2" rx="2"/>')

c.append('<rect x="24" y="200" width="656" height="52" rx="5" class="carte"/>')
c.append('<rect x="24" y="200" width="656" height="52" rx="5" class="bord"/>')
bouts = [("=RECHERCHEX(", 40, "t3"), ("produit", 146, "t"), (" ; ", 204, "t3"),
         ("colonne_produits", 224, "t"), (" ; ", 348, "t3"),
         ("RECHERCHEX(agence;entêtes;tableau)", 368, "vtext"), (")", 644, "t3")]
for txt, x, cls in bouts:
    taille = "11.5" if cls == "vtext" else "13"
    c.append(f'<text x="{x}" y="232" class="mono {cls}" font-size="{taille}">{e(txt)}</text>')

c.append('<rect x="24" y="272" width="656" height="92" rx="6" class="vfill"/>')
c.append('<text x="44" y="298" class="h" font-size="13.5" fill="var(--v)">'
         'Le troisième argument peut être une recherche</text>')
c.append('<text x="44" y="322" class="p" font-size="12.5">'
         'Le RECHERCHEX intérieur choisit LA COLONNE. L’extérieur choisit la ligne.</text>')
c.append('<text x="44" y="342" class="p" font-size="12.5">'
         'Deux recherches, une formule, aucun numéro de colonne à compter.</text>')
c.append('<text x="44" y="360" class="mono t3" font-size="11">'
         'On insère une colonne : rien ne bouge.</text>')
(OUT/"02-recherchex-2d.svg").write_text(svg(704, 388, "".join(c)))

# ══ 3 · Normaliser AVANT de rapprocher ═══════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">La même commande, écrite de cinq façons par trois logiciels</text>')
exemples = [("CMD-00220",        "la référence, telle qu’elle devrait être", "v"),
            ("cmd-00220",        "le logiciel de livraison écrit en minuscules", "r"),
            ("␣CMD-00220␣",      "des espaces de bord — invisibles à l’écran", "r"),
            ("DKR/CMD-00220",    "le préfixe d’agence, ajouté à l’export", "r"),
            ("CMD-00220␣",       "un espace insécable collé à la fin", "r")]
y = 58
for txt, quoi, k in exemples:
    coul = "var(--v)" if k == "v" else "var(--r)"
    c.append(f'<rect x="24" y="{y-18}" width="200" height="26" rx="3" '
             f'class="{"vfill" if k=="v" else "rfill"}"/>')
    c.append(f'<text x="36" y="{y}" class="mono" font-size="12" fill="{coul}">{e(txt)}</text>')
    c.append(f'<text x="244" y="{y}" class="p" font-size="12.5">{quoi}</text>')
    y += 34

c.append(f'<rect x="24" y="{y+6}" width="316" height="96" rx="6" class="rfill"/>')
c.append(f'<text x="44" y="{y+34}" class="h" font-size="13.5" fill="var(--r)">Rapprochement brut</text>')
c.append(f'<text x="44" y="{y+66}" class="mono rtext" font-size="24" font-weight="600">5 635</text>')
c.append(f'<text x="44" y="{y+88}" class="p" font-size="12">écarts sur 7 880 livraisons</text>')

c.append(f'<rect x="364" y="{y+6}" width="316" height="96" rx="6" class="vfill"/>')
c.append(f'<text x="384" y="{y+34}" class="h" font-size="13.5" fill="var(--v)">Après normalisation</text>')
c.append(f'<text x="384" y="{y+66}" class="mono vtext" font-size="24" font-weight="600">8</text>')
c.append(f'<text x="384" y="{y+88}" class="p" font-size="12">et ce sont les vrais</text>')

c.append(f'<text x="24" y="{y+136}" class="p" font-size="12.5">'
         'Cinq mille six cent trente-cinq écarts sur sept mille huit cent quatre-vingts lignes :</text>')
c.append(f'<text x="24" y="{y+156}" class="h" font-size="13">'
         'ce n’est pas un problème de données. C’est un problème de méthode.</text>')
c.append(f'<text x="24" y="{y+178}" class="mono t3" font-size="11">'
         'C’est V3 — Volumétrie — qui doit vous arrêter avant d’écrire le rapport.</text>')
(OUT/"03-normaliser-avant.svg").write_text(svg(704, y+202, "".join(c)))
print("3 schémas")

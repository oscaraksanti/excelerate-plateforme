import sys, pathlib
sys.path.insert(0, "/tmp")
from svg_base import svg, grille
from html import escape as e
OUT = pathlib.Path("public/lecons/m05"); OUT.mkdir(parents=True, exist_ok=True)

def carte(x, y, w, h, cls="carte", r=6):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="{cls}"/>'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="bord"/>')

def txt(x, y, s, cls="p", taille=12.5, poids=None, ancre=None):
    a = f' text-anchor="{ancre}"' if ancre else ""
    p = f' font-weight="{poids}"' if poids else ""
    return f'<text x="{x}" y="{y}" class="{cls}" font-size="{taille}"{p}{a}>{e(s)}</text>'

# ══ 1 · Les quatre zones ═════════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Quatre zones, et la question qu’elles composent</text>']
c.append(carte(24, 50, 172, 246))
c.append(txt(40, 74, "Champs disponibles", "h", 13))
champs = ["Date_Vente", "Agence", "Devise", "Client", "N_Commande",
          "Reference", "Famille", "Quantite", "Montant_USD"]
for i, f in enumerate(champs):
    y = 100 + i * 21
    cl = "mono vtext" if f in ("Date_Vente", "Agence", "Famille", "Montant_USD") else "mono t3"
    c.append(txt(40, y, ("● " if cl.endswith("vtext") else "○ ") + f, cl, 11.5))

ZONES = [("FILTRES", "Famille", "une seule famille à la fois", 212, 50),
         ("COLONNES", "Agence", "une colonne par agence", 448, 50),
         ("LIGNES", "Date_Vente", "groupée par mois", 212, 174),
         ("VALEURS", "Somme de Montant_USD", "l’agrégation se choisit ici", 448, 174)]
for titre, champ, quoi, x, y in ZONES:
    fond = "vfill" if titre == "VALEURS" else "carte"
    c.append(f'<rect x="{x}" y="{y}" width="232" height="108" rx="6" class="{fond}"/>')
    c.append(f'<rect x="{x}" y="{y}" width="232" height="108" rx="6" class="bord"/>')
    c.append(txt(x + 16, y + 26, titre, "eti", 10.5))
    c.append(txt(x + 16, y + 54, champ, "mono t", 13, "600"))
    c.append(txt(x + 16, y + 78, quoi, "p", 11.5))
    if titre == "VALEURS":
        c.append(txt(x + 16, y + 96, "Nombre de → Somme de", "mono vtext", 10.5))

c.append('<rect x="24" y="312" width="656" height="70" rx="6" class="vfill"/>')
c.append(txt(44, 338, "Ce que ces quatre zones disent, en français :", "p", 12))
c.append(txt(44, 364, "« Le chiffre d’affaires en dollars, par mois, par agence, "
                      "pour la famille Riz. »", "h", 14))
(OUT / "01-quatre-zones.svg").write_text(svg(704, 402, "".join(c)))

# ══ 2 · « Nombre de » au lieu de « Somme de » ════════════════════════
c = ['<text x="24" y="30" class="eti">Une seule cellule en texte, et la somme disparaît</text>']
c.append(txt(24, 58, "La colonne Quantite", "h", 13.5))
c.append(grille(24, 74, 2, 6, 140, 26,
    entetes=["N_Commande", "Quantite"],
    cellules=[(0,1,"CMD-ABJ-041","t3"),(1,1,"18","t"),
              (0,2,"CMD-ABJ-042","t3"),(1,2,"7","t"),
              (0,3,"CMD-DKR-118","t3"),(1,3,"24","rtext"),
              (0,4,"CMD-DLA-220","t3"),(1,4,"12","t"),
              (0,5,"CMD-ABJ-044","t3"),(1,5,"31","t"),
              (0,6,"CMD-DKR-119","t3"),(1,6,"9","t")],
    surligne=(1,3,1,1)))
c.append(txt(24, 288, "La troisième est alignée à gauche : c’est du texte.", "p", 12))
c.append(txt(24, 308, "Rien ne la distingue autrement. Aucune alerte.", "mono t3", 11))

c.append(carte(360, 74, 320, 100, "rfill"))
c.append(txt(380, 100, "Ce que le TCD affiche", "eti", 10.5))
c.append(txt(380, 128, "Nombre de Quantite", "mono rtext", 13, "600"))
c.append(txt(380, 154, "29 046", "mono rtext", 20, "600"))
c.append(carte(360, 190, 320, 100, "vfill"))
c.append(txt(380, 216, "Ce qu’on attendait", "eti", 10.5))
c.append(txt(380, 244, "Somme de Quantite", "mono vtext", 13, "600"))
c.append(txt(380, 270, "519 888", "mono vtext", 20, "600"))

c.append('<rect x="24" y="330" width="656" height="78" rx="6" class="vfill"/>')
c.append(txt(44, 356, "La cause, toujours la même", "h", 13.5))
c.append(txt(44, 380, "Une seule valeur en texte dans la colonne, et Excel bascule "
                      "l’agrégation en Nombre.", "p", 12.5))
c.append(txt(44, 400, "Contrôle : =NBVAL(colonne)-NB(colonne). Il doit valoir 0.",
             "mono t3", 11))
(OUT / "02-nombre-de.svg").write_text(svg(704, 428, "".join(c)))

# ══ 3 · % de différence par rapport au précédent ═════════════════════
c = ['<text x="24" y="30" class="eti">L’évolution mois par mois, sans écrire une seule formule</text>']
c.append(txt(24, 58, "Le même champ, glissé deux fois dans Valeurs", "h", 13.5))
c.append(grille(24, 74, 3, 6, 176, 27,
    entetes=["Mois", "Somme de Montant_USD", "% différence / précédent"],
    cellules=[(0,1,"oct. 2025","t"),(1,1,"1 052 875","t3"),(2,1,"","t3"),
              (0,2,"nov. 2025","t"),(1,2,"1 066 080","t3"),(2,2,"+1,3 %","vtext"),
              (0,3,"déc. 2025","t"),(1,3,"1 232 377","t"),(2,3,"+15,6 %","vtext"),
              (0,4,"janv. 2026","t"),(1,4,"936 498","t3"),(2,4,"−24,0 %","rtext"),
              (0,5,"août 2026","t"),(1,5,"1 200 120","t3"),(2,5,"+8,1 %","vtext"),
              (0,6,"sept. 2026","t"),(1,6,"1 091 445","t3"),(2,6,"−9,1 %","rtext")],
    surligne=(2,0,1,7)))
c.append(carte(24, 288, 656, 118, "vfill"))
c.append(txt(44, 314, "Le chemin exact, et personne n’y descend", "h", 13.5))
etapes = ["Clic droit sur la deuxième colonne de valeurs",
          "Afficher les valeurs  →  % de différence par rapport à",
          "Champ de base : Mois      ·      Élément de base : (précédent)"]
for i, s in enumerate(etapes):
    c.append(txt(44, 342 + i * 22, f"{i+1}.  {s}", "mono t", 11.5))
c.append('<rect x="24" y="424" width="656" height="46" rx="6" class="carte"/>')
c.append('<rect x="24" y="424" width="656" height="46" rx="6" class="bord"/>')
c.append(txt(44, 452, "L’équivalent en formule tient en une ligne — mais il faut une "
                      "colonne, une plage, et un décalage.", "p", 12.5))
(OUT / "03-pourcent-precedent.svg").write_text(svg(704, 490, "".join(c)))

# ══ 4 · Plage ou tableau ═════════════════════════════════════════════
c = ['<text x="24" y="30" class="eti">La cause n° 1 des tableaux croisés faux en entreprise</text>']
c.append(carte(24, 52, 320, 198, "rfill"))
c.append(txt(44, 78, "Source : une plage", "h", 13.5, poids=None))
c.append(txt(44, 104, "Ventes!$A$1:$K$29047", "mono rtext", 12))
c.append(txt(44, 136, "Le mois suivant, 2 400 lignes", "p", 12))
c.append(txt(44, 156, "arrivent en ligne 29 048.", "p", 12))
c.append(txt(44, 188, "Actualiser", "mono t", 12, "600"))
c.append(txt(44, 210, "Le total ne bouge pas.", "rtext", 13, "600"))
c.append(txt(44, 232, "Aucune erreur. Aucune alerte.", "mono t3", 11))

c.append(carte(360, 52, 320, 198, "vfill"))
c.append(txt(380, 78, "Source : un tableau", "h", 13.5))
c.append(txt(380, 104, "t_Ventes", "mono vtext", 12))
c.append(txt(380, 136, "Les mêmes 2 400 lignes", "p", 12))
c.append(txt(380, 156, "sont collées sous la dernière.", "p", 12))
c.append(txt(380, 188, "Actualiser", "mono t", 12, "600"))
c.append(txt(380, 210, "Le total suit.", "vtext", 13, "600"))
c.append(txt(380, 232, "Le tableau s’est étendu tout seul.", "mono t3", 11))

c.append('<rect x="24" y="268" width="656" height="94" rx="6" class="carte"/>')
c.append('<rect x="24" y="268" width="656" height="94" rx="6" class="bord"/>')
c.append(txt(44, 294, "Comment on s’en aperçoit — et c’est tout le sujet du TP",
             "h", 13.5))
c.append(txt(44, 320, "On compare le chiffre du TCD à un SOMME.SI.ENS sur les mêmes "
                      "critères.", "p", 12.5))
c.append(txt(44, 344, "R_ECART_TCD  =  chiffre lu dans le TCD  −  chiffre de la formule  "
                      "→  doit valoir 0", "mono vtext", 11.5))
(OUT / "04-plage-ou-tableau.svg").write_text(svg(704, 384, "".join(c)))

# ══ 5 · Un segment, plusieurs TCD ════════════════════════════════════
c = ['<text x="24" y="30" class="eti">Ce qui transforme trois tableaux en un tableau de bord</text>']
c.append(carte(24, 58, 188, 210, "vfill"))
c.append(txt(44, 84, "SEGMENT", "eti", 10.5))
c.append(txt(44, 108, "Agence", "h", 14))
for i, a in enumerate(["Abidjan", "Dakar", "Douala"]):
    y = 128 + i * 38
    actif = i == 0
    c.append(f'<rect x="44" y="{y}" width="148" height="28" rx="4" '
             f'class="{"vstroke" if actif else "bord2"}" stroke-width="{2 if actif else 1}" '
             f'fill="var(--c)"/>')
    c.append(txt(58, y + 19, a, "mono " + ("vtext" if actif else "t3"), 12))

CIBLES = [("TCD 1 — CA par mois", 58), ("TCD 2 — CA par famille", 130),
          ("TCD 3 — Clients servis", 202)]
for lib, y in CIBLES:
    c.append(f'<path d="M212 163 C 272 163, 272 {y+28}, 332 {y+28}" '
             f'class="vstroke" stroke-width="1.5" fill="none"/>')
    c.append(carte(332, y, 348, 56))
    c.append(txt(352, y + 24, lib, "h", 13))
    c.append(txt(352, y + 44, "filtré sur Abidjan, sans y toucher", "mono t3", 11))

c.append('<rect x="24" y="288" width="656" height="78" rx="6" class="vfill"/>')
c.append(txt(44, 314, "Le geste qui manque à presque tout le monde", "h", 13.5))
c.append(txt(44, 338, "Clic droit sur le segment  →  Connexions de rapport  →  "
                      "cocher les trois TCD.", "mono t", 11.5))
c.append(txt(44, 358, "Un clic pilote désormais toute la page.", "p", 12.5))
(OUT / "05-segments.svg").write_text(svg(704, 388, "".join(c)))

# ══ 6 · SOMME, SOUS.TOTAL, AGREGAT ═══════════════════════════════════
c = ['<text x="24" y="30" class="eti">420 lignes, 5 masquées à la main, 3 marges en #DIV/0!</text>']
LIGNES6 = [
    ("=SOMME(plage)",            "199 773,06", "non", "non", "t3"),
    ("=SOUS.TOTAL(9;plage)",     "199 773,06", "oui", "non", "t3"),
    ("=SOUS.TOTAL(109;plage)",   "198 319,07", "oui", "oui", "vtext"),
    ("=AGREGAT(9;5;plage)",      "198 319,07", "oui", "oui", "vtext"),
]
c.append(txt(24, 58, "Sur la colonne des montants — qui suit quoi", "h", 13.5))
y0 = 76
c.append(f'<rect x="24" y="{y0}" width="656" height="30" rx="4" class="vfill"/>')
for x, t in ((40, "Formule"), (300, "Résultat"), (452, "le filtre"),
             (568, "le masquage")):
    c.append(txt(x, y0 + 20, t, "eti", 10.5))
for i, (f, v, filt, masq, cl) in enumerate(LIGNES6):
    y = y0 + 30 + i * 32
    c.append(f'<line x1="24" y1="{y+32}" x2="680" y2="{y+32}" class="bord2"/>')
    c.append(txt(40, y + 21, f, "mono " + cl, 12))
    c.append(txt(300, y + 21, v, "mono " + cl, 12))
    c.append(txt(452, y + 21, "oui" if filt == "oui" else "non",
                 "mono " + ("vtext" if filt == "oui" else "rtext"), 12))
    c.append(txt(568, y + 21, "oui" if masq == "oui" else "non",
                 "mono " + ("vtext" if masq == "oui" else "rtext"), 12))

c.append(txt(24, 252, "Sur la colonne des marges, qui contient trois erreurs", "h", 13.5))
LIGNES7 = [("=SOMME(marges)", "#DIV/0!", "rtext"),
           ("=MOYENNE(marges)", "#DIV/0!", "rtext"),
           ("=AGREGAT(1;6;marges)", "34,87 %", "vtext"),
           ("=AGREGAT(1;7;marges)", "34,91 %", "vtext")]
for i, (f, v, cl) in enumerate(LIGNES7):
    y = 272 + i * 30
    c.append(f'<line x1="24" y1="{y+30}" x2="680" y2="{y+30}" class="bord2"/>')
    c.append(txt(40, y + 20, f, "mono " + cl, 12))
    c.append(txt(300, y + 20, v, "mono " + cl, 12))
c.append(txt(452, 352, "6 = ignorer les erreurs", "mono t3", 11))
c.append(txt(452, 382, "7 = les erreurs ET le masquage", "mono t3", 11))

c.append('<rect x="24" y="404" width="656" height="52" rx="6" class="vfill"/>')
c.append(txt(44, 434, "Aucune fonction classique ne survit à une erreur dans la plage. "
                      "AGREGAT, si.", "p", 12.5))
(OUT / "06-soustotal-agregat.svg").write_text(svg(704, 478, "".join(c)))

print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))

# ══ 7 · La fausse baisse de Douala ═══════════════════════════════════
c = ['<text x="24" y="30" class="eti">Une baisse de 12 % qui n’a jamais eu lieu</text>']
c.append('<line x1="24" y1="96" x2="680" y2="96" class="bord"/>')
c.append(f'<line x1="352" y1="76" x2="352" y2="116" stroke="var(--r)" stroke-width="2"/>')
c.append(txt(352, 68, "1er mars 2026", "mono rtext", 11, ancre="middle"))
c.append(txt(24, 132, "Avant", "eti", 10.5))
c.append(txt(24, 156, "Savons", "mono t", 12.5))
c.append(txt(24, 178, "Conserves", "mono t", 12.5))
c.append(txt(376, 132, "Après — même produits, même clients", "eti", 10.5))
c.append(txt(376, 156, "Hygiène & entretien", "mono vtext", 12.5))
c.append(txt(376, 178, "Épicerie sèche", "mono vtext", 12.5))
c.append(txt(24, 206, "Douala a changé de plan comptable. Rien d’autre n’a bougé : "
                      "ni les ventes, ni les prix.", "p", 12.5))

c.append(carte(24, 232, 320, 128, "rfill"))
c.append(txt(44, 258, "Ce que le TCD affiche", "eti", 10.5))
c.append(txt(44, 284, "si on filtre sur les six familles", "p", 12))
c.append(txt(44, 304, "du catalogue historique", "p", 12))
c.append(txt(44, 340, "− 12,2 %", "mono rtext", 24, "600"))

c.append(carte(360, 232, 320, 128, "vfill"))
c.append(txt(380, 258, "Ce qui s’est réellement passé", "eti", 10.5))
c.append(txt(380, 284, "en regroupant les huit libellés", "p", 12))
c.append(txt(380, 304, "dans leurs six familles", "p", 12))
c.append(txt(380, 340, "+ 2,9 %", "mono vtext", 24, "600"))

c.append('<rect x="24" y="378" width="656" height="82" rx="6" class="carte"/>')
c.append('<rect x="24" y="378" width="656" height="82" rx="6" class="bord"/>')
c.append(txt(44, 404, "Aucun contrôle technique ne pouvait l’attraper", "h", 13.5))
c.append(txt(44, 428, "La formule était juste. L’ordre de grandeur, plausible. "
                      "La version d’Excel, sans importance.", "p", 12.5))
c.append(txt(44, 448, "V4 — Vérité métier : « qui, dans l’entreprise, "
                      "confirmerait ce chiffre ? »", "mono vtext", 11.5))
(OUT / "07-fausse-baisse.svg").write_text(svg(704, 482, "".join(c)))

# ══ 8 · Ce qu’on envoie vraiment à l’IA ══════════════════════════════
c = ['<text x="24" y="30" class="eti">29 046 lignes — et les quatre blocs qu’on envoie à la place</text>']
c.append(carte(24, 54, 200, 248, "rfill"))
c.append(txt(44, 80, "La tentation", "eti", 10.5))
c.append(txt(44, 122, "29 046", "mono rtext", 26, "600"))
c.append(txt(44, 146, "lignes collées", "p", 12))
c.append(txt(44, 164, "d’un seul bloc", "p", 12))
c.append(txt(44, 202, "Le modèle en lit", "mono t3", 10.5))
c.append(txt(44, 217, "une partie, et comble", "mono t3", 10.5))
c.append(txt(44, 232, "le reste tout seul.", "mono t3", 10.5))
c.append(txt(44, 268, "Rien ne signale", "mono rtext", 10.5))
c.append(txt(44, 283, "la troncature.", "mono rtext", 10.5))

BLOCS = [("① Les en-têtes et leur sens", "11 colonnes, une ligne de description chacune"),
         ("② Trente lignes, prises au hasard", "pas les trente premières : elles sont triées"),
         ("③ Les valeurs distinctes de chaque dimension",
          "3 agences · 8 libellés de famille · 12 mois"),
         ("④ Les totaux de contrôle", "CA total, nombre de lignes, nombre de commandes")]
for i, (t, d) in enumerate(BLOCS):
    y = 54 + i * 62
    c.append(carte(244, y, 436, 54, "vfill" if i else "vfill"))
    c.append(txt(264, y + 24, t, "h", 13))
    c.append(txt(264, y + 42, d, "mono t3", 10.5))

c.append('<rect x="24" y="318" width="656" height="94" rx="6" class="carte"/>')
c.append('<rect x="24" y="318" width="656" height="94" rx="6" class="bord"/>')
c.append(txt(44, 344, "La règle qui vaut pour tout le module", "h", 13.5))
c.append(txt(44, 370, "On ne demande pas la réponse. On demande "
                      "LE TABLEAU CROISÉ QUI LA PRODUIT.", "p", 12.5))
c.append(txt(44, 394, "La réponse n’est pas vérifiable. Le tableau, si — "
                      "et il reste dans le fichier.", "mono vtext", 11.5))
(OUT / "08-echantillon.svg").write_text(svg(704, 434, "".join(c)))
print("07 et 08 écrits")

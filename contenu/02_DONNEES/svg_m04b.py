import sys, pathlib
sys.path.insert(0, "/tmp")
from svg_base import svg
from html import escape as e
OUT = pathlib.Path("public/lecons/m04")

# ══ 4 · Les quatre familles d'écarts ═════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Un rapprochement ne rend pas un chiffre. Il rend quatre listes.</text>')
fam = [("Chez A, pas chez B", "Livrée, jamais facturée", "8 commandes · 84 320 USD",
        "de l’argent qu’on n’a pas réclamé", True),
       ("Chez B, pas chez A", "Facturée sans commande", "5 factures",
        "une saisie manuelle, ou pire", False),
       ("Des deux côtés, montants différents", "Écart de montant", "143 commandes",
        "avoirs, rabais, erreurs de saisie", False),
       ("Deux fois du même côté", "Facture en double", "14 factures",
        "le logiciel a hoqueté un matin", False)]
y = 54
for titre, statut, chiffre, quoi, phare in fam:
    h = 76
    c.append(f'<rect x="24" y="{y}" width="656" height="{h}" rx="6" '
             f'class="{"vfill" if phare else "carte"}"/>')
    c.append(f'<rect x="24" y="{y}" width="656" height="{h}" rx="6" '
             f'class="{"vstroke" if phare else "bord"}" stroke-width="{2 if phare else 1}"/>')
    c.append(f'<text x="44" y="{y+26}" class="mono t3" font-size="10.5" letter-spacing=".08em">{titre.upper()}</text>')
    c.append(f'<text x="44" y="{y+48}" class="h" font-size="14">{statut}</text>')
    c.append(f'<text x="44" y="{y+66}" class="p" font-size="12">{quoi}</text>')
    c.append(f'<text x="660" y="{y+48}" text-anchor="end" class="mono" font-size="13" '
             f'fill="{"var(--v)" if phare else "var(--t2)"}" font-weight="600">{chiffre}</text>')
    y += h + 8

c.append(f'<rect x="24" y="{y+6}" width="656" height="76" rx="6" class="carte"/>')
c.append(f'<rect x="24" y="{y+6}" width="656" height="76" rx="6" class="bord"/>')
c.append(f'<text x="44" y="{y+32}" class="h" font-size="13.5">L’ordre des statuts compte</text>')
c.append(f'<text x="44" y="{y+56}" class="mono t3" font-size="11">'
         'Non livrée &gt; Livrée non facturée &gt; Facture en double &gt; Écart de montant &gt; Rapprochée</text>')
c.append(f'<text x="44" y="{y+74}" class="p" font-size="12">'
         'Une commande peut relever de deux familles. Sans priorité écrite, deux personnes comptent deux totaux.</text>')
(OUT/"04-quatre-familles.svg").write_text(svg(704, y+106, "".join(c)))

# ══ 5 · La clé composite et son piège ════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Quand la clé n’est pas dans une seule colonne</text>')
c.append('<rect x="24" y="50" width="656" height="46" rx="5" class="carte"/>')
c.append('<rect x="24" y="50" width="656" height="46" rx="5" class="bord"/>')
c.append('<text x="44" y="79" class="mono t" font-size="13">'
         '=[@Produit] &amp; "|" &amp; [@Canal] &amp; "|" &amp; TEXTE([@Mois];"aaaa-mm")</text>')
c.append('<rect x="148" y="58" width="30" height="30" rx="3" class="vstroke" stroke-width="2"/>')

c.append('<text x="24" y="134" class="h" font-size="13.5">Le piège du séparateur</text>')
paires = [("ABC-1", "2",  "ABC-1-2", "r"),
          ("ABC",   "1-2","ABC-1-2", "r"),
          ("ABC-1", "2",  "ABC-1|2", "v"),
          ("ABC",   "1-2","ABC|1-2", "v")]
y = 160
c.append(f'<text x="44" y="{y}" class="mono t3" font-size="10.5">PARTIE 1</text>')
c.append(f'<text x="188" y="{y}" class="mono t3" font-size="10.5">PARTIE 2</text>')
c.append(f'<text x="340" y="{y}" class="mono t3" font-size="10.5">CLÉ OBTENUE</text>')
y += 22
for a, b, cle, k in paires:
    coul = "var(--r)" if k == "r" else "var(--v)"
    c.append(f'<text x="44" y="{y}" class="mono t" font-size="12">{a}</text>')
    c.append(f'<text x="188" y="{y}" class="mono t" font-size="12">{b}</text>')
    c.append(f'<text x="340" y="{y}" class="mono" font-size="12" fill="{coul}">{cle}</text>')
    c.append(f'<line x1="24" y1="{y+9}" x2="680" y2="{y+9}" class="bord2"/>')
    y += 28
c.append(f'<text x="480" y="{y-84}" class="p" font-size="12" fill="var(--r)">deux clés identiques</text>')
c.append(f'<text x="480" y="{y-66}" class="p" font-size="12" fill="var(--r)">pour deux lignes différentes</text>')
c.append(f'<text x="480" y="{y-28}" class="p" font-size="12" fill="var(--v)">chacune la sienne</text>')

c.append(f'<rect x="24" y="{y+10}" width="656" height="94" rx="6" class="vfill"/>')
c.append(f'<text x="44" y="{y+36}" class="h" font-size="13.5" fill="var(--v)">'
         'Le séparateur doit être impossible dans les données</text>')
c.append(f'<text x="44" y="{y+60}" class="p" font-size="12.5">'
         '« | », « ¤ », « ~ » : des caractères qu’aucune référence ne contient.</text>')
c.append(f'<text x="44" y="{y+80}" class="p" font-size="12.5">'
         'Jamais « - », jamais « / », jamais l’espace : ils existent déjà dans vos données.</text>')
(OUT/"05-cle-composite.svg").write_text(svg(704, y+128, "".join(c)))

# ══ 6 · La méthode de réconciliation ═════════════════════════════════
c = []
c.append('<text x="24" y="30" class="eti">Cinq étapes, dans cet ordre, toujours</text>')
etapes = [("1", "Compter", "Combien de lignes de chaque côté ? On l’écrit avant de commencer."),
          ("2", "Normaliser", "Casse, espaces, préfixes. Sur les DEUX côtés, avec la même règle."),
          ("3", "Rapprocher", "Une ligne par élément du référentiel. Jamais l’inverse."),
          ("4", "Classer", "Chaque ligne reçoit un statut, et un seul. Priorité écrite."),
          ("5", "Contrôler", "Somme des statuts = total. Sinon quelque chose s’est perdu.")]
y = 56
for n, titre, quoi in etapes:
    c.append(f'<rect x="24" y="{y}" width="656" height="56" rx="6" class="carte"/>')
    c.append(f'<rect x="24" y="{y}" width="656" height="56" rx="6" class="bord"/>')
    c.append(f'<circle cx="54" cy="{y+28}" r="15" class="vfill"/>')
    c.append(f'<circle cx="54" cy="{y+28}" r="15" class="vstroke" stroke-width="1.5"/>')
    c.append(f'<text x="54" y="{y+33}" text-anchor="middle" class="mono vtext" font-size="12" font-weight="600">{n}</text>')
    c.append(f'<text x="86" y="{y+25}" class="h" font-size="13.5">{titre}</text>')
    c.append(f'<text x="86" y="{y+44}" class="p" font-size="12">{quoi}</text>')
    if n != "5": c.append(f'<path d="M 54 {y+56} L 54 {y+64}" class="bord" stroke-width="1.4"/>')
    y += 64

c.append(f'<rect x="24" y="{y+6}" width="656" height="78" rx="6" class="rfill"/>')
c.append(f'<text x="44" y="{y+32}" class="h" font-size="13.5" fill="var(--r)">'
         'L’étape qu’on saute, et qui coûte le plus cher</text>')
c.append(f'<text x="44" y="{y+56}" class="p" font-size="12.5">'
         'La 1. Sans le comptage de départ, on ne peut pas savoir si on a perdu des lignes</text>')
c.append(f'<text x="44" y="{y+76}" class="p" font-size="12.5">'
         'en chemin — et c’est l’erreur la plus fréquente d’un rapprochement.</text>')
(OUT/"06-methode-reconciliation.svg").write_text(svg(704, y+108, "".join(c)))
print("6 schémas")

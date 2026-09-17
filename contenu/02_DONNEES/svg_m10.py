import sys, pathlib, json
sys.path.insert(0, "/tmp")
from svg_base import svg, grille
from html import escape as e
OUT = pathlib.Path("public/lecons/m10"); OUT.mkdir(parents=True, exist_ok=True)
R = json.load(open("contenu/02_DONNEES/sortie-m10/REFERENCES_M10.json"))

STYLE10 = ("<style>"
  ".ok{fill:#15803d}.ko{fill:#c0392b}.bl{fill:#1d4ed8}"
  "@media (prefers-color-scheme: dark){"
  ".ok{fill:#5fd68f}.ko{fill:#f87171}.bl{fill:#8ab4ff}}"
  "</style>")

def carte(x, y, w, h, cls="carte", r=6, bord=True):
    o = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="{cls}"/>'
    if bord:
        o += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="bord"/>'
    return o

def txt(x, y, s, cls="p", taille=12.5, poids=None, ancre=None):
    a = f' text-anchor="{ancre}"' if ancre else ""
    p = f' font-weight="{poids}"' if poids else ""
    return f'<text x="{x}" y="{y}" class="{cls}" font-size="{taille}"{p}{a}>{e(s)}</text>'

# ══ 1 · Références relatives ou absolues à l'enregistrement ══════════
c = [STYLE10, '<text x="24" y="30" class="eti">Le bouton que personne ne remarque, et qui décide de tout</text>']
for k, (titre, etat, quoi, d1, d2, cls) in enumerate([
    ("Références absolues", "réglage par défaut",
     "La macro rejoue les MÊMES cellules,", "quel que soit l’endroit où",
     "vous êtes au moment de la lancer.", "carte"),
    ("Références relatives", "à activer avant d’enregistrer",
     "La macro rejoue les mêmes DÉPLACEMENTS,", "à partir de la cellule",
     "sélectionnée au lancement.", "vfill")]):
    x = 24 + k * 336
    c.append(carte(x, 52, 320, 214, cls))
    c.append(txt(x + 20, 80, titre, "h", 14.5))
    c.append(txt(x + 20, 102, etat, "mono t3", 10.5))
    c.append(txt(x + 20, 134, quoi, "p", 12.5))
    c.append(txt(x + 20, 156, d1, "p", 12.5))
    c.append(txt(x + 20, 178, d2, "p", 12.5))
    ex = ("Range(\"B4\").Select" if k == 0 else "ActiveCell.Offset(0, 1).Select")
    c.append(f'<rect x="{x+20}" y="200" width="280" height="26" rx="3" class="fond"/>')
    c.append(f'<text x="{x+32}" y="218" class="mono" font-size="10.5" '
             f'fill="var(--t2)">{e(ex)}</text>')
    c.append(txt(x + 20, 250, "B4. Toujours B4." if k == 0
                 else "Une colonne à droite. D’où qu’on parte.", "mono t3", 11))
c.append(carte(24, 286, 656, 96, "carte"))
c.append(txt(44, 312, "Le test qui tranche, avant d’appuyer sur Enregistrer", "h", 13.5))
c.append(txt(44, 338, "« Est-ce que je referai ce geste ailleurs, sur d’autres "
                      "lignes ? »  Oui → relatives.", "p", 12.5))
c.append(txt(44, 360, "« Est-ce que ça touche toujours les mêmes cellules ? »  "
                      "Oui → absolues.", "p", 12.5))
c.append(carte(24, 396, 656, 58, "rfill"))
c.append(txt(44, 422, "Le réglage se choisit AVANT d’enregistrer. Après, il est "
                      "trop tard :", "p", 12.5))
c.append(txt(44, 442, "il faut réenregistrer la macro en entier.", "p", 12.5))
(OUT / "01-enregistreur.svg").write_text(svg(704, 474, "".join(c)))

# ══ 2 · PERSONAL.XLSB ════════════════════════════════════════════════
c = [STYLE10, '<text x="24" y="30" class="eti">Le classeur invisible qu’Excel ouvre à chaque démarrage</text>']
c.append(carte(232, 56, 240, 96, "vfill"))
c.append(txt(352, 88, "PERSONAL.XLSB", "h", 15, ancre="middle"))
c.append(txt(352, 110, "vos dix macros utiles", "p", 12, ancre="middle"))
c.append(txt(352, 132, "jamais visible, toujours ouvert", "mono t3", 10, ancre="middle"))
CLASSEURS = [("Budget_2027.xlsx", 24), ("Caisse_sept.xlsx", 190),
             ("Clients.xlsx", 356), ("BP_Bamako.xlsx", 522)]
for nom, x in CLASSEURS:
    c.append(carte(x, 236, 158, 62, "carte"))
    c.append(txt(x + 79, 262, nom, "h", 12, ancre="middle"))
    c.append(txt(x + 79, 282, "vos macros y sont", "mono t3", 9.5, ancre="middle"))
    c.append(f'<path d="M 352 152 C 352 190, {x+79} 190, {x+79} 236" '
             f'stroke="var(--vb)" stroke-width="1.6" fill="none"/>')
    c.append(f'<circle cx="{x+79}" cy="236" r="3.5" fill="var(--vb)"/>')
c.append(carte(24, 322, 656, 108, "carte"))
c.append(txt(44, 348, "Comment il naît, en quatre gestes", "h", 13.5))
for k, t in enumerate([
    "1.  Développeur > Enregistrer une macro",
    "2.  « Enregistrer dans » : Classeur de macros personnelles",
    "3.  Faire n’importe quoi, arrêter l’enregistrement",
    "4.  Fermer Excel, répondre OUI à « enregistrer PERSONAL.XLSB »"]):
    c.append(txt(44, 374 + k * 20, t, "mono t2", 11.5))
c.append(carte(24, 444, 656, 58, "vfill"))
c.append(txt(44, 470, "Il existe depuis Excel 97. Presque personne ne le sait, "
                      "et c’est la chose la plus", "p", 12.5))
c.append(txt(44, 490, "rentable de ce module — dix minutes, une fois, pour "
                      "toutes vos années à venir.", "p", 12.5))
(OUT / "02-personal.svg").write_text(svg(704, 522, "".join(c)))

# ══ 3 · La boucle qui supprime — le sens compte ══════════════════════
c = [STYLE10, '<text x="24" y="30" class="eti">La même boucle, dans les deux sens</text>']
LIGNES = ["Kinshasa", "", "", "Dakar", "", "Douala", "", ""]
CW, CH = 132, 26
for bloc, (titre, sens, cls, survivants) in enumerate([
    ("❌  For i = 1 To 8", "on descend", "rfill", {3, 8}),
    ("✅  For i = 8 To 1 Step -1", "on remonte", "vfill", set())]):
    x = 24 + bloc * 336
    c.append(carte(x, 52, 320, 366, cls))
    c.append(txt(x + 20, 80, titre, "h", 14))
    c.append(txt(x + 20, 102, sens, "mono t3", 10.5))
    for k, v in enumerate(LIGNES):
        y = 120 + k * CH
        vide = (v == "")
        mort = vide and k + 1 not in survivants
        c.append(f'<rect x="{x+20}" y="{y}" width="{CW+90}" height="{CH-3}" '
                 f'rx="3" class="fond"/>')
        c.append(f'<text x="{x+30}" y="{y+17}" class="mono t3" font-size="10">'
                 f'{k+1}</text>')
        c.append(f'<text x="{x+56}" y="{y+17}" class="mono" font-size="10.5" '
                 f'fill="var(--t2)">{e(v) if v else "(vide)"}</text>')
        if vide:
            c.append(f'<text x="{x+190}" y="{y+17}" class="mono '
                     f'{"ko" if not mort else "ok"}" font-size="10">'
                     f'{"survit" if not mort else "supprimée"}</text>')
    y = 120 + 8 * CH + 12
    c.append(txt(x + 20, y + 14,
                 "Deux lignes vides sur cinq survivent." if bloc == 0
                 else "Les cinq lignes vides partent.",
                 "mono " + ("ko" if bloc == 0 else "ok"), 11))
    c.append(txt(x + 20, y + 36,
                 "Supprimer la 2 fait remonter la 3," if bloc == 0
                 else "Supprimer la 8 ne déplace rien",
                 "p", 12))
    c.append(txt(x + 20, y + 56,
                 "que la boucle a déjà dépassée." if bloc == 0
                 else "de ce qui est au-dessus.", "p", 12))
c.append(carte(24, 436, 656, 76, "carte"))
c.append(txt(44, 462, "Step -1 est toute la correction", "h", 13.5))
c.append(txt(44, 488, "C’est l’erreur que l’IA écrit presque à chaque fois — "
                      "et elle ne se voit jamais sur un", "p", 12.5))
c.append(txt(44, 508, "jeu de test de trois lignes.", "p", 12.5))
(OUT / "03-boucle.svg").write_text(svg(704, 532, "".join(c)))

# ══ 4 · Quand ne PAS faire de VBA ════════════════════════════════════
c = [STYLE10, '<text x="24" y="30" class="eti">L’ordre des outils — on descend, on ne remonte jamais</text>']
NIVEAUX = [
 ("Une formule", "SOMME.SI.ENS, RECHERCHEX, LET",
  "se relit, se corrige", "vfill"),
 ("Power Query", "importer, nettoyer, dépivoter",
  "s’actualise d’un clic", "vfill"),
 ("Le modèle de données", "relations, mesures DAX",
  "quand une feuille ne suffit plus", "carte"),
 ("VBA", "exporter, nommer, déclencher",
  "seulement ici — et commenté", "carte"),
 ("Claude Code", "deux cents fichiers, une commande",
  "quand le travail sort d’Excel", "carte"),
]
for k, (nom, quoi, note, cls) in enumerate(NIVEAUX):
    y = 52 + k * 82
    c.append(carte(24, y, 656, 70, cls))
    c.append(f'<text x="44" y="{y+22}" class="mono t3" font-size="10.5">'
             f'{k+1}</text>')
    c.append(txt(72, y + 26, nom, "h", 14))
    c.append(txt(72, y + 48, quoi, "p", 12))
    c.append(txt(656, y + 48, note, "mono t3", 10.5, ancre="end"))
    if k < 4:
        c.append(f'<path d="M 352 {y+70} L 352 {y+82}" stroke="var(--b)" '
                 f'stroke-width="2"/>')
c.append(carte(24, 468, 656, 82, "rfill"))
c.append(txt(44, 494, "La règle, et elle ne se négocie pas", "h", 13.5))
c.append(txt(44, 520, "Si le niveau du dessus sait le faire, il gagne. Une macro "
                      "qui refait ce que Power Query", "p", 12.5))
c.append(txt(44, 540, "fait déjà est une dette, pas une automatisation.", "p", 12.5))
(OUT / "04-quand-pas-vba.svg").write_text(svg(704, 570, "".join(c)))

# ══ 5 · Livrer un .xlsm ══════════════════════════════════════════════
c = [STYLE10, '<text x="24" y="30" class="eti">Pourquoi votre fichier n’arrive jamais</text>']
ETAPES = [
 ("Vous envoyez\nRapports.xlsm", "carte", None),
 ("La messagerie\nsupprime la pièce", "rfill", "bloqué"),
 ("Ou elle passe,\net Excel désactive", "rfill", "Mark of the Web"),
 ("Le destinataire\nvoit un fichier mort", "rfill", None),
]
for k, (t, cls, note) in enumerate(ETAPES):
    x = 24 + k * 168
    c.append(carte(x, 56, 152, 96, cls))
    for j, ligne in enumerate(t.split("\n")):
        c.append(txt(x + 76, 88 + j * 20, ligne, "h", 12.5, ancre="middle"))
    if note:
        c.append(txt(x + 76, 138, note, "mono ko", 9.5, ancre="middle"))
    if k < 3:
        c.append(f'<path d="M {x+152} 104 L {x+166} 104" stroke="var(--b)" '
                 f'stroke-width="2"/>')
c.append(carte(24, 174, 656, 118, "vfill"))
c.append(txt(44, 200, "Ce qu’on fait à la place", "h", 14))
for k, t in enumerate([
    "1.  On met le .xlsm dans un .zip, avec un LISEZ-MOI.txt",
    "2.  Le LISEZ-MOI dit : enregistrer le fichier sur le disque AVANT de l’ouvrir",
    "3.  Puis : clic droit > Propriétés > cocher « Débloquer »  (Windows)",
    "4.  Et seulement ensuite : ouvrir, et accepter l’activation des macros"]):
    c.append(txt(44, 226 + k * 20, t, "mono t2", 11.5))
c.append(carte(24, 308, 656, 92, "carte"))
c.append(txt(44, 334, "Le Mark of the Web, en une phrase", "h", 13.5))
c.append(txt(44, 360, "Tout fichier venu d’Internet porte une marque invisible. "
                      "Excel la lit et désactive", "p", 12.5))
c.append(txt(44, 380, "les macros — sans le dire clairement. Ouvrir depuis la "
                      "pièce jointe ne la retire pas.", "p", 12.5))
c.append(carte(24, 414, 656, 58, "vfill"))
c.append(txt(44, 440, "Et la question d’avant : avez-vous vraiment besoin d’une "
                      "macro ?", "h", 13.5))
c.append(txt(44, 462, "Un .xlsx avec Power Query s’envoie sans aucune de ces "
                      "précautions.", "p", 12.5))
(OUT / "05-livraison.svg").write_text(svg(704, 492, "".join(c)))

# ══ 6 · Ce qui survit à l'export vers Google Sheets ══════════════════
c = [STYLE10, '<text x="24" y="30" class="eti">Exporter vers Google Sheets : ce qui passe, ce qui meurt</text>']
SURVIT = [("Formules classiques", "SOMME.SI.ENS, RECHERCHEV, SI"),
          ("Mise en forme conditionnelle", "la plupart des règles"),
          ("Tableaux croisés dynamiques", "refaits, mais équivalents"),
          ("Validation de données", "listes déroulantes")]
MEURT = [("Power Query", "aucun équivalent — la requête disparaît"),
         ("Le modèle de données", "et tout le DAX avec"),
         ("Les matrices dynamiques", "FILTRE, TRIER, UNIQUE ne passent pas"),
         ("Les macros VBA", "Sheets utilise Apps Script, un autre langage")]
for bloc, (titre, liste, cls, cl) in enumerate([
        ("Ce qui survit", SURVIT, "vfill", "ok"),
        ("Ce qui meurt", MEURT, "rfill", "ko")]):
    x = 24 + bloc * 336
    c.append(carte(x, 52, 320, 226, cls))
    c.append(txt(x + 20, 80, titre, "h", 14.5))
    for k, (nom, note) in enumerate(liste):
        y = 110 + k * 42
        c.append(txt(x + 20, y, nom, "h", 12.5))
        c.append(txt(x + 20, y + 18, note, "p", 11.5))
c.append(carte(24, 296, 656, 98, "carte"))
c.append(txt(44, 322, "💎  QUERY() — ce que Sheets fait mieux", "h", 13.5))
c.append(f'<rect x="44" y="336" width="616" height="26" rx="3" class="carte"/>')
c.append('<text x="56" y="354" class="mono bl" font-size="11">'
         '=QUERY(A:F ; "select D, sum(F) where B=\'Kinshasa\' group by D '
         'order by sum(F) desc" ; 1)</text>')
c.append(txt(44, 384, "Un tableau croisé dynamique, en une formule, qui se "
                      "recalcule. Excel n’a pas d’équivalent.", "p", 12.5))
c.append(carte(24, 410, 656, 62, "vfill"))
c.append(txt(44, 436, "La question à poser avant d’exporter", "h", 13.5))
c.append(txt(44, 458, "« Qui va s’en servir, et avec quoi ? »  La réponse "
                      "décide, pas la préférence.", "p", 12.5))
(OUT / "06-sheets.svg").write_text(svg(704, 492, "".join(c)))

# ══ 7 · Claude Code : 200 classeurs, une commande ════════════════════
c = [STYLE10, '<text x="24" y="30" class="eti">Ce qui change quand le travail sort d’Excel</text>']
c.append(carte(24, 52, 200, 150, "carte"))
c.append(txt(44, 80, "J10_Clients/", "h", 14))
c.append(txt(44, 104, f"{R['clients']} classeurs", "mono t2", 12))
c.append(txt(44, 126, f"{R['classeurs_vides']} vides", "mono t3", 11))
c.append(txt(44, 146, "6 avec une ligne TOTAL", "mono t3", 11))
c.append(txt(44, 166, "3 avec une colonne en plus", "mono t3", 11))
c.append(txt(44, 186, "2 mal nommées", "mono t3", 11))
c.append(carte(256, 52, 192, 150, "vfill"))
c.append(txt(352, 80, "Claude Code", "h", 14.5, ancre="middle"))
c.append(txt(352, 108, "CLAUDE.md", "mono ok", 11.5, ancre="middle"))
c.append(txt(352, 128, "vos conventions", "t3", 10.5, ancre="middle"))
c.append(txt(352, 156, "une Skill", "mono ok", 11.5, ancre="middle"))
c.append(txt(352, 176, "votre processus", "t3", 10.5, ancre="middle"))
c.append(carte(480, 52, 200, 150, "carte"))
c.append(txt(500, 80, "La sortie", "h", 14))
c.append(txt(500, 104, f"{R['lignes']} lignes consolidées", "mono t2", 11.5))
c.append(txt(500, 126, "1 récap. par fichier", "mono t3", 11))
c.append(txt(500, 146, "12 rapports", "mono t3", 11))
c.append(txt(500, 166, "1 écart : zéro", "mono ok", 11))
for x1, x2 in ((224, 256), (448, 480)):
    c.append(f'<path d="M {x1} 127 L {x2-6} 127" stroke="var(--vb)" '
             f'stroke-width="2"/>')
    c.append(f'<path d="M {x2-12} 122 L {x2-4} 127 L {x2-12} 132" '
             f'stroke="var(--vb)" stroke-width="2" fill="none"/>')
c.append(carte(24, 222, 656, 76, "vfill"))
c.append(txt(44, 248, "La commande", "h", 13.5))
c.append('<text x="44" y="276" class="mono ok" font-size="12">'
         '&gt; consolide les classeurs de J10_Clients et produis les douze '
         'rapports</text>')
c.append(carte(24, 312, 656, 128, "carte"))
c.append(txt(44, 338, "Ce qui fait la différence avec « demander à une IA »", "h", 13.5))
c.append(txt(44, 364, "CLAUDE.md dit une fois pour toutes : les devises, les "
                      "taux, le nommage des fichiers,", "p", 12.5))
c.append(txt(44, 384, "les quinze anomalies connues, et le contrôle qui doit "
                      "valoir zéro. C’est rejoué à", "p", 12.5))
c.append(txt(44, 404, "chaque fois, sans que vous le retapiez — et c’est "
                      "relisible par quelqu’un d’autre.", "p", 12.5))
c.append(txt(44, 428, "Un prompt se perd. Un fichier de conventions se "
                      "transmet.", "mono t3", 11))
(OUT / "07-claude-code.svg").write_text(svg(704, 460, "".join(c)))

# ══ 8 · L'Échelle, entière ═══════════════════════════════════════════
c = [STYLE10, '<text x="24" y="30" class="eti">Les huit niveaux — la fin du programme</text>']
ECHELLE = [
 (1, "Je le fais à la main", "Mise à niveau"),
 (2, "Je le fais avec une formule", "M1"),
 (3, "Je rends la formule dynamique", "M1 · M4"),
 (4, "J’automatise dans Excel", "M5 · M6"),
 (5, "J’industrialise", "M7 · M8"),
 (6, "Je fais raisonner l’IA avec moi", "tous"),
 (7, "Claude Code automatise le flux", "M10"),
 (8, "Je contrôle, je valide, j’assume", "tous"),
]
for k, (n, quoi, ou) in enumerate(ECHELLE):
    y = 52 + k * 46
    dernier = (n == 8)
    c.append(carte(24, y, 656, 38, "vfill" if dernier else "carte"))
    c.append(f'<circle cx="52" cy="{y+19}" r="13" class="vfill"/>')
    c.append(f'<circle cx="52" cy="{y+19}" r="13" class="vstroke"/>')
    c.append(txt(52, y + 24, str(n), "vtext mono", 12.5, poids=600, ancre="middle"))
    c.append(txt(80, y + 24, quoi, "h", 13.5 if dernier else 13))
    c.append(txt(622, y + 24, ou, "mono t3", 10.5, ancre="end"))
    c.append(f'<path d="M 640 {y+14} L 646 {y+22} L 658 {y+8}" '
             f'stroke="var(--v)" stroke-width="2.4" fill="none" '
             f'stroke-linecap="round"/>')
c.append(carte(24, 424, 656, 84, "carte"))
c.append(txt(44, 452, "Le niveau 8 n’est pas au-dessus de l’IA.", "h", 14.5))
c.append(txt(44, 478, "Il en est la condition. Une sortie que personne ne "
                      "vérifie n’est pas un gain de temps :", "p", 12.5))
c.append(txt(44, 498, "c’est un risque qu’on a déplacé, et qu’on ne voit plus.",
             "p", 12.5))
(OUT / "08-echelle.svg").write_text(svg(704, 528, "".join(c)))

print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))

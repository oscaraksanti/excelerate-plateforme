#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════
#  Les visuels de marque : l'icône, et la carte de partage.
#
#  L'icône est un « E » construit en CELLULES — c'est la signature du
#  site, la même que la plage sélectionnée qui court dans toute
#  l'interface. À 16 pixels il reste lisible parce qu'il n'est fait que
#  de rectangles.
#
#    python3 outils/marque.py
# ══════════════════════════════════════════════════════════════════════
import pathlib, io, sys
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

RACINE = pathlib.Path(__file__).resolve().parent.parent
APP = RACINE / "src" / "app"
PUB = RACINE / "public"
TMP = pathlib.Path("/tmp/marque"); TMP.mkdir(exist_ok=True)

ENCRE   = (11, 14, 19)
ENCRE_2 = (20, 25, 34)
VOLTAGE = (200, 240, 75)
PAPIER  = (255, 255, 255)
GRIS    = (138, 150, 164)
GRIS_2  = (87, 97, 109)

# ══ La police ═════════════════════════════════════════════════════════
def archivo(poids=800, largeur=108):
    """Archivo est chargée par next/font en woff2 variable. On l'instancie
    au poids et à la largeur du titrage du site, puis on l'écrit en TTF —
    Pillow ne lit pas le woff2."""
    src = None
    for f in sorted((RACINE / ".next/static/media").glob("*.woff2")):
        try:
            t = TTFont(str(f))
            if (t["name"].getDebugName(1) or "").startswith("Archivo") and "fvar" in t:
                src = f; break
        except Exception:
            continue
    if src is None:
        sys.exit("Archivo introuvable — lance « npm run build » d'abord.")
    cible = TMP / f"archivo-{poids}-{largeur}.ttf"
    if not cible.exists():
        t = TTFont(str(src))
        axes = {a.axisTag for a in t["fvar"].axes}
        reglage = {}
        if "wght" in axes: reglage["wght"] = poids
        if "wdth" in axes: reglage["wdth"] = largeur
        instantiateVariableFont(t, reglage, inplace=True, updateFontNames=False)
        t.flavor = None
        t.save(str(cible))
    return str(cible)

def plex(poids="Regular"):
    for f in sorted((RACINE / ".next/static/media").glob("*.woff2")):
        try:
            t = TTFont(str(f))
            nom = t["name"].getDebugName(1) or ""
            sous = t["name"].getDebugName(2) or ""
            if "IBM Plex Mono" in nom and poids.lower() in (nom + sous).lower():
                cible = TMP / f"plexmono-{poids}.ttf"
                if not cible.exists():
                    if "fvar" in t:
                        instantiateVariableFont(t, {"wght": 500}, inplace=True)
                    t.flavor = None
                    t.save(str(cible))
                return str(cible)
        except Exception:
            continue
    return None

# ══ 1 · L'icône ═══════════════════════════════════════════════════════
#  Le E, en cellules. Cinq rangées, quatre colonnes.
E_MOTIF = [
    (1, 1, 1, 1),
    (1, 0, 0, 0),
    (1, 1, 1, 0),
    (1, 0, 0, 0),
    (1, 1, 1, 1),
]

def icone(taille, poignee=True, fond=ENCRE):
    """Rendue à 8× puis réduite : les arêtes restent nettes à 16 px."""
    f = 8
    n = taille * f
    im = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    rayon = int(n * 0.22)
    d.rounded_rectangle([0, 0, n - 1, n - 1], radius=rayon, fill=fond + (255,))

    marge = n * 0.20
    larg = n - 2 * marge
    #  Quatre colonnes, cinq rangées, avec un joint fin — c'est ce joint
    #  qui fait lire « cellules » plutôt que « lettre ».
    joint = max(1.0, n * 0.012)
    cw = (larg + joint) / 4 - joint
    ch = (larg + joint) / 5 - joint

    for r, rangee in enumerate(E_MOTIF):
        for c, plein in enumerate(rangee):
            if not plein:
                continue
            x = marge + c * (cw + joint)
            y = marge + r * (ch + joint)
            d.rectangle([x, y, x + cw, y + ch], fill=VOLTAGE + (255,))

    #  La poignée de recopie, en bas à droite de la « plage ».
    if poignee and taille >= 128:
        p = n * 0.052
        x2 = marge + larg
        y2 = marge + larg
        d.rectangle([x2 - p / 2, y2 - p / 2, x2 + p / 2, y2 + p / 2],
                    fill=PAPIER + (255,))

    return im.resize((taille, taille), Image.LANCZOS)

#  favicon.ico : plusieurs tailles dans un seul fichier. Les petites
#  n'ont pas la poignée — elle deviendrait un pâté.
ico = icone(256)
ico.save(APP / "favicon.ico", format="ICO",
         sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
icone(512).save(APP / "icon.png")
#  L'icône iOS n'a pas de transparence et pas de coins arrondis : le
#  système les arrondit lui-même, et un fond transparent devient noir.
pomme = Image.new("RGB", (180, 180), ENCRE)
pomme.paste(icone(180, fond=ENCRE), (0, 0), icone(180, fond=ENCRE))
pomme.save(APP / "apple-icon.png")
print(f"  favicon.ico · icon.png · apple-icon.png")

# ══ 2 · La carte de partage ═══════════════════════════════════════════
#  1200 × 630 : le format que lisent Google, WhatsApp, LinkedIn, X et
#  Facebook. C'est la première chose que voit quelqu'un à qui on envoie
#  le lien — elle doit donc tenir seule, sans le texte du message.
#
#  Tout est composé en Archivo. IBM Plex Mono, extrait du woff2 de
#  next/font, rend des carrés vides : le sous-ensemble livré au
#  navigateur ne suffit pas à Pillow. Les étiquettes sont donc en
#  Archivo capitales, avec un interlettrage posé à la main.
def lettrage(d, xy, texte, police, fill, ecart=2.6):
    """Écrit un texte en espaçant les lettres — l'étiquette du site."""
    x, y = xy
    for ch in texte:
        d.text((x, y), ch, font=police, fill=fill)
        x += d.textlength(ch, font=police) + ecart
    return x

def largeur_lettrage(d, texte, police, ecart=2.6):
    return sum(d.textlength(c, font=police) + ecart for c in texte) - ecart

def portrait(cote):
    """Le portrait, recadré sur le visage."""
    src = RACINE.parent / "assets" / "oscar-aksanti.jpg"
    if not src.exists():
        return None
    ph = Image.open(src).convert("RGB")
    c = min(ph.size)
    #  Le cadrage part du haut : c'est là qu'est le visage.
    ph = ph.crop(((ph.width - c) // 2, 0, (ph.width + c) // 2, c))
    return ph.resize((cote, cote), Image.LANCZOS)

def carte_partage(chemin, titre, sous_titre, faits, avec_portrait=True):
    L, H = 1200, 630
    im = Image.new("RGB", (L, H), ENCRE)
    d = ImageDraw.Draw(im)

    for x in range(0, L, 48):
        d.line([(x, 0), (x, H)], fill=(22, 27, 36), width=1)
    for y in range(0, H, 48):
        d.line([(0, y), (L, y)], fill=(22, 27, 36), width=1)

    f_titre = ImageFont.truetype(archivo(800, 108), 74)
    f_sous  = ImageFont.truetype(archivo(450, 104), 27)
    f_etiq  = ImageFont.truetype(archivo(600, 100), 17)
    f_fait  = ImageFont.truetype(archivo(720, 104), 26)

    #  ── Le portrait, dans une cellule ──────────────────────────────
    #  Encadré plutôt qu'en fond perdu : sur un fond sombre, le blanc
    #  d'un studio mange le tiers droit de la carte.
    droite = L - 64
    if avec_portrait:
        cote = 356
        px, py = L - 64 - cote, (H - cote) // 2 - 6
        ph = portrait(cote)
        if ph is not None:
            im.paste(ph, (px, py))
            d.rectangle([px, py, px + cote, py + cote], outline=VOLTAGE, width=3)
            #  la poignée de recopie, en bas à droite de la plage
            d.rectangle([px + cote - 7, py + cote - 7, px + cote + 7, py + cote + 7],
                        fill=VOLTAGE, outline=ENCRE, width=3)
            d.rectangle([px, py + cote + 18, px + cote, py + cote + 54],
                        fill=ENCRE_2, outline=(46, 54, 66), width=1)
            lettrage(d, (px + 18, py + cote + 28), "ANIMÉ PAR OSCAR AKSANTI",
                     f_etiq, GRIS, 2.2)
            droite = px - 48

    #  ── Le bandeau de marque ───────────────────────────────────────
    d.rectangle([64, 58, 64 + 13, 58 + 13], fill=VOLTAGE)
    x = lettrage(d, (90, 52), "EXCELERATE IA", f_etiq, PAPIER, 3.2)
    lettrage(d, (x + 16, 52), "· EURÊKA SERVICES", f_etiq, GRIS_2, 3.2)

    #  ── Le titre ───────────────────────────────────────────────────
    y = 128
    for ligne in titre:
        d.text((60, y), ligne, font=f_titre, fill=PAPIER)
        y += 80

    y += 16
    for ligne in sous_titre:
        d.text((64, y), ligne, font=f_sous, fill=GRIS)
        y += 38

    #  ── Les faits, en bas ──────────────────────────────────────────
    x = 64
    for etiq, valeur, accent in faits:
        lv = d.textlength(valeur, font=f_fait)
        le = largeur_lettrage(d, etiq, f_etiq, 2.2)
        larg = max(lv, le) + 44
        if x + larg > droite:
            break
        d.rectangle([x, H - 136, x + larg, H - 52],
                    fill=(36, 46, 18) if accent else ENCRE_2,
                    outline=(86, 116, 30) if accent else (46, 54, 66), width=1)
        lettrage(d, (x + 22, H - 122), etiq, f_etiq, GRIS, 2.2)
        d.text((x + 22, H - 96), valeur, font=f_fait,
               fill=VOLTAGE if accent else PAPIER)
        x += larg + 14

    im.save(chemin, quality=92)
    print(f"  {pathlib.Path(chemin).name}")

carte_partage(
    APP / "opengraph-image.png",
    ["Excel ne vous", "ralentira plus."],
    ["Onze modules, cinquante-cinq leçons, onze travaux",
     "pratiques corrigés automatiquement."],
    [("MODULES 0 À 3", "Gratuits", True),
     ("LA SUITE", "37 $", False),
     ("AU BOUT", "Un certificat", False)],
)

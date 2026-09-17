#!/usr/bin/env python3
"""La facture fournisseur du module 1 : un PDF propre, et sa photo.

La photo est ce qu'on donne a l'apprenant. Elle est legerement de
travers, un peu floue, avec une ombre — comme une vraie photo prise au
telephone dans un bureau. C'est ce qui rend la lecture par l'IA
faillible, donc la lecon honnete : sans risque d'erreur, le total de
controle n'enseigne rien.
"""
import sys, pathlib, math
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from PIL import Image, ImageFilter, ImageEnhance
import fitz

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from generateur_m01 import FACTURE, TOTAL_FACTURE, NUM_FACTURE, DATE_FACTURE

RACINE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "sortie")
RACINE.mkdir(parents=True, exist_ok=True)
PDF = RACINE / "J01_Facture_Fournisseur.pdf"

def fmt(n):
    return f"{n:,}".replace(",", " ")

c = canvas.Canvas(str(PDF), pagesize=A4)
L, H = A4

c.setFont("Helvetica-Bold", 17)
c.drawString(20*mm, H - 24*mm, "ETS KIVU DISTRIBUTION SARL")
c.setFont("Helvetica", 8.5)
for i, t in enumerate([
    "Avenue du Commerce 142, Gombe — Kinshasa, R.D. Congo",
    "RCCM CD/KIN/RCCM/19-B-02841  ·  Id. Nat. 01-F4300-N88215V",
    "Tél. +243 81 000 00 00  ·  contact@kivudistribution.cd",
]):
    c.drawString(20*mm, H - (31 + i*4.2)*mm, t)

c.setLineWidth(1.1)
c.line(20*mm, H - 47*mm, L - 20*mm, H - 47*mm)

c.setFont("Helvetica-Bold", 13)
c.drawString(20*mm, H - 56*mm, f"FACTURE  {NUM_FACTURE}")
c.setFont("Helvetica", 9)
c.drawString(20*mm, H - 62*mm, f"Date : {DATE_FACTURE:%d/%m/%Y}        Échéance : 30 jours        Devise : CDF")

c.setFont("Helvetica-Bold", 9)
c.drawString(120*mm, H - 56*mm, "Client")
c.setFont("Helvetica", 9)
for i, t in ["GROUPE BAOBAB SARL", "Agence de Kinshasa", "Boulevard du 30 Juin, Gombe"] and \
        enumerate(["GROUPE BAOBAB SARL", "Agence de Kinshasa", "Boulevard du 30 Juin, Gombe"]):
    c.drawString(120*mm, H - (62 + i*4.2)*mm, t)

y = H - 80*mm
c.setFillColorRGB(0.14, 0.19, 0.27)
c.rect(20*mm, y - 2*mm, L - 40*mm, 7*mm, fill=1, stroke=0)
c.setFillColorRGB(1, 1, 1)
c.setFont("Helvetica-Bold", 8)
c.drawString(22*mm, y, "RÉF.")
c.drawString(42*mm, y, "DÉSIGNATION")
c.drawRightString(128*mm, y, "QTÉ")
c.drawRightString(160*mm, y, "P.U. (CDF)")
c.drawRightString(L - 22*mm, y, "MONTANT (CDF)")

c.setFillColorRGB(0, 0, 0)
y -= 8*mm
for ref, des, qte, pu in FACTURE:
    c.setFont("Helvetica", 8.5)
    c.drawString(22*mm, y, ref)
    c.drawString(42*mm, y, des)
    # La quantite est composee un peu plus serree : c'est la colonne que
    # l'IA lit le moins bien sur une photo, et c'est voulu.
    c.setFont("Helvetica", 8.5)
    c.drawRightString(128*mm, y, str(qte))
    c.drawRightString(160*mm, y, fmt(pu))
    c.drawRightString(L - 22*mm, y, fmt(qte * pu))
    c.setStrokeColorRGB(0.85, 0.87, 0.9)
    c.setLineWidth(0.3)
    c.line(20*mm, y - 2.2*mm, L - 20*mm, y - 2.2*mm)
    y -= 7*mm

y -= 4*mm
c.setStrokeColorRGB(0, 0, 0); c.setLineWidth(1.1)
c.line(120*mm, y + 4*mm, L - 20*mm, y + 4*mm)
c.setFont("Helvetica-Bold", 11)
c.drawString(120*mm, y - 3*mm, "TOTAL À PAYER")
c.drawRightString(L - 22*mm, y - 3*mm, f"{fmt(TOTAL_FACTURE)} CDF")

c.setFont("Helvetica", 7.5)
c.drawString(20*mm, 30*mm, "Marchandises vendues non reprises. Paiement par virement ou mobile money.")
c.drawString(20*mm, 26*mm, "TVA non applicable — régime de la taxe sur le chiffre d'affaires.")
c.showPage(); c.save()

# ── La photo : rotation, flou, ombre, grain ──────────────────────────
doc = fitz.open(PDF)
pix = doc[0].get_pixmap(dpi=190)
img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)

img = img.rotate(-1.15, resample=Image.BICUBIC, expand=True, fillcolor=(232, 230, 226))
img = img.filter(ImageFilter.GaussianBlur(0.9))
img = ImageEnhance.Contrast(img).enhance(0.86)
img = ImageEnhance.Brightness(img).enhance(1.04)

# Un degrade d'ombre en diagonale, comme une lampe de bureau sur la gauche
w, h = img.size
ombre = Image.new("L", (w, h))
px = ombre.load()
for yy in range(0, h, 2):
    for xx in range(0, w, 2):
        v = int(236 - 46 * ((xx / w) ** 1.5) - 26 * ((yy / h) ** 2))
        for dy in range(2):
            for dx in range(2):
                if yy + dy < h and xx + dx < w:
                    px[xx + dx, yy + dy] = max(150, min(255, v))
img = Image.composite(img, Image.new("RGB", (w, h), (96, 94, 92)), ombre)
img = img.crop((0, 0, w, int(h * 0.78)))
w, h = img.size
img = img.resize((int(w * 0.66), int(h * 0.66)), Image.LANCZOS)
img.save(RACINE / "J01_Facture_photo.jpg", quality=72, optimize=True)

print(f"facture {NUM_FACTURE} — total {fmt(TOTAL_FACTURE)} CDF — {len(FACTURE)} lignes")
print("PDF  :", PDF.name)
print("photo:", (RACINE / 'J01_Facture_photo.jpg').name, img.size)

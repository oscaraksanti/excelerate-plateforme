# Le socle commun : palette, polices, et l'inversion automatique en thème sombre.
STYLE = """<style>
  :root{
    --f:#fbfcfd; --c:#ffffff; --b:#dfe4ea; --b2:#eef1f4;
    --t:#101418; --t2:#4d5765; --t3:#8a94a3;
    --v:#1f9d55; --vf:#e6f6ed; --vb:#7ed4a3;
    --r:#c0392b; --rf:#fdecea;
  }
  @media (prefers-color-scheme: dark){
    :root{
      --f:#11151b; --c:#171c24; --b:#2b3340; --b2:#222834;
      --t:#eef1f5; --t2:#a8b2c0; --t3:#6c7686;
      --v:#4ade80; --vf:#13291d; --vb:#2f6b47;
      --r:#f87171; --rf:#2a1719;
    }
  }
  .fond{fill:var(--f)} .carte{fill:var(--c)} .bord{stroke:var(--b);fill:none}
  .bord2{stroke:var(--b2);fill:none}
  text{font-family:'IBM Plex Sans',ui-sans-serif,system-ui,-apple-system,sans-serif}
  .t{fill:var(--t)} .t2{fill:var(--t2)} .t3{fill:var(--t3)}
  .mono{font-family:'IBM Plex Mono',ui-monospace,'SF Mono',Menlo,monospace}
  .eti{font-size:11px;letter-spacing:.11em;text-transform:uppercase;fill:var(--t3);
       font-family:'IBM Plex Mono',ui-monospace,monospace}
  .h{font-size:15px;font-weight:600;fill:var(--t)}
  .p{font-size:13px;fill:var(--t2)}
  .vfill{fill:var(--vf)} .vstroke{stroke:var(--vb);fill:none} .vtext{fill:var(--v)}
  .rfill{fill:var(--rf)} .rtext{fill:var(--r)}
</style>"""

def svg(w, h, corps):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}" role="img">{STYLE}'
            f'<rect width="{w}" height="{h}" rx="8" class="fond"/>{corps}</svg>')

def grille(x, y, cols, rows, cw, ch, entetes=None, cellules=None, surligne=None):
    """Une grille de cellules facon Excel."""
    o = [f'<rect x="{x}" y="{y}" width="{cols*cw}" height="{(rows+1)*ch}" rx="3" class="carte"/>']
    if entetes:
        o.append(f'<rect x="{x}" y="{y}" width="{cols*cw}" height="{ch}" rx="3" class="vfill"/>')
        for i, e in enumerate(entetes):
            o.append(f'<text x="{x+i*cw+9}" y="{y+ch/2+4}" class="mono" '
                     f'font-size="10.5" fill="var(--t2)">{e}</text>')
    for r in range(rows + 2):
        o.append(f'<line x1="{x}" y1="{y+r*ch}" x2="{x+cols*cw}" y2="{y+r*ch}" class="bord2"/>')
    for c in range(cols + 1):
        o.append(f'<line x1="{x+c*cw}" y1="{y}" x2="{x+c*cw}" y2="{y+(rows+1)*ch}" class="bord2"/>')
    if surligne:
        sx, sy, sc, sr = surligne
        o.append(f'<rect x="{x+sx*cw}" y="{y+sy*ch}" width="{sc*cw}" height="{sr*ch}" '
                 f'class="vstroke" stroke-width="2" rx="2"/>')
    for (cc, rr, txt, cls) in (cellules or []):
        o.append(f'<text x="{x+cc*cw+9}" y="{y+(rr+1)*ch-ch/2+4}" class="mono {cls}" '
                 f'font-size="11">{txt}</text>')
    o.append(f'<rect x="{x}" y="{y}" width="{cols*cw}" height="{(rows+1)*ch}" rx="3" class="bord"/>')
    return "".join(o)

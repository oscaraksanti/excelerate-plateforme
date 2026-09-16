import type { Resultat } from "@/lib/correcteur";

function marque(etat: boolean | null) {
  if (etat === null)
    return (
      <span className="inline-block rounded-[3px] bg-fond-3 px-[6px] py-[2px] font-mono text-[9.5px] tracking-[0.08em] text-texte-3 uppercase">
        n/a
      </span>
    );
  return etat ? (
    <span className="inline-block rounded-[3px] bg-[color:var(--plage-fond)] px-[6px] py-[2px] font-mono text-[9.5px] tracking-[0.08em] text-accent-texte uppercase">
      ✓ oui
    </span>
  ) : (
    <span className="inline-block rounded-[3px] bg-[color:rgba(190,59,48,.1)] px-[6px] py-[2px] font-mono text-[9.5px] tracking-[0.08em] text-ko uppercase">
      ✗ non
    </span>
  );
}

function afficher(v: string | number | boolean | null) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number")
    return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 4 }).format(v);
  return String(v);
}

export function GrilleResultat({ resultat }: { resultat: Resultat }) {
  return (
    <div className="mt-8">
      {/* ── La note et ses trois axes ─────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div className="plage px-6 py-5">
          <span className="etiquette mb-2 block">Note machine</span>
          <span className="titre-xl block text-[3rem] tabular-nums">
            {String(resultat.sur20).replace(".", ",")}
            <span className="text-[1.3rem] text-texte-2">/20</span>
          </span>
          <span className="mt-[10px] block font-mono text-[11.5px] tabular-nums text-texte-2">
            {resultat.obtenu} point{resultat.obtenu > 1 ? "s" : ""} sur {resultat.total}
          </span>
          <span className="poignee" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-4">
          {resultat.axes.map((a) => {
            const pc = a.total ? Math.round((a.obtenu / a.total) * 100) : 0;
            return (
              <div key={a.nom}>
                <div className="mb-[6px] flex items-baseline justify-between gap-3">
                  <b className="text-[0.94rem] font-semibold">{a.nom}</b>
                  <i className="font-mono text-[11.5px] not-italic tabular-nums text-texte-2">
                    {a.obtenu} / {a.total} · {pc} %
                  </i>
                </div>
                <div className="h-2 overflow-hidden rounded-[2px] bg-fond-3">
                  <div
                    className={`h-full rounded-[2px] ${pc < 60 ? "bg-ambre" : "bg-[color:var(--voltage-2)]"}`}
                    style={{ width: `${pc}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Le détail ─────────────────────────────────────── */}
      <div className="mt-8 overflow-x-auto rounded-[10px] border border-bord bg-fond">
        <table className="w-full min-w-[640px] border-collapse text-[0.89rem]">
          <thead>
            <tr>
              {[
                "Emplacement",
                "Méthode attendue",
                "Méthode rendue",
                "Résultat attendu",
                "Résultat rendu",
              ].map((t) => (
                <th
                  key={t}
                  className="border-b border-bord bg-fond-2 px-[14px] py-[11px] text-left font-mono text-[9.5px] font-semibold tracking-[0.13em] whitespace-nowrap text-texte-2 uppercase"
                >
                  {t}
                </th>
              ))}
              <th className="border-b border-bord bg-fond-2 px-[14px] py-[11px] text-right font-mono text-[9.5px] font-semibold tracking-[0.13em] whitespace-nowrap text-texte-2 uppercase">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {resultat.lignes.map((l, i) => (
              <tr
                key={`${l.ou}-${i}`}
                className={l.obtenu === 0 ? "bg-[color:rgba(190,59,48,.06)]" : ""}
              >
                <td className="border-b border-bord-2 px-[14px] py-[11px] align-top font-mono text-[12px] font-medium whitespace-nowrap text-texte">
                  {l.ou}
                </td>
                <td className="border-b border-bord-2 px-[14px] py-[11px] align-top font-mono text-[11.5px] text-texte">
                  {l.structurel ? <span className="text-texte-3">—</span> : l.attFn}
                </td>
                <td className="border-b border-bord-2 px-[14px] py-[11px] align-top font-mono text-[11.5px] text-texte-2">
                  {l.renFn} {marque(l.methode)}
                </td>
                <td className="border-b border-bord-2 px-[14px] py-[11px] align-top font-mono text-[11.5px] tabular-nums text-texte-2">
                  {l.structurel ? <span className="text-texte-3">—</span> : afficher(l.attVal)}
                </td>
                <td className="border-b border-bord-2 px-[14px] py-[11px] align-top font-mono text-[11.5px] tabular-nums text-texte-2">
                  {l.structurel ? (
                    <span className="text-texte-3">—</span>
                  ) : (
                    <>
                      {afficher(l.renVal)} {marque(l.resultat)}
                    </>
                  )}
                </td>
                <td className="border-b border-bord-2 px-[14px] py-[11px] text-right align-top font-mono text-[11.5px] tabular-nums whitespace-nowrap text-texte">
                  {l.obtenu} / {l.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 max-w-[36rem] text-[0.9rem] text-texte-3">
        Cette note ne juge que ce qu&apos;un programme peut vérifier : les
        fonctions employées et les valeurs obtenues. Le choix de structure, la
        lisibilité et la méthode sont notés par tes pairs — et comptent pour
        40&nbsp;% de la note finale.
      </p>
    </div>
  );
}

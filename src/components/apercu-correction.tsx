/* ══════════════════════════════════════════════════════════════════
   Ce que la machine renvoie quand on dépose un classeur.

   La page décrit la correction automatique depuis le premier jour
   sans jamais la montrer. Or c'est la seule chose que personne
   d'autre ne fait : on dépose un .xlsx, et trois secondes plus tard
   on sait cellule par cellule ce qui tient et ce qui ne tient pas.

   Ce bloc est un exemple — dit comme tel — repris de la vraie grille
   du TP 1. Pas une capture d'écran : du HTML, donc net sur tous les
   écrans et lisible dans les deux thèmes.
   ══════════════════════════════════════════════════════════════════ */

const AXES = [
  { nom: "Les valeurs attendues", obtenu: 11, total: 12 },
  { nom: "La méthode employée", obtenu: 7, total: 8 },
  { nom: "La structure du classeur", obtenu: 4, total: 6 },
];

const LIGNES: [string, string, string, "oui" | "non"][] = [
  ["Synthèse!B7", "Total des mouvements", "84 320,00", "oui"],
  ["Synthèse!B9", "Écart contrôle", "0,00", "oui"],
  ["Données!F2", "Formule RECHERCHEX", "=RECHERCHEX([@Agence];…)", "oui"],
  ["Synthèse!B12", "Marge moyenne", "12,4 %", "non"],
];

function Marque({ etat }: { etat: "oui" | "non" }) {
  return etat === "oui" ? (
    <span className="inline-block rounded-[3px] bg-[color:var(--plage-fond)] px-[6px] py-[2px] font-mono text-[9.5px] tracking-[0.08em] text-accent-texte uppercase">
      ✓ oui
    </span>
  ) : (
    <span className="inline-block rounded-[3px] bg-[color:rgba(190,59,48,.1)] px-[6px] py-[2px] font-mono text-[9.5px] tracking-[0.08em] text-ko uppercase">
      ✗ non
    </span>
  );
}

export function ApercuCorrection() {
  return (
    <div className="rounded-[10px] border border-bord p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <span className="etiquette">
          TP 1 — trois secondes après le dépôt
        </span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase">
          exemple
        </span>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div className="plage px-5 py-4">
          <span className="etiquette mb-2 block">Note machine</span>
          <span className="titre-xl block text-[2.4rem] tabular-nums">
            15,4<span className="text-[1.1rem] text-texte-2">/20</span>
          </span>
          <span className="mt-[8px] block font-mono text-[11px] tabular-nums text-texte-2">
            22 points sur 26
          </span>
          <span className="poignee" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-3">
          {AXES.map((a) => {
            const pc = Math.round((a.obtenu / a.total) * 100);
            return (
              <div key={a.nom}>
                <div className="mb-[5px] flex items-baseline justify-between gap-3">
                  <b className="text-[0.9rem] font-semibold">{a.nom}</b>
                  <i className="font-mono text-[11px] not-italic tabular-nums text-texte-2">
                    {a.obtenu} / {a.total}
                  </i>
                </div>
                <div className="h-[5px] w-full overflow-hidden rounded-[2px] bg-fond-3">
                  <div
                    className="h-full rounded-[2px] bg-[color:var(--voltage-2)]"
                    style={{ width: `${pc}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-[0.88rem]">
          <tbody>
            {LIGNES.map(([cellule, quoi, valeur, etat]) => (
              <tr key={cellule} className="border-t border-bord-2">
                <td className="py-[9px] pr-3 font-mono text-[11.5px] whitespace-nowrap text-texte-2">
                  {cellule}
                </td>
                <td className="py-[9px] pr-3 text-texte">{quoi}</td>
                {/*  Sur un téléphone, la marque ✓/✗ compte plus que la
                    valeur : c'est elle qui se lit d'un coup d'œil. */}
                <td className="hidden py-[9px] pr-3 font-mono text-[11.5px] text-texte-2 sm:table-cell">
                  {valeur}
                </td>
                <td className="py-[9px] text-right">
                  <Marque etat={etat} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 mb-0 max-w-[36rem] text-[0.9rem] leading-[1.5] text-texte-2">
        Chaque cellule attendue est vérifiée : la valeur, mais aussi la formule
        qui y mène. Un bon résultat obtenu à la main ne passe pas — c&apos;est
        volontaire.
      </p>
    </div>
  );
}

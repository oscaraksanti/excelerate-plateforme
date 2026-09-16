import type { Metadata } from "next";
import { SEGMENTS } from "@/app/api/export/[segment]/route";
import { CHAMP } from "@/components/champs";
import { formaterDate } from "@/lib/formats";
import { listerApprenants } from "@/lib/metriques";

export const metadata: Metadata = { title: "Les apprenants" };

export default async function PageApprenants({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const recherche = (q ?? "").trim();
  const gens = await listerApprenants(recherche, 300);

  return (
    <>
      <h1 className="titre-xl m-0 mb-2 text-[clamp(1.7rem,4vw,2.4rem)]">
        Les apprenants
      </h1>
      <p className="mb-9 max-w-[35rem] text-[1.01rem] text-texte-2">
        Ceux qui ont ouvert un compte, et ce qu&apos;ils font. Les inscrits qui
        ne se sont jamais connectés sont dans les exports ci-dessous.
      </p>

      {/* ── Les exports ──────────────────────────────────── */}
      <section className="mb-12 border-t-2 border-texte pt-6">
        <h2 className="titre-l m-0 mb-1 text-[1.35rem]">
          Les listes pour systeme.io
        </h2>
        <p className="mt-2 mb-5 max-w-[35rem] text-[0.96rem] text-texte-2">
          La plateforme n&apos;envoie pas d&apos;emails de masse : elle te sort
          la liste, tu l&apos;importes dans systeme.io. Format point-virgule,
          prêt pour Excel en français.
        </p>
        <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
          {Object.entries(SEGMENTS).map(([cle, libelle]) => (
            <li key={cle}>
              <a
                href={`/api/export/${cle}`}
                download
                className="flex items-center justify-between gap-3 rounded-[8px] border border-bord bg-fond px-4 py-[11px] text-[0.93rem] transition-colors hover:border-texte-2"
              >
                <span className="text-texte">{libelle}</span>
                <span className="font-mono text-[9.5px] tracking-[0.12em] whitespace-nowrap text-texte-3 uppercase">
                  csv
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ── La liste ─────────────────────────────────────── */}
      <section>
        <form method="get" className="mb-6 flex max-w-[26rem] gap-3">
          <input
            type="search"
            name="q"
            defaultValue={recherche}
            placeholder="Nom, email ou téléphone…"
            className={CHAMP}
          />
          <button type="submit" className="bouton-2 whitespace-nowrap">
            Chercher
          </button>
        </form>

        <p className="mb-4 font-mono text-[11px] tracking-[0.1em] text-texte-2 uppercase">
          {gens.length} compte{gens.length > 1 ? "s" : ""}
          {recherche ? ` pour « ${recherche} »` : ""}
        </p>

        {gens.length === 0 ? (
          <p className="text-texte-2">Aucun résultat.</p>
        ) : (
          <div className="overflow-x-auto rounded-[10px] border border-bord">
            <table className="w-full min-w-[720px] border-collapse text-[0.89rem]">
              <thead>
                <tr>
                  {["Personne", "Téléphone", "Leçons", "TP", "Corrections", "Achat", "Arrivé"].map(
                    (t) => (
                      <th
                        key={t}
                        className="border-b border-bord bg-fond-2 px-[13px] py-[10px] text-left font-mono text-[9.5px] font-semibold tracking-[0.13em] whitespace-nowrap text-texte-2 uppercase"
                      >
                        {t}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {gens.map((g) => (
                  <tr key={g.id}>
                    <td className="border-b border-bord-2 px-[13px] py-[10px]">
                      <span className="block font-medium text-texte">
                        {g.nom || "—"}
                        {g.role === "admin" && (
                          <span className="ml-2 rounded-[3px] bg-fond-3 px-[5px] py-[1px] font-mono text-[9px] tracking-[0.1em] text-texte-2 uppercase">
                            admin
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[10.5px] text-texte-3">
                        {g.email}
                      </span>
                    </td>
                    <td className="border-b border-bord-2 px-[13px] py-[10px] font-mono text-[11px] whitespace-nowrap text-texte-2">
                      {g.telephone ?? "—"}
                    </td>
                    {[g.lecons_vues, g.copies, g.corrections].map((n, i) => (
                      <td
                        key={i}
                        className={`border-b border-bord-2 px-[13px] py-[10px] font-mono text-[11.5px] tabular-nums ${n > 0 ? "text-texte" : "text-texte-3"}`}
                      >
                        {n}
                      </td>
                    ))}
                    <td className="border-b border-bord-2 px-[13px] py-[10px]">
                      {g.a_paye ? (
                        <span className="font-mono text-[9.5px] tracking-[0.1em] text-accent-texte uppercase">
                          oui
                        </span>
                      ) : (
                        <span className="text-texte-3">—</span>
                      )}
                    </td>
                    <td className="border-b border-bord-2 px-[13px] py-[10px] font-mono text-[10.5px] whitespace-nowrap text-texte-3">
                      {formaterDate(g.cree_le)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

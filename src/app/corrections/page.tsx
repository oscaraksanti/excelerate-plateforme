import type { Metadata } from "next";
import Link from "next/link";
import { demanderFile } from "@/app/corrections/actions";
import { EnteteApp } from "@/components/entete-app";
import { formaterDate } from "@/lib/formats";
import { maFile, monAvancement } from "@/lib/pairs";
import { profilCourant } from "@/lib/profil";
import { clientServeur } from "@/lib/supabase/serveur";

export const metadata: Metadata = { title: "Corriger" };

export default async function PageCorrections({
  searchParams,
}: {
  searchParams: Promise<{ fait?: string }>;
}) {
  const { fait } = await searchParams;
  const profil = await profilCourant();
  const supabase = await clientServeur();

  // Les TP où j'ai déposé : ce sont les seuls où je peux corriger.
  const { data: miennes } = await supabase
    .from("copies")
    .select("tp_id, tps(id, numero, titre, module_id, modules(numero))")
    .eq("profil_id", profil.id);

  const travaux = (miennes ?? [])
    .map((c) => c.tps as unknown as {
      id: string; numero: number; titre: string;
      modules: { numero: number } | null;
    } | null)
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const blocs = await Promise.all(
    travaux.map(async (t) => ({
      tp: t,
      file: await maFile(t.id),
      avancement: await monAvancement(t.id),
    })),
  );

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <h1 className="titre-xl m-0 mb-4 text-[clamp(1.9rem,4.6vw,2.7rem)]">
          Corriger
        </h1>
        <p className="mb-8 max-w-[35rem] text-[1.04rem] text-texte-2">
          Tu corriges anonymement, et on te corrige anonymement. C&apos;est en
          voyant comment six autres personnes ont résolu le même problème
          qu&apos;on apprend le plus — souvent plus que dans sa propre note.
        </p>

        {fait === "1" && (
          <p
            role="status"
            className="mb-8 max-w-[35rem] border-l-[3px] border-[color:var(--voltage-2)] bg-fond-2 px-4 py-3 text-[0.96rem]"
          >
            Correction enregistrée. Merci — l&apos;auteur la verra dès
            qu&apos;il aura rendu les siennes.
          </p>
        )}

        {blocs.length === 0 ? (
          <div className="plage px-6 py-5">
            <span className="etiquette mb-2 block">Rien à corriger</span>
            <p className="m-0 max-w-[31rem] text-[1.02rem] leading-[1.5]">
              Il faut avoir déposé sa propre copie pour entrer dans la file. Va
              d&apos;abord rendre ton travail pratique.
            </p>
            <span className="poignee" aria-hidden="true" />
          </div>
        ) : (
          blocs.map(({ tp, file, avancement }) => {
            const restant = Math.max(0, avancement.requises - avancement.faites);
            const cheminTp = `/modules/${tp.modules?.numero ?? 1}/tp/${tp.numero}`;
            return (
              <section key={tp.id} className="mb-14 border-t-2 border-texte pt-6">
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="titre-l m-0 text-[1.4rem]">{tp.titre}</h2>
                  <span className="font-mono text-[11px] tabular-nums text-texte-2">
                    {avancement.faites} / {avancement.requises} rendues
                  </span>
                </div>

                <div className="mb-6 h-2 max-w-[35rem] overflow-hidden rounded-[2px] bg-fond-3">
                  <div
                    className="h-full rounded-[2px] bg-[color:var(--voltage-2)]"
                    style={{
                      width: `${Math.min(100, Math.round((avancement.faites / Math.max(1, avancement.requises)) * 100))}%`,
                    }}
                  />
                </div>

                {restant > 0 ? (
                  <p className="mb-6 max-w-[35rem] text-[0.97rem] text-texte-2">
                    Encore <strong className="font-semibold text-texte">{restant}</strong>{" "}
                    correction{restant > 1 ? "s" : ""} avant de voir la note de tes
                    pairs sur <Link href={cheminTp} className="underline decoration-[color:var(--voltage-2)] underline-offset-[3px]">ta propre copie</Link>.
                  </p>
                ) : (
                  <p className="mb-6 max-w-[35rem] text-[0.97rem] text-accent-texte">
                    Tu as rendu tes corrections. Ta note est visible sur{" "}
                    <Link href={cheminTp} className="underline decoration-[color:var(--voltage-2)] underline-offset-[3px]">
                      la page du travail
                    </Link>
                    .
                  </p>
                )}

                {file.length > 0 && (
                  <ol className="m-0 mb-6 flex list-none flex-col gap-0 border-t border-bord p-0">
                    {file.map((e, i) => (
                      <li key={e.attribution_id} className="border-b border-bord">
                        {e.statut === "faite" ? (
                          <span className="flex items-center gap-4 py-[15px] opacity-55">
                            <span
                              aria-hidden="true"
                              className="h-[14px] w-[14px] shrink-0 rounded-[2px] border-2 border-[color:var(--plage-bord)] bg-voltage"
                            />
                            <span className="flex-1 text-[0.98rem]">
                              Copie {i + 1} — corrigée
                            </span>
                          </span>
                        ) : (
                          <Link
                            href={`/corrections/${e.attribution_id}`}
                            className="flex items-center gap-4 py-[15px] transition-colors hover:bg-fond-2"
                          >
                            <span
                              aria-hidden="true"
                              className="h-[14px] w-[14px] shrink-0 rounded-[2px] border-2 border-bord"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[0.98rem] font-medium text-texte">
                                Copie {i + 1}
                              </span>
                              <span className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase">
                                déposée {formaterDate(e.depose_le)}
                              </span>
                            </span>
                            <span className="font-mono text-[10.5px] tracking-[0.1em] whitespace-nowrap text-texte-3 uppercase">
                              corriger →
                            </span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ol>
                )}

                {avancement.attribuees === 0 && restant > 0 && (
                  <form action={demanderFile}>
                    <input type="hidden" name="tp_id" value={tp.id} />
                    <input type="hidden" name="chemin_page" value="/corrections" />
                    <button type="submit" className="bouton">
                      {file.length === 0
                        ? "Recevoir des copies à corriger"
                        : "Recevoir une copie de plus"}
                    </button>
                  </form>
                )}
              </section>
            );
          })
        )}
      </main>
    </>
  );
}

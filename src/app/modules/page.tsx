import type { Metadata } from "next";
import Link from "next/link";
import { EnteteApp } from "@/components/entete-app";
import { listerModules, sommaireModule, leconsTerminees } from "@/lib/donnees";
import { listerTps } from "@/lib/tp";
import { profilCourant } from "@/lib/profil";

export const metadata: Metadata = { title: "Les modules" };

export default async function PageModules() {
  const profil = await profilCourant();
  const modules = await listerModules();
  const terminees = await leconsTerminees();

  const dernier = modules.find((m) => m.numero === 10);
  const capstone = dernier
    ? (await listerTps(dernier.id)).find((t) => t.numero === 2 && t.publie)
    : undefined;

  const avec = await Promise.all(
    modules.map(async (m) => {
      const lecons = await sommaireModule(m.id);
      const ouvrables = lecons.filter((l) => !l.verrouille);
      const faites = ouvrables.filter((l) => terminees.has(l.id)).length;
      return {
        module: m,
        total: ouvrables.length,
        faites,
        verrouillees: lecons.length - ouvrables.length,
      };
    }),
  );

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <h1 className="titre-xl m-0 mb-4 text-[clamp(1.9rem,4.6vw,2.7rem)]">
          Les modules
        </h1>
        <p className="mb-9 max-w-[34rem] text-[1.04rem] text-texte-2">
          Commencez par le module 0 : il vous dit où vous en êtes et règle
          votre machine. Les quatre premiers sont ouverts à tout le monde ; les
          suivants s&apos;ouvrent avec la masterclass.
        </p>

        {avec.length === 0 ? (
          <p className="text-texte-2">
            Aucun module n&apos;est encore ouvert. Le premier arrive lundi 21 au
            soir.
          </p>
        ) : (
          <ol className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
            {avec.map(({ module: m, total, faites, verrouillees }) => {
              const pret = total > 0;
              const fini = pret && faites === total;
              return (
                <li key={m.id} className="border-b border-bord">
                  <Link
                    href={`/modules/${m.numero}`}
                    className="grid grid-cols-1 items-baseline gap-x-6 gap-y-2 py-6 transition-colors hover:bg-fond-2 sm:grid-cols-[86px_minmax(0,1fr)_auto]"
                  >
                    <span className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
                      <span className="font-mono text-[11px] tracking-[0.1em] text-texte-2 uppercase">
                        Module {m.numero}
                      </span>
                      <span
                        className={`font-mono text-[10px] tracking-[0.1em] uppercase ${
                          m.acces === "gratuit" ? "text-accent-texte" : "text-texte-3"
                        }`}
                      >
                        {m.acces === "gratuit" ? "Ouvert" : "Masterclass"}
                      </span>
                    </span>

                    <span className="block">
                      <span className="titre-m block text-[1.18rem] text-texte">
                        {m.titre}
                      </span>
                      {m.resume && (
                        <span className="mt-1 block max-w-[33rem] text-[0.95rem] text-texte-2">
                          {m.resume}
                        </span>
                      )}
                      {!m.publie && (
                        <span className="mt-2 inline-block rounded-[3px] bg-fond-3 px-2 py-[3px] font-mono text-[9.5px] tracking-[0.12em] text-texte-2 uppercase">
                          Brouillon
                        </span>
                      )}
                    </span>

                    <span className="font-mono text-[11px] whitespace-nowrap tabular-nums text-texte-2">
                      {pret ? (
                        fini ? (
                          <span className="text-accent-texte">terminé</span>
                        ) : (
                          `${faites} / ${total}`
                        )
                      ) : verrouillees > 0 ? (
                        <span className="text-texte-3">
                          &#128274; {verrouillees} leçon{verrouillees > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-texte-3">à venir</span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}

        {capstone && dernier && (
          <section className="mt-14 border-t-2 border-texte pt-6">
            <p className="etiquette mb-2">Le projet final</p>
            <h2 className="titre-l m-0 mb-3 text-[clamp(1.4rem,3vw,1.8rem)]">
              {capstone.titre}
            </h2>
            <p className="mb-6 max-w-[34rem] text-[1.01rem] text-texte-2">
              Vingt et un fichiers, un brief de quatre phrases, et rien
              d&apos;autre. C&apos;est la condition du certificat{" "}
              <strong className="font-semibold text-texte">Avancé</strong> :
              un capstone rendu, trois corrections faites, et une note
              d&apos;au moins 12 sur 20.
            </p>
            <Link
              href={`/modules/${dernier.numero}/tp/${capstone.id}`}
              className="bouton"
            >
              Ouvrir le capstone
            </Link>
          </section>
        )}
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnteteApp } from "@/components/entete-app";
import { Qcm } from "@/components/qcm";
import { lireModule, sommaireModule, leconsTerminees } from "@/lib/donnees";
import { listerTps } from "@/lib/tp";
import { monQcm } from "@/lib/qcm";
import { formaterDuree } from "@/lib/markdown";
import { formaterDate } from "@/lib/formats";
import { profilCourant } from "@/lib/profil";

type Params = { params: Promise<{ numero: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { numero } = await params;
  const m = await lireModule(Number(numero));
  return { title: m?.titre ?? "Module" };
}

export default async function PageModule({ params }: Params) {
  const { numero } = await params;
  const n = Number(numero);
  if (!Number.isInteger(n)) notFound();

  const profil = await profilCourant();
  const module = await lireModule(n);
  if (!module) notFound();

  const lecons = await sommaireModule(module.id);
  const terminees = await leconsTerminees();
  const tps = (await listerTps(module.id)).filter(
    (t) => t.publie || profil.role === "admin",
  );
  const questions = await monQcm(module.id);

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <Link
          href="/modules"
          className="etiquette mb-6 inline-block hover:text-texte"
        >
          ← Tous les modules
        </Link>

        <p className="etiquette mb-2">Module {module.numero}</p>
        <h1 className="titre-xl m-0 mb-4 text-[clamp(1.8rem,4.4vw,2.6rem)]">
          {module.titre}
        </h1>
        {module.resume && (
          <p className="mb-9 max-w-[34rem] text-[1.04rem] text-texte-2">
            {module.resume}
          </p>
        )}

        {lecons.length === 0 ? (
          <div className="plage px-6 py-5">
            <span className="etiquette mb-2 block">Pas encore de leçon</span>
            <p className="m-0 max-w-[30rem] text-[1.02rem] leading-[1.5]">
              Le contenu de ce module est publié le soir même, juste après le
              direct.
            </p>
            <span className="poignee" aria-hidden="true" />
          </div>
        ) : (
          <ol className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
            {lecons.map((l) => {
              const fait = terminees.has(l.id);
              const corps = (
                <>
                  <span
                    aria-hidden="true"
                    className={`h-[14px] w-[14px] shrink-0 rounded-[2px] border-2 ${
                      fait
                        ? "border-[color:var(--plage-bord)] bg-voltage"
                        : "border-bord"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[1.02rem] font-medium ${l.verrouille ? "text-texte-2" : "text-texte"}`}
                    >
                      {l.titre}
                    </span>
                    {l.verrouille && l.accroche && (
                      <span className="mt-1 block max-w-[32rem] text-[0.9rem] text-texte-3">
                        {l.accroche}
                      </span>
                    )}
                    {l.raison && (
                      <span className="mt-[6px] inline-block rounded-[3px] bg-fond-3 px-2 py-[2px] font-mono text-[9.5px] tracking-[0.12em] text-texte-2 uppercase">
                        {l.raison === "payant"
                          ? "Masterclass"
                          : l.raison === "programmee"
                            ? `En ligne ${formaterDate(l.publie_le)}`
                            : "Brouillon"}
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[11px] whitespace-nowrap tabular-nums text-texte-3">
                    {l.verrouille ? "\u{1F512}" : formaterDuree(l.duree_min)}
                  </span>
                </>
              );

              return (
                <li key={l.id} className="border-b border-bord">
                  {l.verrouille ? (
                    <span className="flex cursor-not-allowed items-center gap-4 py-[18px] opacity-70">
                      {corps}
                    </span>
                  ) : (
                    <Link
                      href={`/modules/${module.numero}/${l.numero}`}
                      className="flex items-center gap-4 py-[18px] transition-colors hover:bg-fond-2"
                    >
                      {corps}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        {lecons.some((l) => l.raison === "payant") && (
          <div className="plage mt-10 px-6 py-5">
            <span className="etiquette mb-2 block">Ces leçons sont fermées</span>
            <p className="m-0 mb-4 max-w-[31rem] text-[1.02rem] leading-[1.5]">
              Elles font partie de la masterclass. Les trois soirées
              t&apos;ont montré des méthodes — celles-ci les installent pour
              de bon, et le certificat avancé est compris.
            </p>
            <Link href="/offres" className="bouton">
              Voir ce que ça contient
            </Link>
            <span className="poignee" aria-hidden="true" />
          </div>
        )}

        {tps.length > 0 && (
          <section className="mt-12 border-t-2 border-texte pt-6">
            <h2 className="titre-l m-0 mb-1 text-[1.4rem]">Le travail pratique</h2>
            <p className="mt-2 mb-5 max-w-[34rem] text-[0.96rem] text-texte-2">
              C&apos;est lui qui compte pour le certificat. Ta copie reçoit une
              note machine immédiate, puis celle de tes pairs.
            </p>
            <ol className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
              {tps.map((t) => (
                <li key={t.id} className="border-b border-bord">
                  <Link
                    href={`/modules/${module.numero}/tp/${t.numero}`}
                    className="flex items-center justify-between gap-4 py-[16px] transition-colors hover:bg-fond-2"
                  >
                    <span className="min-w-0 text-[1.02rem] font-medium text-texte">
                      {t.titre}
                    </span>
                    <span className="font-mono text-[10.5px] tracking-[0.1em] whitespace-nowrap text-texte-3 uppercase">
                      ouvrir →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}
        <Qcm questions={questions} />
      </main>
    </>
  );
}

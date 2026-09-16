import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnteteApp } from "@/components/entete-app";
import { lireModule, listerLecons, leconsTerminees } from "@/lib/donnees";
import { formaterDuree } from "@/lib/markdown";
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

  const toutes = await listerLecons(module.id);
  const lecons = toutes.filter((l) => l.publie || profil.role === "admin");
  const terminees = await leconsTerminees();

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
              return (
                <li key={l.id} className="border-b border-bord">
                  <Link
                    href={`/modules/${module.numero}/${l.numero}`}
                    className="flex items-center gap-4 py-[18px] transition-colors hover:bg-fond-2"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-[14px] w-[14px] shrink-0 rounded-[2px] border-2 ${
                        fait
                          ? "border-[color:var(--plage-bord)] bg-voltage"
                          : "border-bord"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[1.02rem] font-medium text-texte">
                        {l.titre}
                      </span>
                      {!l.publie && (
                        <span className="mt-1 inline-block rounded-[3px] bg-fond-3 px-2 py-[2px] font-mono text-[9.5px] tracking-[0.12em] text-texte-2 uppercase">
                          Brouillon
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[11px] whitespace-nowrap tabular-nums text-texte-3">
                      {formaterDuree(l.duree_min)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </>
  );
}

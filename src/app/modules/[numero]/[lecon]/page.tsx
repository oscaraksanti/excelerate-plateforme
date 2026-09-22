import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Commentaires } from "@/components/commentaires";
import { EnteteApp } from "@/components/entete-app";
import { LecteurVideo } from "@/components/lecteur-video";
import { basculerTerminee } from "@/app/modules/actions";
import {
  adresseRessource,
  enregistrerPassage,
  formaterTaille,
  leconsTerminees,
  lireLecon,
  lireModule,
  filDiscussion,
  sommaireModule,
  listerRessources,
} from "@/lib/donnees";
import { formaterDuree, rendreMarkdown } from "@/lib/markdown";
import { profilCourant } from "@/lib/profil";

type Params = { params: Promise<{ numero: string; lecon: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { numero, lecon } = await params;
  const m = await lireModule(Number(numero));
  if (!m) return { title: "Leçon" };
  const l = await lireLecon(m.id, Number(lecon));
  return { robots: { index: false, follow: false }, title: l?.titre ?? "Leçon" };
}

export default async function PageLecon({ params }: Params) {
  const { numero, lecon } = await params;
  const nModule = Number(numero);
  const nLecon = Number(lecon);
  if (!Number.isInteger(nModule) || !Number.isInteger(nLecon)) notFound();

  const profil = await profilCourant();
  const leModule = await lireModule(nModule);
  if (!leModule) notFound();

  const courante = await lireLecon(leModule.id, nLecon);
  if (!courante) notFound();

  const sommaire = await sommaireModule(leModule.id);
  const ouvrables = sommaire.filter((l) => !l.verrouille);
  const place = ouvrables.findIndex((l) => l.id === courante.id);
  const precedente = place > 0 ? ouvrables[place - 1] : null;
  const suivante =
    place >= 0 && place < ouvrables.length - 1 ? ouvrables[place + 1] : null;

  const [ressources, fils, terminees, dejaTerminee] = await Promise.all([
    listerRessources(courante.id),
    filDiscussion(courante.id),
    leconsTerminees(),
    enregistrerPassage(courante.id),
  ]);

  const chemin = `/modules/${leModule.numero}/${courante.numero}`;
  const corps = rendreMarkdown(courante.corps_md);

  return (
    <>
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-10 px-6 pt-8 pb-24 lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* ── Sommaire du leModule ─────────────────────────────── */}
        <aside className="lg:sticky lg:top-[64px] lg:self-start">
          <Link
            href={`/modules/${leModule.numero}`}
            className="etiquette mb-3 inline-block hover:text-texte"
          >
            ← Module {leModule.numero}
          </Link>
          <p className="titre-m m-0 mb-4 text-[1.02rem]">{leModule.titre}</p>

          <ol className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
            {sommaire.map((l) => {
              const ici = l.id === courante.id;
              const fait = terminees.has(l.id);
              return (
                <li key={l.id}>
                  {l.verrouille ? (
                    <span className="flex cursor-not-allowed items-start gap-[10px] border-b border-l-2 border-bord-2 border-l-transparent py-[11px] pr-2 pl-3 text-[0.9rem] text-texte-3">
                      <span aria-hidden="true" className="mt-[3px] shrink-0 text-[11px]">
                        &#128274;
                      </span>
                      <span className="min-w-0">{l.titre}</span>
                    </span>
                  ) : (
                    <Link
                      href={`/modules/${leModule.numero}/${l.numero}`}
                      aria-current={ici ? "page" : undefined}
                      className={`flex items-start gap-[10px] border-b border-bord-2 py-[11px] pr-2 pl-3 text-[0.9rem] transition-colors ${
                        ici
                          ? "border-l-2 border-l-[color:var(--plage-bord)] bg-fond-2 font-semibold text-texte"
                          : "border-l-2 border-l-transparent text-texte-2 hover:text-texte"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-[5px] h-[10px] w-[10px] shrink-0 rounded-[2px] border-2 ${
                          fait
                            ? "border-[color:var(--plage-bord)] bg-voltage"
                            : "border-bord"
                        }`}
                      />
                      <span className="min-w-0">{l.titre}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </aside>

        {/* ── La leçon ───────────────────────────────────────── */}
        <main className="min-w-0">
          <p className="etiquette mb-2">
            Leçon {courante.numero}
            {courante.duree_min ? ` · ${formaterDuree(courante.duree_min)}` : ""}
          </p>
          <h1 className="titre-l m-0 mb-6 text-[clamp(1.6rem,3.6vw,2.15rem)]">
            {courante.titre}
          </h1>

          {courante.video_source === "youtube" && courante.video_id ? (
            <LecteurVideo videoId={courante.video_id} titre={courante.titre} />
          ) : (
            <div className="rounded-[6px] border border-dashed border-bord bg-fond-2 px-6 py-10 text-center text-[0.95rem] text-texte-3">
              La vidéo de cette leçon sera publiée après le direct.
            </div>
          )}

          {corps && (
            <div
              className="prose-excel mt-9"
              dangerouslySetInnerHTML={{ __html: corps }}
            />
          )}

          {ressources.length > 0 && (
            <section className="mt-10">
              <h2 className="titre-m m-0 mb-4 text-[1.18rem]">
                Les fichiers de la leçon
              </h2>
              <ul className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
                {ressources.map((r) => (
                  <li key={r.id} className="border-b border-bord-2">
                    <a
                      href={adresseRessource(r.chemin)}
                      download
                      className="flex items-center justify-between gap-4 py-[14px] transition-colors hover:bg-fond-2"
                    >
                      <span className="min-w-0 truncate text-[0.97rem] font-medium text-texte">
                        {r.nom}
                      </span>
                      <span className="font-mono text-[10.5px] tracking-[0.1em] whitespace-nowrap text-texte-3 uppercase">
                        {formaterTaille(r.taille_octets)} · télécharger
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Avancement et navigation ─────────────────────── */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-bord pt-6">
            <form action={basculerTerminee}>
              <input type="hidden" name="lecon_id" value={courante.id} />
              <input type="hidden" name="chemin" value={chemin} />
              <input
                type="hidden"
                name="terminee"
                value={dejaTerminee ? "0" : "1"}
              />
              <button
                type="submit"
                className={dejaTerminee ? "bouton-2" : "bouton"}
              >
                {dejaTerminee ? "✓ Terminée — annuler" : "Marquer comme terminée"}
              </button>
            </form>

            <div className="flex items-center gap-3">
              {precedente && (
                <Link
                  href={`/modules/${leModule.numero}/${precedente.numero}`}
                  className="bouton-2"
                >
                  ← Précédente
                </Link>
              )}
              {suivante && (
                <Link
                  href={`/modules/${leModule.numero}/${suivante.numero}`}
                  className="bouton-2"
                >
                  Suivante →
                </Link>
              )}
            </div>
          </div>

          <Commentaires leconId={courante.id} chemin={chemin} fils={fils} />
        </main>
      </div>
    </>
  );
}

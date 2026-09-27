import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InscriptionRapide } from "@/components/inscription-rapide";
import { LecteurVideo } from "@/components/lecteur-video";
import { PiedPage } from "@/components/pied-page";
import { lireLecon, lireModule, sommaireModule } from "@/lib/donnees";
import { formaterDuree, rendreMarkdown } from "@/lib/markdown";
import { SITE } from "@/app/layout";

/* ══════════════════════════════════════════════════════════════════
   Une leçon lisible sans compte.

   Jusqu'ici Google ne connaissait qu'une seule page de ce site :
   l'accueil. Cinquante-cinq leçons écrites et relues n'existaient pour
   personne qui cherche « tableau structuré Excel ».

   Les modules 0 et 1 s'ouvrent, et eux seuls : la base ne rend « libre »
   que ce qui porte ce niveau d'accès. Cette page ne sait rien faire
   d'autre que lire — pas de progression, pas de fil, pas de dépôt.
   Ce qui demande un compte reste derrière le compte.
   ══════════════════════════════════════════════════════════════════ */

export const revalidate = 3600;

type Params = { params: Promise<{ module: string; lecon: string }> };

async function charger(params: Params["params"]) {
  const { module: mod, lecon } = await params;
  const nModule = Number(mod);
  const nLecon = Number(lecon);
  if (!Number.isInteger(nModule) || !Number.isInteger(nLecon)) return null;

  const leModule = await lireModule(nModule);
  if (!leModule) return null;

  const courante = await lireLecon(leModule.id, nLecon);
  if (!courante) return null;

  return { leModule, courante };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const trouve = await charger(params);
  if (!trouve) return { title: "Leçon introuvable", robots: { index: false } };

  const { leModule, courante } = trouve;
  const chemin = `/lecons/${leModule.numero}/${courante.numero}`;

  return {
    title: `${courante.titre} — Excel + IA`,
    description:
      courante.accroche
      || `Leçon ${courante.numero} du module ${leModule.numero} « ${leModule.titre} ». `
        + "Formation Excel + IA d'Oscar Aksanti, à lire gratuitement.",
    alternates: { canonical: chemin },
    //  Ces pages-là ont vocation à être trouvées : c'est toute leur
    //  raison d'être.
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: courante.titre,
      url: `${SITE}${chemin}`,
    },
  };
}

export default async function LeconPublique({ params }: Params) {
  const trouve = await charger(params);
  if (!trouve) notFound();

  const { leModule, courante } = trouve;
  const sommaire = await sommaireModule(leModule.id);
  const libres = sommaire.filter((l) => !l.verrouille);
  const place = libres.findIndex((l) => l.id === courante.id);
  const precedente = place > 0 ? libres[place - 1] : null;
  const suivante =
    place >= 0 && place < libres.length - 1 ? libres[place + 1] : null;

  const corps = rendreMarkdown(courante.corps_md);

  return (
    <>
      <div className="trame" aria-hidden="true" />

      <header className="relative z-1 border-b border-bord">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 px-6 py-[14px]">
          <Link href="/" className="etiquette flex items-center gap-[10px]">
            <i className="h-[7px] w-[7px] rounded-full bg-voltage not-italic" />
            <span>Excelerate IA · Oscar Aksanti</span>
          </Link>
          <Link
            href="/connexion"
            className="font-mono text-[10.5px] tracking-[0.14em] text-texte-3 uppercase hover:text-texte"
          >
            Déjà inscrit ? Se connecter →
          </Link>
        </div>
      </header>

      <div className="relative z-1 mx-auto grid max-w-[1160px] grid-cols-1 gap-10 px-6 pt-8 pb-20 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="etiquette mb-3">Module {leModule.numero}</p>
          <p className="titre-m m-0 mb-4 text-[1.02rem]">{leModule.titre}</p>

          <ol className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
            {libres.map((l) => {
              const ici = l.id === courante.id;
              return (
                <li key={l.id}>
                  <Link
                    href={`/lecons/${leModule.numero}/${l.numero}`}
                    aria-current={ici ? "page" : undefined}
                    className={`flex items-start gap-[10px] border-b border-bord-2 py-[11px] pr-2 pl-3 text-[0.9rem] transition-colors ${
                      ici
                        ? "border-l-2 border-l-[color:var(--plage-bord)] bg-fond-2 font-semibold text-texte"
                        : "border-l-2 border-l-transparent text-texte-2 hover:text-texte"
                    }`}
                  >
                    <span className="min-w-0">{l.titre}</span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <p className="mt-5 text-[0.86rem] leading-[1.5] text-texte-3">
            Les modules 2 et 3 sont gratuits eux aussi — ils demandent
            simplement un compte, comme les travaux pratiques.
          </p>
        </aside>

        <main className="min-w-0">
          <p className="etiquette mb-2">
            Leçon {courante.numero}
            {courante.duree_min ? ` · ${formaterDuree(courante.duree_min)}` : ""}
            {" · en accès libre"}
          </p>
          <h1 className="titre-l m-0 mb-6 text-[clamp(1.6rem,3.6vw,2.15rem)]">
            {courante.titre}
          </h1>

          {courante.video_source === "youtube" && courante.video_id && (
            <LecteurVideo videoId={courante.video_id} titre={courante.titre} />
          )}

          {corps && (
            <div
              className="prose-excel mt-9"
              dangerouslySetInnerHTML={{ __html: corps }}
            />
          )}

          {/* ── Ce qu'on ne peut pas faire ici ──────────────── */}
          <section className="mt-14 border-t-2 border-texte pt-7">
            <p className="etiquette mb-3">La suite</p>
            <h2 className="titre-l m-0 mb-4 text-[1.5rem]">
              Lire ne suffit pas. Il faut le faire.
            </h2>
            <p className="mb-7 max-w-[34rem] text-[1.02rem] leading-[1.6] text-texte-2">
              Cette leçon est en libre accès. Le reste demande un compte —
              gratuit, sans carte bancaire : les{" "}
              <strong className="font-semibold text-texte">
                quatre premiers modules
              </strong>
              , leurs travaux pratiques corrigés automatiquement en quelques
              secondes, les QCM, et la correction entre pairs.
            </p>
            <InscriptionRapide
              suite={`/modules/${leModule.numero}/${courante.numero}`}
              libelle="Créer mon compte — c'est gratuit"
              compact
            />
          </section>

          {/* ── Aller et venir ─────────────────────────────── */}
          {(precedente || suivante) && (
            <nav className="mt-12 flex flex-wrap justify-between gap-4 border-t border-bord pt-6">
              {precedente ? (
                <Link
                  href={`/lecons/${leModule.numero}/${precedente.numero}`}
                  className="max-w-[16rem] text-[0.95rem] text-texte-2 hover:text-texte"
                >
                  ← {precedente.titre}
                </Link>
              ) : (
                <span />
              )}
              {suivante && (
                <Link
                  href={`/lecons/${leModule.numero}/${suivante.numero}`}
                  className="max-w-[16rem] text-right text-[0.95rem] text-texte-2 hover:text-texte"
                >
                  {suivante.titre} →
                </Link>
              )}
            </nav>
          )}
        </main>
      </div>

      <PiedPage />
    </>
  );
}

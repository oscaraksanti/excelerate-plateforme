import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnteteApp } from "@/components/entete-app";
import { GrilleResultat } from "@/components/grille-resultat";
import type { Resultat } from "@/lib/correcteur";
import { adresseRessource, lireModule } from "@/lib/donnees";
import { rendreMarkdown } from "@/lib/markdown";
import { profilCourant } from "@/lib/profil";
import { etatTp, formaterDate, lireTp, maCopie } from "@/lib/tp";
import { DepotCopie } from "./depot";

type Params = { params: Promise<{ numero: string; tp: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { numero, tp } = await params;
  const m = await lireModule(Number(numero));
  if (!m) return { title: "Travail pratique" };
  const t = await lireTp(m.id, Number(tp));
  return { title: t?.titre ?? "Travail pratique" };
}

export default async function PageTp({ params }: Params) {
  const { numero, tp: numTp } = await params;
  const nModule = Number(numero);
  const nTp = Number(numTp);
  if (!Number.isInteger(nModule) || !Number.isInteger(nTp)) notFound();

  const profil = await profilCourant();
  const module = await lireModule(nModule);
  if (!module) notFound();

  const tp = await lireTp(module.id, nTp);
  if (!tp) notFound();

  const copie = await maCopie(tp.id);
  const etat = etatTp(tp);
  const chemin = `/modules/${module.numero}/tp/${tp.numero}`;
  const resultat = copie?.detail_machine as Resultat | null;

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <Link
          href={`/modules/${module.numero}`}
          className="etiquette mb-6 inline-block hover:text-texte"
        >
          ← Module {module.numero} · {module.titre}
        </Link>

        <p className="etiquette mb-2">Travail pratique {tp.numero}</p>
        <h1 className="titre-xl m-0 mb-5 text-[clamp(1.7rem,4.2vw,2.5rem)]">
          {tp.titre}
        </h1>

        {/* ── Les dates ────────────────────────────────────── */}
        <div className="mb-9 flex flex-wrap gap-x-8 gap-y-3 border-y border-bord py-4">
          <span className="flex flex-col gap-1">
            <span className="etiquette">Dépôts</span>
            <span className="text-[0.95rem] text-texte-2">
              {etat === "a_venir"
                ? `ouverts ${formaterDate(tp.ouvre_le)}`
                : etat === "ferme"
                  ? "clos"
                  : tp.ferme_le
                    ? `jusqu'au ${formaterDate(tp.ferme_le)}`
                    : "ouverts"}
            </span>
          </span>
          <span className="flex flex-col gap-1">
            <span className="etiquette">À corriger ensuite</span>
            <span className="text-[0.95rem] text-texte-2">
              {tp.corrections_requises} copies de tes pairs
            </span>
          </span>
          {copie && (
            <span className="flex flex-col gap-1">
              <span className="etiquette">Ta copie</span>
              <span className="text-[0.95rem] text-texte-2">
                déposée {formaterDate(copie.depose_le)}
              </span>
            </span>
          )}
        </div>

        {tp.enonce_md && (
          <div
            className="prose-excel"
            dangerouslySetInnerHTML={{ __html: rendreMarkdown(tp.enonce_md) }}
          />
        )}

        {tp.fichier_depart && (
          <p className="mt-8">
            <a href={adresseRessource(tp.fichier_depart)} download className="bouton-2">
              Télécharger le classeur de départ
            </a>
          </p>
        )}

        {/* ── Le dépôt ─────────────────────────────────────── */}
        <section className="mt-12 border-t-2 border-texte pt-6">
          <h2 className="titre-l m-0 mb-1 text-[1.5rem]">
            {copie ? "Remplacer ta copie" : "Déposer ta copie"}
          </h2>
          <p className="mt-2 mb-6 max-w-[34rem] text-[0.98rem] text-texte-2">
            Un classeur <code className="font-mono text-[0.88em]">.xlsx</code>, 10
            Mo au maximum. Ta note machine s&apos;affiche en quelques secondes
            {copie ? ". Tu peux redéposer autant de fois que tu veux avant la fermeture." : "."}
          </p>

          {etat === "a_venir" ? (
            <p className="m-0 max-w-[34rem] border-l-[3px] border-ambre bg-fond-2 px-4 py-3 text-[0.94rem]">
              Les dépôts ouvrent {formaterDate(tp.ouvre_le)}.
            </p>
          ) : etat === "ferme" ? (
            <p className="m-0 max-w-[34rem] border-l-[3px] border-ambre bg-fond-2 px-4 py-3 text-[0.94rem]">
              Les dépôts sont clos depuis {formaterDate(tp.ferme_le)}.
            </p>
          ) : (
            <DepotCopie
              tpId={tp.id}
              profilId={profil.id}
              cheminPage={chemin}
              dejaDepose={Boolean(copie)}
            />
          )}
        </section>

        {/* ── Le résultat ──────────────────────────────────── */}
        {copie && (
          <section className="mt-14 border-t-2 border-texte pt-6">
            <h2 className="titre-l m-0 mb-1 text-[1.5rem]">Ta correction</h2>
            {resultat?.lignes ? (
              <GrilleResultat resultat={resultat} />
            ) : (
              <p className="mt-4 mb-0 max-w-[34rem] text-[0.96rem] text-texte-2">
                Ta copie est enregistrée. La note apparaîtra ici dès que le
                corrigé sera en ligne.
              </p>
            )}
          </section>
        )}
      </main>
    </>
  );
}

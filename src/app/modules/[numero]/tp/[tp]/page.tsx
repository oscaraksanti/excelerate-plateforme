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
import { corrections_recues, criteresDe, monAvancement, verrouLeve } from "@/lib/pairs";
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
  const avancement = copie ? await monAvancement(tp.id) : null;
  const leve = copie ? await verrouLeve(tp.id) : false;
  const recues = copie && leve ? await corrections_recues(copie.id) : [];
  const criteres = criteresDe(tp.criteres);
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

        {/* ── La correction entre pairs ────────────────────── */}
        {copie && avancement && (
          <section className="mt-14 border-t-2 border-texte pt-6">
            <h2 className="titre-l m-0 mb-1 text-[1.5rem]">La note de tes pairs</h2>

            {!leve ? (
              <>
                <p className="mt-2 mb-6 max-w-[35rem] text-[0.98rem] text-texte-2">
                  Elle s&apos;affichera ici quand tu auras corrigé{" "}
                  <strong className="font-semibold text-texte">
                    {avancement.requises} copies
                  </strong>{" "}
                  de tes pairs. Ce n&apos;est pas une punition : voir comment
                  d&apos;autres ont résolu le même problème apprend souvent plus
                  que sa propre note.
                </p>

                <div className="mb-6 flex items-center gap-4">
                  <div className="h-2 w-full max-w-[22rem] overflow-hidden rounded-[2px] bg-fond-3">
                    <div
                      className="h-full rounded-[2px] bg-[color:var(--voltage-2)]"
                      style={{
                        width: `${Math.min(100, Math.round((avancement.faites / Math.max(1, avancement.requises)) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[11.5px] tabular-nums whitespace-nowrap text-texte-2">
                    {avancement.faites} / {avancement.requises}
                  </span>
                </div>

                <Link href="/corrections" className="bouton">
                  {avancement.faites === 0
                    ? "Commencer à corriger"
                    : "Continuer mes corrections"}
                </Link>
              </>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
                  <div className="plage px-6 py-5">
                    <span className="etiquette mb-2 block">Note finale</span>
                    <span className="titre-xl block text-[3rem] tabular-nums">
                      {copie.note_finale !== null
                        ? String(copie.note_finale).replace(".", ",")
                        : "—"}
                      <span className="text-[1.3rem] text-texte-2">/20</span>
                    </span>
                    <span className="mt-[10px] block font-mono text-[11.5px] tabular-nums text-texte-2">
                      60 % machine · 40 % pairs
                    </span>
                    <span className="poignee" aria-hidden="true" />
                  </div>

                  <div className="flex flex-col gap-3 font-mono text-[12.5px] tabular-nums text-texte-2">
                    <span>
                      machine :{" "}
                      <span className="text-texte">
                        {copie.note_machine !== null
                          ? String(copie.note_machine).replace(".", ",")
                          : "—"}{" "}
                        / 20
                      </span>
                    </span>
                    <span>
                      pairs (médiane) :{" "}
                      <span className="text-texte">
                        {copie.note_pairs !== null
                          ? String(copie.note_pairs).replace(".", ",")
                          : "en attente d'une deuxième correction"}{" "}
                        {copie.note_pairs !== null ? "/ 20" : ""}
                      </span>
                    </span>
                    <span>
                      corrections reçues :{" "}
                      <span className="text-texte">{recues.length}</span>
                    </span>
                  </div>
                </div>

                {recues.length > 0 && (
                  <ol className="m-0 mt-9 flex list-none flex-col gap-0 border-t border-bord p-0">
                    {recues.map((c, i) => (
                      <li key={c.id} className="border-b border-bord py-6">
                        <div className="mb-3 flex items-baseline justify-between gap-3">
                          <span className="etiquette">Correcteur {i + 1}</span>
                          <span className="font-mono text-[12px] tabular-nums text-texte">
                            {c.total} / 20
                          </span>
                        </div>
                        {criteres.length > 0 && (
                          <ul className="m-0 mb-4 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
                            {criteres.map((cr) => (
                              <li
                                key={cr.cle}
                                className="font-mono text-[11px] text-texte-2"
                              >
                                {cr.titre.replace(/^L[ae'] /i, "")} :{" "}
                                <span className="text-texte">
                                  {c.notes?.[cr.cle] ?? "—"}/4
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {c.commentaire && (
                          <p className="m-0 max-w-[36rem] text-[0.96rem] whitespace-pre-wrap text-texte-2">
                            {c.commentaire}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </>
            )}
          </section>
        )}

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

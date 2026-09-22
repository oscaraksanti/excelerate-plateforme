import type { Metadata } from "next";
import Link from "next/link";
import { EnteteApp } from "@/components/entete-app";
import { profilCourant } from "@/lib/profil";
import { listerModules, sommaireModule, leconsTerminees } from "@/lib/donnees";
import { aVenir, formaterOuverture, nomComplet } from "@/lib/formats";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Tableau de bord" };

/* Les directs se tiennent a 19 h GMT. Ces trois lignes sont la seule
   traduction qui compte pour la promotion : trois fuseaux, six agences. */
const FUSEAUX = [
  ["19 h – 21 h", "Abidjan · Dakar · Bamako", "GMT"],
  ["20 h – 22 h", "Kinshasa · Douala · Libreville · Lagos", "GMT+1"],
  ["21 h – 23 h", "Lubumbashi · Kigali · Johannesburg", "GMT+2"],
];

export default async function TableauDeBord() {
  const profil = await profilCourant();
  const prenom = profil.nom.split(" ")[0];

  const modules = await listerModules();
  const terminees = await leconsTerminees();

  //  On ne compte que ce que la personne peut reellement ouvrir : un
  //  module verrouille n'a pas a peser dans son avancement.
  const parModule = await Promise.all(
    modules.map(async (m) => {
      const lecons = await sommaireModule(m.id);
      const ouvrables = lecons.filter((l) => !l.verrouille);
      const faites = ouvrables.filter((l) => terminees.has(l.id));
      const suivante = ouvrables.find((l) => !terminees.has(l.id));
      return { module: m, total: ouvrables.length, faites: faites.length, suivante };
    }),
  );

  //  Le prochain module a s'ouvrir. Quelqu'un qui termine le module 0
  //  pendant le direct ne doit pas tomber sur « reprends-en une » : il
  //  doit savoir quand revenir, et c'est ce moment-la qui decide s'il
  //  revient.
  const prochaineOuverture = modules
    .filter((m) => aVenir(m.publie_le))
    .sort((a, b) => String(a.publie_le).localeCompare(String(b.publie_le)))[0];

  const total = parModule.reduce((s, x) => s + x.total, 0);
  const faites = parModule.reduce((s, x) => s + x.faites, 0);
  const prochain = parModule.find((x) => x.suivante);
  const pourcent = total ? Math.round((faites / total) * 100) : 0;

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <h1 className="titre-xl m-0 mb-5 text-[clamp(1.9rem,4.6vw,2.8rem)]">
          {prenom ? `Bonjour ${prenom}.` : "Ton espace."}
        </h1>

        {/*  Sur les 654 premiers comptes, 516 n'avaient pas de nom
            utilisable. Corriger le formulaire d'inscription ne répare
            que les suivants : ceux-là, il faut aller les chercher, et
            avant qu'ils ne demandent leur certificat — pas après. */}
        {!nomComplet(profil.nom) && (
          <div className="plage mb-9 px-6 py-5">
            <span className="etiquette mb-2 block">
              Ton certificat n&apos;a pas encore de nom
            </span>
            <p className="m-0 mb-4 max-w-[33rem] text-[1.02rem] leading-[1.5]">
              {profil.nom.trim() ? (
                <>
                  Il porterait{" "}
                  <strong className="font-semibold text-texte">
                    « {profil.nom.trim()} »
                  </strong>
                  , ce qui ne désigne personne devant un employeur.
                </>
              ) : (
                <>
                  Il sortirait <strong className="font-semibold text-texte">sans nom</strong>.
                </>
              )}{" "}
              Écris ton <strong className="font-semibold text-texte">prénom et ton nom</strong>{" "}
              — c&apos;est exactement ce qui sera imprimé, et ça prend dix secondes.
            </p>
            <Link href="/profil" className="bouton">
              Compléter mon nom
            </Link>
            <span className="poignee" aria-hidden="true" />
          </div>
        )}

        {prochain?.suivante ? (
          <>
            <p className="mb-7 max-w-[33rem] text-[1.06rem] text-texte-2">
              {faites === 0 ? (
                <>
                  Commence par le{" "}
                  <strong className="font-semibold text-texte">module 0</strong>{" "}
                  : il te dit où tu en es et règle ta machine.
                </>
              ) : (
                <>
                  Tu as terminé{" "}
                  <strong className="font-semibold text-texte">
                    {faites} leçon{faites > 1 ? "s" : ""} sur {total}
                  </strong>
                  . Reprends où tu t&apos;es arrêté.
                </>
              )}
            </p>

            <div className="mb-8 max-w-[33rem]">
              <div
                className="h-[6px] w-full overflow-hidden rounded-full bg-fond-3"
                role="img"
                aria-label={`${pourcent} % du programme ouvert`}
              >
                <div
                  className="h-full rounded-full bg-voltage"
                  style={{ width: `${Math.max(pourcent, faites ? 3 : 0)}%` }}
                />
              </div>
              <p className="mt-2 mb-0 font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase">
                {pourcent} % · {faites} / {total} leçons
              </p>
            </div>

            <p className="mb-12">
              <Link
                href={`/modules/${prochain.module.numero}/${prochain.suivante.numero}`}
                className="bouton"
              >
                {faites === 0 ? "Commencer la première leçon" : "Continuer"} —{" "}
                {prochain.module.numero}.{prochain.suivante.numero}{" "}
                {prochain.suivante.titre}
              </Link>
            </p>
          </>
        ) : (
          <p className="mb-12 max-w-[33rem] text-[1.06rem] text-texte-2">
            Tu as terminé toutes les leçons ouvertes.{" "}
            {prochaineOuverture ? (
              <>
                Le{" "}
                <strong className="font-semibold text-texte">
                  module {prochaineOuverture.numero}
                </strong>{" "}
                s&apos;ouvre{" "}
                <strong className="font-semibold text-texte">
                  {formaterOuverture(prochaineOuverture.publie_le)}
                </strong>
                , juste après le direct. D&apos;ici là tu peux{" "}
                <Link href="/modules" className="underline underline-offset-4">
                  voir ce qui t&apos;attend
                </Link>
                .
              </>
            ) : (
              <>
                <Link href="/modules" className="underline underline-offset-4">
                  Reprends-en une
                </Link>{" "}
                quand tu veux — rien n&apos;expire.
              </>
            )}
          </p>
        )}

        {/* ── Les directs ───────────────────────────────────── */}
        <section className="border-t-2 border-texte pt-5">
          <h2 className="titre-l m-0 text-[1.35rem]">Les directs</h2>
          <p className="mt-3 mb-6 max-w-[33rem] text-[0.98rem] text-texte-2">
            Sur Microsoft Teams, de{" "}
            <strong className="font-semibold text-texte">19 h à 21 h GMT</strong>.
            Le lien apparaît en haut de la page dès qu&apos;un direct approche.
          </p>
          <ul className="m-0 flex max-w-[33rem] list-none flex-col gap-0 border-t border-bord p-0">
            {FUSEAUX.map(([heure, villes, zone]) => (
              <li
                key={zone}
                className="grid grid-cols-[92px_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-bord-2 py-[13px]"
              >
                <span className="font-mono text-[0.95rem] tabular-nums text-texte">
                  {heure}
                </span>
                <span className="text-[0.95rem] text-texte-2">{villes}</span>
                <span className="font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase">
                  {zone}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 mb-0 max-w-[33rem] text-[0.92rem] text-texte-3">
            Tu n&apos;es pas obligé d&apos;y être : tout le programme se suit en
            autonomie.
          </p>
        </section>

        {!profil.nom && (
          <div className="plage mt-12 px-6 py-5">
            <span className="etiquette mb-2 block">Une minute à prendre</span>
            <p className="m-0 mb-4 max-w-[30rem] text-[1.02rem] leading-[1.5]">
              Ton nom servira à établir ton certificat. Autant qu&apos;il soit
              écrit correctement dès maintenant.
            </p>
            <Link href="/profil" className="bouton">
              Compléter mon profil
            </Link>
            <span className="poignee" aria-hidden="true" />
          </div>
        )}
      </main>
    </>
  );
}

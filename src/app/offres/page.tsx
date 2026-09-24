import type { Metadata } from "next";
import Link from "next/link";
import { EnteteApp } from "@/components/entete-app";
import { PiedPage } from "@/components/pied-page";
import { lienAppel } from "@/lib/appel";
import { certificatMerite, listerProduits, mesAchats, mesConditions } from "@/lib/offres";
import { placesBonus } from "@/lib/places";
import { profilCourant } from "@/lib/profil";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Aller plus loin" };

export default async function PageOffres() {
  const profil = await profilCourant();
  const [produits, conditions, achats] = await Promise.all([
    listerProduits(),
    mesConditions(),
    mesAchats(),
  ]);

  const places = await placesBonus();
  const dansLeCercle = achats.some((a) => a.produit === "coaching97");
  //  Un courriel se perd. Le lien doit exister quelque part où l'on
  //  peut toujours revenir.
  const appel = dansLeCercle ? await lienAppel() : null;
  const visibles = produits.filter((p) => p.actif || profil.role === "admin");
  const dejaAchete = new Set(achats.map((a) => a.produit));
  const merite = certificatMerite(conditions);

  const lignes = [
    {
      titre: "Travaux pratiques rendus",
      fait: conditions.tps_rendus,
      total: conditions.tps_total,
    },
    {
      titre: "Copies corrigées",
      fait: conditions.corrections,
      total: conditions.corrections_dues,
    },
    {
      titre: "Moyenne d'au moins 12 / 20",
      fait: (conditions.moyenne ?? 0) >= 12 ? 1 : 0,
      total: 1,
      valeur: conditions.moyenne !== null ? `${String(conditions.moyenne).replace(".", ",")} / 20` : "—",
    },
  ];

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <h1 className="titre-xl m-0 mb-4 text-[clamp(1.9rem,4.6vw,2.7rem)]">
          Aller plus loin
        </h1>
        <p className="mb-10 max-w-[35rem] text-[1.06rem] text-texte-2">
          Les trois soirées t&apos;ont montré des méthodes. La suite les
          installe pour de bon — et te donne de quoi le prouver.
        </p>

        {/* ── Le rendez-vous du cercle ─────────────────────── */}
        {appel && (
          <section className="mb-14">
            <div className="plage px-6 py-5">
              <span className="etiquette mb-2 block">Ton appel privé</span>
              <p className="m-0 mb-5 max-w-[34rem] text-[1.02rem] leading-[1.5]">
                Trente minutes en tête à tête avec Oscar, comprises dans le
                cercle. Viens avec un fichier réel — un vrai classeur de ton
                travail, même en désordre. On part de là plutôt que d&apos;un
                cas d&apos;école.
              </p>
              <a
                href={appel}
                target="_blank"
                rel="noreferrer"
                className="bouton"
              >
                Choisir mon créneau
              </a>
              <span className="poignee" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── Les conditions du certificat ─────────────────── */}
        <section className="mb-14">
          <h2 className="titre-l m-0 mb-1 text-[1.4rem]">
            Où tu en es du certificat
          </h2>
          <p className="mt-2 mb-6 max-w-[35rem] text-[0.97rem] text-texte-2">
            Un certificat qui se mérite se vend ; un certificat qu&apos;on
            achète ne vaut rien. Trois conditions, les mêmes pour tout le monde.
          </p>

          <ol className="m-0 flex max-w-[35rem] list-none flex-col gap-0 border-t border-bord p-0">
            {lignes.map((l) => {
              const fini = l.total > 0 && l.fait >= l.total;
              return (
                <li
                  key={l.titre}
                  className="flex items-center gap-3 border-b border-bord-2 py-[14px]"
                >
                  <span
                    aria-hidden="true"
                    className={`h-[14px] w-[14px] shrink-0 rounded-[2px] border-2 ${
                      fini ? "border-[color:var(--plage-bord)] bg-voltage" : "border-bord"
                    }`}
                  />
                  <span className={`flex-1 text-[0.98rem] ${fini ? "text-texte" : "text-texte-2"}`}>
                    {l.titre}
                  </span>
                  <span className="font-mono text-[11.5px] tabular-nums whitespace-nowrap text-texte-2">
                    {l.valeur ?? `${l.fait} / ${l.total}`}
                  </span>
                </li>
              );
            })}
          </ol>

          {merite && (
            <p className="mt-5 mb-0 max-w-[35rem] border-l-[3px] border-[color:var(--voltage-2)] bg-fond-2 px-4 py-3 text-[0.96rem]">
              Tu remplis les trois conditions. Ton certificat est acquis.
            </p>
          )}
        </section>

        {/* ── Le mur d'offres ──────────────────────────────── */}
        <section className="border-t-2 border-texte pt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((p) => {
              const possede = dejaAchete.has(p.produit);
              return (
                <article
                  key={p.ref}
                  className={`flex flex-col rounded-[10px] p-6 ${
                    p.phare
                      ? "border-2 border-[color:var(--plage-bord)] bg-[color:var(--plage-fond)]"
                      : "border border-bord bg-fond"
                  }`}
                >
                  {p.phare && (
                    <span className="etiquette mb-3 text-accent-texte">
                      Le plus pris
                    </span>
                  )}
                  {!p.actif && (
                    <span className="etiquette mb-3 text-ambre-texte">
                      Inactif — visible par toi seul
                    </span>
                  )}

                  <span className="titre-xl block text-[2rem] tabular-nums">
                    {p.montant !== null ? `${p.montant} $` : "Sur devis"}
                  </span>

                  <h3 className="titre-m mt-4 mb-2 text-[1.08rem]">{p.titre}</h3>
                  <p className="m-0 mb-3 text-[0.95rem] font-medium text-texte">
                    {p.accroche}
                  </p>
                  <p className="m-0 mb-6 flex-1 text-[0.92rem] text-texte-2">
                    {p.detail}
                  </p>

                  {possede ? (
                    <span className="bouton-2 cursor-default text-center">
                      Déjà à toi
                    </span>
                  ) : p.lien ? (
                    //  On passe par notre propre page : le paiement s'y
                    //  affiche dans la plateforme, pré-rempli avec
                    //  l'adresse du compte. Le lien Chariow reste stocké,
                    //  il sert à déduire la boutique.
                    <Link
                      href={`/offres/payer/${p.ref}`}
                      className={p.phare ? "bouton" : "bouton-2"}
                    >
                      {p.montant === 37 ? "Prendre la masterclass" : "Choisir cette offre"}
                    </Link>
                  ) : (
                    <a href="mailto:oscaraksanti@gmail.com" className="bouton-2">
                      Écrire à Oscar
                    </a>
                  )}
                </article>
              );
            })}
          </div>

          {profil.email && (
            <p className="mt-7 max-w-[35rem] border-l-[3px] border-[color:var(--voltage-2)] bg-fond-2 px-4 py-3 text-[0.95rem] leading-[1.5] text-texte">
              Au moment de payer, utilisez cette adresse :{" "}
              <strong className="font-semibold break-all">{profil.email}</strong>.
              C&apos;est elle qui ouvre vos accès, automatiquement. Avec une
              autre, il faudra nous écrire — ça se répare, mais ça prend du
              temps que vous n&apos;avez pas envie de perdre.
            </p>
          )}

          {places && places.restantes > 0 && (
            <p className="mt-5 max-w-[35rem] text-[0.95rem] leading-[1.5] text-texte-2">
              <strong className="font-semibold text-texte">
                {places.prises === 0
                  ? `Les ${places.total} premières places`
                  : `Il reste ${places.restantes} place${places.restantes > 1 ? "s" : ""} sur ${places.total}`}
              </strong>{" "}
              : Oscar relit personnellement le projet final des{" "}
              {places.total} premiers acheteurs, et ils passent en premier dans
              les directs.
            </p>
          )}

          {/* ── Équipe et entreprise : pas un produit, une conversation ── */}
          <div className="plage mt-9 px-6 py-5">
            <span className="etiquette mb-2 block">Pour une équipe</span>
            <p className="m-0 mb-4 max-w-[33rem] text-[1.02rem] leading-[1.5]">
              Former plusieurs personnes d&apos;une même structure ne se règle
              pas avec un bouton : le programme se construit sur vos fichiers
              et vos chiffres à vous. Écrivez à Oscar, il répond lui-même.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/243971601855?text=Bonjour%20Oscar%2C%20je%20souhaite%20un%20programme%20pour%20mon%20%C3%A9quipe."
                target="_blank"
                rel="noopener noreferrer"
                className="bouton"
              >
                Écrire sur WhatsApp
              </a>
              <a
                href="mailto:oscaraksanti@gmail.com?subject=Programme%20pour%20une%20%C3%A9quipe"
                className="bouton-2"
              >
                Par courriel
              </a>
            </div>
            <span className="poignee" aria-hidden="true" />
          </div>

          <p className="mt-9 max-w-[35rem] text-[0.92rem] text-texte-3">
            Le paiement passe par Chariow, en mobile money ou par carte. Ton
            accès s&apos;ouvre tout seul, en quelques secondes.{" "}
            <Link
              href="/offres/acces"
              className="underline decoration-[color:var(--voltage-2)] underline-offset-[3px] hover:text-texte-2"
            >
              Tu as payé et rien ne s&apos;est ouvert ?
            </Link>
          </p>
        </section>
      </main>

      <PiedPage />
    </>
  );
}

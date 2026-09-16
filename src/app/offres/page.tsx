import type { Metadata } from "next";
import Link from "next/link";
import { EnteteApp } from "@/components/entete-app";
import { certificatMerite, listerProduits, mesAchats, mesConditions } from "@/lib/offres";
import { profilCourant } from "@/lib/profil";

export const metadata: Metadata = { title: "Aller plus loin" };

export default async function PageOffres() {
  const profil = await profilCourant();
  const [produits, conditions, achats] = await Promise.all([
    listerProduits(),
    mesConditions(),
    mesAchats(),
  ]);

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
                    <a href={p.lien} className={p.phare ? "bouton" : "bouton-2"}>
                      {p.montant === 37 ? "Prendre la masterclass" : "Choisir cette offre"}
                    </a>
                  ) : (
                    <a href="mailto:oscaraksanti@gmail.com" className="bouton-2">
                      Écrire à Oscar
                    </a>
                  )}
                </article>
              );
            })}
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
    </>
  );
}

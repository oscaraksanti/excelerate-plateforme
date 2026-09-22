import type { Metadata } from "next";
import Link from "next/link";
import { EnteteApp } from "@/components/entete-app";
import { AttenteConfirmation } from "@/components/attente-confirmation";
import { achatRecent, listerProduits } from "@/lib/offres";
import { profilCourant } from "@/lib/profil";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Merci",
};

//  Rien ne se met en cache ici : la page existe pour voir arriver une
//  ligne dans la base, seconde après seconde.
export const dynamic = "force-dynamic";

export default async function PageMerci() {
  const profil = await profilCourant();
  const [recent, produits] = await Promise.all([achatRecent(), listerProduits()]);

  const offre = recent
    ? produits.find((p) => p.produit === recent.produit)
    : undefined;

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[680px] px-6 pt-12 pb-24">
        {recent ? (
          <>
            <p className="etiquette mb-2">Paiement reçu</p>
            <h1 className="titre-xl m-0 mb-5 text-[clamp(1.8rem,4.4vw,2.5rem)]">
              C&apos;est réglé. Tout est ouvert.
            </h1>

            <div className="plage mb-8 px-6 py-5">
              <p className="m-0 mb-3 max-w-[32rem] text-[1.04rem] leading-[1.55]">
                Ton paiement de{" "}
                <strong className="font-semibold text-texte">
                  {recent.montant} $
                </strong>{" "}
                pour{" "}
                <strong className="font-semibold text-texte">
                  {offre?.titre ?? "ton offre"}
                </strong>{" "}
                est enregistré, et tes accès sont ouverts à l&apos;instant.
              </p>
              <p className="m-0 text-[0.98rem] leading-[1.55] text-texte-2">
                Un courriel de confirmation vient de partir à{" "}
                <strong className="font-semibold text-texte">
                  {profil.email}
                </strong>
                . Il rappelle ce qui t&apos;appartient et les conditions du
                certificat — garde-le.
              </p>
              <span className="poignee" aria-hidden="true" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/modules" className="bouton">
                Commencer maintenant
              </Link>
              <Link href="/tableau-de-bord" className="bouton-2">
                Mon tableau de bord
              </Link>
            </div>

            <p className="mt-9 max-w-[33rem] text-[0.93rem] leading-[1.55] text-texte-3">
              Le certificat ne s&apos;achète pas, il se mérite : tous les
              travaux pratiques rendus, toutes les corrections de tes pairs
              effectuées, et une moyenne d&apos;au moins 12 sur 20.
            </p>
          </>
        ) : (
          <>
            <p className="etiquette mb-2">Paiement</p>
            <h1 className="titre-xl m-0 mb-6 text-[clamp(1.8rem,4.4vw,2.5rem)]">
              Encore un instant.
            </h1>
            <AttenteConfirmation email={profil.email ?? ""} />
          </>
        )}
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { EnteteApp } from "@/components/entete-app";
import { profilCourant } from "@/lib/profil";
import { FormulaireAcces } from "./formulaire";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Retrouver mon paiement" };

export default async function PageAcces() {
  const profil = await profilCourant();

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <Link href="/offres" className="etiquette mb-6 inline-block hover:text-texte">
          ← Les offres
        </Link>

        <h1 className="titre-xl m-0 mb-4 text-[clamp(1.8rem,4.4vw,2.5rem)]">
          Tu as payé, rien ne s&apos;est ouvert
        </h1>
        <p className="mb-9 max-w-[33rem] text-[1.04rem] text-texte-2">
          C&apos;est presque toujours la même raison : tu as payé avec une
          adresse différente de celle de ton compte. Donne-moi les deux
          éléments de ton reçu et je rattache ça tout de suite.
        </p>

        <FormulaireAcces emailCompte={profil.email} />
      </main>
    </>
  );
}

import type { Metadata } from "next";
import { EnteteApp } from "@/components/entete-app";
import { profilCourant } from "@/lib/profil";
import { FormulaireProfil } from "./formulaire";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Mon profil" };

export default async function PageProfil() {
  const profil = await profilCourant();

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <h1 className="titre-xl m-0 mb-5 text-[clamp(1.9rem,4.6vw,2.6rem)]">
          Mon profil
        </h1>
        <p className="mb-9 max-w-[30rem] text-[1.04rem] text-texte-2">
          Deux champs, et c&apos;est tout ce qu&apos;on te demandera.
        </p>

        <FormulaireProfil
          nom={profil.nom}
          telephone={profil.telephone}
          email={profil.email}
        />
      </main>
    </>
  );
}

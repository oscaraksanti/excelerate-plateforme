import type { Metadata } from "next";
import { lireAppel } from "@/lib/appel";
import { lireDirect } from "@/lib/direct";
import { FormulaireAppel } from "./appel";
import { FormulaireDirect } from "./formulaire";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Réglages" };

export default async function PageReglages() {
  const direct = await lireDirect();
  const appel = await lireAppel();

  return (
    <>
      <h1 className="titre-xl m-0 mb-2 text-[clamp(1.7rem,4vw,2.4rem)]">
        Réglages
      </h1>
      <p className="mb-9 max-w-[34rem] text-[1.01rem] text-texte-2">
        Le bandeau du direct est la première chose que 1 700 personnes
        chercheront à 19 h GMT. C&apos;est ici qu&apos;il se pilote.
      </p>

      <section className="border-t-2 border-texte pt-6">
        <h2 className="titre-l m-0 mb-5 text-[1.35rem]">Le direct</h2>
        <FormulaireDirect direct={direct} />
      </section>

      <section className="mt-14 border-t-2 border-texte pt-6">
        <h2 className="titre-l m-0 mb-1 text-[1.35rem]">L&apos;appel du cercle</h2>
        <p className="mt-2 mb-6 max-w-[34rem] text-[0.96rem] text-texte-2">
          Quelqu&apos;un qui règle 97 $ n&apos;achète pas sept modules de plus :
          il achète du temps avec toi. Sans ce lien, il n&apos;a aucun moyen de
          le prendre.
        </p>
        <FormulaireAppel appel={appel} />
      </section>
    </>
  );
}

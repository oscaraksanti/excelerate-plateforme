import type { Metadata } from "next";
import { lireDirect } from "@/lib/direct";
import { FormulaireDirect } from "./formulaire";

export const metadata: Metadata = { title: "Réglages" };

export default async function PageReglages() {
  const direct = await lireDirect();

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
    </>
  );
}

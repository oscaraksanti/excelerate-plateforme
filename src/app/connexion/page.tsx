import type { Metadata } from "next";
import Link from "next/link";
import { FormulaireConnexion } from "./formulaire";

export const metadata: Metadata = { title: "Connexion" };

export default async function PageConnexion({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string; probleme?: string }>;
}) {
  const { suite, probleme } = await searchParams;
  const destination =
    suite && suite.startsWith("/") && !suite.startsWith("//")
      ? suite
      : "/tableau-de-bord";

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-16 pb-24">
        <Link href="/" className="etiquette mb-10 flex items-center gap-[10px]">
          <i className="h-[7px] w-[7px] rounded-full bg-voltage not-italic" />
          <span>Excelerate IA</span>
        </Link>

        <h1 className="titre-xl m-0 mb-5 text-[clamp(2rem,5vw,3rem)]">
          Se connecter
        </h1>
        <p className="mb-9 max-w-[30rem] text-[1.08rem] text-texte-2">
          Ton compte existe déjà si tu t&apos;es inscrit à l&apos;atelier. Entre
          la même adresse et tu recevras ton lien.
        </p>

        <FormulaireConnexion suite={destination} probleme={probleme} />
      </main>
    </>
  );
}

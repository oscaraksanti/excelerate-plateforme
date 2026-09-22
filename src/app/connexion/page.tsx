import type { Metadata } from "next";
import Link from "next/link";
import { FormulaireConnexion } from "./formulaire";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Connexion" };

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
          Accéder à la formation
        </h1>
        <p className="mb-9 max-w-[30rem] text-[1.08rem] text-texte-2">
          Ton nom, ton adresse, et tu reçois un lien pour entrer — c&apos;est
          tout. Si tu t&apos;es déjà inscrit à l&apos;atelier, mets la même
          adresse : ton compte est déjà là et tu le retrouves.
        </p>

        <FormulaireConnexion suite={destination} probleme={probleme} />
      </main>
    </>
  );
}

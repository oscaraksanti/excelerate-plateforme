import Link from "next/link";

const PAGES = [
  { href: "/mentions-legales", libelle: "Mentions légales" },
  { href: "/confidentialite", libelle: "Données personnelles" },
  { href: "/cgv", libelle: "Conditions de vente" },
];

export default function DispositionLegale({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="trame" aria-hidden="true" />

      <div className="relative z-1 mx-auto max-w-[900px] px-6 pt-12 pb-24">
        <Link href="/" className="etiquette mb-10 flex w-fit items-center gap-[10px]">
          <i className="h-[7px] w-[7px] rounded-full bg-voltage not-italic" />
          <span>Excelerate IA</span>
        </Link>

        <main className="legal">{children}</main>

        <nav className="mt-16 flex flex-wrap gap-x-7 gap-y-2 border-t border-bord pt-6">
          {PAGES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="font-mono text-[10.5px] tracking-[0.12em] text-texte-3 uppercase hover:text-texte"
            >
              {p.libelle}
            </Link>
          ))}
          <Link
            href="/"
            className="font-mono text-[10.5px] tracking-[0.12em] text-texte-3 uppercase hover:text-texte"
          >
            Accueil
          </Link>
        </nav>
      </div>
    </>
  );
}

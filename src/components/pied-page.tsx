import Link from "next/link";

/** Le pied de page public : les liens légaux, et rien d'autre. */
export function PiedPage() {
  return (
    <footer className="relative z-1 mt-20 border-t border-bord">
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-4 px-6 py-6">
        <p className="etiquette m-0">
          Eurêka Services · Oscar Aksanti · RCCM CD/BKV/RCCM/21-A-00483
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            ["/mentions-legales", "Mentions légales"],
            ["/confidentialite", "Données personnelles"],
            ["/cgv", "Conditions de vente"],
          ].map(([href, libelle]) => (
            <Link
              key={href}
              href={href}
              className="font-mono text-[10.5px] tracking-[0.12em] text-texte-3 uppercase hover:text-texte"
            >
              {libelle}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

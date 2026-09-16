import Link from "next/link";

export function EnteteApp({ nom, admin }: { nom: string; admin: boolean }) {
  return (
    <header className="sticky top-0 z-10 border-b border-bord bg-fond/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-4 px-6 py-[14px]">
        <Link
          href="/tableau-de-bord"
          className="etiquette flex items-center gap-[10px]"
        >
          <i className="h-[7px] w-[7px] rounded-full bg-voltage not-italic" />
          <span>Excelerate IA</span>
        </Link>

        <nav className="flex items-center gap-5 font-mono text-[11px] tracking-[0.12em] text-texte-2 uppercase">
          <Link href="/modules" className="hover:text-texte">
            Modules
          </Link>
          <Link href="/corrections" className="hover:text-texte">
            Corriger
          </Link>
          <Link href="/offres" className="hover:text-texte">
            Offres
          </Link>
          {admin && (
            <Link href="/admin" className="hover:text-texte">
              Admin
            </Link>
          )}
          <Link href="/profil" className="hover:text-texte">
            {nom || "Profil"}
          </Link>
          <form action="/deconnexion" method="post">
            <button
              type="submit"
              className="cursor-pointer font-mono text-[11px] tracking-[0.12em] text-texte-3 uppercase hover:text-texte"
            >
              Sortir
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}

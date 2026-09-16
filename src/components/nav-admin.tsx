"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/admin", libelle: "Tableau de bord", exact: true },
  { href: "/admin/contenu", libelle: "Contenu" },
  { href: "/admin/apprenants", libelle: "Apprenants" },
  { href: "/admin/import", libelle: "Import" },
  { href: "/admin/achats", libelle: "Ventes" },
  { href: "/admin/certificats", libelle: "Certificats" },
  { href: "/admin/reglages", libelle: "Réglages" },
];

export function NavAdmin() {
  const ici = usePathname();

  return (
    <nav aria-label="Administration" className="lg:sticky lg:top-[64px] lg:self-start">
      <p className="etiquette mb-3">Administration</p>
      <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 lg:flex-col lg:gap-0 lg:overflow-visible">
        {SECTIONS.map((s) => {
          const actif = s.exact
            ? ici === s.href
            : ici === s.href || ici.startsWith(`${s.href}/`);
          return (
            <li key={s.href} className="shrink-0">
              <Link
                href={s.href}
                aria-current={actif ? "page" : undefined}
                className={`block rounded-[6px] px-[11px] py-[8px] text-[0.93rem] whitespace-nowrap transition-colors lg:rounded-none lg:border-l-2 lg:px-3 ${
                  actif
                    ? "bg-fond-2 font-semibold text-texte lg:border-l-[color:var(--plage-bord)]"
                    : "text-texte-2 hover:text-texte lg:border-l-transparent"
                }`}
              >
                {s.libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

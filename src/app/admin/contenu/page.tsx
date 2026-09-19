import type { Metadata } from "next";
import Link from "next/link";
import { listerLecons, listerModules } from "@/lib/donnees";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Le contenu" };

export default async function PageAdmin() {
  const modules = await listerModules();

  const lignes = await Promise.all(
    modules.map(async (m) => {
      const lecons = await listerLecons(m.id);
      return {
        m,
        total: lecons.length,
        publiees: lecons.filter((l) => l.publie).length,
      };
    }),
  );

  return (
    <>
        <h1 className="titre-xl m-0 mb-4 text-[clamp(1.9rem,4.6vw,2.7rem)]">
          Le contenu
        </h1>
        <p className="mb-9 max-w-[34rem] text-[1.02rem] text-texte-2">
          Un module reste invisible tant qu&apos;il est en brouillon, et une
          leçon en brouillon l&apos;est aussi — même dans un module publié. Rien
          ne part avant que tu ne le décides.
        </p>

        <ol className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
          {lignes.map(({ m, total, publiees }) => (
            <li key={m.id} className="border-b border-bord">
              <Link
                href={`/admin/modules/${m.id}`}
                className="grid grid-cols-1 items-baseline gap-x-5 gap-y-2 py-[18px] transition-colors hover:bg-fond-2 sm:grid-cols-[76px_minmax(0,1fr)_auto]"
              >
                <span className="font-mono text-[11px] tracking-[0.1em] text-texte-2 uppercase">
                  Mod. {m.numero}
                </span>
                <span className="block min-w-0">
                  <span className="block truncate text-[1.02rem] font-medium text-texte">
                    {m.titre}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-[3px] px-2 py-[2px] font-mono text-[9.5px] tracking-[0.12em] uppercase ${
                        m.publie
                          ? "bg-[color:var(--plage-fond)] text-accent-texte"
                          : "bg-fond-3 text-texte-2"
                      }`}
                    >
                      {m.publie ? "Publié" : "Brouillon"}
                    </span>
                    <span className="rounded-[3px] bg-fond-3 px-2 py-[2px] font-mono text-[9.5px] tracking-[0.12em] text-texte-2 uppercase">
                      {m.acces === "gratuit" ? "Gratuit" : "Masterclass"}
                    </span>
                  </span>
                </span>
                <span className="font-mono text-[11px] whitespace-nowrap tabular-nums text-texte-2">
                  {total === 0 ? (
                    <span className="text-texte-3">aucune leçon</span>
                  ) : (
                    `${publiees} / ${total} publiée${total > 1 ? "s" : ""}`
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ol>
    </>
  );
}

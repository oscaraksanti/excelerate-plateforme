import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { creerLecon } from "@/app/admin/actions";
import { EnteteApp } from "@/components/entete-app";
import { exigerAdmin } from "@/lib/admin";
import { listerLecons } from "@/lib/donnees";
import { formaterDuree } from "@/lib/markdown";
import { clientServeur } from "@/lib/supabase/serveur";
import { FormulaireModule } from "./formulaire";

export const metadata: Metadata = { title: "Modifier un module" };

export default async function PageModuleAdmin({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profil = await exigerAdmin();

  const supabase = await clientServeur();
  const { data: module } = await supabase
    .from("modules")
    .select("id, numero, titre, resume, acces, publie")
    .eq("id", id)
    .maybeSingle();

  if (!module) notFound();
  const lecons = await listerLecons(module.id);

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <Link href="/admin" className="etiquette mb-6 inline-block hover:text-texte">
          ← Administration
        </Link>

        <p className="etiquette mb-2">Module {module.numero}</p>
        <h1 className="titre-xl m-0 mb-8 text-[clamp(1.7rem,4.2vw,2.4rem)]">
          {module.titre}
        </h1>

        <FormulaireModule module={module} />

        <section className="mt-16 border-t-2 border-texte pt-6">
          <h2 className="titre-l m-0 mb-1 text-[1.5rem]">Les leçons</h2>
          <p className="mt-2 mb-6 max-w-[34rem] text-[0.98rem] text-texte-2">
            Elles s&apos;affichent dans l&apos;ordre de leur numéro. Pour en
            déplacer une, change son numéro dans sa fiche.
          </p>

          {lecons.length > 0 && (
            <ol className="m-0 mb-7 flex list-none flex-col gap-0 border-t border-bord p-0">
              {lecons.map((l) => (
                <li key={l.id} className="border-b border-bord">
                  <Link
                    href={`/admin/lecons/${l.id}`}
                    className="flex items-center gap-4 py-[15px] transition-colors hover:bg-fond-2"
                  >
                    <span className="w-[26px] shrink-0 font-mono text-[12px] tabular-nums text-texte-3">
                      {l.numero}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[1rem] font-medium text-texte">
                        {l.titre}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-[3px] px-2 py-[2px] font-mono text-[9.5px] tracking-[0.12em] uppercase ${
                            l.publie
                              ? "bg-[color:var(--plage-fond)] text-accent-texte"
                              : "bg-fond-3 text-texte-2"
                          }`}
                        >
                          {l.publie ? "Publiée" : "Brouillon"}
                        </span>
                        {!l.video_id && (
                          <span className="rounded-[3px] bg-fond-3 px-2 py-[2px] font-mono text-[9.5px] tracking-[0.12em] text-texte-2 uppercase">
                            Sans vidéo
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] whitespace-nowrap text-texte-3">
                      {formaterDuree(l.duree_min)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}

          <form action={creerLecon} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="module_id" value={module.id} />
            <div className="flex min-w-[15rem] flex-1 flex-col gap-2">
              <label htmlFor="titre-lecon" className="etiquette">
                Titre de la nouvelle leçon
              </label>
              <input
                id="titre-lecon"
                name="titre"
                type="text"
                placeholder="Les tableaux structurés"
                className="w-full rounded-[2px] border border-bord bg-fond px-[13px] py-[11px] text-[15px] text-texte outline-none placeholder:text-texte-3 focus:border-texte-2"
              />
            </div>
            <button type="submit" className="bouton">
              Créer la leçon
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

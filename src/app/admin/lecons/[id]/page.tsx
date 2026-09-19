import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supprimerLecon } from "@/app/admin/actions";
import { EnteteApp } from "@/components/entete-app";
import { exigerAdmin } from "@/lib/admin";
import { listerRessources } from "@/lib/donnees";
import { clientServeur } from "@/lib/supabase/serveur";
import { FormulaireLecon } from "./formulaire";
import { Ressources } from "./ressources";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Modifier une leçon" };

export default async function PageLeconAdmin({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profil = await exigerAdmin();

  const supabase = await clientServeur();
  const { data: lecon } = await supabase
    .from("lecons")
    .select(
      "id, module_id, numero, titre, video_source, video_id, duree_min, corps_md, accroche, acces, publie_le, publie",
    )
    .eq("id", id)
    .maybeSingle();

  if (!lecon) notFound();

  const { data: module } = await supabase
    .from("modules")
    .select("id, numero, titre")
    .eq("id", lecon.module_id)
    .maybeSingle();

  const ressources = await listerRessources(lecon.id);

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <Link
          href={`/admin/modules/${lecon.module_id}`}
          className="etiquette mb-6 inline-block hover:text-texte"
        >
          ← Module {module?.numero} · {module?.titre}
        </Link>

        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="etiquette mb-2">Leçon {lecon.numero}</p>
            <h1 className="titre-xl m-0 text-[clamp(1.6rem,4vw,2.3rem)]">
              {lecon.titre}
            </h1>
          </div>
          {lecon.publie && module && (
            <Link
              href={`/modules/${module.numero}/${lecon.numero}`}
              className="bouton-2"
            >
              Voir la page publique
            </Link>
          )}
        </div>

        <FormulaireLecon lecon={lecon} />

        <Ressources leconId={lecon.id} ressources={ressources} />

        <section className="mt-14 border-t border-bord pt-6">
          <form action={supprimerLecon}>
            <input type="hidden" name="id" value={lecon.id} />
            <input type="hidden" name="module_id" value={lecon.module_id} />
            <button
              type="submit"
              className="cursor-pointer font-mono text-[10.5px] tracking-[0.12em] text-texte-3 uppercase hover:text-ko"
            >
              Supprimer cette leçon
            </button>
          </form>
          <p className="mt-2 mb-0 max-w-[30rem] text-[0.85rem] text-texte-3">
            Définitif, et emporte les commentaires et la progression associés.
          </p>
        </section>
      </main>
    </>
  );
}

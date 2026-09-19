import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supprimerTp } from "@/app/admin/tps/actions";
import { EnteteApp } from "@/components/entete-app";
import { exigerAdmin } from "@/lib/admin";
import { clientServeur } from "@/lib/supabase/serveur";
import { lireCorrige, lireTpParId } from "@/lib/tp";
import { CorrigeTp, DepartTp, FormulaireTp } from "./formulaire";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Modifier un travail pratique" };

export default async function PageTpAdmin({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profil = await exigerAdmin();

  const tp = await lireTpParId(id);
  if (!tp) notFound();

  const supabase = await clientServeur();
  const { data: module } = await supabase
    .from("modules")
    .select("id, numero, titre")
    .eq("id", tp.module_id)
    .maybeSingle();

  const corrige = await lireCorrige(tp.id);
  const { count } = await supabase
    .from("copies")
    .select("id", { count: "exact", head: true })
    .eq("tp_id", tp.id);

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <Link
          href={`/admin/modules/${tp.module_id}`}
          className="etiquette mb-6 inline-block hover:text-texte"
        >
          ← Module {module?.numero} · {module?.titre}
        </Link>

        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="etiquette mb-2">Travail pratique {tp.numero}</p>
            <h1 className="titre-xl m-0 text-[clamp(1.6rem,4vw,2.3rem)]">{tp.titre}</h1>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-texte-2">
            {count ?? 0} copie{(count ?? 0) > 1 ? "s" : ""} déposée
            {(count ?? 0) > 1 ? "s" : ""}
          </span>
        </div>

        <FormulaireTp tp={tp} />

        <section className="mt-14 border-t-2 border-texte pt-6">
          <h2 className="titre-l m-0 mb-1 text-[1.5rem]">Le classeur de départ</h2>
          <p className="mt-2 mb-6 max-w-[34rem] text-[0.98rem] text-texte-2">
            Celui que les apprenants téléchargent pour travailler. Il contient
            les données brutes, sans les formules.
          </p>
          <DepartTp tp={tp} />
        </section>

        <section className="mt-14 border-t-2 border-texte pt-6">
          <h2 className="titre-l m-0 mb-1 text-[1.5rem]">Le corrigé</h2>
          <p className="mt-2 mb-6 max-w-[34rem] text-[0.98rem] text-texte-2">
            Tu ne remplis aucune grille : elle se déduit de ce fichier. Chaque
            cellule qui y porte une formule devient deux points — un pour la
            méthode, un pour le résultat. Personne d&apos;autre que toi ne peut
            le lire.
          </p>
          <CorrigeTp tp={tp} dejaPose={corrige} />
        </section>

        <section className="mt-14 border-t border-bord pt-6">
          <form action={supprimerTp}>
            <input type="hidden" name="id" value={tp.id} />
            <input type="hidden" name="module_id" value={tp.module_id} />
            <button
              type="submit"
              className="cursor-pointer font-mono text-[10.5px] tracking-[0.12em] text-texte-3 uppercase hover:text-ko"
            >
              Supprimer ce travail pratique
            </button>
          </form>
          <p className="mt-2 mb-0 max-w-[30rem] text-[0.85rem] text-texte-3">
            Définitif, et emporte toutes les copies déposées.
          </p>
        </section>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnteteApp } from "@/components/entete-app";
import { exigerAdmin } from "@/lib/admin";
import { questionsDuModule } from "@/lib/qcm";
import { GENRES, type Genre } from "@/lib/formats";
import { clientServeur } from "@/lib/supabase/serveur";
import { BoutonSupprimer, FormulaireQuestion } from "./formulaire";

export const metadata: Metadata = { title: "Le QCM du module" };

export default async function PageQcmAdmin({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profil = await exigerAdmin();

  const supabase = await clientServeur();
  const { data: module } = await supabase
    .from("modules")
    .select("id, numero, titre")
    .eq("id", id)
    .maybeSingle();
  if (!module) notFound();

  const questions = await questionsDuModule(module.id);

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <Link
          href={`/admin/modules/${module.id}`}
          className="etiquette mb-6 inline-block hover:text-texte"
        >
          ← Module {module.numero}
        </Link>

        <h1 className="titre-xl m-0 mb-3 text-[clamp(1.7rem,4.2vw,2.4rem)]">
          Le contrôle du module {module.numero}
        </h1>
        <p className="mb-10 max-w-[36rem] text-[1.01rem] text-texte-2">
          Six questions, deux minutes, pensées pour un téléphone. Correction
          immédiate, essais illimités, aucun seuil bloquant — le travail
          pratique reste la seule porte du certificat.
        </p>

        {questions.length > 0 && (
          <ol className="m-0 mb-14 flex list-none flex-col gap-0 p-0">
            {questions.map((q) => (
              <li key={q.id} className="border-t border-bord py-8">
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
                  <span className="etiquette">
                    {q.numero}. {GENRES[q.genre as Genre] ?? q.genre}
                    {!q.publie && " · brouillon"}
                  </span>
                  <BoutonSupprimer id={q.id} moduleId={module.id} />
                </div>
                <FormulaireQuestion moduleId={module.id} question={q} />
              </li>
            ))}
          </ol>
        )}

        <section className="border-t-2 border-texte pt-6">
          <h2 className="titre-l m-0 mb-6 text-[1.4rem]">Ajouter une question</h2>
          <FormulaireQuestion
            moduleId={module.id}
            numeroPropose={questions.length + 1}
          />
        </section>
      </main>
    </>
  );
}

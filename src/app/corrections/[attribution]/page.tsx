import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnteteApp } from "@/components/entete-app";
import { criteresDe } from "@/lib/pairs";
import { profilCourant } from "@/lib/profil";
import { clientServeur } from "@/lib/supabase/serveur";
import { FormulaireCorrection } from "./formulaire";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Corriger une copie" };

export default async function PageCorriger({
  params,
}: {
  params: Promise<{ attribution: string }>;
}) {
  const { attribution } = await params;
  const profil = await profilCourant();
  const supabase = await clientServeur();

  const { data: ligne } = await supabase
    .from("attributions")
    .select("id, copie_id, correcteur_id, statut")
    .eq("id", attribution)
    .maybeSingle();

  if (!ligne || ligne.correcteur_id !== profil.id) notFound();

  // On ne lit que le TP : jamais l'auteur, jamais sa note machine.
  const { data: copie } = await supabase
    .from("copies")
    .select("tp_id")
    .eq("id", ligne.copie_id)
    .maybeSingle();

  const { data: tp } = await supabase
    .from("tps")
    .select("id, titre, criteres, enonce_md")
    .eq("id", copie?.tp_id ?? "")
    .maybeSingle();

  if (!tp) notFound();
  const criteres = criteresDe(tp.criteres);

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <Link href="/corrections" className="etiquette mb-6 inline-block hover:text-texte">
          ← Mes corrections
        </Link>

        <p className="etiquette mb-2">{tp.titre}</p>
        <h1 className="titre-xl m-0 mb-5 text-[clamp(1.7rem,4.2vw,2.4rem)]">
          Corriger une copie
        </h1>

        {ligne.statut === "faite" ? (
          <p className="max-w-[35rem] border-l-[3px] border-ambre bg-fond-2 px-4 py-3 text-[0.96rem]">
            Tu as déjà corrigé cette copie. Une correction ne se modifie pas.
          </p>
        ) : (
          <>
            <div className="plage mb-9 px-6 py-5">
              <span className="etiquette mb-2 block">Avant de commencer</span>
              <p className="m-0 mb-4 max-w-[32rem] text-[1rem] leading-[1.5]">
                Tu ne sais pas de qui est cette copie, et son auteur ne saura
                jamais que c&apos;est toi qui l&apos;as notée. Les formules et
                les valeurs ont déjà été vérifiées par la machine —{" "}
                <strong className="font-semibold">
                  juge ce qu&apos;un programme ne peut pas voir.
                </strong>
              </p>
              <a
                href={`/api/copies/${attribution}/fichier`}
                download
                className="bouton"
              >
                Télécharger la copie
              </a>
              <span className="poignee" aria-hidden="true" />
            </div>

            <FormulaireCorrection attributionId={attribution} criteres={criteres} />
          </>
        )}
      </main>
    </>
  );
}

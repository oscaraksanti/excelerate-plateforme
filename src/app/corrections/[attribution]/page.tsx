import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnteteApp } from "@/components/entete-app";
import { criteresDe } from "@/lib/pairs";
import { profilCourant } from "@/lib/profil";
import { clientAdmin } from "@/lib/supabase/admin";
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

  //  Les regles d'acces interdisent a un apprenant de lire la copie
  //  d'un autre : « copies : je lis la mienne ». C'est voulu, c'est ce
  //  qui tient l'anonymat — mais le correcteur a besoin d'une chose,
  //  une seule : de quel TP il s'agit. On la lit donc avec les droits
  //  complets, APRES avoir verifie que l'attribution est bien la
  //  sienne, et on ne prend que `tp_id` : ni l'auteur, ni sa note
  //  machine ne sortent d'ici. Meme montage que la route qui sert
  //  deja le fichier a corriger.
  const admin = clientAdmin();
  const { data: ligne } = await admin
    .from("attributions")
    .select("id, copie_id, correcteur_id, statut, copies(tp_id)")
    .eq("id", attribution)
    .maybeSingle();

  if (!ligne || ligne.correcteur_id !== profil.id) notFound();

  const tpId = (ligne.copies as unknown as { tp_id: string } | null)?.tp_id;
  if (!tpId) notFound();

  //  Le TP, lui, se lit avec les droits de la personne : elle a depose
  //  sur ce TP, donc elle y a acces. Garder cette lecture-la sous les
  //  regles evite d'ouvrir un enonce paye a quelqu'un qui ne l'a pas.
  const { data: tp } = await supabase
    .from("tps")
    .select("id, titre, criteres, enonce_md")
    .eq("id", tpId)
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

import type { Metadata } from "next";
import Link from "next/link";
import { clientServeur } from "@/lib/supabase/serveur";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Questions en attente",
};

type Question = {
  id: string;
  corps: string;
  cree_le: string;
  heures: number;
  auteur: string;
  module_num: number;
  lecon_num: number;
  lecon_titre: string;
  a_image: boolean;
};

export default async function PageQuestions() {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("questions_en_attente", { p_limite: 100 });
  const questions = (data as Question[]) ?? [];

  //  Au-delà de 24 h, une question n'attend plus : elle est oubliée.
  const vieilles = questions.filter((q) => q.heures >= 24).length;

  return (
    <>
      <h1 className="titre-xl m-0 mb-2 text-[clamp(1.7rem,4vw,2.4rem)]">
        Questions en attente
      </h1>
      <p className="mb-9 max-w-[36rem] text-[1.01rem] text-texte-2">
        Celles que personne n&apos;a encore reprises. Une question répondue dans
        la journée fait un forum vivant ; répondue au bout de trois jours, elle
        apprend surtout à ne plus en poser.
      </p>

      {questions.length === 0 ? (
        <div className="plage px-6 py-5">
          <span className="etiquette mb-2 block">Rien en attente</span>
          <p className="m-0 max-w-[30rem] text-[1.02rem] leading-[1.5]">
            Toutes les questions ont au moins une réponse. C&apos;est le bon
            état — et ce n&apos;est pas le plus fréquent.
          </p>
          <span className="poignee" aria-hidden="true" />
        </div>
      ) : (
        <>
          <p className="mb-6 font-mono text-[0.9rem] text-texte-2 tabular-nums">
            {questions.length} en attente
            {vieilles > 0 && (
              <span className="text-ko">
                {" "}
                · {vieilles} depuis plus de 24 h
              </span>
            )}
          </p>

          <ul className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
            {questions.map((q) => (
              <li key={q.id} className="border-b border-bord py-5">
                <p className="m-0 mb-2 flex flex-wrap items-baseline gap-x-3 text-[0.86rem]">
                  <span
                    className={`font-mono text-[10.5px] tracking-[0.1em] uppercase tabular-nums ${
                      q.heures >= 24 ? "font-semibold text-ko" : "text-texte-3"
                    }`}
                  >
                    {q.heures < 1 ? "à l'instant" : `depuis ${q.heures} h`}
                  </span>
                  <span className="font-semibold text-texte">{q.auteur}</span>
                  <span className="text-texte-3">
                    module {q.module_num} · leçon {q.lecon_num} — {q.lecon_titre}
                  </span>
                  {q.a_image && (
                    <span className="font-mono text-[9.5px] tracking-[0.1em] text-texte-3 uppercase">
                      capture jointe
                    </span>
                  )}
                </p>
                <p className="m-0 mb-3 max-w-[44rem] text-[0.98rem] leading-[1.5] whitespace-pre-wrap text-texte-2">
                  {q.corps.length > 400 ? `${q.corps.slice(0, 400)}…` : q.corps}
                </p>
                <Link
                  href={`/modules/${q.module_num}/${q.lecon_num}`}
                  className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase hover:text-texte"
                >
                  répondre →
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { repondreQcm } from "@/app/modules/qcm-actions";
import { GENRES, type EntreeQcm } from "@/lib/formats";

type Etat = { choix: string; juste: boolean; bonne: string; explication: string };

function Question({ q }: { q: EntreeQcm }) {
  const [etat, poser] = useState<Etat | null>(
    q.deja_repondu && q.bonne
      ? {
          choix: q.mon_choix ?? "",
          juste: (q.mon_choix ?? "") === q.bonne,
          bonne: q.bonne,
          explication: q.explication ?? "",
        }
      : null,
  );
  const [enCours, demarrer] = useTransition();

  function choisir(cle: string) {
    if (enCours) return;
    demarrer(async () => {
      const v = await repondreQcm(q.id, cle);
      if (v.ok) poser({ choix: cle, juste: v.juste, bonne: v.bonne, explication: v.explication });
    });
  }

  return (
    <li className="border-b border-bord py-6 last:border-b-0">
      <p className="etiquette mb-[10px]">
        {q.numero}. {GENRES[q.genre] ?? "Question"}
        {q.genre === "pepite" && " 💎"}
      </p>

      <p className="m-0 mb-4 text-[1.04rem] leading-[1.5] text-texte">{q.enonce}</p>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {q.propositions.map((p) => {
          const choisi = etat?.choix === p.cle;
          const estBonne = Boolean(etat) && etat!.bonne === p.cle;
          // Tant qu'on n'a pas repondu, aucune proposition n'est marquee.
          const style = !etat
            ? "border-bord hover:border-texte-2"
            : estBonne
              ? "border-[color:var(--plage-bord)] bg-[color:var(--plage-fond)]"
              : choisi
                ? "border-ko"
                : "border-bord-2 opacity-60";

          return (
            <li key={p.cle}>
              <button
                type="button"
                onClick={() => choisir(p.cle)}
                disabled={enCours}
                aria-pressed={choisi}
                className={`flex w-full items-start gap-3 rounded-[5px] border px-[14px] py-[11px] text-left text-[0.97rem] leading-[1.45] transition-colors disabled:cursor-wait ${style}`}
              >
                <span className="mt-[2px] shrink-0 font-mono text-[11px] uppercase text-texte-3">
                  {p.cle}
                </span>
                <span className="min-w-0 flex-1 text-texte-2">{p.texte}</span>
                {etat && estBonne && (
                  <span aria-hidden="true" className="shrink-0 text-[0.9rem]">✓</span>
                )}
                {etat && choisi && !estBonne && (
                  <span aria-hidden="true" className="shrink-0 text-[0.9rem]">✕</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {etat && (
        <p
          className={`mt-4 mb-0 border-l-[3px] bg-fond-2 px-4 py-3 text-[0.93rem] leading-[1.5] ${
            etat.juste ? "border-[color:var(--plage-bord)]" : "border-ko"
          }`}
        >
          <strong className="text-texte">
            {etat.juste ? "C'est ça. " : "Pas celle-ci. "}
          </strong>
          {etat.explication}
        </p>
      )}
    </li>
  );
}

export function Qcm({ questions }: { questions: EntreeQcm[] }) {
  if (questions.length === 0) return null;

  const repondues = questions.filter((q) => q.deja_repondu).length;

  return (
    <section className="mt-12 border-t-2 border-texte pt-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="titre-l m-0 text-[1.4rem]">Le contrôle</h2>
        <span className="font-mono text-[11px] tracking-[0.1em] tabular-nums text-texte-3 uppercase">
          {repondues} / {questions.length}
        </span>
      </div>
      <p className="mt-2 mb-2 max-w-[34rem] text-[0.96rem] text-texte-2">
        Six questions, deux minutes, depuis ton téléphone. Ça ne compte pas pour
        le certificat — c&apos;est là pour que ça reste.
      </p>

      <ul className="m-0 flex list-none flex-col gap-0 p-0">
        {questions.map((q) => (
          <Question key={q.id} q={q} />
        ))}
      </ul>
    </section>
  );
}

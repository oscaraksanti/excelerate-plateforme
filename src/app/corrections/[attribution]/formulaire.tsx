"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  enregistrerCorrection,
  type EtatCorrection,
} from "@/app/corrections/actions";
import { BAREME, type Critere } from "@/lib/formats";

const DEPART: EtatCorrection = { ok: false, message: "" };

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Envoi…" : "Envoyer ma correction"}
    </button>
  );
}

export function FormulaireCorrection({
  attributionId,
  criteres,
}: {
  attributionId: string;
  criteres: Critere[];
}) {
  const [etat, action] = useActionState(enregistrerCorrection, DEPART);

  return (
    <form action={action} className="flex flex-col gap-0">
      <input type="hidden" name="attribution_id" value={attributionId} />

      <ol className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
        {criteres.map((c, i) => (
          <li key={c.cle} className="border-b border-bord py-7">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="font-mono text-[11px] tabular-nums text-texte-3">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="titre-m m-0 mb-1 text-[1.1rem]">{c.titre}</h3>
                <p className="m-0 max-w-[34rem] text-[0.93rem] text-texte-2">
                  {c.aide}
                </p>
              </div>
            </div>

            <fieldset className="m-0 border-0 p-0">
              <legend className="sr-only">{c.titre}</legend>
              <div className="flex flex-wrap gap-2 pl-[26px]">
                {BAREME.map((b) => (
                  <label
                    key={b.note}
                    className="group flex cursor-pointer items-center gap-[7px] rounded-[4px] border border-bord bg-fond px-[11px] py-[8px] text-[0.87rem] transition-colors has-checked:border-[color:var(--plage-bord)] has-checked:bg-[color:var(--plage-fond)] hover:border-texte-2"
                  >
                    <input
                      type="radio"
                      name={`note_${c.cle}`}
                      value={b.note}
                      required
                      className="h-[14px] w-[14px] accent-[color:var(--voltage-2)]"
                    />
                    <span className="font-mono text-[11px] tabular-nums text-texte">
                      {b.note}
                    </span>
                    <span className="text-texte-2">{b.mot}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col gap-2">
        <label htmlFor="commentaire" className="etiquette">
          Ton retour à l&apos;auteur
        </label>
        <textarea
          id="commentaire"
          name="commentaire"
          rows={5}
          required
          minLength={15}
          maxLength={4000}
          placeholder="Ce qui marche, ce qui ne tient pas, et ce que tu ferais autrement…"
          className="w-full resize-y rounded-[2px] border border-bord bg-fond px-[14px] py-[12px] text-[16px] text-texte outline-none placeholder:text-texte-3 focus:border-texte-2"
        />
        <p className="m-0 text-[0.86rem] text-texte-3">
          Une phrase minimum. C&apos;est la partie que l&apos;auteur relira — la
          note, il l&apos;oublie.
        </p>
      </div>

      {etat.message && (
        <p
          role="alert"
          className="mt-5 mb-0 max-w-[36rem] border-l-[3px] border-ko bg-fond-2 px-4 py-3 text-[0.94rem] text-texte"
        >
          {etat.message}
        </p>
      )}

      <div className="mt-8">
        <Bouton />
      </div>
    </form>
  );
}

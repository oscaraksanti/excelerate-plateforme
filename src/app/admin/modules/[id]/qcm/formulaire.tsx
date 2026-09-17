"use client";

import { useActionState } from "react";
import { enregistrerQuestion, supprimerQuestion } from "@/app/admin/qcm-actions";
import { AIDE, CHAMP, LABEL } from "@/components/champs";
import { GENRES } from "@/lib/formats";
import type { QuestionAdmin } from "@/lib/qcm";

const VIDE = { ok: false, message: "" };
const CLES = ["a", "b", "c", "d"] as const;

export function FormulaireQuestion({
  moduleId,
  question,
  numeroPropose,
}: {
  moduleId: string;
  question?: QuestionAdmin;
  numeroPropose?: number;
}) {
  const [etat, envoyer, enCours] = useActionState(enregistrerQuestion, VIDE);
  const p = (cle: string) =>
    question?.propositions.find((x) => x.cle === cle)?.texte ?? "";

  return (
    <form action={envoyer} className="flex flex-col gap-5">
      {question && <input type="hidden" name="id" value={question.id} />}
      <input type="hidden" name="module_id" value={moduleId} />

      <div className="flex flex-wrap gap-4">
        <div className="flex w-[6rem] flex-col gap-2">
          <label htmlFor={`n-${question?.id ?? "x"}`} className={LABEL}>Numéro</label>
          <input
            id={`n-${question?.id ?? "x"}`}
            name="numero"
            type="number"
            min={1}
            defaultValue={question?.numero ?? numeroPropose ?? 1}
            className={CHAMP}
          />
        </div>
        <div className="flex min-w-[12rem] flex-1 flex-col gap-2">
          <label htmlFor={`g-${question?.id ?? "x"}`} className={LABEL}>Type</label>
          <select
            id={`g-${question?.id ?? "x"}`}
            name="genre"
            defaultValue={question?.genre ?? "concept"}
            className={CHAMP}
          >
            {Object.entries(GENRES).map(([cle, libelle]) => (
              <option key={cle} value={cle}>{libelle}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`e-${question?.id ?? "x"}`} className={LABEL}>L&apos;énoncé</label>
        <textarea
          id={`e-${question?.id ?? "x"}`}
          name="enonce"
          rows={3}
          defaultValue={question?.enonce ?? ""}
          className={CHAMP}
        />
      </div>

      <div className="flex flex-col gap-3">
        <span className={LABEL}>Les propositions</span>
        {CLES.map((cle) => (
          <div key={cle} className="flex items-center gap-3">
            <span className="w-[18px] shrink-0 font-mono text-[12px] uppercase text-texte-3">
              {cle}
            </span>
            <input
              name={`prop_${cle}`}
              type="text"
              defaultValue={p(cle)}
              placeholder={cle === "d" ? "(facultative)" : ""}
              className={CHAMP}
            />
          </div>
        ))}
        <p className={AIDE}>
          Trois propositions absurdes ne testent rien. Chaque mauvaise réponse
          doit être une erreur que quelqu&apos;un pourrait vraiment commettre.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex w-[8rem] flex-col gap-2">
          <label htmlFor={`b-${question?.id ?? "x"}`} className={LABEL}>Bonne réponse</label>
          <select
            id={`b-${question?.id ?? "x"}`}
            name="bonne"
            defaultValue={question?.bonne || "a"}
            className={CHAMP}
          >
            {CLES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex min-w-[16rem] flex-1 flex-col gap-2">
          <label htmlFor={`x-${question?.id ?? "x"}`} className={LABEL}>
            L&apos;explication
          </label>
          <textarea
            id={`x-${question?.id ?? "x"}`}
            name="explication"
            rows={2}
            defaultValue={question?.explication ?? ""}
            className={CHAMP}
          />
          <p className={AIDE}>Une phrase. Elle se lit sur un écran de téléphone.</p>
        </div>
      </div>

      <label className="flex items-center gap-3 text-[0.95rem] text-texte-2">
        <input
          type="checkbox"
          name="publie"
          defaultChecked={question?.publie ?? true}
          className="h-[15px] w-[15px] accent-[color:var(--voltage)]"
        />
        Publiée
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={enCours} className="bouton">
          {enCours ? "Enregistrement…" : "Enregistrer"}
        </button>
        {etat.message && (
          <span className={`text-[0.92rem] ${etat.ok ? "text-accent-texte" : "text-ko"}`}>
            {etat.message}
          </span>
        )}
      </div>
    </form>
  );
}

export function BoutonSupprimer({
  id,
  moduleId,
}: {
  id: string;
  moduleId: string;
}) {
  return (
    <form action={supprimerQuestion}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="module_id" value={moduleId} />
      <button
        type="submit"
        className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase hover:text-ko"
      >
        Supprimer
      </button>
    </form>
  );
}

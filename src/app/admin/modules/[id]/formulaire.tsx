"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { enregistrerModule, type Etat } from "@/app/admin/actions";
import { AIDE, CHAMP, LABEL } from "@/components/champs";
import type { Module } from "@/lib/donnees";
import { pourChampGmt } from "@/lib/formats";

const DEPART: Etat = { ok: false, message: "" };

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer le module"}
    </button>
  );
}

export function FormulaireModule({ module }: { module: Module }) {
  const [etat, action] = useActionState(enregistrerModule, DEPART);

  return (
    <form action={action} className="flex max-w-[34rem] flex-col gap-5">
      <input type="hidden" name="id" value={module.id} />

      <div className="flex flex-col gap-2">
        <label htmlFor="titre" className={LABEL}>
          Titre du module
        </label>
        <input
          id="titre"
          name="titre"
          type="text"
          required
          defaultValue={module.titre}
          className={CHAMP}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="resume" className={LABEL}>
          Résumé
        </label>
        <textarea
          id="resume"
          name="resume"
          rows={3}
          defaultValue={module.resume}
          className={`${CHAMP} resize-y`}
        />
        <p className={AIDE}>
          Une ou deux phrases. C&apos;est ce qui s&apos;affiche dans la liste des
          modules.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="acces" className={LABEL}>
          Accès
        </label>
        <select
          id="acces"
          name="acces"
          defaultValue={module.acces}
          className={CHAMP}
        >
          <option value="gratuit">Gratuit — ouvert à tous les inscrits</option>
          <option value="paye">Masterclass — réservé aux acheteurs</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="publie_le" className={LABEL}>
          Ouverture
        </label>
        <input
          id="publie_le"
          name="publie_le"
          type="datetime-local"
          defaultValue={pourChampGmt(module.publie_le)}
          className={CHAMP}
        />
        <p className={AIDE}>
          Vide, le module s&apos;ouvre dès qu&apos;il est publié. Avec une date
          à venir, il devient <strong>« À venir »</strong> : son titre, son
          résumé et le sommaire de ses leçons restent visibles, mais rien ne
          s&apos;ouvre — ni leçon, ni TP, ni quiz.{" "}
          <strong>L&apos;heure se saisit en GMT</strong>, comme tout le reste
          de la formation.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 border border-bord bg-fond-2 px-4 py-[14px]">
        <input
          type="checkbox"
          name="publie"
          defaultChecked={module.publie}
          className="mt-[3px] h-[16px] w-[16px] shrink-0 accent-[color:var(--voltage-2)]"
        />
        <span>
          <span className="block text-[0.97rem] font-semibold text-texte">
            Publié
          </span>
          <span className="mt-[2px] block text-[0.87rem] text-texte-2">
            Décoché, le module est invisible pour tout le monde sauf toi.
          </span>
        </span>
      </label>

      {etat.message && (
        <p
          role="status"
          className={`m-0 border-l-[3px] bg-fond-2 px-4 py-3 text-[0.93rem] text-texte ${
            etat.ok ? "border-[color:var(--voltage-2)]" : "border-ko"
          }`}
        >
          {etat.message}
        </p>
      )}

      <div>
        <Bouton />
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { enregistrerDirect, type Etat } from "./actions";
import { AIDE, CHAMP, CHAMP_MONO, LABEL } from "@/components/champs";
import { pourChampDate } from "@/lib/formats";
import type { Direct } from "@/lib/formats";

const DEPART: Etat = { ok: false, message: "" };

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

export function FormulaireDirect({ direct }: { direct: Direct }) {
  const [etat, action] = useActionState(enregistrerDirect, DEPART);

  return (
    <form action={action} className="flex max-w-[36rem] flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="titre" className={LABEL}>
          Ce qui s&apos;affiche dans le bandeau
        </label>
        <input
          id="titre"
          name="titre"
          type="text"
          defaultValue={direct.titre}
          placeholder="Soirée 1 — Arrêter de se battre avec ses données"
          className={CHAMP}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="lien" className={LABEL}>
          Le lien Teams
        </label>
        <input
          id="lien"
          name="lien"
          type="url"
          defaultValue={direct.lien}
          placeholder="https://teams.microsoft.com/l/meetup-join/…"
          className={CHAMP_MONO}
        />
        <p className={AIDE}>
          Colle ici le lien de ta réunion. C&apos;est le seul endroit où il
          figure — tu le changes chaque soir sans toucher au reste.
        </p>
      </div>

      <div className="flex flex-wrap gap-5">
        <div className="flex min-w-[15rem] flex-1 flex-col gap-2">
          <label htmlFor="debut_le" className={LABEL}>
            Début
          </label>
          <input
            id="debut_le"
            name="debut_le"
            type="datetime-local"
            defaultValue={pourChampDate(direct.debut_le)}
            className={CHAMP_MONO}
          />
        </div>
        <div className="flex w-[11rem] flex-col gap-2">
          <label htmlFor="duree_min" className={LABEL}>
            Durée (minutes)
          </label>
          <input
            id="duree_min"
            name="duree_min"
            type="number"
            min={15}
            max={600}
            defaultValue={direct.duree_min}
            className={CHAMP_MONO}
          />
        </div>
      </div>
      <p className={`${AIDE} -mt-2`}>
        Le bandeau s&apos;éteint tout seul à la fin de la durée. Tu n&apos;as
        rien à faire à 21 h.
      </p>

      <label className="flex cursor-pointer items-start gap-3 border border-bord bg-fond-2 px-4 py-[14px]">
        <input
          type="checkbox"
          name="actif"
          defaultChecked={direct.actif}
          className="mt-[3px] h-[16px] w-[16px] shrink-0 accent-[color:var(--voltage-2)]"
        />
        <span>
          <span className="block text-[0.97rem] font-semibold text-texte">
            Allumer le bandeau
          </span>
          <span className="mt-[2px] block text-[0.87rem] text-texte-2">
            Compte à rebours avant l&apos;heure, bouton « Rejoindre » pendant.
            Invisible après.
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

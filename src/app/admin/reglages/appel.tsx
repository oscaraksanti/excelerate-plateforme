"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { enregistrerAppel, type Etat } from "./actions";
import type { Appel } from "@/lib/appel";

const DEPART: Etat = { ok: false, message: "" };
const CHAMP =
  "w-full rounded-[6px] border border-bord bg-fond-2 px-3 py-[10px] text-[0.97rem] text-texte outline-none focus:border-[color:var(--plage-bord)]";

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

export function FormulaireAppel({ appel }: { appel: Appel }) {
  const [etat, action] = useActionState(enregistrerAppel, DEPART);

  return (
    <form action={action} className="flex max-w-[35rem] flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="etiquette">Le lien de réservation</span>
        <input
          name="lien"
          type="url"
          defaultValue={appel.lien}
          placeholder="https://calendly.com/…"
          className={CHAMP}
        />
        <span className="text-[0.86rem] text-texte-3">
          Il part dans le courriel de confirmation de chaque achat à 97 $, et
          s&apos;affiche sur la page des offres — un courriel se perd.
        </span>
      </label>

      <label className="flex max-w-[12rem] flex-col gap-2">
        <span className="etiquette">Durée (minutes)</span>
        <input
          name="duree_min"
          type="number"
          min={15}
          max={180}
          defaultValue={appel.duree_min}
          className={CHAMP}
        />
      </label>

      <label className="flex items-center gap-3">
        <input
          name="actif"
          type="checkbox"
          defaultChecked={appel.actif}
          className="h-[16px] w-[16px] accent-[color:var(--voltage-2)]"
        />
        <span className="text-[0.97rem]">Envoyer le lien aux acheteurs du cercle</span>
      </label>

      {etat.message && (
        <p
          role="status"
          className={`m-0 border-l-[3px] bg-fond-2 px-4 py-3 text-[0.94rem] text-texte ${
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

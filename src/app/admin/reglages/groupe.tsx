"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { enregistrerGroupe, type Etat } from "./actions";
import type { Groupe } from "@/lib/appel";

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

export function FormulaireGroupe({ groupe }: { groupe: Groupe }) {
  const [etat, action] = useActionState(enregistrerGroupe, DEPART);

  return (
    <form action={action} className="flex max-w-[35rem] flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="etiquette">Le lien d&apos;invitation</span>
        <input
          name="lien"
          type="url"
          defaultValue={groupe.lien}
          placeholder="https://chat.whatsapp.com/…"
          className={CHAMP}
        />
        <span className="text-[0.86rem] text-texte-3">
          Il part dans le courriel de confirmation de chaque achat, quel que
          soit le montant. Si tu changes de groupe, change-le ici : les
          anciens courriels, eux, garderont l&apos;ancien lien.
        </span>
      </label>

      <label className="flex max-w-[14rem] flex-col gap-2">
        <span className="etiquette">Nom du service</span>
        <input name="nom" defaultValue={groupe.nom} className={CHAMP} />
      </label>

      <label className="flex items-center gap-3">
        <input
          name="actif"
          type="checkbox"
          defaultChecked={groupe.actif}
          className="h-[16px] w-[16px] accent-[color:var(--voltage-2)]"
        />
        <span className="text-[0.97rem]">Envoyer l&apos;invitation aux acheteurs</span>
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

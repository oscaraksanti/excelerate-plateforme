"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { reclamerAchat, type EtatAcces } from "./actions";
import { CHAMP, CHAMP_MONO, LABEL, AIDE } from "@/components/champs";

const DEPART: EtatAcces = { ok: false, message: "" };

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Vérification…" : "Retrouver mon paiement"}
    </button>
  );
}

export function FormulaireAcces({ emailCompte }: { emailCompte: string | null }) {
  const [etat, action] = useActionState(reclamerAchat, DEPART);

  return (
    <form action={action} className="flex max-w-[28rem] flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={LABEL}>
          L&apos;adresse utilisée pour payer
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={emailCompte ?? ""}
          className={CHAMP}
        />
        <p className={AIDE}>
          Celle qui figure sur ton reçu Chariow — pas forcément celle de ton
          compte.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reference" className={LABEL}>
          La référence de commande
        </label>
        <input
          id="reference"
          name="reference"
          type="text"
          required
          placeholder="ord_…"
          className={CHAMP_MONO}
        />
        <p className={AIDE}>
          Sur le reçu reçu par email après le paiement. Elle prouve que ce
          paiement est bien le tien.
        </p>
      </div>

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

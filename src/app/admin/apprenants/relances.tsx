"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { relancerCorrections, type EtatRelance } from "./actions";

const DEPART: EtatRelance = { ok: false, message: "" };

function Bouton({ nb }: { nb: number }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending || nb === 0}>
      {pending ? "Envoi en cours…" : `Relancer ${nb} personne${nb > 1 ? "s" : ""}`}
    </button>
  );
}

export function Relances({
  gens,
}: {
  gens: { profil_id: string; email: string; nom: string; restant: number }[];
}) {
  const [etat, action] = useActionState(relancerCorrections, DEPART);

  if (gens.length === 0) {
    return (
      <p className="m-0 text-[0.96rem] text-texte-2">
        Personne n&apos;a de correction en retard. Rien à relancer.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <ul className="m-0 flex max-w-[35rem] list-none flex-col gap-0 border-t border-bord p-0">
        {gens.slice(0, 8).map((g) => (
          <li
            key={g.profil_id}
            className="flex items-center justify-between gap-4 border-b border-bord-2 py-[11px]"
          >
            <span className="min-w-0">
              <span className="block truncate text-[0.96rem] text-texte">
                {g.nom || g.email}
              </span>
              <span className="font-mono text-[10.5px] text-texte-3">{g.email}</span>
            </span>
            <span className="font-mono text-[11.5px] tabular-nums whitespace-nowrap text-texte-2">
              {g.restant} à rendre
            </span>
          </li>
        ))}
      </ul>
      {gens.length > 8 && (
        <p className="m-0 text-[0.88rem] text-texte-3">
          … et {gens.length - 8} autre{gens.length - 8 > 1 ? "s" : ""}.
        </p>
      )}

      {etat.message && (
        <p
          role="status"
          className={`m-0 max-w-[35rem] border-l-[3px] bg-fond-2 px-4 py-3 text-[0.94rem] text-texte ${
            etat.ok ? "border-[color:var(--voltage-2)]" : "border-ko"
          }`}
        >
          {etat.message}
        </p>
      )}

      <div>
        <Bouton nb={gens.length} />
      </div>
    </form>
  );
}

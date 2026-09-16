"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { enregistrerProfil, type EtatProfil } from "./actions";

const DEPART: EtatProfil = { ok: false, message: "" };

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

const champ =
  "w-full rounded-[2px] border border-bord bg-fond px-[14px] py-[13px] text-[16px] text-texte outline-none placeholder:text-texte-3 focus:border-texte-2";

export function FormulaireProfil({
  nom,
  telephone,
  email,
}: {
  nom: string;
  telephone: string | null;
  email: string | null;
}) {
  const [etat, action] = useActionState(enregistrerProfil, DEPART);

  return (
    <form action={action} className="flex max-w-[26rem] flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="nom" className="etiquette">
          Nom complet
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          defaultValue={nom}
          placeholder="Oscar Aksanti"
          autoComplete="name"
          className={champ}
        />
        <p className="m-0 text-[0.88rem] text-texte-3">
          C&apos;est ce nom qui figurera sur ton certificat.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="telephone" className="etiquette">
          Téléphone (WhatsApp)
        </label>
        <input
          id="telephone"
          name="telephone"
          type="tel"
          inputMode="tel"
          defaultValue={telephone ?? ""}
          placeholder="+243 971 601 855"
          autoComplete="tel"
          className={champ}
        />
        <p className="m-0 text-[0.88rem] text-texte-3">
          Facultatif. Sert uniquement aux rappels avant chaque soirée.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="etiquette">Adresse email</span>
        <p className="m-0 font-mono text-[0.95rem] text-texte-2">
          {email ?? "—"}
        </p>
        <p className="m-0 text-[0.88rem] text-texte-3">
          C&apos;est ton identifiant de connexion. Écris-nous pour la changer.
        </p>
      </div>

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

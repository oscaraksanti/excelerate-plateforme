"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { envoyerLien, type EtatConnexion } from "./actions";

const DEPART: EtatConnexion = { ok: false, message: "" };

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton w-full" disabled={pending}>
      {pending ? "Envoi en cours…" : "Recevoir mon lien de connexion"}
    </button>
  );
}

export function FormulaireConnexion({
  suite,
  probleme,
}: {
  suite: string;
  probleme?: string;
}) {
  const [etat, action] = useActionState(envoyerLien, DEPART);

  if (etat.ok) {
    return (
      <div className="plage px-6 py-5">
        <span className="etiquette mb-2 block">Regarde tes emails</span>
        <p className="m-0 max-w-[30rem] text-[1.02rem] leading-[1.5]">
          Un lien de connexion vient de partir vers{" "}
          <strong className="font-semibold">{etat.email}</strong>. Il est valable
          une heure, et il fonctionne aussi bien sur ce téléphone que sur un
          autre appareil.
        </p>
        <p className="mt-3 mb-0 text-[0.9rem] text-texte-2">
          Rien au bout de deux minutes ? Regarde dans les courriers indésirables
          ou l&apos;onglet Promotions.
        </p>
        <span className="poignee" aria-hidden="true" />
      </div>
    );
  }

  const messageProbleme =
    probleme === "lien-expire"
      ? "Ce lien a expiré ou a déjà servi. Demandes-en un nouveau — c'est immédiat."
      : probleme === "lien-incomplet"
        ? "Ce lien est incomplet. Il a peut-être été coupé par ta messagerie : demandes-en un nouveau."
        : null;

  return (
    <form action={action} className="flex max-w-[26rem] flex-col gap-4">
      <input type="hidden" name="suite" value={suite} />

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="etiquette">
          Ton adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="prenom@exemple.com"
          defaultValue={etat.email ?? ""}
          className="w-full rounded-[2px] border border-bord bg-fond px-[14px] py-[13px] text-[16px] text-texte outline-none placeholder:text-texte-3 focus:border-texte-2"
        />
        <p className="m-0 text-[0.88rem] text-texte-3">
          Utilise l&apos;adresse avec laquelle tu t&apos;es inscrit à
          l&apos;atelier.
        </p>
      </div>

      {(messageProbleme || etat.message) && (
        <p
          role="alert"
          className="m-0 border-l-[3px] border-ko bg-fond-2 px-4 py-3 text-[0.93rem] text-texte"
        >
          {messageProbleme ?? etat.message}
        </p>
      )}

      <Bouton />

      <p className="m-0 text-[0.88rem] text-texte-3">
        Pas de mot de passe à créer ni à retenir. Tu reçois un lien, tu cliques,
        tu es connecté.
      </p>
    </form>
  );
}

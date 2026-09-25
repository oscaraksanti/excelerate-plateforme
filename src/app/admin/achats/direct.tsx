"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { enregistrerPaiementDirect, type EtatDirect } from "./actions";

const DEPART: EtatDirect = { ok: false, message: "" };
const CHAMP =
  "w-full rounded-[6px] border border-bord bg-fond-2 px-3 py-[10px] text-[0.97rem] text-texte outline-none focus:border-[color:var(--plage-bord)]";

const MONTANTS: Record<string, string> = {
  certificat27: "27",
  masterclass37: "37",
  coaching97: "97",
  equipe: "497",
};

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer le paiement"}
    </button>
  );
}

export function PaiementDirect() {
  const [etat, action] = useActionState(enregistrerPaiementDirect, DEPART);
  const [produit, setProduit] = useState("masterclass37");

  return (
    <form action={action} className="flex max-w-[38rem] flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="etiquette">Adresse du payeur</span>
          <input name="email" type="email" required className={CHAMP} />
          <span className="text-[0.84rem] text-texte-3">
            Celle de son compte. Sans compte, l&apos;accès s&apos;ouvrira à sa
            première connexion avec cette adresse.
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="etiquette">Nom complet</span>
          <input name="nom" className={CHAMP} placeholder="Prénom Nom" />
          <span className="text-[0.84rem] text-texte-3">
            Facultatif. Ne remplace un nom que s&apos;il est incomplet — c&apos;est
            celui du certificat.
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="etiquette">Offre payée</span>
          <select
            name="produit"
            value={produit}
            onChange={(e) => setProduit(e.target.value)}
            className={CHAMP}
          >
            <option value="certificat27">Certificat Fondations — 27 $</option>
            <option value="masterclass37">La masterclass complète — 37 $</option>
            <option value="coaching97">Le cercle — 97 $</option>
            <option value="equipe">Équipe — 497 $</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="etiquette">Montant reçu ($)</span>
          <input
            name="montant"
            inputMode="decimal"
            key={produit}
            defaultValue={MONTANTS[produit]}
            className={CHAMP}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="etiquette">Par quel moyen</span>
        <input
          name="moyen"
          list="moyens"
          required
          placeholder="Airtel Money"
          className={CHAMP}
        />
        <datalist id="moyens">
          <option value="Airtel Money" />
          <option value="Orange Money" />
          <option value="M-Pesa" />
          <option value="Western Union" />
          <option value="Wave" />
          <option value="Virement bancaire" />
          <option value="Espèces" />
        </datalist>
        <span className="text-[0.84rem] text-texte-3">
          C&apos;est ce qui rendra le rapprochement lisible le jour où tu
          compareras avec le relevé Chariow.
        </span>
      </label>

      <label className="flex items-center gap-3">
        <input
          name="envoyer"
          type="checkbox"
          defaultChecked
          className="h-[16px] w-[16px] accent-[color:var(--voltage-2)]"
        />
        <span className="text-[0.97rem]">
          Envoyer le courriel de confirmation — le même qu&apos;une vente Chariow
        </span>
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

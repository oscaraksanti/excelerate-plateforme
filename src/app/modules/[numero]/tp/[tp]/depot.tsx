"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { deposerCopie, type EtatDepot } from "@/app/modules/tp-actions";
import { DepotFichier } from "@/components/depot-fichier";

const DEPART: EtatDepot = { ok: false, message: "" };

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Correction en cours…" : "Envoyer et faire corriger"}
    </button>
  );
}

export function DepotCopie({
  tpId,
  profilId,
  cheminPage,
  dejaDepose,
}: {
  tpId: string;
  profilId: string;
  cheminPage: string;
  dejaDepose: boolean;
}) {
  const [etat, action] = useActionState(deposerCopie, DEPART);
  const [fichier, setFichier] = useState<{ chemin: string; nom: string } | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <DepotFichier
        espace="depots"
        prefixe={`${profilId}/${tpId}`}
        discret={dejaDepose}
        libelle={dejaDepose ? "Déposer une nouvelle version" : "Choisir mon classeur"}
        onDepose={(r) => setFichier({ chemin: r.chemin, nom: r.nom })}
      />

      {fichier && (
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="tp_id" value={tpId} />
          <input type="hidden" name="chemin" value={fichier.chemin} />
          <input type="hidden" name="nom_fichier" value={fichier.nom} />
          <input type="hidden" name="chemin_page" value={cheminPage} />
          <p className="m-0 font-mono text-[0.88rem] text-texte-2">
            Prêt à envoyer : <span className="text-texte">{fichier.nom}</span>
          </p>
          <div>
            <Bouton />
          </div>
        </form>
      )}

      {etat.message && (
        <p
          role="status"
          className={`m-0 max-w-[36rem] border-l-[3px] bg-fond-2 px-4 py-3 text-[0.94rem] text-texte ${
            etat.ok ? "border-[color:var(--voltage-2)]" : "border-ko"
          }`}
        >
          {etat.message}
        </p>
      )}
    </div>
  );
}

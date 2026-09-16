"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  enregistrerTp,
  rattacherCorrige,
  rattacherDepart,
  type Etat,
} from "@/app/admin/tps/actions";
import { AIDE, CHAMP, CHAMP_MONO, LABEL } from "@/components/champs";
import { DepotFichier } from "@/components/depot-fichier";
import { pourChampDate } from "@/lib/formats";
import type { Tp } from "@/lib/tp";

const DEPART: Etat = { ok: false, message: "" };

function Bouton({ texte }: { texte: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : texte}
    </button>
  );
}

function Message({ etat }: { etat: Etat }) {
  if (!etat.message) return null;
  return (
    <p
      role="status"
      className={`m-0 max-w-[36rem] border-l-[3px] bg-fond-2 px-4 py-3 text-[0.93rem] text-texte ${
        etat.ok ? "border-[color:var(--voltage-2)]" : "border-ko"
      }`}
    >
      {etat.message}
    </p>
  );
}

export function FormulaireTp({ tp }: { tp: Tp }) {
  const [etat, action] = useActionState(enregistrerTp, DEPART);

  return (
    <form action={action} className="flex max-w-[40rem] flex-col gap-5">
      <input type="hidden" name="id" value={tp.id} />

      <div className="flex flex-col gap-2">
        <label htmlFor="titre" className={LABEL}>
          Titre
        </label>
        <input id="titre" name="titre" type="text" required defaultValue={tp.titre} className={CHAMP} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="enonce_md" className={LABEL}>
          L&apos;énoncé
        </label>
        <textarea
          id="enonce_md"
          name="enonce_md"
          rows={12}
          defaultValue={tp.enonce_md}
          placeholder={"## Ce qu'on te demande\n\n1. Convertis la plage en tableau structuré, nomme-le `Ventes`\n2. En `Analyse!B2`, retrouve le montant avec `RECHERCHEX`\n3. En `Analyse!D2`, liste les villes au-dessus du seuil avec `FILTRE`\n\n> Dépose le classeur au format .xlsx, sans le renommer."}
          className={`${CHAMP} resize-y font-mono text-[13.5px] leading-[1.7]`}
        />
        <p className={AIDE}>
          Markdown, comme pour les leçons. Sois précis sur les emplacements
          attendus : c&apos;est ce que la machine vérifie.
        </p>
      </div>

      <div className="flex flex-wrap gap-5">
        <div className="flex min-w-[13rem] flex-1 flex-col gap-2">
          <label htmlFor="ouvre_le" className={LABEL}>
            Ouverture des dépôts
          </label>
          <input
            id="ouvre_le"
            name="ouvre_le"
            type="datetime-local"
            defaultValue={pourChampDate(tp.ouvre_le)}
            className={CHAMP_MONO}
          />
        </div>
        <div className="flex min-w-[13rem] flex-1 flex-col gap-2">
          <label htmlFor="ferme_le" className={LABEL}>
            Fermeture
          </label>
          <input
            id="ferme_le"
            name="ferme_le"
            type="datetime-local"
            defaultValue={pourChampDate(tp.ferme_le)}
            className={CHAMP_MONO}
          />
        </div>
        <div className="flex w-[10rem] flex-col gap-2">
          <label htmlFor="corrections_requises" className={LABEL}>
            Corrections dues
          </label>
          <input
            id="corrections_requises"
            name="corrections_requises"
            type="number"
            min={1}
            max={10}
            defaultValue={tp.corrections_requises}
            className={CHAMP_MONO}
          />
        </div>
      </div>
      <p className={`${AIDE} -mt-2`}>
        Laisse les dates vides pour un dépôt ouvert en permanence. Le nombre de
        corrections dues est celui qui déverrouille la note des pairs.
      </p>

      <label className="flex cursor-pointer items-start gap-3 border border-bord bg-fond-2 px-4 py-[14px]">
        <input
          type="checkbox"
          name="publie"
          defaultChecked={tp.publie}
          className="mt-[3px] h-[16px] w-[16px] shrink-0 accent-[color:var(--voltage-2)]"
        />
        <span>
          <span className="block text-[0.97rem] font-semibold text-texte">Publié</span>
          <span className="mt-[2px] block text-[0.87rem] text-texte-2">
            Décoché, personne ne voit ce travail ni ne peut déposer.
          </span>
        </span>
      </label>

      <Message etat={etat} />
      <div>
        <Bouton texte="Enregistrer le travail pratique" />
      </div>
    </form>
  );
}

/* ── Le classeur de départ ──────────────────────────────────────── */

export function DepartTp({ tp }: { tp: Tp }) {
  const [etat, action] = useActionState(rattacherDepart, DEPART);
  const [chemin, setChemin] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <DepotFichier
        espace="ressources"
        prefixe={`tp/${tp.id}/depart`}
        discret={Boolean(tp.fichier_depart)}
        libelle={tp.fichier_depart ? "Remplacer le classeur de départ" : "Déposer le classeur de départ"}
        onDepose={(r) => setChemin(r.chemin)}
      />

      {chemin && !etat.ok && (
        <form action={action} className="flex items-center gap-3">
          <input type="hidden" name="id" value={tp.id} />
          <input type="hidden" name="chemin" value={chemin} />
          <Bouton texte="Confirmer ce classeur de départ" />
        </form>
      )}

      <Message etat={etat} />
    </div>
  );
}

/* ── Le corrigé ─────────────────────────────────────────────────── */

export function CorrigeTp({
  tp,
  dejaPose,
}: {
  tp: Tp;
  dejaPose: { grille: unknown; maj_le: string } | null;
}) {
  const [etat, action] = useActionState(rattacherCorrige, DEPART);
  const [chemin, setChemin] = useState("");

  const g = dejaPose?.grille as
    | { total?: number; cellules?: number; feuilles?: number; noms?: number }
    | undefined;

  return (
    <div className="flex flex-col gap-4">
      {g?.total ? (
        <div className="plage w-fit px-5 py-4">
          <span className="etiquette mb-2 block">Grille déduite</span>
          <p className="m-0 font-mono text-[0.92rem] tabular-nums">
            {g.total} points · {g.cellules} cellule{(g.cellules ?? 0) > 1 ? "s" : ""} à
            produire · {g.feuilles} feuille{(g.feuilles ?? 0) > 1 ? "s" : ""}
            {g.noms ? ` · ${g.noms} plage nommée${g.noms > 1 ? "s" : ""}` : ""}
          </p>
          <span className="poignee" aria-hidden="true" />
        </div>
      ) : (
        <p className="m-0 max-w-[34rem] border-l-[3px] border-ambre bg-fond-2 px-4 py-3 text-[0.93rem] text-texte">
          Aucun corrigé déposé. Les copies seront acceptées, mais sans note
          machine tant que celui-ci manque.
        </p>
      )}

      <DepotFichier
        espace="corriges"
        prefixe={tp.id}
        discret={Boolean(g?.total)}
        libelle={g?.total ? "Remplacer le corrigé" : "Déposer le corrigé"}
        onDepose={(r) => setChemin(r.chemin)}
      />

      {chemin && !etat.ok && (
        <form action={action} className="flex items-center gap-3">
          <input type="hidden" name="tp_id" value={tp.id} />
          <input type="hidden" name="chemin" value={chemin} />
          <Bouton texte="Analyser ce corrigé" />
        </form>
      )}

      <Message etat={etat} />
    </div>
  );
}

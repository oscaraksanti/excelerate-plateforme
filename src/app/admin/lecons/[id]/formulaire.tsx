"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { enregistrerLecon, type Etat } from "@/app/admin/actions";
import { AIDE, CHAMP, CHAMP_MONO, LABEL } from "@/components/champs";
import { pourChampDate } from "@/lib/formats";
import type { Lecon } from "@/lib/donnees";

const DEPART: Etat = { ok: false, message: "" };

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer la leçon"}
    </button>
  );
}

export function FormulaireLecon({ lecon }: { lecon: Lecon }) {
  const [etat, action] = useActionState(enregistrerLecon, DEPART);

  return (
    <form action={action} className="flex max-w-[40rem] flex-col gap-5">
      <input type="hidden" name="id" value={lecon.id} />

      <div className="flex flex-col gap-2">
        <label htmlFor="titre" className={LABEL}>
          Titre de la leçon
        </label>
        <input
          id="titre"
          name="titre"
          type="text"
          required
          defaultValue={lecon.titre}
          className={CHAMP}
        />
      </div>

      <div className="flex flex-wrap gap-5">
        <div className="flex w-[8rem] flex-col gap-2">
          <label htmlFor="numero" className={LABEL}>
            Ordre
          </label>
          <input
            id="numero"
            name="numero"
            type="number"
            min={1}
            required
            defaultValue={lecon.numero}
            className={CHAMP_MONO}
          />
        </div>
        <div className="flex w-[10rem] flex-col gap-2">
          <label htmlFor="duree_min" className={LABEL}>
            Durée (minutes)
          </label>
          <input
            id="duree_min"
            name="duree_min"
            type="number"
            min={0}
            defaultValue={lecon.duree_min ?? ""}
            placeholder="45"
            className={CHAMP_MONO}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="video" className={LABEL}>
          Vidéo YouTube
        </label>
        <input
          id="video"
          name="video"
          type="text"
          defaultValue={lecon.video_id ?? ""}
          placeholder="https://youtu.be/XXXXXXXXXXX"
          className={CHAMP_MONO}
        />
        <p className={AIDE}>
          Colle le lien complet — l&apos;identifiant est extrait tout seul.
          Laisse vide tant que le replay n&apos;est pas prêt.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="corps_md" className={LABEL}>
          Contenu de la leçon
        </label>
        <textarea
          id="corps_md"
          name="corps_md"
          rows={16}
          defaultValue={lecon.corps_md}
          placeholder={"## Ce qu'on voit ici\n\nUn paragraphe.\n\n- un point\n- un autre\n\nUne formule : `=FILTRE(Ventes;Ventes[Montant]>1000)`"}
          className={`${CHAMP} resize-y font-mono text-[13.5px] leading-[1.7]`}
        />
        <p className={AIDE}>
          Markdown : <code>## titre</code>, <code>**gras**</code>,{" "}
          <code>- liste</code>, <code>`formule`</code>, <code>&gt; encadré</code>.
          Les formules en accent grave ressortent en monospace.
        </p>
      </div>

      <div className="flex flex-wrap gap-5 border-t border-bord pt-5">
        <div className="flex w-[15rem] flex-col gap-2">
          <label htmlFor="acces" className={LABEL}>
            Qui peut l&apos;ouvrir
          </label>
          <select id="acces" name="acces" defaultValue={lecon.acces} className={CHAMP}>
            <option value="herite">Comme le module</option>
            <option value="libre">Libre — tous les inscrits</option>
            <option value="payant">Masterclass uniquement</option>
          </select>
        </div>
        <div className="flex min-w-[15rem] flex-1 flex-col gap-2">
          <label htmlFor="publie_le" className={LABEL}>
            Mise en ligne automatique
          </label>
          <input
            id="publie_le"
            name="publie_le"
            type="datetime-local"
            defaultValue={pourChampDate(lecon.publie_le)}
            className={CHAMP_MONO}
          />
        </div>
      </div>
      <p className={`${AIDE} -mt-2`}>
        Avec une date, la leçon s&apos;ouvre toute seule à ce moment-là — tu
        n&apos;as pas à être devant ton ordinateur le lendemain matin. Sans
        date, elle s&apos;ouvre dès que « Publiée » est coché.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="accroche" className={LABEL}>
          Ce qu&apos;on lit quand elle est verrouillée
        </label>
        <input
          id="accroche"
          name="accroche"
          type="text"
          maxLength={300}
          defaultValue={lecon.accroche}
          placeholder="Nettoyer 40 000 lignes en trois clics, et ne jamais recommencer."
          className={CHAMP}
        />
        <p className={AIDE}>
          Une phrase, pas une description technique. C&apos;est ce qui donne
          envie d&apos;ouvrir le cadenas.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 border border-bord bg-fond-2 px-4 py-[14px]">
        <input
          type="checkbox"
          name="publie"
          defaultChecked={lecon.publie}
          className="mt-[3px] h-[16px] w-[16px] shrink-0 accent-[color:var(--voltage-2)]"
        />
        <span>
          <span className="block text-[0.97rem] font-semibold text-texte">
            Publiée
          </span>
          <span className="mt-[2px] block text-[0.87rem] text-texte-2">
            Décochée, elle reste invisible même si le module est publié.
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

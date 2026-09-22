"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  accepterReponse,
  basculerUtile,
  modifierMessage,
  publierCommentaire,
  supprimerMessage,
  type EtatSimple,
} from "@/app/modules/actions";
import { ChampCapture } from "@/components/champ-capture";
import { TexteRiche } from "@/components/texte-riche";
import type { Fil, Message } from "@/lib/donnees";

const DEPART: EtatSimple = { ok: false, message: "" };

const CHAMP =
  "w-full resize-y rounded-[2px] border border-bord bg-fond px-[14px] py-[12px] text-[16px] text-texte outline-none placeholder:text-texte-3 focus:border-texte-2";

const ACTION =
  "font-mono text-[10.5px] tracking-[0.1em] uppercase transition-colors";

function Bouton({ texte }: { texte: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Envoi…" : texte}
    </button>
  );
}

function quand(iso: string) {
  const d = new Date(iso);
  const ecart = Math.floor((Date.now() - d.getTime()) / 60000);
  if (ecart < 1) return "à l'instant";
  if (ecart < 60) return `il y a ${ecart} min`;
  if (ecart < 1440) return `il y a ${Math.floor(ecart / 60)} h`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

function initiales(nom: string) {
  const p = nom.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  return (p[0][0] + (p[1]?.[0] ?? "")).toUpperCase();
}

function Signature({ m, petit }: { m: Message; petit?: boolean }) {
  return (
    <p className="m-0 mb-1 flex flex-wrap items-baseline gap-x-2 text-[0.88rem]">
      <span className="font-semibold text-texte">{m.auteur}</span>
      {m.est_instructeur && (
        <span className="rounded-[3px] bg-voltage px-[6px] py-[1px] font-mono text-[9px] font-semibold tracking-[0.1em] text-[color:var(--fond)] uppercase">
          Instructeur
        </span>
      )}
      {m.est_moi && !m.est_instructeur && (
        <span className="font-mono text-[9.5px] tracking-[0.1em] text-texte-3 uppercase">
          vous
        </span>
      )}
      <span
        className={`font-mono tracking-[0.08em] text-texte-3 uppercase ${petit ? "text-[10px]" : "text-[10.5px]"}`}
      >
        {quand(m.cree_le)}
      </span>
    </p>
  );
}

function Corps({ m }: { m: Message }) {
  return (
    <>
      <p className="m-0 whitespace-pre-wrap text-[0.96rem] leading-[1.55] text-texte-2">
        <TexteRiche texte={m.corps} />
      </p>
      {m.a_image && (
        <a
          href={`/api/captures/${m.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-[10px] block w-fit"
          title="Ouvrir en grand"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/captures/${m.id}`}
            alt="Capture jointe au message"
            loading="lazy"
            className="max-h-[320px] max-w-full rounded-[4px] border border-bord"
          />
        </a>
      )}
    </>
  );
}

/** « Utile » — posé ou retiré, avec son compte. */
function Utile({ m, chemin }: { m: Message; chemin: string }) {
  return (
    <form action={basculerUtile} className="contents">
      <input type="hidden" name="commentaire_id" value={m.id} />
      <input type="hidden" name="chemin" value={chemin} />
      <button
        type="submit"
        aria-pressed={m.moi_utile}
        title={m.moi_utile ? "Retirer" : "Ce message m'a aidé"}
        className={`${ACTION} ${
          m.moi_utile
            ? "font-semibold text-accent-texte"
            : "text-texte-3 hover:text-texte"
        }`}
      >
        {m.moi_utile ? "✦ utile" : "utile"}
        {m.utiles > 0 && <span className="ml-[5px] tabular-nums">{m.utiles}</span>}
      </button>
    </form>
  );
}

/**
 * Le corps d'un message et la rangée d'actions dessous.
 *
 * Un seul composant pour les questions et pour les réponses : ce qui
 * change entre les deux, c'est ce qu'on a le droit d'y faire, pas la
 * façon de l'afficher.
 */
function CorpsEtActions({
  m,
  chemin,
  fil,
  aDesReponses,
}: {
  m: Message;
  chemin: string;
  /** Le fil dont ce message est une réponse, s'il en est une. */
  fil?: Fil;
  aDesReponses?: boolean;
}) {
  const [edition, setEdition] = useState(false);
  const [etat, modifier] = useActionState(modifierMessage, DEPART);

  //  useActionState rend un objet neuf à chaque envoi. On s'en sert
  //  comme d'un jeton : dès qu'il change et qu'il est bon, on referme.
  //  Ajusté pendant le rendu plutôt que dans un effet — c'est ce que
  //  React recommande pour dériver un état, et ça évite le second
  //  rendu en cascade.
  const [vu, setVu] = useState<EtatSimple>(DEPART);
  if (etat !== vu) {
    setVu(etat);
    if (etat.ok) setEdition(false);
  }

  if (edition) {
    return (
      <form action={modifier} className="mt-2 flex flex-col gap-3">
        <input type="hidden" name="message_id" value={m.id} />
        <input type="hidden" name="chemin" value={chemin} />
        <textarea
          name="corps"
          rows={3}
          required
          autoFocus
          maxLength={4000}
          defaultValue={m.corps}
          className={CHAMP}
        />
        {m.a_image && (
          <label className="flex cursor-pointer items-center gap-2 text-[0.88rem] text-texte-2">
            <input
              type="checkbox"
              name="retirer_image"
              className="h-[15px] w-[15px] accent-[color:var(--voltage-2)]"
            />
            Retirer la capture jointe
          </label>
        )}
        {etat.message && (
          <p role="alert" className="m-0 text-[0.9rem] text-ko">
            {etat.message}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Bouton texte="Enregistrer" />
          <button
            type="button"
            onClick={() => setEdition(false)}
            className={`${ACTION} text-texte-3 hover:text-texte-2`}
          >
            annuler
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <Corps m={m} />
      <div className="mt-[10px] flex flex-wrap items-center gap-x-4 gap-y-2">
        <Utile m={m} chemin={chemin} />

        {fil?.je_peux_resoudre && (
          <form action={accepterReponse} className="contents">
            <input type="hidden" name="fil_id" value={fil.id} />
            <input
              type="hidden"
              name="reponse_id"
              value={m.est_acceptee ? "" : m.id}
            />
            <input type="hidden" name="chemin" value={chemin} />
            <button type="submit" className={`${ACTION} text-texte-3 hover:text-texte`}>
              {m.est_acceptee ? "ce n'était pas la bonne" : "c'est la bonne réponse"}
            </button>
          </form>
        )}

        {m.est_moi && (
          <button
            type="button"
            onClick={() => setEdition(true)}
            className={`${ACTION} text-texte-3 hover:text-texte`}
          >
            modifier
          </button>
        )}

        {/*  Supprimer une question qui a des réponses emporterait le
            travail de ceux qui ont pris le temps d'y répondre. Dans ce
            cas, il reste « modifier » — et le retrait de la capture. */}
        {m.est_moi && !aDesReponses && (
          <form action={supprimerMessage} className="contents">
            <input type="hidden" name="message_id" value={m.id} />
            <input type="hidden" name="chemin" value={chemin} />
            <button type="submit" className={`${ACTION} text-texte-3 hover:text-ko`}>
              supprimer
            </button>
          </form>
        )}
      </div>
    </>
  );
}

function Discussion({
  fil,
  leconId,
  chemin,
}: {
  fil: Fil;
  leconId: string;
  chemin: string;
}) {
  const [etat, action] = useActionState(publierCommentaire, DEPART);
  const [ouvert, setOuvert] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  //  Une fois la réponse partie, on referme : laisser le champ ouvert
  //  avec son texte donne l'impression que rien n'est parti, et on
  //  reçoit le message deux fois. Même jeton qu'ailleurs, ajusté
  //  pendant le rendu.
  const [vu, setVu] = useState<EtatSimple>(DEPART);
  if (etat !== vu) {
    setVu(etat);
    if (etat.ok) setOuvert(false);
  }

  //  Vider les champs est une action sur le DOM, pas un état : elle
  //  reste dans un effet, à sa place.
  useEffect(() => {
    if (etat.ok) form.current?.reset();
  }, [etat]);

  const resolu = Boolean(fil.reponse_acceptee);

  return (
    <li className="border-b border-bord-2 py-[20px]">
      <div className="grid grid-cols-[34px_minmax(0,1fr)] gap-3">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-fond-3 font-mono text-[11px] font-semibold text-texte-2">
          {initiales(fil.auteur)}
        </span>
        <div className="min-w-0">
          <p className="m-0 mb-1 flex flex-wrap items-baseline gap-x-2 text-[0.88rem]">
            <span className="font-semibold text-texte">{fil.auteur}</span>
            {fil.est_instructeur && (
              <span className="rounded-[3px] bg-voltage px-[6px] py-[1px] font-mono text-[9px] font-semibold tracking-[0.1em] text-[color:var(--fond)] uppercase">
                Instructeur
              </span>
            )}
            {fil.est_moi && !fil.est_instructeur && (
              <span className="font-mono text-[9.5px] tracking-[0.1em] text-texte-3 uppercase">
                vous
              </span>
            )}
            {resolu && (
              <span className="rounded-[3px] border border-[color:var(--voltage-2)] px-[6px] py-[1px] font-mono text-[9px] font-semibold tracking-[0.1em] text-accent-texte uppercase">
                Résolu
              </span>
            )}
            <span className="font-mono text-[10.5px] tracking-[0.08em] text-texte-3 uppercase">
              {quand(fil.cree_le)}
            </span>
          </p>
          <CorpsEtActions
            m={fil}
            chemin={chemin}
            aDesReponses={fil.reponses.length > 0}
          />
        </div>
      </div>

      {fil.reponses.length > 0 && (
        <ul className="m-0 mt-4 ml-[17px] flex list-none flex-col gap-4 border-l border-bord p-0 pl-[20px]">
          {fil.reponses.map((r) => (
            <li
              key={r.id}
              className={`grid grid-cols-[26px_minmax(0,1fr)] gap-[10px] ${
                r.est_acceptee
                  ? "-ml-[21px] border-l-2 border-[color:var(--voltage-2)] pl-[19px]"
                  : ""
              }`}
            >
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-fond-3 font-mono text-[9.5px] font-semibold text-texte-2">
                {initiales(r.auteur)}
              </span>
              <div className="min-w-0">
                {r.est_acceptee && (
                  <p className="m-0 mb-[3px] font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-texte uppercase">
                    ✓ Réponse retenue
                  </p>
                )}
                <Signature m={r} petit />
                <CorpsEtActions m={r} chemin={chemin} fil={fil} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 ml-[46px]">
        {ouvert ? (
          <form ref={form} action={action} className="flex flex-col gap-3">
            <input type="hidden" name="lecon_id" value={leconId} />
            <input type="hidden" name="chemin" value={chemin} />
            <input type="hidden" name="parent_id" value={fil.id} />
            <textarea
              name="corps"
              rows={2}
              required
              autoFocus
              maxLength={4000}
              placeholder={`Répondre à ${fil.auteur}…`}
              className={CHAMP}
            />
            <ChampCapture />
            {etat.message && (
              <p role="alert" className="m-0 text-[0.9rem] text-ko">
                {etat.message}
              </p>
            )}
            <div className="flex items-center gap-3">
              <Bouton texte="Répondre" />
              <button
                type="button"
                onClick={() => setOuvert(false)}
                className={`${ACTION} text-texte-3 hover:text-texte-2`}
              >
                annuler
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setOuvert(true)}
            className={`${ACTION} text-texte-3 hover:text-texte`}
          >
            {fil.reponses.length > 0 ? "Ajouter une réponse" : "Répondre"}
          </button>
        )}
      </div>
    </li>
  );
}

export function Commentaires({
  leconId,
  chemin,
  fils,
}: {
  leconId: string;
  chemin: string;
  fils: Fil[];
}) {
  const [etat, action] = useActionState(publierCommentaire, DEPART);
  const zone = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (etat.ok) zone.current?.reset();
  }, [etat]);

  const total = fils.reduce((s, f) => s + 1 + f.reponses.length, 0);

  return (
    <section className="mt-14 border-t border-bord pt-8">
      <h2 className="titre-m m-0 mb-1 text-[1.24rem]">
        Questions et remarques
        {total > 0 && (
          <span className="ml-2 font-mono text-[0.8rem] font-normal text-texte-3 tabular-nums">
            {total}
          </span>
        )}
      </h2>
      <p className="mt-0 mb-6 max-w-[34rem] text-[0.95rem] text-texte-2">
        Posez votre question ici, et répondez à celles des autres — c&apos;est
        souvent en expliquant qu&apos;on comprend vraiment. Une formule entre
        accents graves s&apos;affiche comme une formule&nbsp;:{" "}
        <code className="rounded-[3px] bg-fond-3 px-[5px] py-[1px] font-mono text-[0.88em] text-texte">
          =RECHERCHEX(…)
        </code>
      </p>

      <form ref={zone} action={action} className="mb-9 flex flex-col gap-3">
        <input type="hidden" name="lecon_id" value={leconId} />
        <input type="hidden" name="chemin" value={chemin} />
        <textarea
          name="corps"
          rows={3}
          required
          maxLength={4000}
          placeholder="Ta question…"
          className={CHAMP}
        />
        <ChampCapture />
        {etat.message && (
          <p role="alert" className="m-0 text-[0.9rem] text-ko">
            {etat.message}
          </p>
        )}
        <div>
          <Bouton texte="Publier" />
        </div>
      </form>

      {fils.length === 0 ? (
        <p className="m-0 text-[0.95rem] text-texte-3">
          Aucun message pour l&apos;instant. Sois le premier.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
          {fils.map((f) => (
            <Discussion key={f.id} fil={f} leconId={leconId} chemin={chemin} />
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { publierCommentaire, type EtatSimple } from "@/app/modules/actions";
import type { Fil, Message } from "@/lib/donnees";

const DEPART: EtatSimple = { ok: false, message: "" };

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

const CHAMP =
  "w-full resize-y rounded-[2px] border border-bord bg-fond px-[14px] py-[12px] text-[16px] text-texte outline-none placeholder:text-texte-3 focus:border-texte-2";

/** L'en-tête d'un message : qui parle, et quand. */
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

/* Texte brut, jamais de markdown : le contenu vient des participants,
   on ne lui donne aucun pouvoir. */
function Corps({ texte }: { texte: string }) {
  return (
    <p className="m-0 whitespace-pre-wrap text-[0.96rem] leading-[1.55] text-texte-2">
      {texte}
    </p>
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

  //  Une fois la réponse partie, on referme et on vide : laisser le
  //  champ ouvert avec son texte donne l'impression que rien n'est
  //  parti, et on reçoit le message deux fois.
  useEffect(() => {
    if (etat.ok) {
      form.current?.reset();
      setOuvert(false);
    }
  }, [etat]);

  return (
    <li className="border-b border-bord-2 py-[20px]">
      <div className="grid grid-cols-[34px_minmax(0,1fr)] gap-3">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-fond-3 font-mono text-[11px] font-semibold text-texte-2">
          {initiales(fil.auteur)}
        </span>
        <div className="min-w-0">
          <Signature m={fil} />
          <Corps texte={fil.corps} />
        </div>
      </div>

      {fil.reponses.length > 0 && (
        <ul className="m-0 mt-4 ml-[17px] flex list-none flex-col gap-4 border-l border-bord p-0 pl-[20px]">
          {fil.reponses.map((r) => (
            <li key={r.id} className="grid grid-cols-[26px_minmax(0,1fr)] gap-[10px]">
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-fond-3 font-mono text-[9.5px] font-semibold text-texte-2">
                {initiales(r.auteur)}
              </span>
              <div className="min-w-0">
                <Signature m={r} petit />
                <Corps texte={r.corps} />
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
                className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase hover:text-texte-2"
              >
                annuler
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setOuvert(true)}
            className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase hover:text-texte"
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
        souvent en expliquant qu&apos;on comprend vraiment. Tout le monde lit ce
        fil.
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

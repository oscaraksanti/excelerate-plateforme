"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { publierCommentaire, type EtatSimple } from "@/app/modules/actions";
import type { Commentaire } from "@/lib/donnees";

const DEPART: EtatSimple = { ok: false, message: "" };

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Envoi…" : "Publier"}
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

export function Commentaires({
  leconId,
  chemin,
  fils,
}: {
  leconId: string;
  chemin: string;
  fils: Commentaire[];
}) {
  const [etat, action] = useActionState(publierCommentaire, DEPART);
  const zone = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (etat.ok) zone.current?.reset();
  }, [etat]);

  return (
    <section className="mt-14 border-t border-bord pt-8">
      <h2 className="titre-m m-0 mb-1 text-[1.24rem]">Questions et remarques</h2>
      <p className="mt-0 mb-6 max-w-[34rem] text-[0.95rem] text-texte-2">
        Une question sur cette leçon ? Pose-la ici — les réponses profitent à
        tout le monde.
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
          className="w-full resize-y rounded-[2px] border border-bord bg-fond px-[14px] py-[12px] text-[16px] text-texte outline-none placeholder:text-texte-3 focus:border-texte-2"
        />
        {etat.message && (
          <p role="alert" className="m-0 text-[0.9rem] text-ko">
            {etat.message}
          </p>
        )}
        <div>
          <Bouton />
        </div>
      </form>

      {fils.length === 0 ? (
        <p className="m-0 text-[0.95rem] text-texte-3">
          Aucun message pour l&apos;instant. Sois le premier.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
          {fils.map((c) => (
            <li
              key={c.id}
              className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 border-b border-bord-2 py-[18px]"
            >
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-fond-3 font-mono text-[11px] font-semibold text-texte-2">
                {initiales(c.profils?.nom ?? "")}
              </span>
              <div>
                <p className="m-0 mb-1 flex flex-wrap items-baseline gap-x-2 text-[0.88rem]">
                  <span className="font-semibold text-texte">
                    {c.profils?.nom || "Participant"}
                  </span>
                  <span className="font-mono text-[10.5px] tracking-[0.08em] text-texte-3 uppercase">
                    {quand(c.cree_le)}
                  </span>
                </p>
                {/* Texte brut, jamais de markdown : le contenu vient des
                    participants, on ne lui donne aucun pouvoir. */}
                <p className="m-0 whitespace-pre-wrap text-[0.96rem] text-texte-2">
                  {c.corps}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

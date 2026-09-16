"use client";

import { useState } from "react";

/**
 * Lecteur YouTube a chargement differe.
 *
 * Tant qu'on n'a pas clique, seule la miniature est telechargee : le
 * lecteur YouTube pese pres d'un megaoctet, et une bonne partie de
 * l'audience est en connexion mobile lente. On n'impose ce poids qu'aux
 * gens qui lancent reellement la video.
 */
export function LecteurVideo({
  videoId,
  titre,
}: {
  videoId: string;
  titre: string;
}) {
  const [lance, setLance] = useState(false);

  if (lance) {
    return (
      <div className="relative w-full overflow-hidden rounded-[6px] border border-bord bg-encre pt-[56.25%]">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&hl=fr`}
          title={titre}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLance(true)}
      aria-label={`Lancer la vidéo : ${titre}`}
      className="group relative block w-full cursor-pointer overflow-hidden rounded-[6px] border border-bord bg-encre pt-[56.25%]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-85 transition-opacity group-hover:opacity-100"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center gap-3 rounded-[10px] bg-encre/85 px-6 py-[13px] text-[0.95rem] font-semibold text-voltage backdrop-blur-sm transition-transform group-hover:scale-[1.03]">
          <svg width="13" height="15" viewBox="0 0 13 15" aria-hidden="true">
            <path d="M0 0v15l13-7.5z" fill="currentColor" />
          </svg>
          Lancer la vidéo
        </span>
      </span>
    </button>
  );
}

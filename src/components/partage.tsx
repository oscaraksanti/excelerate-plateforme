"use client";

import { useState } from "react";

/* ══════════════════════════════════════════════════════════════════
   Partager son certificat.

   LinkedIn d'abord parce que c'est là qu'un recruteur le verra, mais
   WhatsApp juste après : à Kinshasa, Abidjan ou Douala, c'est là que
   la nouvelle circule vraiment.
   ══════════════════════════════════════════════════════════════════ */

export function Partage({
  url,
  mention,
  site,
}: {
  url: string;
  mention: string;
  site: string;
}) {
  const [copie, setCopie] = useState(false);

  const phrase =
    `Je viens d'obtenir mon certificat « ${mention} » — Excel boosté par l'IA, `
    + `avec Eurêka Services. Travaux rendus, copies corrigées, note vérifiable : `
    + `${url}\n\nLa formation est ici si ça t'intéresse : ${site}`;

  const liens = [
    {
      nom: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      nom: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(phrase)}`,
    },
    {
      nom: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
  ];

  async function copier() {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      setCopie(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {liens.map((l) => (
        <a
          key={l.nom}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="bouton-2 !px-4 !py-[8px] !text-[0.88rem]"
        >
          {l.nom}
        </a>
      ))}
      <button
        type="button"
        onClick={copier}
        className="cursor-pointer font-mono text-[10.5px] tracking-[0.12em] text-texte-3 uppercase hover:text-texte"
      >
        {copie ? "lien copié" : "copier le lien"}
      </button>
    </div>
  );
}

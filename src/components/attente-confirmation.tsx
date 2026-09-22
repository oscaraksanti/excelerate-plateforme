"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ══════════════════════════════════════════════════════════════════
   Tant que le paiement n'est pas confirmé.

   La page ne croit pas l'adresse : elle relit la base. C'est le Pulse
   de Chariow qui fait foi, et lui seul — une redirection peut être
   rejouée, mise en favori, ou arriver avant que l'argent ne soit
   validé. Annoncer « paiement reçu » sur la foi d'un paramètre
   d'adresse, c'est mentir une fois sur cent, et cette fois-là coûte
   cher.

   En mobile money, la validation prend parfois une minute : Airtel et
   M-Pesa ne répondent pas toujours dans la seconde. On attend donc
   franchement, puis on dit la vérité au lieu d'annoncer un échec qui
   n'en est pas un.
   ══════════════════════════════════════════════════════════════════ */

const PAS = 3000;
const ESSAIS_MAX = 13; // ≈ 40 secondes

export function AttenteConfirmation({ email }: { email: string }) {
  const router = useRouter();
  const [essais, setEssais] = useState(0);
  const fini = essais >= ESSAIS_MAX;

  useEffect(() => {
    if (fini) return;
    const t = setTimeout(() => {
      setEssais((n) => n + 1);
      router.refresh();
    }, PAS);
    return () => clearTimeout(t);
  }, [essais, fini, router]);

  if (!fini) {
    return (
      <div className="plage px-6 py-5">
        <span className="etiquette mb-2 block">
          Nous confirmons ton paiement…
        </span>
        <p className="m-0 mb-4 max-w-[31rem] text-[1.02rem] leading-[1.5]">
          Ça prend en général une à deux secondes. Avec le mobile money,
          parfois un peu plus — l&apos;opérateur nous répond à son rythme.
          <strong className="font-semibold text-texte">
            {" "}
            Ne ferme pas cette page.
          </strong>
        </p>
        <div
          className="h-[4px] w-full overflow-hidden rounded-full bg-fond-3"
          role="progressbar"
          aria-label="Confirmation en cours"
        >
          <div
            className="h-full bg-voltage transition-[width] duration-[3000ms] ease-linear"
            style={{ width: `${Math.round((essais / ESSAIS_MAX) * 100)}%` }}
          />
        </div>
        <span className="poignee" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="plage px-6 py-5">
      <span className="etiquette mb-2 block">
        La confirmation tarde un peu
      </span>
      <p className="m-0 mb-3 max-w-[32rem] text-[1.02rem] leading-[1.5]">
        Ton paiement est peut-être encore en validation chez l&apos;opérateur.
        <strong className="font-semibold text-texte">
          {" "}
          Si l&apos;argent est parti, il arrivera
        </strong>{" "}
        — et tu recevras le courriel de confirmation à{" "}
        <strong className="font-semibold text-texte">{email}</strong> dès que
        c&apos;est le cas. Tes accès s&apos;ouvriront au même moment.
      </p>
      <p className="m-0 mb-4 max-w-[32rem] text-[0.95rem] leading-[1.5] text-texte-2">
        Rien au bout de dix minutes ? Écris-nous avec la référence de ton reçu,
        on règle ça à la main.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="https://wa.me/243971601855?text=Bonjour%20Oscar%2C%20j%27ai%20pay%C3%A9%20mais%20mon%20acc%C3%A8s%20ne%20s%27est%20pas%20ouvert."
          target="_blank"
          rel="noopener noreferrer"
          className="bouton"
        >
          Écrire sur WhatsApp
        </a>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="bouton-2"
        >
          Revérifier
        </button>
      </div>
      <span className="poignee" aria-hidden="true" />
    </div>
  );
}

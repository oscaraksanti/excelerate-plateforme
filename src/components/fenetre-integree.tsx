"use client";

import { useSyncExternalStore } from "react";

/* ══════════════════════════════════════════════════════════════════
   « Ouvre cette page dans ton navigateur ».

   Un lien cliqué depuis WhatsApp, Facebook ou Gmail s'ouvre dans une
   fenêtre intégrée à l'application. Cette fenêtre a ses propres
   cookies : la session qu'on y crée n'existe pas dans Chrome, et la
   personne redemande un lien dix minutes plus tard. Sur 324
   reconnexions, 79 sont arrivées en moins d'une heure.

   Aucun cookie ne franchit cette frontière — c'est une règle du web,
   pas un défaut réparable. La seule chose utile est de le dire.
   ══════════════════════════════════════════════════════════════════ */

function detecter() {
  if (typeof navigator === "undefined") return false;
  const a = navigator.userAgent;
  return (
    /FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|MicroMessenger|WhatsApp/i.test(a)
    //  Android : les fenêtres intégrées portent « ; wv » et jamais
    //  « Chrome/… Safari » complet.
    || (/\bwv\b/.test(a) && /Android/i.test(a))
  );
}

const rien = () => () => {};

export function FenetreIntegree() {
  const integree = useSyncExternalStore(rien, detecter, () => false);
  if (!integree) return null;

  const apple = /iPhone|iPad|iPod/i.test(
    typeof navigator === "undefined" ? "" : navigator.userAgent,
  );

  return (
    <div className="mb-7 max-w-[35rem] border-l-[3px] border-ambre bg-fond-2 px-4 py-3 text-[0.94rem] leading-[1.55]">
      <strong className="font-semibold text-texte">
        Tu es dans la fenêtre d&apos;une application.
      </strong>{" "}
      Elle ne garde pas ta connexion : dans dix minutes, il faudrait
      redemander un lien. Ouvre plutôt cette page dans ton navigateur —{" "}
      {apple ? (
        <>le bouton <span className="text-texte">Partager</span>, puis{" "}
        <span className="text-texte">Ouvrir dans Safari</span>.</>
      ) : (
        <>les <span className="text-texte">trois points</span> en haut à
        droite, puis <span className="text-texte">Ouvrir dans Chrome</span>.</>
      )}{" "}
      Tu n&apos;auras plus jamais à te reconnecter.
    </div>
  );
}

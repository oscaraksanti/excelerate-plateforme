"use client";

import { useEffect, useRef, useState } from "react";

/* ══════════════════════════════════════════════════════════════════
   Le tunnel de paiement Chariow, affiché DANS la page.

   `data-style="frame"` — et non « tap », qui ouvre une fenêtre. Le
   formulaire s'insère dans la page, le widget nous renvoie sa hauteur
   au fil de la saisie, et l'acheteur ne voit jamais d'adresse Chariow.

   Les champs eux-mêmes restent servis par Chariow, dans un cadre :
   c'est une frontière de conformité, pas un choix. Aucun prestataire
   ne laisse héberger les champs de paiement sur un autre domaine.

   Le pré-remplissage passe par l'adresse de la page : le widget lit
   `chw_email`, `chw_first_name` et `chw_last_name` dans la barre
   d'adresse au moment où il démarre. On les y pose avec
   `replaceState`, qui ne fait aucun aller-retour serveur — l'adresse
   de l'apprenant n'apparaît donc dans aucun journal.

   Ça règle le défaut le plus coûteux de la chaîne : quelqu'un qui
   paie avec une autre adresse que celle de son compte n'a pas ses
   accès.
   ══════════════════════════════════════════════════════════════════ */

const SCRIPT = "https://js.chariowcdn.com/v1/widget.min.js";
const STYLE = "https://js.chariowcdn.com/v1/widget.min.css";

export function TunnelChariow({
  produitRef,
  boutique,
  email,
  prenom,
  nom,
}: {
  produitRef: string;
  boutique: string;
  email: string;
  prenom: string;
  nom: string;
}) {
  const hote = useRef<HTMLDivElement>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (email) params.set("chw_email", email);
    if (prenom) params.set("chw_first_name", prenom);
    if (nom) params.set("chw_last_name", nom);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );

    //  La feuille de style peut être posée sans condition : le
    //  navigateur ne la téléchargera qu'une fois.
    if (!document.querySelector(`link[href="${STYLE}"]`)) {
      const lien = document.createElement("link");
      lien.rel = "stylesheet";
      lien.href = STYLE;
      document.head.appendChild(lien);
    }

    //  Le script, lui, ne doit tourner qu'une fois par montage : il
    //  lit le div au chargement. En navigation interne il est déjà là,
    //  donc on le retire avant de le remettre.
    const ancien = document.querySelector(`script[src="${SCRIPT}"]`);
    if (ancien) ancien.remove();

    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => setPret(true);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [email, prenom, nom, produitRef]);

  return (
    <div className="relative min-h-[420px]">
      {!pret && (
        <p
          role="status"
          className="absolute inset-x-0 top-[28px] m-0 text-center font-mono text-[11px] tracking-[0.12em] text-texte-3 uppercase"
        >
          Chargement du paiement sécurisé…
        </p>
      )}
      <div ref={hote}>
        <div
          id="chariow-widget"
          data-product-id={produitRef}
          data-store-domain={boutique}
          data-style="frame"
          data-border-style="rounded"
          data-locale="fr"
          data-primary-color="#0B0E13"
          data-background-color="#FFFFFF"
        />
      </div>
    </div>
  );
}

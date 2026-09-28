"use client";

import { useState } from "react";

/* ══════════════════════════════════════════════════════════════════
   Les numéros WhatsApp de ceux qui ont payé.

   Le besoin est concret : les ajouter à un groupe, ou écrire à
   quelqu'un qui n'a pas rendu son travail. Deux gestes, donc deux
   outils — un lien par personne pour lui écrire tout de suite, et la
   liste entière d'un bloc pour la coller ailleurs.

   Ceux qui n'ont pas donné de numéro sont montrés quand même : c'est
   eux qu'il faut relancer par courriel, et les cacher ferait croire
   qu'ils n'existent pas.
   ══════════════════════════════════════════════════════════════════ */

export type Payeur = {
  profil_id: string | null;
  nom: string;
  email: string;
  telephone: string | null;
  produit: string;
};

const OFFRES: Record<string, string> = {
  certificat27: "certificat",
  masterclass37: "masterclass",
  coaching97: "cercle",
  equipe: "équipe",
};

/** wa.me n'accepte que les chiffres : ni +, ni espace, ni tiret. */
function pourWhatsApp(t: string) {
  return t.replace(/[^0-9]/g, "");
}

export function NumerosWhatsApp({ payeurs }: { payeurs: Payeur[] }) {
  const [copie, setCopie] = useState("");
  //  Le presse-papier peut être refusé — navigateur ancien, page non
  //  sécurisée, réglage d'entreprise. Un bouton qui ne fait rien est
  //  pire que pas de bouton : on montre alors le texte à copier.
  const [repli, setRepli] = useState("");

  const avec = payeurs.filter((p) => p.telephone);
  const sans = payeurs.filter((p) => !p.telephone);

  async function copier(quoi: "numeros" | "carnet") {
    const texte =
      quoi === "numeros"
        ? avec.map((p) => p.telephone).join("\n")
        : avec.map((p) => `${p.nom || p.email};${p.telephone}`).join("\n");
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(quoi);
      setRepli("");
      setTimeout(() => setCopie(""), 2500);
    } catch {
      setCopie("");
      setRepli(texte);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => copier("numeros")} className="bouton-2">
          {copie === "numeros"
            ? `${avec.length} numéros copiés`
            : `Copier les ${avec.length} numéros`}
        </button>
        <button
          type="button"
          onClick={() => copier("carnet")}
          className="cursor-pointer font-mono text-[10.5px] tracking-[0.12em] text-texte-3 uppercase hover:text-texte"
        >
          {copie === "carnet" ? "copié" : "copier nom ; numéro"}
        </button>
        {sans.length > 0 && (
          <span className="font-mono text-[11px] text-ambre-texte">
            {sans.length} sans numéro
          </span>
        )}
      </div>

      {repli && (
        <div className="mb-5">
          <p className="m-0 mb-2 text-[0.9rem] text-ambre-texte">
            Ton navigateur refuse le presse-papier. Voici la liste —
            sélectionne-la et copie-la à la main.
          </p>
          <textarea
            readOnly
            rows={6}
            value={repli}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-[6px] border border-bord bg-fond-2 px-3 py-2 font-mono text-[12px] text-texte outline-none"
          />
        </div>
      )}

      <ul className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
        {[...avec, ...sans].map((p) => (
          <li
            key={p.email}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-bord-2 py-[11px]"
          >
            <span className="min-w-0">
              <span className="block text-[0.95rem] text-texte">
                {p.nom || p.email}
                <span className="ml-2 font-mono text-[10px] tracking-[0.1em] text-accent-texte uppercase">
                  {OFFRES[p.produit] ?? p.produit}
                </span>
              </span>
              <span className="font-mono text-[10.5px] text-texte-3">{p.email}</span>
            </span>

            {p.telephone ? (
              <a
                href={`https://wa.me/${pourWhatsApp(p.telephone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[12px] tabular-nums whitespace-nowrap text-texte-2 underline decoration-bord underline-offset-[3px] hover:text-texte hover:decoration-[color:var(--voltage-2)]"
              >
                {p.telephone}
              </a>
            ) : (
              <span className="font-mono text-[11px] tracking-[0.1em] text-ambre-texte uppercase">
                pas de numéro
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { delivrer, type Etat } from "./actions";
import { nomComplet } from "@/lib/formats";

const DEPART: Etat = { ok: false, message: "" };

export type Du = {
  profil_id: string;
  email: string | null;
  nom: string | null;
  produit: string;
  achete_le: string;
  niveau_du: string;
  tps_rendus: number;
  tps_total: number;
  corrections: number;
  corrections_dues: number;
  moyenne: number | null;
  merite: boolean;
  deja_emis: boolean;
  niveau_emis: string | null;
};

const OFFRE: Record<string, string> = {
  certificat27: "Certificat Fondations · 27 $",
  masterclass37: "Masterclass · 37 $",
  coaching97: "Le cercle · 97 $",
  equipe: "Équipe · 497 $",
};

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton !px-4 !py-2 !text-[0.86rem]" disabled={pending}>
      {pending ? "…" : "Délivrer"}
    </button>
  );
}

function jour(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function ACertifier({ lignes }: { lignes: Du[] }) {
  const [etat, action] = useActionState(delivrer, DEPART);

  //  Ceux qui attendent quelque chose d'abord, les autres ensuite :
  //  cette liste sert à agir, pas à consulter.
  const ordre = [...lignes].sort((a, b) => {
    const rang = (l: Du) => (l.deja_emis ? 2 : l.merite ? 0 : 1);
    return rang(a) - rang(b) || a.achete_le.localeCompare(b.achete_le);
  });

  const du = ordre.filter((l) => l.merite && !l.deja_emis).length;

  return (
    <>
      <p className="mb-5 font-mono text-[0.9rem] text-texte-2 tabular-nums">
        {lignes.length} personne{lignes.length > 1 ? "s ont" : " a"} payé
        {du > 0 ? (
          <span className="text-accent-texte">
            {" "}
            · {du} certificat{du > 1 ? "s" : ""} à délivrer maintenant
          </span>
        ) : (
          <span className="text-texte-3"> · aucun ne remplit encore les conditions</span>
        )}
      </p>

      {etat.message && (
        <p
          role="status"
          className={`m-0 mb-5 border-l-[3px] bg-fond-2 px-4 py-3 text-[0.93rem] ${
            etat.ok ? "border-[color:var(--voltage-2)]" : "border-ko"
          }`}
        >
          {etat.message}
        </p>
      )}

      <ul className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
        {ordre.map((l) => {
          const nommable = nomComplet(l.nom);
          return (
            <li
              key={l.profil_id}
              className="grid grid-cols-1 gap-3 border-b border-bord py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="m-0 mb-1 flex flex-wrap items-baseline gap-x-3 text-[0.95rem]">
                  <span className="font-semibold text-texte">
                    {l.nom?.trim() || "— sans nom —"}
                  </span>
                  <span className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase">
                    {OFFRE[l.produit] ?? l.produit} · {jour(l.achete_le)}
                  </span>
                  <span className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase">
                    {l.niveau_du === "avance" ? "niveau avancé" : "fondations"}
                  </span>
                </p>
                <p className="m-0 font-mono text-[0.86rem] text-texte-2 tabular-nums">
                  {l.email} — TP {l.tps_rendus}/{l.tps_total} · corrections{" "}
                  {l.corrections}/{l.corrections_dues} · moyenne{" "}
                  {l.moyenne === null ? "—" : String(l.moyenne).replace(".", ",")}
                </p>
                {!nommable && !l.deja_emis && (
                  //  La délivrance échoue sans nom, et un certificat qui
                  //  porte « Joyce » ne désigne personne. Le dire ici
                  //  évite de le découvrir au moment de cliquer.
                  <p className="m-0 mt-1 text-[0.86rem] text-ambre-texte">
                    Nom incomplet — le certificat ne peut pas être établi. À
                    corriger dans sa fiche apprenant.
                  </p>
                )}
              </div>

              <div className="sm:justify-self-end">
                {l.deja_emis ? (
                  <span className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase">
                    délivré · {l.niveau_emis ?? "—"}
                  </span>
                ) : l.merite && nommable ? (
                  <form action={action}>
                    <input type="hidden" name="profil_id" value={l.profil_id} />
                    <input type="hidden" name="niveau" value={l.niveau_du} />
                    <Bouton />
                  </form>
                ) : (
                  <span className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase">
                    {l.merite ? "bloqué" : "en cours"}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

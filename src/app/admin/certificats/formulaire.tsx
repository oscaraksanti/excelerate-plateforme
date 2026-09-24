"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { delivrer, type Etat } from "./actions";

const DEPART: Etat = { ok: false, message: "" };

export type Ligne = {
  profil_id: string;
  email: string | null;
  nom: string;
  tps_rendus: number;
  tps_total: number;
  corrections: number;
  corrections_dues: number;
  moyenne: number | null;
  a_certificat: boolean;
};

function Bouton({ nb }: { nb: number }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending || nb === 0}>
      {pending
        ? "Délivrance…"
        : `Délivrer ${nb} certificat${nb > 1 ? "s" : ""}`}
    </button>
  );
}

export function TableauEligibles({ lignes }: { lignes: Ligne[] }) {
  const [etat, action] = useActionState(delivrer, DEPART);
  const [coches, setCoches] = useState<Set<string>>(new Set());

  function basculer(id: string) {
    const n = new Set(coches);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setCoches(n);
  }

  const merite = (l: Ligne) =>
    l.tps_total > 0 &&
    l.tps_rendus >= l.tps_total &&
    l.corrections >= l.corrections_dues &&
    (l.moyenne ?? 0) >= 12;

  //  874 comptes, dont 850 qui n'ont jamais rien déposé : les
  //  afficher tous rendait la page illisible et enterrait la liste des
  //  certificats délivrés. On ne montre que ceux qui ont commencé —
  //  pour tous les autres, la fiche de l'apprenant permet de délivrer
  //  au cas par cas.
  const commences = lignes.filter((l) => l.tps_rendus > 0);
  const caches = lignes.length - commences.length;
  const attente = commences.filter((l) => !l.a_certificat);
  const tousMeritants = attente.filter(merite).map((l) => l.profil_id);

  return (
    <form action={action}>
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <select
          name="niveau"
          defaultValue="fondamentaux"
          className="rounded-[2px] border border-bord bg-fond px-[13px] py-[10px] text-[15px] text-texte outline-none focus:border-texte-2"
        >
          <option value="fondamentaux">Certificat — les trois soirées</option>
          <option value="avance">Certificat avancé — la masterclass</option>
        </select>

        <button
          type="button"
          onClick={() => setCoches(new Set(tousMeritants))}
          className="bouton-2 !px-4 !py-[9px] !text-[0.88rem]"
        >
          Cocher les {tousMeritants.length} qui remplissent les conditions
        </button>

        <Bouton nb={coches.size} />
      </div>

      {etat.message && (
        <p
          role="status"
          className={`mb-6 max-w-[36rem] border-l-[3px] bg-fond-2 px-4 py-3 text-[0.94rem] text-texte ${
            etat.ok ? "border-[color:var(--voltage-2)]" : "border-ko"
          }`}
        >
          {etat.message}
        </p>
      )}

      {caches > 0 && (
        <p className="mb-4 text-[0.9rem] text-texte-2">
          {caches} compte{caches > 1 ? "s" : ""} n&apos;{caches > 1 ? "ont" : "a"}{" "}
          rien déposé et {caches > 1 ? "sont" : "est"} masqué
          {caches > 1 ? "s" : ""} ici. Pour délivrer à l&apos;un d&apos;eux
          malgré tout, passe par sa fiche depuis{" "}
          <span className="text-texte">Apprenants</span>.
        </p>
      )}

      <div className="overflow-x-auto rounded-[10px] border border-bord">
        <table className="w-full min-w-[720px] border-collapse text-[0.89rem]">
          <thead>
            <tr>
              {["", "Personne", "TP", "Corrections", "Moyenne", "Conditions"].map((t, i) => (
                <th
                  key={i}
                  className="border-b border-bord bg-fond-2 px-[13px] py-[10px] text-left font-mono text-[9.5px] font-semibold tracking-[0.13em] whitespace-nowrap text-texte-2 uppercase"
                >
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {commences.map((l) => {
              const bon = merite(l);
              return (
                <tr key={l.profil_id} className={l.a_certificat ? "opacity-55" : ""}>
                  <td className="border-b border-bord-2 px-[13px] py-[10px]">
                    {l.a_certificat ? (
                      <span
                        aria-hidden="true"
                        className="block h-[15px] w-[15px] rounded-[3px] border-2 border-[color:var(--plage-bord)] bg-voltage"
                      />
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          name="profil_id"
                          value={l.profil_id}
                          checked={coches.has(l.profil_id)}
                          onChange={() => basculer(l.profil_id)}
                          aria-label={`Sélectionner ${l.nom || l.email}`}
                          className="h-[15px] w-[15px] accent-[color:var(--voltage-2)]"
                        />
                      </>
                    )}
                  </td>
                  <td className="border-b border-bord-2 px-[13px] py-[10px]">
                    <span className="block font-medium text-texte">{l.nom || "— sans nom —"}</span>
                    <span className="font-mono text-[10.5px] text-texte-3">{l.email}</span>
                  </td>
                  <td className="border-b border-bord-2 px-[13px] py-[10px] font-mono text-[11.5px] tabular-nums text-texte-2">
                    {l.tps_rendus} / {l.tps_total}
                  </td>
                  <td className="border-b border-bord-2 px-[13px] py-[10px] font-mono text-[11.5px] tabular-nums text-texte-2">
                    {l.corrections} / {l.corrections_dues}
                  </td>
                  <td className="border-b border-bord-2 px-[13px] py-[10px] font-mono text-[11.5px] tabular-nums text-texte-2">
                    {l.moyenne !== null ? String(l.moyenne).replace(".", ",") : "—"}
                  </td>
                  <td className="border-b border-bord-2 px-[13px] py-[10px]">
                    {l.a_certificat ? (
                      <span className="font-mono text-[9.5px] tracking-[0.1em] text-accent-texte uppercase">
                        délivré
                      </span>
                    ) : bon ? (
                      <span className="font-mono text-[9.5px] tracking-[0.1em] text-accent-texte uppercase">
                        remplies
                      </span>
                    ) : (
                      <span className="font-mono text-[9.5px] tracking-[0.1em] text-texte-3 uppercase">
                        incomplètes
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </form>
  );
}

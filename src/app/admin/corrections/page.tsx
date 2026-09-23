import type { Metadata } from "next";
import { corrigerMoiMeme, liberer, repartir } from "./actions";
import { formaterDate } from "@/lib/formats";
import { clientServeur } from "@/lib/supabase/serveur";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Les corrections",
};

type Ligne = {
  tp_id: string;
  module: number;
  tp: string;
  copie_id: string;
  profil_id: string;
  nom: string;
  email: string;
  a_paye: boolean;
  depose_le: string;
  recues: number;
  reservees: number;
  dormantes: number;
  note_finale: number | null;
  definitive: boolean;
  ses_faites: number;
  ses_dues: number;
};

function nombre(n: number | null) {
  return n === null ? "—" : String(n).replace(".", ",");
}

export default async function PageCorrections() {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("etat_corrections");
  const lignes = (data as Ligne[]) ?? [];

  const parTp = new Map<string, Ligne[]>();
  for (const l of lignes) {
    const liste = parTp.get(l.tp_id);
    if (liste) liste.push(l);
    else parTp.set(l.tp_id, [l]);
  }

  const provisoires = lignes.filter((l) => !l.definitive).length;
  const sansLecteur = lignes.filter((l) => l.recues + l.reservees < 2).length;
  const dormantes = lignes.reduce((s, l) => s + l.dormantes, 0);

  return (
    <>
      <h1 className="titre-xl m-0 mb-2 text-[clamp(1.7rem,4vw,2.4rem)]">
        Les corrections
      </h1>
      <p className="mb-9 max-w-[38rem] text-[1.01rem] text-texte-2">
        Une note ne devient définitive qu&apos;après deux lectures de pairs.
        Cette page montre où ça coince : les copies que personne ne lit, et
        celles que quelqu&apos;un a réservées sans jamais les ouvrir.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { etiq: "Notes provisoires", val: provisoires },
          { etiq: "Copies sans deux lecteurs", val: sansLecteur },
          { etiq: "Réservations dormantes", val: dormantes },
        ].map((c) => (
          <div key={c.etiq} className="plage px-5 py-4">
            <p className="etiquette mb-2">{c.etiq}</p>
            <p className="titre-xl m-0 text-[2.1rem] tabular-nums">{c.val}</p>
            <span className="poignee" aria-hidden="true" />
          </div>
        ))}
      </div>

      <div className="mb-12 flex flex-wrap items-center gap-3">
        <form action={repartir}>
          <button type="submit" className="bouton-2">
            Répartir les copies
          </button>
        </form>
        <form action={liberer}>
          <input type="hidden" name="heures" value="48" />
          <button type="submit" className="bouton-2">
            Libérer les réservations de plus de 48 h
          </button>
        </form>
      </div>

      {lignes.length === 0 ? (
        <div className="plage px-6 py-5">
          <span className="etiquette mb-2 block">Aucune copie déposée</span>
          <p className="m-0 max-w-[30rem] text-[1.02rem] leading-[1.5]">
            Rien à répartir pour l&apos;instant.
          </p>
          <span className="poignee" aria-hidden="true" />
        </div>
      ) : (
        [...parTp.entries()].map(([tpId, copies]) => (
          <section key={tpId} className="mb-14 border-t-2 border-texte pt-6">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="titre-l m-0 text-[1.35rem]">{copies[0].tp}</h2>
              <span className="font-mono text-[11px] tabular-nums text-texte-2">
                {copies.length} copie{copies.length > 1 ? "s" : ""} ·{" "}
                {copies.filter((c) => c.definitive).length} note
                {copies.filter((c) => c.definitive).length > 1 ? "s" : ""} définitive
                {copies.filter((c) => c.definitive).length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[0.93rem]">
                <thead>
                  <tr className="border-b border-bord text-left">
                    <th className="py-2 pr-4 font-mono text-[10.5px] tracking-[0.1em] font-normal text-texte-3 uppercase">
                      Auteur
                    </th>
                    <th className="py-2 pr-4 font-mono text-[10.5px] tracking-[0.1em] font-normal text-texte-3 uppercase">
                      Déposée
                    </th>
                    <th className="py-2 pr-4 text-right font-mono text-[10.5px] tracking-[0.1em] font-normal text-texte-3 uppercase">
                      Lue
                    </th>
                    <th className="py-2 pr-4 text-right font-mono text-[10.5px] tracking-[0.1em] font-normal text-texte-3 uppercase">
                      Réservée
                    </th>
                    <th className="py-2 pr-4 text-right font-mono text-[10.5px] tracking-[0.1em] font-normal text-texte-3 uppercase">
                      Ses corrections
                    </th>
                    <th className="py-2 text-right font-mono text-[10.5px] tracking-[0.1em] font-normal text-texte-3 uppercase">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {copies.map((c) => (
                    <tr key={c.copie_id} className="border-b border-bord align-top">
                      <td className="py-[11px] pr-4">
                        <span className="block text-texte">
                          {c.nom?.trim() || c.email}
                          {c.a_paye && (
                            <span className="ml-2 font-mono text-[10px] tracking-[0.1em] text-accent-texte uppercase">
                              a payé
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-[10.5px] text-texte-3">
                          {c.email}
                        </span>
                      </td>
                      <td className="py-[11px] pr-4 text-texte-2">
                        {formaterDate(c.depose_le)}
                      </td>
                      <td className="py-[11px] pr-4 text-right font-mono tabular-nums">
                        <span className={c.recues >= 2 ? "text-texte" : "text-ko"}>
                          {c.recues}
                        </span>
                      </td>
                      <td className="py-[11px] pr-4 text-right font-mono tabular-nums text-texte-2">
                        {c.reservees}
                        {c.dormantes > 0 && (
                          <span className="text-ko"> · {c.dormantes} dorment</span>
                        )}
                      </td>
                      <td className="py-[11px] pr-4 text-right font-mono tabular-nums text-texte-2">
                        {c.ses_faites} / {c.ses_dues}
                      </td>
                      <td className="py-[11px] text-right font-mono tabular-nums">
                        <span className="text-texte">{nombre(c.note_finale)}</span>
                        <span className="block font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase">
                          {c.definitive ? "définitive" : "provisoire"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <form action={repartir}>
                <input type="hidden" name="tp_id" value={tpId} />
                <button
                  type="submit"
                  className="cursor-pointer font-mono text-[10.5px] tracking-[0.12em] text-texte-3 uppercase hover:text-texte"
                >
                  Répartir ce travail
                </button>
              </form>
              <form action={corrigerMoiMeme}>
                <input type="hidden" name="tp_id" value={tpId} />
                <button
                  type="submit"
                  className="cursor-pointer font-mono text-[10.5px] tracking-[0.12em] text-texte-3 uppercase hover:text-texte"
                >
                  M&apos;attribuer une copie à corriger
                </button>
              </form>
            </div>
          </section>
        ))
      )}
    </>
  );
}

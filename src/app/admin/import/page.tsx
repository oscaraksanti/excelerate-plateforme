import type { Metadata } from "next";
import { clientAdmin } from "@/lib/supabase/admin";
import { FormulaireImport } from "./formulaire";

export const metadata: Metadata = { title: "Importer les inscrits" };

export default async function PageImport() {
  const admin = clientAdmin();
  const { count } = await admin
    .from("inscrits")
    .select("email", { count: "exact", head: true });

  return (
    <>
      <h1 className="titre-xl m-0 mb-2 text-[clamp(1.7rem,4vw,2.4rem)]">
        Importer les inscrits
      </h1>
      <p className="mb-8 max-w-[35rem] text-[1.01rem] text-texte-2">
        Dépose l&apos;export de systeme.io, en <code>.csv</code> ou{" "}
        <code>.xlsx</code>. Relance-le autant de fois que tu veux à mesure que
        les inscriptions montent.
      </p>

      <div className="plage mb-9 w-fit px-5 py-4">
        <span className="etiquette mb-2 block">Actuellement en base</span>
        <p className="m-0 font-mono text-[1.4rem] tabular-nums">
          {count ?? 0} inscrit{(count ?? 0) > 1 ? "s" : ""}
        </p>
        <span className="poignee" aria-hidden="true" />
      </div>

      <FormulaireImport />

      <section className="mt-14 border-t border-bord pt-6">
        <h2 className="titre-m m-0 mb-3 text-[1.08rem]">
          Ce que l&apos;import fait, et ne fait pas
        </h2>
        <ul className="m-0 flex max-w-[35rem] list-none flex-col gap-[10px] p-0 text-[0.94rem] text-texte-2">
          {[
            "Il n'ouvre aucun compte : les comptes se créent à la première connexion.",
            "Le nom et le téléphone se posent tout seuls sur le profil, à ce moment-là.",
            "Les numéros sont remis au format international (+243…).",
            "Il n'envoie aucun email — tes envois restent sur systeme.io.",
          ].map((t) => (
            <li key={t} className="relative pl-[21px]">
              <span
                aria-hidden="true"
                className="absolute top-[0.62em] left-[2px] h-[7px] w-[7px] rounded-[1px] bg-[color:var(--voltage-2)]"
              />
              {t}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

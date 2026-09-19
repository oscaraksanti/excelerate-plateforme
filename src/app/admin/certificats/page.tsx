import type { Metadata } from "next";
import { revoquer } from "./actions";
import { formaterDate } from "@/lib/formats";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";
import { TableauEligibles, type Ligne } from "./formulaire";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Les certificats" };

export default async function PageCertificats() {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("eligibles_certificat");
  const lignes = (data as Ligne[]) ?? [];

  const admin = clientAdmin();
  const { data: remis } = await admin
    .from("certificats")
    .select("code, nom_affiche, niveau, emis_le, revoque_le")
    .order("emis_le", { ascending: false })
    .limit(100);

  return (
    <>
      <h1 className="titre-xl m-0 mb-2 text-[clamp(1.7rem,4vw,2.4rem)]">
        Les certificats
      </h1>
      <p className="mb-9 max-w-[35rem] text-[1.01rem] text-texte-2">
        Trois conditions : tous les TP rendus, toutes les corrections faites,
        moyenne d&apos;au moins 12 sur 20. Un certificat qui se mérite se vend ;
        un certificat qu&apos;on achète ne vaut rien.
      </p>

      <p className="mb-9">
        <a href="/admin/certificats/apercu" className="bouton-2">
          Voir le certificat →
        </a>
      </p>

      <section className="mb-14 border-t-2 border-texte pt-6">
        <h2 className="titre-l m-0 mb-5 text-[1.35rem]">Qui y a droit</h2>
        {lignes.length === 0 ? (
          <p className="text-texte-2">Aucun apprenant pour l&apos;instant.</p>
        ) : (
          <TableauEligibles lignes={lignes} />
        )}
      </section>

      <section>
        <h2 className="titre-l m-0 mb-5 text-[1.35rem]">
          Délivrés — {(remis ?? []).length}
        </h2>
        {(remis ?? []).length === 0 ? (
          <p className="text-texte-2">Aucun certificat délivré.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
            {(remis ?? []).map((c) => (
              <li
                key={c.code}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-bord-2 py-[13px]"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-texte">
                    {c.nom_affiche}
                    {c.revoque_le && (
                      <span className="ml-2 font-mono text-[9.5px] tracking-[0.1em] text-ko uppercase">
                        révoqué
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[10.5px] text-texte-3">
                    {c.code} · {c.niveau} · {formaterDate(c.emis_le)}
                  </span>
                </span>
                <span className="flex items-center gap-4">
                  <a href={`/c/${c.code}`} target="_blank" rel="noopener noreferrer" className="bouton-2 !px-4 !py-[7px] !text-[0.85rem]">
                    Voir
                  </a>
                  {!c.revoque_le && (
                    <form action={revoquer}>
                      <input type="hidden" name="code" value={c.code} />
                      <button
                        type="submit"
                        className="cursor-pointer font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase hover:text-ko"
                      >
                        Révoquer
                      </button>
                    </form>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

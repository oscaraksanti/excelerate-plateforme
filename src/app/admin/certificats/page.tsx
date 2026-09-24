import type { Metadata } from "next";
import Link from "next/link";
import { renvoyerAvis, retablir, revoquer } from "./actions";
import { formaterDate } from "@/lib/formats";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";
import { TableauEligibles, type Ligne } from "./formulaire";
import { ACertifier, type Du } from "./a-emettre";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Les certificats" };

export default async function PageCertificats() {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("eligibles_certificat");
  const lignes = (data as Ligne[]) ?? [];

  const { data: dus } = await supabase.rpc("certificats_a_emettre");
  const aEmettre = (dus as Du[]) ?? [];

  const admin = clientAdmin();
  const { data: remis } = await admin
    .from("certificats")
    .select("code, profil_id, nom_affiche, niveau, note, emis_le, revoque_le, revoque_motif, courriel_le")
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

      {/*  Ceux qui ont payé passent avant tout le reste : un certificat
          acheté et jamais délivré est une promesse rompue, pas un
          oubli. La liste « qui y a droit » compte des centaines de
          lignes — celle-ci en compte autant qu'il y a eu de ventes. */}
      <section className="mb-14 border-t-2 border-texte pt-6">
        <h2 className="titre-l m-0 mb-1 text-[1.35rem]">Dus — ils ont payé</h2>
        <p className="mt-2 mb-5 max-w-[35rem] text-[0.96rem] text-texte-2">
          Le certificat à 27 $ porte sur les modules gratuits ; la masterclass
          et le cercle portent sur tout le programme. Les conditions restent
          les mêmes pour tous.
        </p>
        {aEmettre.length === 0 ? (
          <p className="text-texte-2">Aucun achat pour l&apos;instant.</p>
        ) : (
          <ACertifier lignes={aEmettre} />
        )}
      </section>

      <section className="mb-14 border-t-2 border-texte pt-6">
        <h2 className="titre-l m-0 mb-5 text-[1.35rem]">Qui y a droit</h2>
        {lignes.length === 0 ? (
          <p className="text-texte-2">Aucun apprenant pour l&apos;instant.</p>
        ) : (
          <TableauEligibles lignes={lignes} />
        )}
      </section>

      <section>
        <h2 className="titre-l m-0 mb-1 text-[1.35rem]">
          Délivrés — {(remis ?? []).length}
        </h2>
        <p className="mt-2 mb-5 max-w-[35rem] text-[0.96rem] text-texte-2">
          Le nom est figé à la délivrance : le corriger après coup demande de
          révoquer et de réémettre. Un avis jamais parti veut dire que la
          personne ignore qu&apos;elle a un certificat.
        </p>
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
                  <Link
                    href={`/admin/apprenants/${c.profil_id}`}
                    className="block font-medium text-texte underline decoration-bord underline-offset-[3px] hover:decoration-[color:var(--voltage-2)]"
                  >
                    {c.nom_affiche}
                  </Link>
                  <span className="font-mono text-[10.5px] text-texte-3">
                    {c.code} · {c.niveau === "avance" ? "avancé" : "fondations"}
                    {c.note !== null ? ` · ${String(c.note).replace(".", ",")}/20` : ""} ·{" "}
                    {formaterDate(c.emis_le)}
                  </span>
                  <span className="block font-mono text-[10.5px]">
                    {c.revoque_le ? (
                      <span className="text-ko">
                        révoqué {formaterDate(c.revoque_le)}
                        {c.revoque_motif ? ` — ${c.revoque_motif}` : ""}
                      </span>
                    ) : c.courriel_le ? (
                      <span className="text-texte-3">
                        avis envoyé {formaterDate(c.courriel_le)}
                      </span>
                    ) : (
                      <span className="text-ambre-texte">avis jamais envoyé</span>
                    )}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-4">
                  <a
                    href={`/c/${c.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bouton-2 !px-4 !py-[7px] !text-[0.85rem]"
                  >
                    Voir
                  </a>
                  {c.revoque_le ? (
                    <form action={retablir}>
                      <input type="hidden" name="code" value={c.code} />
                      <button
                        type="submit"
                        className="cursor-pointer font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase hover:text-texte"
                      >
                        Rétablir
                      </button>
                    </form>
                  ) : (
                    <>
                      <form action={renvoyerAvis}>
                        <input type="hidden" name="code" value={c.code} />
                        <button
                          type="submit"
                          className="cursor-pointer font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase hover:text-texte"
                        >
                          {c.courriel_le ? "Renvoyer" : "Envoyer l'avis"}
                        </button>
                      </form>
                      <form action={revoquer} className="flex items-center gap-2">
                        <input type="hidden" name="code" value={c.code} />
                        <input
                          name="motif"
                          placeholder="motif"
                          className="w-[8rem] rounded-[6px] border border-bord bg-fond-2 px-2 py-[5px] text-[0.82rem] text-texte outline-none focus:border-[color:var(--plage-bord)]"
                        />
                        <button
                          type="submit"
                          className="cursor-pointer font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase hover:text-ko"
                        >
                          Révoquer
                        </button>
                      </form>
                    </>
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

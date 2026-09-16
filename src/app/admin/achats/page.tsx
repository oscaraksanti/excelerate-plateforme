import type { Metadata } from "next";
import Link from "next/link";
import { EnteteApp } from "@/components/entete-app";
import { exigerAdmin } from "@/lib/admin";
import { formaterDate } from "@/lib/formats";
import { clientAdmin } from "@/lib/supabase/admin";
import { listerProduits } from "@/lib/offres";
import { basculerProduit } from "./actions";

export const metadata: Metadata = { title: "Les ventes" };

const NET = { certificat27: 24.3, masterclass37: 33.3, coaching97: 87.3, equipe: 0 };

export default async function PageAchats() {
  const profil = await exigerAdmin();
  const produits = await listerProduits();

  const admin = clientAdmin();
  const { data: achats } = await admin
    .from("achats")
    .select("id, email, produit, montant, chariow_ref, paye_le, profil_id")
    .order("paye_le", { ascending: false })
    .limit(200);

  const lignes = achats ?? [];
  const brut = lignes.reduce((s, a) => s + Number(a.montant ?? 0), 0);
  const net = lignes.reduce(
    (s, a) => s + (NET[a.produit as keyof typeof NET] ?? 0),
    0,
  );
  const orphelins = lignes.filter((a) => !a.profil_id).length;

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <Link href="/admin" className="etiquette mb-6 inline-block hover:text-texte">
          ← Administration
        </Link>

        <h1 className="titre-xl m-0 mb-8 text-[clamp(1.8rem,4.4vw,2.5rem)]">
          Les ventes
        </h1>

        <div className="mb-12 flex flex-wrap gap-10 border-y border-bord py-5">
          {[
            { etiq: "Ventes", val: String(lignes.length) },
            { etiq: "Encaissé brut", val: `${brut.toFixed(0)} $` },
            { etiq: "Net après Chariow", val: `${net.toFixed(0)} $` },
            { etiq: "Sans compte", val: String(orphelins) },
          ].map((s) => (
            <span key={s.etiq} className="flex flex-col gap-1">
              <span className="etiquette">{s.etiq}</span>
              <span className="titre-l text-[1.7rem] tabular-nums">{s.val}</span>
            </span>
          ))}
        </div>

        <section className="mb-14">
          <h2 className="titre-l m-0 mb-1 text-[1.4rem]">Les offres</h2>
          <p className="mt-2 mb-5 max-w-[35rem] text-[0.96rem] text-texte-2">
            Le certificat à 27 $ doit rester inactif jusqu&apos;au mercredi
            soir. Annoncé lundi, il ancre toute l&apos;audience en dessous de la
            masterclass.
          </p>

          <ul className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
            {produits.map((p) => (
              <li
                key={p.ref}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-bord py-[15px]"
              >
                <span className="min-w-0">
                  <span className="block text-[1rem] font-medium text-texte">
                    {p.titre}{" "}
                    <span className="font-mono text-[0.85rem] text-texte-2">
                      {p.montant !== null ? `${p.montant} $` : ""}
                    </span>
                  </span>
                  <span className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3">
                    {p.ref}
                  </span>
                </span>
                <form action={basculerProduit} className="flex items-center gap-3">
                  <input type="hidden" name="ref" value={p.ref} />
                  <input type="hidden" name="actif" value={p.actif ? "0" : "1"} />
                  <span
                    className={`rounded-[3px] px-2 py-[3px] font-mono text-[9.5px] tracking-[0.12em] uppercase ${
                      p.actif
                        ? "bg-[color:var(--plage-fond)] text-accent-texte"
                        : "bg-fond-3 text-texte-2"
                    }`}
                  >
                    {p.actif ? "Active" : "Inactive"}
                  </span>
                  <button type="submit" className="bouton-2 !px-4 !py-2 !text-[0.85rem]">
                    {p.actif ? "Désactiver" : "Activer"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="titre-l m-0 mb-5 text-[1.4rem]">Les paiements reçus</h2>
          {lignes.length === 0 ? (
            <p className="text-texte-2">Aucun paiement pour l&apos;instant.</p>
          ) : (
            <div className="overflow-x-auto rounded-[10px] border border-bord">
              <table className="w-full min-w-[620px] border-collapse text-[0.9rem]">
                <thead>
                  <tr>
                    {["Quand", "Adresse", "Produit", "Montant", "Compte"].map((t) => (
                      <th
                        key={t}
                        className="border-b border-bord bg-fond-2 px-[14px] py-[11px] text-left font-mono text-[9.5px] font-semibold tracking-[0.13em] whitespace-nowrap text-texte-2 uppercase"
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((a) => (
                    <tr key={a.id}>
                      <td className="border-b border-bord-2 px-[14px] py-[11px] font-mono text-[11.5px] whitespace-nowrap text-texte-2">
                        {formaterDate(a.paye_le)}
                      </td>
                      <td className="border-b border-bord-2 px-[14px] py-[11px] text-texte">
                        {a.email}
                      </td>
                      <td className="border-b border-bord-2 px-[14px] py-[11px] font-mono text-[11.5px] text-texte-2">
                        {a.produit}
                      </td>
                      <td className="border-b border-bord-2 px-[14px] py-[11px] font-mono text-[11.5px] tabular-nums text-texte-2">
                        {a.montant !== null ? `${a.montant} $` : "—"}
                      </td>
                      <td className="border-b border-bord-2 px-[14px] py-[11px]">
                        {a.profil_id ? (
                          <span className="font-mono text-[10px] tracking-[0.1em] text-accent-texte uppercase">
                            rattaché
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] tracking-[0.1em] text-ambre-texte uppercase">
                            en attente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-5 max-w-[35rem] text-[0.9rem] text-texte-3">
            « En attente » signifie que la personne a payé mais ne s&apos;est pas
            encore connectée avec cette adresse. Le rattachement se fera tout
            seul à sa première connexion.
          </p>
        </section>
      </main>
    </>
  );
}

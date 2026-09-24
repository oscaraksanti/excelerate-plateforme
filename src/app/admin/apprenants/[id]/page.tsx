import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { renvoyerAvis, retablir, revoquer } from "@/app/admin/certificats/actions";
import { exigerAdmin } from "@/lib/admin";
import { lireFiche } from "@/lib/fiche";
import { formaterDate, nomComplet } from "@/lib/formats";
import { Delivrer, Ecrire, Identite, Messages } from "./formulaires";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Fiche apprenant",
};

const OFFRES: Record<string, string> = {
  certificat27: "Certificat Fondations · 27 $",
  masterclass37: "Masterclass · 37 $",
  coaching97: "Le cercle · 97 $",
  equipe: "Équipe · 497 $",
};

function note(n: number | null) {
  return n === null ? "—" : String(n).replace(".", ",");
}

export default async function FicheApprenant({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigerAdmin();
  const { id } = await params;
  const f = await lireFiche(id);
  if (!f) notFound();

  const rendus = f.travaux.filter((t) => t.copie_id);
  const dues = rendus.reduce((s, t) => s + t.requises, 0);
  const faites = rendus.reduce((s, t) => s + t.faites, 0);
  const notes = rendus
    .map((t) => t.note_finale)
    .filter((n): n is number => n !== null);
  const moyenne =
    notes.length > 0 ? notes.reduce((s, n) => s + n, 0) / notes.length : null;

  const retenues = f.travaux.reduce((s, t) => s + t.retenues, 0);
  const dormantes = f.travaux.reduce((s, t) => s + t.dormantes, 0);

  const paye = f.achats.length > 0;
  const dansLeCercle = f.achats.some((a) => a.produit === "coaching97");
  const avance = f.achats.some((a) =>
    ["masterclass37", "coaching97", "equipe"].includes(a.produit),
  );
  const vivant = f.certificats.find((c) => !c.revoque_le) ?? null;
  const complet = nomComplet(f.nom);

  const chiffres = [
    { etiq: "Leçons terminées", val: `${f.lecons_finies} / ${f.lecons_total}` },
    { etiq: "TP rendus", val: `${rendus.length} / ${f.travaux.length}` },
    { etiq: "Corrections rendues", val: `${faites} / ${dues}` },
    { etiq: "Moyenne", val: moyenne === null ? "—" : note(Math.round(moyenne * 100) / 100) },
  ];

  return (
    <>
      <Link href="/admin/apprenants" className="etiquette mb-6 inline-block hover:text-texte">
        ← Les apprenants
      </Link>

      <div className="mb-3 flex flex-wrap items-baseline gap-3">
        <h1 className="titre-xl m-0 text-[clamp(1.6rem,4vw,2.3rem)]">
          {f.nom?.trim() || f.email || "Sans nom"}
        </h1>
        {paye && (
          <span className="font-mono text-[10px] tracking-[0.12em] text-accent-texte uppercase">
            client
          </span>
        )}
        {f.role === "admin" && (
          <span className="font-mono text-[10px] tracking-[0.12em] text-texte-3 uppercase">
            administration
          </span>
        )}
      </div>

      <p className="mb-9 font-mono text-[0.88rem] text-texte-2">
        {f.email}
        {f.telephone ? ` · ${f.telephone}` : ""}
        <br />
        inscrit {formaterDate(f.cree_le)}
        {f.origine === "import" ? " (importé)" : ""}
        {f.vu_le ? ` · vu ${formaterDate(f.vu_le)}` : " · jamais connecté"}
        {f.poids_correcteur < 1 && (
          <span className="text-ambre-texte">
            {" "}
            · poids correcteur {String(f.poids_correcteur).replace(".", ",")}
          </span>
        )}
      </p>

      <div className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {chiffres.map((c) => (
          <div key={c.etiq} className="plage px-5 py-4">
            <p className="etiquette mb-2">{c.etiq}</p>
            <p className="titre-l m-0 text-[1.5rem] tabular-nums">{c.val}</p>
            <span className="poignee" aria-hidden="true" />
          </div>
        ))}
      </div>

      {/* ── Le certificat ────────────────────────────────── */}
      <section className="mb-14 border-t-2 border-texte pt-6">
        <h2 className="titre-l m-0 mb-1 text-[1.35rem]">Le certificat</h2>
        <p className="mt-2 mb-6 max-w-[35rem] text-[0.96rem] text-texte-2">
          Il porte le nom de la fiche, figé au moment de la délivrance. Le
          changer ensuite demande de révoquer et de réémettre.
        </p>

        {f.certificats.length > 0 && (
          <ul className="m-0 mb-7 flex max-w-[40rem] list-none flex-col gap-0 border-t border-bord p-0">
            {f.certificats.map((c) => (
              <li key={c.code} className="border-b border-bord-2 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-medium text-texte">
                      {c.nom_affiche}
                      {c.revoque_le && (
                        <span className="ml-2 font-mono text-[9.5px] tracking-[0.1em] text-ko uppercase">
                          révoqué {formaterDate(c.revoque_le)}
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[10.5px] text-texte-3">
                      {c.code} · {c.niveau === "avance" ? "avancé" : "fondations"} ·{" "}
                      {note(c.note)}/20 · délivré {formaterDate(c.emis_le)}
                    </span>
                    <span className="block font-mono text-[10.5px] text-texte-3">
                      {c.courriel_le
                        ? `avis envoyé ${formaterDate(c.courriel_le)}`
                        : "avis jamais envoyé"}
                    </span>
                    {c.revoque_motif && (
                      <span className="block text-[0.88rem] text-texte-2">
                        Motif : {c.revoque_motif}
                      </span>
                    )}
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
                            Renvoyer l&apos;avis
                          </button>
                        </form>
                        <form action={revoquer} className="flex items-center gap-2">
                          <input type="hidden" name="code" value={c.code} />
                          <input
                            name="motif"
                            placeholder="motif"
                            className="w-[9rem] rounded-[6px] border border-bord bg-fond-2 px-2 py-[5px] text-[0.82rem] text-texte outline-none focus:border-[color:var(--plage-bord)]"
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
                </div>
              </li>
            ))}
          </ul>
        )}

        {!vivant &&
          (complet ? (
            <Delivrer id={f.id} niveauSuggere={avance ? "avance" : "fondamentaux"} />
          ) : (
            <p className="m-0 max-w-[35rem] border-l-[3px] border-ambre bg-fond-2 px-4 py-3 text-[0.94rem]">
              Nom incomplet — corrige-le plus bas avant de délivrer quoi que ce
              soit. C&apos;est ce nom qui sera imprimé.
            </p>
          ))}
      </section>

      {/* ── Les achats ───────────────────────────────────── */}
      <section className="mb-14 border-t-2 border-texte pt-6">
        <h2 className="titre-l m-0 mb-5 text-[1.35rem]">Ce qu&apos;il a acheté</h2>
        {f.achats.length === 0 ? (
          <p className="m-0 text-[0.96rem] text-texte-2">
            Aucun achat. Accès aux modules 0 à 3 seulement.
          </p>
        ) : (
          <ul className="m-0 flex max-w-[40rem] list-none flex-col gap-0 border-t border-bord p-0">
            {f.achats.map((a) => (
              <li
                key={a.chariow_ref}
                className="flex flex-wrap items-baseline justify-between gap-3 border-b border-bord-2 py-[13px]"
              >
                <span>
                  <span className="block text-texte">{OFFRES[a.produit] ?? a.produit}</span>
                  <span className="font-mono text-[10.5px] text-texte-3">
                    {a.chariow_ref}
                  </span>
                </span>
                <span className="font-mono text-[12px] tabular-nums text-texte-2">
                  {a.montant === null ? "—" : `${a.montant} $`} · {formaterDate(a.paye_le)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Les travaux ──────────────────────────────────── */}
      <section className="mb-14 border-t-2 border-texte pt-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="titre-l m-0 text-[1.35rem]">Ses travaux pratiques</h2>
          {retenues > 0 && (
            <span className="font-mono text-[11px] tabular-nums text-texte-2">
              {retenues} copie{retenues > 1 ? "s" : ""} d&apos;autrui en attente chez lui
              {dormantes > 0 && (
                <span className="text-ko"> · {dormantes} depuis plus de 48 h</span>
              )}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[0.93rem]">
            <thead>
              <tr className="border-b border-bord text-left">
                {["Travail", "Déposé", "Machine", "Pairs", "Finale", "Ses corrections"].map(
                  (t, i) => (
                    <th
                      key={t}
                      className={`py-2 pr-4 font-mono text-[10.5px] tracking-[0.1em] font-normal text-texte-3 uppercase ${
                        i >= 2 ? "text-right" : ""
                      }`}
                    >
                      {t}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {f.travaux.map((t) => (
                <tr
                  key={t.tp_id}
                  className={`border-b border-bord ${t.copie_id ? "" : "opacity-50"}`}
                >
                  <td className="py-[11px] pr-4">
                    <span className="block text-texte">{t.titre}</span>
                    <span className="font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase">
                      module {t.module} · {t.acces === "paye" ? "payant" : "gratuit"}
                    </span>
                  </td>
                  <td className="py-[11px] pr-4 text-texte-2">
                    {t.depose_le ? formaterDate(t.depose_le) : "—"}
                  </td>
                  <td className="py-[11px] pr-4 text-right font-mono tabular-nums text-texte-2">
                    {note(t.note_machine)}
                  </td>
                  <td className="py-[11px] pr-4 text-right font-mono tabular-nums text-texte-2">
                    {note(t.note_pairs)}
                    {t.copie_id && (
                      <span className="block text-[10px] text-texte-3">
                        {t.recues} reçue{t.recues > 1 ? "s" : ""}
                      </span>
                    )}
                  </td>
                  <td className="py-[11px] pr-4 text-right font-mono tabular-nums">
                    <span className="text-texte">{note(t.note_finale)}</span>
                    {t.copie_id && (
                      <span className="block font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase">
                        {t.definitive ? "définitive" : "provisoire"}
                      </span>
                    )}
                  </td>
                  <td className="py-[11px] text-right font-mono tabular-nums">
                    <span className={t.faites >= t.requises ? "text-texte-2" : "text-ko"}>
                      {t.faites} / {t.requises}
                    </span>
                    {t.retenues > 0 && (
                      <span className="block text-[10px] text-texte-3">
                        {t.retenues} en attente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Lui écrire ───────────────────────────────────── */}
      <section className="mb-14 border-t-2 border-texte pt-6">
        <h2 className="titre-l m-0 mb-1 text-[1.35rem]">Lui écrire</h2>
        <p className="mt-2 mb-6 max-w-[35rem] text-[0.96rem] text-texte-2">
          Les messages tout faits reprennent exactement les textes des relances
          groupées. En dessous, de quoi répondre à une situation qu&apos;aucun
          d&apos;eux ne couvre.
        </p>
        <Messages
          id={f.id}
          dansLeCercle={dansLeCercle}
          aUnCertificat={Boolean(vivant)}
        />
        <div className="mt-9">
          <Ecrire id={f.id} />
        </div>
      </section>

      {/* ── L'identité ───────────────────────────────────── */}
      <section className="border-t-2 border-texte pt-6">
        <h2 className="titre-l m-0 mb-1 text-[1.35rem]">Corriger sa fiche</h2>
        <p className="mt-2 mb-6 max-w-[35rem] text-[0.96rem] text-texte-2">
          Beaucoup n&apos;ont tapé qu&apos;un prénom à l&apos;inscription. Le nom
          d&apos;ici est celui qui sera imprimé sur le certificat.
        </p>
        <Identite
          id={f.id}
          nom={f.nom}
          telephone={f.telephone}
          complet={complet}
        />
      </section>
    </>
  );
}

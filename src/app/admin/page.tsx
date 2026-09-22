import type { Metadata } from "next";
import Link from "next/link";
import { lireMetriques } from "@/lib/metriques";
import { lireDirect, formaterDebut } from "@/lib/direct";
import { statsQcm } from "@/lib/qcm";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Tableau de bord" };


function pourcent(a: number, b: number) {
  if (!b) return "—";
  return `${Math.round((a / b) * 100)} %`;
}

export default async function TableauDeBordAdmin() {
  const m = await lireMetriques();
  const direct = await lireDirect();
  const qcm = (await statsQcm()).filter((q) => q.reponses > 0);

  const netEstime =
    m.ventes > 0 ? Math.round(m.ca_brut * 0.9) : 0;

  const cartes = [
    { etiq: "Inscrits", val: m.inscrits, note: `${m.importes} importés` },
    { etiq: "Ont ouvert un compte", val: m.connectes, note: pourcent(m.connectes, m.inscrits) },
    { etiq: "Actifs sur 7 jours", val: m.actifs_7j, note: pourcent(m.actifs_7j, m.inscrits) },
    { etiq: "Ventes", val: m.ventes, note: `${netEstime} $ net estimé` },
  ];

  const engagement = [
    { titre: "Leçons ouvertes", val: m.lecons_vues },
    { titre: "Leçons terminées", val: m.lecons_finies },
    { titre: "Copies déposées", val: m.copies },
    { titre: "Corrections rendues", val: m.corrections },
    { titre: "Questions posées", val: m.commentaires },
    { titre: "Certificats délivrés", val: m.certificats },
  ];

  return (
    <>
      <h1 className="titre-xl m-0 mb-2 text-[clamp(1.7rem,4vw,2.4rem)]">
        Tableau de bord
      </h1>
      <p className="mb-9 max-w-[34rem] text-[1.01rem] text-texte-2">
        Tout ce que la plateforme sait, à l&apos;instant.
      </p>

      {/* ── L'état du direct ─────────────────────────────── */}
      <section
        className={`mb-10 rounded-[10px] border p-5 ${
          direct.actif
            ? "border-2 border-[color:var(--plage-bord)] bg-[color:var(--plage-fond)]"
            : "border-bord bg-fond-2"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="etiquette mb-[6px]">Le bandeau du direct</p>
            <p className="m-0 text-[1.02rem] font-semibold">
              {direct.actif ? "Affiché sur la plateforme" : "Éteint"}
            </p>
            <p className="m-0 mt-1 text-[0.92rem] text-texte-2">
              {direct.actif
                ? `${direct.titre} · ${formaterDebut(direct.debut_le)}`
                : "Personne ne voit de lien vers le direct."}
            </p>
          </div>
          <Link href="/admin/reglages" className="bouton-2">
            Régler le direct
          </Link>
        </div>
        {direct.actif && !direct.lien && (
          <p className="mt-4 mb-0 border-l-[3px] border-ko bg-fond px-4 py-3 text-[0.92rem]">
            Le bandeau est allumé mais <strong>aucun lien Teams n&apos;est
            renseigné</strong> : le bouton ne mène nulle part.
          </p>
        )}
      </section>

      {/* ── Les quatre chiffres qui comptent ─────────────── */}
      <div className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cartes.map((c) => (
          <div key={c.etiq} className="rounded-[10px] border border-bord bg-fond p-5">
            <p className="etiquette mb-2">{c.etiq}</p>
            <p className="titre-xl m-0 text-[2.1rem] tabular-nums">{c.val}</p>
            <p className="m-0 mt-1 font-mono text-[10.5px] tracking-[0.08em] text-texte-3 uppercase">
              {c.note}
            </p>
          </div>
        ))}
      </div>

      {/* ── L'engagement ─────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="titre-l m-0 mb-1 text-[1.35rem]">L&apos;engagement</h2>
        <p className="mt-2 mb-5 max-w-[34rem] text-[0.96rem] text-texte-2">
          Ce que les gens font réellement, pas ce qu&apos;ils déclarent.
        </p>
        <ul className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
          {engagement.map((e) => (
            <li
              key={e.titre}
              className="flex items-baseline justify-between gap-4 border-b border-bord-2 py-[13px]"
            >
              <span className="text-[0.98rem] text-texte-2">{e.titre}</span>
              <span className="font-mono text-[1.02rem] tabular-nums text-texte">
                {e.val}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Ce qui n'est pas compris ─────────────────────── */}
      {qcm.length > 0 && (
        <section className="mb-12">
          <h2 className="titre-l m-0 mb-1 text-[1.35rem]">Ce qui n&apos;est pas compris</h2>
          <p className="mt-2 mb-5 max-w-[34rem] text-[0.96rem] text-texte-2">
            Le taux de réussite au premier essai. Une question ratée par plus
            de la moitié n&apos;est pas forcément difficile — c&apos;est souvent
            une leçon à reprendre le soir même.
          </p>
          <ul className="m-0 flex list-none flex-col gap-0 border-t border-bord p-0">
            {[...qcm]
              .sort((a, b) => (a.reussite ?? 100) - (b.reussite ?? 100))
              .slice(0, 8)
              .map((q) => (
                <li
                  key={q.question_id}
                  className="flex items-baseline justify-between gap-4 border-b border-bord-2 py-[13px]"
                >
                  <span className="min-w-0 flex-1 text-[0.95rem] text-texte-2">
                    <span className="font-mono text-[11px] text-texte-3">
                      M{q.module_numero}.{q.numero}
                    </span>{" "}
                    {q.enonce}
                  </span>
                  <span
                    className={`shrink-0 font-mono text-[1.02rem] tabular-nums ${
                      (q.reussite ?? 100) < 50 ? "text-ko" : "text-texte"
                    }`}
                  >
                    {q.reussite} %
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* ── L'état du contenu ────────────────────────────── */}
      <section>
        <h2 className="titre-l m-0 mb-1 text-[1.35rem]">Le contenu en ligne</h2>
        <div className="mt-5 flex flex-wrap gap-10 border-y border-bord py-5">
          <span className="flex flex-col gap-1">
            <span className="etiquette">Modules publiés</span>
            <span className="titre-l text-[1.6rem] tabular-nums">
              {m.modules_publies} <span className="text-texte-3">/ 11</span>
            </span>
          </span>
          <span className="flex flex-col gap-1">
            <span className="etiquette">Leçons publiées</span>
            <span className="titre-l text-[1.6rem] tabular-nums">
              {m.lecons_publiees}
            </span>
          </span>
        </div>
        <p className="mt-5">
          <Link href="/admin/contenu" className="bouton-2">
            Gérer le contenu →
          </Link>
        </p>
      </section>
    </>
  );
}

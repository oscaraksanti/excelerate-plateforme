import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EnteteApp } from "@/components/entete-app";
import { Partage } from "@/components/partage";
import { formaterDate, nomComplet } from "@/lib/formats";
import { monParcours } from "@/lib/parcours";
import { profilCourant } from "@/lib/profil";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Mon parcours",
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://excelai.oscaraksanti.com";

const OFFRES: Record<string, string> = {
  certificat27: "Certificat Fondations",
  masterclass37: "La masterclass complète",
  coaching97: "Le cercle",
  equipe: "Équipe",
};

function note(n: number | null) {
  return n === null ? "—" : String(n).replace(".", ",");
}

export default async function MonParcours() {
  const profil = await profilCourant();
  const f = await monParcours();
  if (!f) redirect("/connexion");

  const rendus = f.travaux.filter((t) => t.copie_id);
  const dues = rendus.reduce((s, t) => s + t.requises, 0);
  const faites = rendus.reduce((s, t) => s + t.faites, 0);
  const notes = rendus
    .filter((t) => t.faites >= t.requises)
    .map((t) => t.note_finale)
    .filter((n): n is number => n !== null);
  const moyenne =
    notes.length > 0
      ? Math.round((notes.reduce((s, n) => s + n, 0) / notes.length) * 100) / 100
      : null;

  const certificat = f.certificats.find((c) => !c.revoque_le) ?? null;
  const retire = !certificat && f.certificats.length > 0;
  const complet = nomComplet(f.nom);
  const paye = f.achats.length > 0;

  //  Ce qui manque, dans l'ordre où il faut s'en occuper. Une liste
  //  vide vaut mieux qu'une liste vague : on ne met que du concret.
  const manques: { quoi: string; ou: string; lien: string }[] = [];
  if (!complet) {
    manques.push({
      quoi: "Ton nom complet — sans lui, aucun certificat ne peut être établi.",
      ou: "Compléter mon nom",
      lien: "/profil",
    });
  }
  const aDeposer = f.travaux.filter((t) => !t.copie_id);
  if (aDeposer.length > 0) {
    manques.push({
      quoi: `${aDeposer.length} travail${aDeposer.length > 1 ? "x" : ""} pratique${aDeposer.length > 1 ? "s" : ""} à rendre — à commencer par « ${aDeposer[0].titre} ».`,
      ou: "Ouvrir ce travail",
      lien: `/modules/${aDeposer[0].module}/tp/1`,
    });
  }
  const aCorriger = rendus.reduce((s, t) => s + Math.max(0, t.requises - t.faites), 0);
  if (aCorriger > 0) {
    manques.push({
      quoi: `${aCorriger} correction${aCorriger > 1 ? "s" : ""} de tes pairs — c'est ce qui débloque tes notes.`,
      ou: "Corriger maintenant",
      lien: "/corrections",
    });
  }
  if (moyenne !== null && moyenne < 12) {
    manques.push({
      quoi: `Ta moyenne est de ${note(moyenne)} sur 20 ; le certificat en demande 12.`,
      ou: "Revoir mes travaux",
      lien: "/modules",
    });
  }

  const chiffres = [
    { etiq: "Leçons terminées", val: `${f.lecons_finies} / ${f.lecons_total}` },
    { etiq: "Travaux rendus", val: `${rendus.length} / ${f.travaux.length}` },
    { etiq: "Corrections rendues", val: `${faites} / ${dues}` },
    { etiq: "Moyenne", val: moyenne === null ? "—" : note(moyenne) },
  ];

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <h1 className="titre-xl m-0 mb-4 text-[clamp(1.9rem,4.6vw,2.7rem)]">
          Mon parcours
        </h1>
        <p className="mb-10 max-w-[35rem] text-[1.04rem] text-texte-2">
          Tout ce que tu as rendu, tout ce qui te reste, et ton certificat quand
          il est là. Rien n&apos;est caché : ce que tu vois ici est ce que voit
          Oscar.
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
          <h2 className="titre-l m-0 mb-1 text-[1.5rem]">
            {certificat ? "Ton certificat" : "Ta certification"}
          </h2>

          {certificat ? (
            <>
              <p className="mt-2 mb-7 max-w-[35rem] text-[0.98rem] text-texte-2">
                Il est à ton nom, il porte un code unique, et sa page de
                vérification est publique : n&apos;importe qui peut confirmer
                qu&apos;il est réel, sans compte et en trois secondes.
              </p>

              <div className="plage mb-7 px-6 py-6">
                <span className="etiquette mb-2 block">{certificat.mention}</span>
                <span className="titre-xl block text-[1.7rem] leading-tight">
                  {certificat.nom_affiche}
                </span>
                <span className="mt-3 block font-mono text-[12px] tabular-nums text-texte-2">
                  {certificat.code} ·{" "}
                  {certificat.niveau === "avance" ? "niveau avancé" : "fondations"}
                  {certificat.note !== null
                    ? ` · ${note(certificat.note)} / 20`
                    : ""}{" "}
                  · délivré {formaterDate(certificat.emis_le)}
                </span>
                <span className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href={`/c/${certificat.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bouton"
                  >
                    Ouvrir mon certificat
                  </a>
                  <span className="font-mono text-[11px] text-texte-3">
                    le bouton « Télécharger en PDF » est sur la page
                  </span>
                </span>
                <span className="poignee" aria-hidden="true" />
              </div>

              <p className="etiquette mb-3">Le faire savoir</p>
              <p className="mb-4 max-w-[35rem] text-[0.96rem] text-texte-2">
                Un certificat que personne ne voit ne sert à rien. Et si
                quelqu&apos;un de ton réseau veut le même, il saura par où
                commencer — le lien de la formation part avec le partage.
              </p>
              <Partage
                url={`${SITE}/c/${certificat.code}`}
                mention={certificat.mention}
                site={SITE}
              />
            </>
          ) : (
            <>
              <p className="mt-2 mb-6 max-w-[35rem] text-[0.98rem] text-texte-2">
                {retire
                  ? "Ton certificat a été retiré. Écris à Oscar si tu penses que c'est une erreur — il est rétabli en une minute."
                  : "Un certificat qui se mérite se vend ; un certificat qu'on achète ne vaut rien. Trois conditions, les mêmes pour tout le monde."}
              </p>

              <ol className="m-0 mb-7 flex max-w-[35rem] list-none flex-col gap-0 border-t border-bord p-0">
                {[
                  {
                    titre: "Tous les travaux pratiques rendus",
                    fait: rendus.length,
                    total: f.travaux.length,
                  },
                  { titre: "Toutes les corrections faites", fait: faites, total: dues },
                  {
                    titre: "Une moyenne d'au moins 12 sur 20",
                    valeur: moyenne === null ? "—" : `${note(moyenne)} / 20`,
                    fait: moyenne !== null && moyenne >= 12 ? 1 : 0,
                    total: 1,
                  },
                ].map((l) => {
                  const fini = l.total > 0 && l.fait >= l.total;
                  return (
                    <li
                      key={l.titre}
                      className="flex items-center gap-3 border-b border-bord-2 py-[14px]"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-[14px] w-[14px] shrink-0 rounded-[2px] border-2 ${
                          fini ? "border-[color:var(--plage-bord)] bg-voltage" : "border-bord"
                        }`}
                      />
                      <span
                        className={`flex-1 text-[0.98rem] ${fini ? "text-texte" : "text-texte-2"}`}
                      >
                        {l.titre}
                      </span>
                      <span className="font-mono text-[11.5px] tabular-nums whitespace-nowrap text-texte-2">
                        {l.valeur ?? `${l.fait} / ${l.total}`}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {!paye && (
                <div className="plage px-6 py-5">
                  <span className="etiquette mb-2 block">
                    Le certificat n&apos;est pas compris dans l&apos;accès gratuit
                  </span>
                  <p className="m-0 mb-5 max-w-[33rem] text-[1.02rem] leading-[1.5]">
                    Les trois premiers modules restent ouverts à tout le monde.
                    Le certificat, lui, s&apos;obtient avec l&apos;une des
                    offres — et il se mérite quand même : les conditions
                    ci-dessus ne changent pas.
                  </p>
                  <Link href="/offres" className="bouton">
                    Voir les offres
                  </Link>
                  <span className="poignee" aria-hidden="true" />
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Ce qui manque ────────────────────────────────── */}
        {manques.length > 0 && (
          <section className="mb-14 border-t-2 border-texte pt-6">
            <h2 className="titre-l m-0 mb-1 text-[1.5rem]">Ce qui te manque</h2>
            <p className="mt-2 mb-6 max-w-[35rem] text-[0.98rem] text-texte-2">
              Dans l&apos;ordre où il vaut mieux s&apos;en occuper.
            </p>
            <ol className="m-0 flex max-w-[38rem] list-none flex-col gap-0 border-t border-bord p-0">
              {manques.map((m) => (
                <li
                  key={m.quoi}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-bord-2 py-[14px]"
                >
                  <span className="max-w-[26rem] text-[0.98rem]">{m.quoi}</span>
                  <Link href={m.lien} className="bouton-2 !px-4 !py-[7px] !text-[0.85rem]">
                    {m.ou}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── Les travaux ──────────────────────────────────── */}
        <section className="mb-14 border-t-2 border-texte pt-6">
          <h2 className="titre-l m-0 mb-1 text-[1.5rem]">Mes travaux pratiques</h2>
          <p className="mt-2 mb-6 max-w-[35rem] text-[0.98rem] text-texte-2">
            Ta note s&apos;affiche quand tu as rendu tes corrections sur ce
            travail. Elle reste provisoire tant que deux pairs ne t&apos;ont pas
            lu — la machine seule d&apos;abord, la médiane ensuite.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.93rem]">
              <thead>
                <tr className="border-b border-bord text-left">
                  {["Travail", "Rendu", "Mes corrections", "Note"].map((t, i) => (
                    <th
                      key={t}
                      className={`py-2 pr-4 font-mono text-[10.5px] tracking-[0.1em] font-normal text-texte-3 uppercase ${
                        i >= 2 ? "text-right" : ""
                      }`}
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {f.travaux.map((t) => {
                  const leve = t.faites >= t.requises;
                  return (
                    <tr
                      key={t.tp_id}
                      className={`border-b border-bord ${t.copie_id ? "" : "opacity-55"}`}
                    >
                      <td className="py-[11px] pr-4">
                        <Link
                          href={`/modules/${t.module}/tp/1`}
                          className="block text-texte underline decoration-bord underline-offset-[3px] hover:decoration-[color:var(--voltage-2)]"
                        >
                          {t.titre}
                        </Link>
                        <span className="font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase">
                          module {t.module}
                        </span>
                      </td>
                      <td className="py-[11px] pr-4 text-texte-2">
                        {t.depose_le ? formaterDate(t.depose_le) : "pas encore"}
                      </td>
                      <td className="py-[11px] pr-4 text-right font-mono tabular-nums">
                        {t.copie_id ? (
                          <span className={leve ? "text-texte-2" : "text-ambre-texte"}>
                            {t.faites} / {t.requises}
                          </span>
                        ) : (
                          <span className="text-texte-3">—</span>
                        )}
                      </td>
                      <td className="py-[11px] text-right font-mono tabular-nums">
                        {!t.copie_id ? (
                          <span className="text-texte-3">—</span>
                        ) : leve ? (
                          <>
                            <span className="text-texte">{note(t.note_finale)}</span>
                            <span className="block font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase">
                              {t.definitive ? "définitive" : "provisoire"}
                            </span>
                          </>
                        ) : (
                          <Link
                            href="/corrections"
                            className="font-mono text-[10px] tracking-[0.1em] text-ambre-texte uppercase hover:text-texte"
                          >
                            à débloquer
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Mes données ──────────────────────────────────── */}
        <section className="border-t-2 border-texte pt-6">
          <h2 className="titre-l m-0 mb-1 text-[1.5rem]">Mes données</h2>
          <p className="mt-2 mb-6 max-w-[35rem] text-[0.98rem] text-texte-2">
            Ce que la plateforme sait de toi, en entier.
          </p>

          <ul className="m-0 mb-7 flex max-w-[35rem] list-none flex-col gap-0 border-t border-bord p-0">
            {[
              ["Nom sur le certificat", f.nom?.trim() || "—"],
              ["Adresse", f.email ?? "—"],
              ["Téléphone", f.telephone ?? "—"],
              ["Inscrit le", formaterDate(f.cree_le)],
              ["Questions posées", String(f.messages)],
            ].map(([k, v]) => (
              <li
                key={k}
                className="flex flex-wrap items-baseline justify-between gap-3 border-b border-bord-2 py-[12px]"
              >
                <span className="text-[0.96rem] text-texte-2">{k}</span>
                <span className="font-mono text-[12px] text-texte">{v}</span>
              </li>
            ))}
          </ul>

          {f.achats.length > 0 && (
            <>
              <p className="etiquette mb-3">Mes accès</p>
              <ul className="m-0 mb-7 flex max-w-[35rem] list-none flex-col gap-0 border-t border-bord p-0">
                {f.achats.map((a) => (
                  <li
                    key={a.chariow_ref}
                    className="flex flex-wrap items-baseline justify-between gap-3 border-b border-bord-2 py-[12px]"
                  >
                    <span className="text-[0.96rem] text-texte">
                      {OFFRES[a.produit] ?? a.produit}
                    </span>
                    <span className="font-mono text-[12px] tabular-nums text-texte-2">
                      {formaterDate(a.paye_le)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <Link href="/profil" className="bouton-2">
            Modifier mon nom ou mon téléphone
          </Link>
        </section>
      </main>
    </>
  );
}

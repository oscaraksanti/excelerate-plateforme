import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Certificat, type DonneesCertificat, type StyleCertificat } from "@/components/certificat";
import { clientAdmin } from "@/lib/supabase/admin";

type Params = {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ style?: string }>;
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://excelai.oscaraksanti.com";

async function lire(code: string) {
  const admin = clientAdmin();
  const { data } = await admin
    .from("certificats")
    .select("code, nom_affiche, mention, corps, niveau, note, lieu, emis_le, revoque_le, tps_rendus, corrections")
    .eq("code", code.toUpperCase())
    .maybeSingle();
  return data as (DonneesCertificat & { tps_rendus: number; corrections: number }) | null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { code } = await params;
  const c = await lire(code);
  if (!c) return { title: "Certificat introuvable", robots: { index: false } };
  return {
    title: `Certificat de ${c.nom_affiche}`,
    description: `${c.nom_affiche} · ${c.mention} · délivré par Eurêka Services, code ${c.code}.`,
    // Les pages de vérification, elles, ont vocation à être trouvées.
    robots: { index: true, follow: true },
  };
}

export default async function PageCertificat({ params, searchParams }: Params) {
  const { code } = await params;
  const { style } = (await searchParams) ?? {};
  const c = await lire(code);
  if (!c) notFound();

  const url = `${SITE}/c/${c.code}`;
  const qrSvg = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0B0E13", light: "#FFFFFF00" },
  });

  const revoque = Boolean(c.revoque_le);
  const partage = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10">
      {/* ── Le bandeau de vérification, absent à l'impression ── */}
      <section className="no-print mx-auto mb-9 max-w-[52rem]">
        <p className="etiquette mb-3 flex items-center gap-[9px]">
          <i className="h-[7px] w-[7px] rounded-full bg-voltage not-italic" />
          Excelerate IA · Eurêka Services
        </p>

        <div
          className={`rounded-[10px] border p-6 ${
            revoque
              ? "border-ko bg-[color:rgba(190,59,48,.07)]"
              : "border-2 border-[color:var(--plage-bord)] bg-[color:var(--plage-fond)]"
          }`}
        >
          <h1 className="titre-l m-0 mb-2 text-[clamp(1.4rem,3.4vw,1.9rem)]">
            {revoque ? "Ce certificat a été révoqué" : "Certificat authentique"}
          </h1>
          <p className="m-0 mb-5 max-w-[34rem] text-[1.01rem] text-texte-2">
            {revoque ? (
              <>
                Il figurait au nom de {c.nom_affiche} et n&apos;est plus valide
                depuis le {new Date(c.revoque_le!).toLocaleDateString("fr-FR")}.
              </>
            ) : (
              <>
                Délivré à <strong className="font-semibold text-texte">{c.nom_affiche}</strong> par
                Eurêka Services. Cette page est la source officielle : elle fait
                foi, le document imprimé en est une copie.
              </>
            )}
          </p>

          <dl className="m-0 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            {[
              ["Code", c.code],
              ["Délivré le", new Date(c.emis_le).toLocaleDateString("fr-FR")],
              ["Travaux rendus", String(c.tps_rendus)],
              ["Corrections rendues", String(c.corrections)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="etiquette mb-1">{k}</dt>
                <dd className="m-0 font-mono text-[0.98rem] tabular-nums text-texte">{v}</dd>
              </div>
            ))}
          </dl>

          {!revoque && (
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={partage}
                target="_blank"
                rel="noopener noreferrer"
                className="bouton"
              >
                Partager sur LinkedIn
              </a>
              <Link href="/" className="bouton-2">
                Obtenir le mien
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Le certificat ───────────────────────────────────── */}
      <div className="cadre-certificat">
        <Certificat
          c={c}
          urlVerification={url}
          qrSvg={qrSvg}
          style={(style === "classique" ? "classique" : "selection") as StyleCertificat}
        />
      </div>

      <p className="no-print mx-auto mt-8 max-w-[52rem] text-[0.9rem] text-texte-3">
        Pour l&apos;enregistrer en PDF : Fichier → Imprimer, puis « Enregistrer
        au format PDF ». Le format A4 paysage est déjà réglé.
      </p>
    </main>
  );
}

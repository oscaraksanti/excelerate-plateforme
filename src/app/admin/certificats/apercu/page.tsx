import type { Metadata } from "next";
import QRCode from "qrcode";
import { Certificat, type DonneesCertificat, type StyleCertificat } from "@/components/certificat";

export const metadata: Metadata = { title: "Aperçu du certificat" };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://excelai.oscaraksanti.com";

const EXEMPLE: DonneesCertificat = {
  code: "7K4M-2XQ9",
  nom_affiche: "MOUNZENZE Ircellin-Sath",
  mention: "Excel + IA — Les fondations",
  corps: "",
  niveau: "fondamentaux",
  note: 15.4,
  lieu: "Kinshasa",
  emis_le: new Date().toISOString(),
  revoque_le: null,
  tps_rendus: 3,
  corrections: 9,
};

const VARIANTES: { cle: StyleCertificat; titre: string; propos: string }[] = [
  {
    cle: "selection",
    titre: "A — Sélection",
    propos:
      "Le nom domine, la preuve s'affiche, et la trame de cellules remplace la guilloche. Le titre du programme est « sélectionné » comme une plage Excel — la signature de ta marque, à sa place sur un certificat qui parle d'Excel.",
  },
  {
    cle: "classique",
    titre: "B — Classique tenue",
    propos:
      "Ta composition d'origine, débarrassée de ce qui la datait : plus de guilloche, un seul liseré au lieu de deux, une vraie hiérarchie de tailles, et l'accent de marque en une seule touche sous le nom.",
  },
];

export default async function PageApercu({
  searchParams,
}: {
  searchParams: Promise<{ seul?: string }>;
}) {
  const { seul } = await searchParams;
  const qrSvg = await QRCode.toString(`${SITE}/c/${EXEMPLE.code}`, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0B0E13", light: "#FFFFFF00" },
  });

  const montrees = seul
    ? VARIANTES.filter((v) => v.cle === seul)
    : VARIANTES;

  return (
    <>
      <h1 className="titre-xl m-0 mb-2 text-[clamp(1.7rem,4vw,2.4rem)]">
        Aperçu du certificat
      </h1>
      <p className="mb-10 max-w-[35rem] text-[1.01rem] text-texte-2">
        Deux directions, mêmes marqueurs de confiance : logo et mentions
        légales, cachet, les deux paraphes, le trophée. Ce qui change, c&apos;est
        la composition.
      </p>

      {montrees.map((v) => (
        <section key={v.cle} className="mb-16">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-texte pt-5">
            <h2 className="titre-l m-0 text-[1.35rem]">{v.titre}</h2>
            <a
              href={`/admin/certificats/apercu?seul=${v.cle}`}
              className="font-mono text-[10.5px] tracking-[0.12em] text-texte-3 uppercase hover:text-texte"
            >
              voir seul →
            </a>
          </div>
          <p className="mb-6 max-w-[36rem] text-[0.96rem] text-texte-2">{v.propos}</p>

          <div className="cadre-certificat">
            <Certificat
              c={EXEMPLE}
              urlVerification={`${SITE}/c/${EXEMPLE.code}`}
              qrSvg={qrSvg}
              style={v.cle}
            />
          </div>
        </section>
      ))}
    </>
  );
}

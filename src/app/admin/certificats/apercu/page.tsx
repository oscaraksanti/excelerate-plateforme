import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { Certificat, type DonneesCertificat } from "@/components/certificat";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Aperçu du certificat" };

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

export default async function PageApercu({
  searchParams,
}: {
  searchParams: Promise<{ niveau?: string }>;
}) {
  const { niveau } = await searchParams;
  const avance = niveau === "avance";

  const exemple: DonneesCertificat = avance
    ? {
        ...EXEMPLE,
        niveau: "avance",
        mention: "MS Excel Boosté par l'Intelligence Artificielle",
        note: 17.2,
        tps_rendus: 10,
        corrections: 30,
      }
    : EXEMPLE;

  const qrSvg = await QRCode.toString(`${SITE}/c/${exemple.code}`, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0B0E13", light: "#FFFFFF00" },
  });

  return (
    <>
      <h1 className="titre-xl m-0 mb-2 text-[clamp(1.7rem,4vw,2.4rem)]">
        Aperçu du certificat
      </h1>
      <p className="mb-7 max-w-[35rem] text-[1.01rem] text-texte-2">
        Sur un exemple. Seuls le nom, la mention, les chiffres, la date et le
        code changent d&apos;une personne à l&apos;autre.
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/admin/certificats/apercu"
          className={avance ? "bouton-2" : "bouton"}
        >
          Les trois soirées
        </Link>
        <Link
          href="/admin/certificats/apercu?niveau=avance"
          className={avance ? "bouton" : "bouton-2"}
        >
          Niveau avancé
        </Link>
      </div>

      <div className="cadre-certificat">
        <Certificat
          c={exemple}
          urlVerification={`${SITE}/c/${exemple.code}`}
          qrSvg={qrSvg}
        />
      </div>

      <p className="mt-7 max-w-[35rem] text-[0.92rem] text-texte-3">
        Pour voir le rendu réel : ⌘P. Le format A4 paysage est déjà réglé, et
        seul le certificat s&apos;imprime — le reste de la page disparaît.
      </p>
    </>
  );
}

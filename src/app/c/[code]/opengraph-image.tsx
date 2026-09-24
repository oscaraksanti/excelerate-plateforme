import { ImageResponse } from "next/og";
import { clientAdmin } from "@/lib/supabase/admin";

/* ══════════════════════════════════════════════════════════════════
   L'aperçu du certificat quand on le partage.

   Sans ça, un lien collé sur LinkedIn ou WhatsApp ne montre rien —
   et un diplôme qui s'affiche comme une URL nue ne fait honneur à
   personne. On y met le nom, parce que c'est ce dont le titulaire
   est fier, et le code, parce que c'est ce qui prouve.
   ══════════════════════════════════════════════════════════════════ */

export const runtime = "nodejs";
export const alt = "Certificat Excelerate IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const { data } = await clientAdmin()
    .from("certificats")
    .select("code, nom_affiche, mention, niveau, revoque_le")
    .eq("code", (code ?? "").toUpperCase())
    .maybeSingle();

  const nom = data?.nom_affiche ?? "Certificat";
  const mention = data?.mention ?? "Excelerate IA";
  const valide = Boolean(data) && !data?.revoque_le;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0E13",
          color: "#F2F5F7",
          padding: "68px 76px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#C8F04B",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#8A96A4" }}>
            EXCELERATE IA · EURÊKA SERVICES
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#8A96A4", marginBottom: 18 }}>
            {valide ? "Certificat délivré à" : "Certificat retiré"}
          </div>
          <div
            style={{
              fontSize: nom.length > 26 ? 66 : 86,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {nom}
          </div>
          <div style={{ fontSize: 32, color: "#C8F04B", marginTop: 24 }}>
            {mention}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid #232A33",
            paddingTop: 26,
          }}
        >
          <div style={{ fontSize: 24, color: "#8A96A4" }}>
            {`Code ${data?.code ?? "—"} · vérifiable publiquement`}
          </div>
          <div style={{ fontSize: 24, color: "#8A96A4" }}>
            excelai.oscaraksanti.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}

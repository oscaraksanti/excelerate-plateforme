import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--police-dsp",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--police-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--police-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://excelai.oscaraksanti.com"),
  title: {
    default: "Excelerate IA",
    template: "%s · Excelerate IA",
  },
  description:
    "Trois soirées pour passer d'Excel « qui marche » à Excel qui travaille pour toi, avec l'IA. Formation en direct par Oscar Aksanti.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Excelerate IA",
    title: "Excelerate IA",
    description:
      "Trois soirées en direct pour passer au niveau supérieur sur Excel, avec l'IA.",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e13" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body
        className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

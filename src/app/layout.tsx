import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { SCRIPT_THEME } from "@/components/theme";
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

export const SITE = "https://excelai.oscaraksanti.com";

const DESCRIPTION =
  "Formation Excel + intelligence artificielle par Oscar Aksanti : onze modules, "
  + "cinquante-cinq leçons, onze travaux pratiques corrigés automatiquement et un "
  + "certificat vérifiable. Les quatre premiers modules sont gratuits.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Excelerate IA — formation Excel + IA par Oscar Aksanti",
    template: "%s · Excelerate IA",
  },
  description: DESCRIPTION,
  applicationName: "Excelerate IA",
  authors: [{ name: "Oscar Aksanti" }],
  creator: "Oscar Aksanti",
  publisher: "Eurêka Services",
  category: "education",
  keywords: [
    "formation Excel",
    "Excel et intelligence artificielle",
    "formation Excel en ligne",
    "Excel avancé",
    "Power Query",
    "tableau croisé dynamique",
    "tableau de bord Excel",
    "RECHERCHEX",
    "certificat Excel",
    "Oscar Aksanti",
    "formation Excel Afrique",
    "formation Excel Kinshasa",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE,
    siteName: "Excelerate IA",
    title: "Excelerate IA — formation Excel + IA par Oscar Aksanti",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Excelerate IA — formation Excel + IA",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  //  Le jeton arrive de la Search Console ; sans variable, rien n'est
  //  émis — on ne met pas de balise vide dans le <head>.
  ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION } }
    : {}),
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
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body
        className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

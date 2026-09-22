import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SCRIPT_THEME } from "@/components/theme";
import "./globals.css";

/* ── Les polices, servies depuis le dépôt ──────────────────────────
   `next/font/google` télécharge les fichiers depuis Google pendant le
   build. Le 21 septembre à 20 h 51, cette requête a échoué chez Vercel
   et le déploiement est mort dessus — la plateforme est restée quinze
   heures sans le correctif qu'elle attendait.

   Les mêmes fichiers sont maintenant dans le dépôt : 204 Ko, latin
   seul, exactement ceux que Google servait. Le build ne dépend plus
   d'aucun réseau, et le rendu est identique — l'Archivo rapatriée est
   bien la variable, axes wght 100-900 et wdth 62-125, dont
   globals.css se sert pour ses titres. */

const archivo = localFont({
  src: "./polices/archivo-variable.woff2",
  weight: "100 900",
  //  Sans cette déclaration, le navigateur ignore l'axe de largeur et
  //  `font-variation-settings: "wdth" 108` reste sans effet.
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  variable: "--police-dsp",
  display: "swap",
});

const plexSans = localFont({
  src: [
    { path: "./polices/plex-sans-400.woff2", weight: "400", style: "normal" },
    { path: "./polices/plex-sans-500.woff2", weight: "500", style: "normal" },
    { path: "./polices/plex-sans-600.woff2", weight: "600", style: "normal" },
    { path: "./polices/plex-sans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--police-sans",
  display: "swap",
});

const plexMono = localFont({
  src: [
    { path: "./polices/plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./polices/plex-mono-500.woff2", weight: "500", style: "normal" },
    { path: "./polices/plex-mono-600.woff2", weight: "600", style: "normal" },
  ],
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

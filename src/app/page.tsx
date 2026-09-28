import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ApercuCorrection } from "@/components/apercu-correction";
import { PiedPage } from "@/components/pied-page";
import { InscriptionRapide } from "@/components/inscription-rapide";
import { nombreApprenants } from "@/lib/audience";
import { lireDirectPublic, formaterDebut } from "@/lib/direct";
import { SITE } from "./layout";

export const metadata: Metadata = {
  //  `absolute` : sans lui, le gabarit ajouterait « · Excelerate IA »
  //  une seconde fois à la fin du titre.
  title: {
    absolute: "Formation Excel + IA en ligne — Excelerate IA, par Oscar Aksanti",
  },
  description:
    "Onze modules, 55 leçons, 11 travaux pratiques corrigés automatiquement et un "
    + "certificat vérifiable. Tableaux croisés, Power Query, DAX, macros — et l'IA "
    + "comme copilote. Les deux premiers modules sont gratuits.",
  alternates: { canonical: "/" },
};

/**
 * La page s'affiche depuis le cache, mais se refait au plus toutes les
 * minutes.
 *
 * Sans cette ligne elle serait figée au moment du build : le nombre
 * d'inscrits et le bandeau du direct resteraient sur leur valeur du
 * jour de la mise en ligne. Une minute suffit, et 2 000 visiteurs ne
 * font toujours qu'un seul rendu par minute.
 */
export const revalidate = 60;

const LIEN_TELEGRAM = "https://t.me/ExcelPowerBiPourEntreprises";
const COLONNES = "ABCDEFGHIJKLMNOPQRSTUVWX".split("");

/* ── Ce qu'on sait faire après, dit en gestes, pas en fonctions ─── */
const AVANT_APRES = [
  {
    cell: "B4",
    avant: "Trois heures chaque lundi à produire les mêmes rapports.",
    apres: "Un clic. Les douze PDF sortent nommés pendant que vous prenez un café.",
    ou: "Module 10",
  },
  {
    cell: "B5",
    avant: "Un chiffre qu'on vous demande d'expliquer, et que vous ne savez pas défendre.",
    apres: "Une cellule de contrôle qui vaut zéro — vous savez que c'est juste avant de l'envoyer.",
    ou: "Module 2",
  },
  {
    cell: "B6",
    avant: "Une IA qui vous donne une formule fausse, avec assurance.",
    apres: "Un protocole en quatre vérifications qui l'attrape en trois minutes.",
    ou: "Module 2",
  },
  {
    cell: "B7",
    avant: "1,2 million de lignes qu'une feuille Excel ne peut pas contenir.",
    apres: "Un modèle de données en étoile, et une réponse en deux secondes.",
    ou: "Module 8",
  },
];

/* ── Le programme, tel qu'il est réellement en ligne ────────────── */
const MODULES = [
  [0, "Avant de commencer", "Votre version, le fil rouge, les réglages", true],
  [1, "Reprendre la main sur ses données", "Tableaux structurés, RECHERCHEX, FILTRE", true],
  [2, "L'IA comme copilote, pas comme oracle", "Le protocole V4, et le total de contrôle", false],
  [3, "Ce qui tourne tout seul", "Power Query, LET, le premier tableau de bord", false],
  [4, "Chercher, croiser, réconcilier", "Les quatre familles d'écarts", false],
  [5, "Six questions, cinq minutes", "Les tableaux croisés, vraiment", false],
  [6, "Huit secondes", "Le tableau de bord qu'on lit sans explication", false],
  [7, "Un clic, tous les mois", "Power Query, treize fichiers, quatre formats", false],
  [8, "Dépasser le million", "Le schéma en étoile et le DAX", false],
  [9, "La question d'après", "Simulation, VAN, TRI, modèle professionnel", false],
  [10, "Le lundi matin d'Aïcha", "Macros, livraison, deux cents classeurs", false],
] as const;


const RYTHME = [
  ["Cinq leçons", "15 min chacune", "à lire ou à regarder, dans l'ordre"],
  ["Un QCM", "5 min", "corrigé et expliqué sur-le-champ"],
  ["Un travail pratique", "60 à 90 min", "un classeur à trous, chaque réponse est une cellule"],
  ["Le dépôt", "instantané", "la note automatique s'affiche en quelques secondes"],
  ["Trois corrections", "15 min chacune", "vous corrigez avant de voir votre note finale"],
];

const CHIFFRES = [
  ["11", "modules"],
  ["55", "leçons"],
  ["11", "TP corrigés automatiquement"],
  ["81", "schémas"],
  ["71", "questions"],
  ["1", "certificat vérifiable"],
];

const QUESTIONS = [
  {
    q: "Je débute vraiment. C'est pour moi ?",
    r: "Oui, à une condition : commencez par le module 0, qui vous dit exactement où vous en êtes. "
      + "Et si vous n'avez jamais écrit une formule, ma formation Excel gratuite de dix heures est "
      + "sur YouTube — plus de 100 000 personnes l'ont suivie. Le module 0 vous dit combien d'heures "
      + "en faire avant de revenir.",
  },
  {
    q: "Quelle version d'Excel faut-il ?",
    r: "Excel 2021 suffit pour neuf modules sur dix ; 2024 ou Microsoft 365 est plus confortable. "
      + "Avec 2016 ou 2019 vous ferez tout, avec INDEX/EQUIV là où j'écris RECHERCHEX — les leçons "
      + "donnent l'équivalent à chaque fois. La leçon 0.2 contient un test de dix secondes.",
  },
  {
    q: "Je suis sur Mac.",
    r: "Tout fonctionne, sauf Power Pivot — que Microsoft n'a jamais porté sur macOS. Le module 8 se "
      + "fait donc sur un poste Windows, ou en observation : la façon de penser se transpose "
      + "intégralement, et le module 9 n'en dépend pas. C'est écrit en tête du module.",
  },
  {
    q: "Combien de temps par module ?",
    r: "Environ deux heures, que vous pouvez étaler. Rien n'est chronométré, rien n'expire, et vous "
      + "pouvez reprendre une leçon six mois plus tard.",
  },
  {
    q: "Il faut être là à une heure précise ?",
    r: "Non, jamais. Tout est en ligne et rien n'expire : vous commencez ce soir ou dans trois "
      + "mois, vous avancez au rythme qui vous arrange. Les soirées d'ouverture, elles, ont été "
      + "filmées et sont dans la formation — vous les regardez quand vous voulez.",
  },
  {
    q: "C'est un abonnement ?",
    r: "Non. Les deux premiers modules sont gratuits et le restent — on peut même les lire sans compte. Les neuf suivants, le projet "
      + "final et le certificat coûtent 37 $, une seule fois. Le prix ne monte jamais, et il n'y a "
      + "rien à reconduire.",
  },
  {
    q: "Pourquoi 37 $, et pas tout gratuit ?",
    r: "Parce que la formation gratuite existe déjà : dix heures sur YouTube, plus de 100 000 "
      + "personnes l'ont suivie, et elle le restera. Ici, il y a onze travaux pratiques corrigés "
      + "automatiquement, la correction entre pairs, un certificat vérifiable et des réponses à "
      + "vos questions — ça demande du temps, des serveurs et de la relecture. 37 $ une fois, pour "
      + "un accès à vie : c'est le prix qui permet que ça existe sans publicité ni abonnement.",
  },
  {
    q: "Je n'ai pas de carte bancaire. Je peux payer autrement ?",
    r: "Oui, et c'est le cas d'une bonne partie des gens qui paient ici. Airtel Money, Orange "
      + "Money, M-Pesa, Wave, Western Union ou un virement : écrivez-moi sur WhatsApp au "
      + "+243 971 601 855 ou à oscaraksanti@gmail.com, je vous donne le numéro et j'ouvre votre "
      + "accès dès réception. La page de paiement, elle, accepte la carte et affiche le prix dans "
      + "votre monnaie.",
  },
  {
    q: "Le certificat vaut quelque chose ?",
    r: "Il porte un code unique et une page de vérification publique : quiconque le reçoit confirme "
      + "en trois secondes qu'il est réel. Et pour le niveau Avancé, il faut avoir rendu le projet "
      + "final et l'avoir soutenu dix minutes, écran partagé — donc avoir su expliquer chaque cellule "
      + "de son propre fichier.",
  },
];

const ORGANISATION = {
  "@type": "Organization",
  "@id": `${SITE}#organisation`,
  name: "Eurêka Services",
  alternateName: "Excelerate IA",
  url: SITE,
  logo: `${SITE}/icon.png`,
  areaServed: ["CD", "CI", "SN", "CM", "GA", "ML", "BF", "FR"],
  sameAs: [
    "https://www.youtube.com/@oscaraksanti",
    LIEN_TELEGRAM,
  ],
};

const FORMATEUR = {
  "@type": "Person",
  "@id": `${SITE}#oscar`,
  name: "Oscar Aksanti",
  jobTitle: "Ingénieur en informatique · analyste de données · formateur",
  worksFor: { "@id": `${SITE}#organisation` },
  url: SITE,
};

function donneesStructurees() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ORGANISATION,
      FORMATEUR,
      {
        "@type": "WebSite",
        "@id": `${SITE}#site`,
        url: SITE,
        name: "Excelerate IA",
        inLanguage: "fr",
        publisher: { "@id": `${SITE}#organisation` },
      },
      {
        "@type": "Course",
        "@id": `${SITE}#formation`,
        name: "Excelerate IA — Excel augmenté par l'intelligence artificielle",
        description:
          "Onze modules pour passer de « je sais faire un tableau » à « je construis "
          + "un modèle, je le documente et j'assume chaque chiffre » : tableaux "
          + "structurés, RECHERCHEX, tableaux croisés dynamiques, tableaux de bord, "
          + "Power Query, modèle de données et DAX, simulation financière, macros — "
          + "et l'usage critique de l'IA à chaque étape.",
        url: SITE,
        image: `${SITE}/opengraph-image.png`,
        inLanguage: "fr",
        provider: { "@id": `${SITE}#organisation` },
        educationalLevel: "Débutant à avancé",
        teaches: [
          "Tableaux structurés et références structurées",
          "RECHERCHEX, FILTRE, TRIER, UNIQUE",
          "Tableaux croisés dynamiques",
          "Tableaux de bord Excel",
          "Power Query",
          "Modèle de données et DAX",
          "Simulation, VAN, TRI et analyse de scénarios",
          "Macros VBA et automatisation",
          "Usage critique de l'intelligence artificielle sur Excel",
        ],
        hasCourseInstance: [
          {
            "@type": "CourseInstance",
            courseMode: "online",
            courseWorkload: "PT22H",
            inLanguage: "fr",
            instructor: { "@id": `${SITE}#oscar` },
          },
        ],
        offers: [
          {
            "@type": "Offer",
            category: "Free",
            price: 0,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: SITE,
            description: "Les modules 0 et 1, leur travail pratique et leurs QCM.",
          },
          {
            "@type": "Offer",
            category: "Paid",
            price: 37,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: SITE,
            description:
              "Les modules 2 à 10, le projet final, la correction entre pairs et "
              + "le certificat vérifiable. Paiement unique.",
          },
          {
            "@type": "Offer",
            category: "Paid",
            price: 97,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: SITE,
            description:
              "Le cercle : toute la masterclass, plus un appel personnel de "
              + "trente minutes avec l'instructeur et un canal privé.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE}#questions`,
        mainEntity: QUESTIONS.map((x) => ({
          "@type": "Question",
          name: x.q,
          acceptedAnswer: { "@type": "Answer", text: x.r },
        })),
      },
    ],
  };
}

export default async function Accueil() {
  const direct = await lireDirectPublic();
  const inscrits = await nombreApprenants();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees()) }}
      />
      <div className="trame" aria-hidden="true" />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pb-24">
        {/* ── Bandeau des lettres de colonnes ───────────────── */}
        <div
          className="mb-7 flex overflow-hidden border-b border-bord-2 pt-10 font-mono text-[10.5px] tracking-[0.14em] text-texte-3"
          aria-hidden="true"
        >
          {COLONNES.map((c, i) => (
            <span
              key={c}
              className={`flex-[0_0_48px] border-r border-bord-2 pb-[5px] text-center ${
                i === 0 ? "bg-fond-3 text-texte-2" : ""
              }`}
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="etiquette flex items-center gap-[10px]">
            <i className="h-[7px] w-[7px] rounded-full bg-voltage not-italic" />
            <span>
              Excelerate IA · <span className="text-texte">Oscar Aksanti</span>
            </span>
          </div>
          <Link
            href="/connexion"
            className="font-mono text-[10.5px] tracking-[0.14em] text-texte-3 uppercase hover:text-texte"
          >
            Déjà inscrit ? Se connecter →
          </Link>
        </div>

        {/* ── Le direct, s'il y en a un d'annoncé ───────────── */}
        {direct.actif && direct.titre && (
          <p className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-[3px] border-[color:var(--plage-bord)] bg-[color:var(--plage-fond)] px-4 py-3 text-[0.95rem]">
            <span className="etiquette">En direct</span>
            <strong className="font-semibold">{direct.titre}</strong>
            <span className="text-texte-2">{formaterDebut(direct.debut_le)}</span>
          </p>
        )}

        {/* ── L'accroche ────────────────────────────────────── */}
        <h1 className="titre-xl m-0 mb-6 max-w-[18ch] text-[clamp(2.5rem,7vw,4.4rem)]">
          Excel ne vous
          <br />
          ralentira plus.
        </h1>

        <p className="mb-8 max-w-[36rem] text-[1.18rem] leading-[1.55] text-texte-2">
          Onze modules pour passer de{" "}
          <span className="text-texte">« je sais faire un tableau »</span> à{" "}
          <strong className="font-semibold text-texte">
            « je construis un modèle, je le documente, et j&apos;assume chaque
            chiffre »
          </strong>{" "}
          — avec l&apos;IA comme copilote, jamais comme oracle.
        </p>

        <div className="barre-formule mb-10 max-w-[36rem] overflow-x-auto">
          <span className="ref">A1</span>
          <span className="fx">fx</span>
          <span className="val">
            =SI(niveau_8;{" "}
            <b className="font-semibold text-accent-texte">
              &quot;irremplaçable&quot;
            </b>
            ; &quot;remplaçable&quot;)
          </span>
        </div>

        <section id="commencer" className="mb-6 scroll-mt-8">
          <InscriptionRapide />
        </section>

        <p className="mb-4 max-w-[34rem] text-[0.95rem] text-texte-2">
          Vous arrivez directement sur la première leçon.{" "}
          <strong className="font-semibold text-texte">
            Les modules 0 et 1 sont gratuits
          </strong>{" "}
          — et ils le restent. Ensuite, la masterclass complète :{" "}
          <strong className="font-semibold text-texte">37 $, une fois</strong>,
          pour les neuf modules qui restent et le certificat. Pas
          d&apos;abonnement, et le prix ne monte jamais.
        </p>

        {/*  La seule preuve sociale de la page était une vidéo YouTube,
            citée aux deux tiers du texte. Ces deux nombres sont vrais,
            vérifiables, et se refont tout seuls. */}
        <p className="mb-10 flex max-w-[34rem] flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] tracking-[0.1em] text-texte-3 uppercase">
          <span>
            <strong className="font-semibold text-texte-2">100 000+</strong>{" "}
            formés sur YouTube
          </span>
          {inscrits && (
            <span>
              <strong className="font-semibold text-texte-2">{inscrits}+</strong>{" "}
              inscrits ici
            </span>
          )}
          <span>Certificat vérifiable publiquement</span>
        </p>

        {/* ── Comment ça marche ─────────────────────────────── */}
        {/*  Une chronologie, pas une liste de traits : l'ordre porte
            l'information. Dire le prix ici, tôt, le transforme en
            réassurance — c'est l'inverse de le cacher jusqu'au
            module 2, qui se vit comme une embuscade. */}
        <section className="mb-16">
          <ol className="m-0 grid list-none gap-0 border-t border-bord p-0 sm:grid-cols-3">
            {[
              {
                quand: "Maintenant",
                quoi: "Votre nom, votre adresse, et vous êtes sur la première leçon. Aucune carte bancaire.",
              },
              {
                quand: "Quatre modules, à votre rythme",
                quoi: "Les modules 0 et 1, leur travail pratique et leurs QCM. Rien n'expire, rien ne se ferme.",
              },
              {
                quand: "Quand vous décidez",
                quoi: "37 $ une fois pour les neuf modules restants, le projet final et le certificat.",
              },
            ].map((e, i) => (
              <li
                key={e.quand}
                className="border-b border-bord py-5 sm:border-b-0 sm:border-r sm:px-5 sm:py-4 sm:first:pl-0 sm:last:border-r-0"
              >
                <span className="font-mono text-[10px] tracking-[0.12em] text-texte-3 tabular-nums">
                  0{i + 1}
                </span>
                <span className="mt-[6px] block text-[0.99rem] font-semibold text-texte">
                  {e.quand}
                </span>
                <span className="mt-[5px] block text-[0.92rem] leading-[1.5] text-texte-2">
                  {e.quoi}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-[36rem] text-[0.92rem] leading-[1.5] text-texte-3">
            Pas d&apos;abonnement, rien à reconduire, et{" "}
            <strong className="font-semibold text-texte-2">
              le prix ne monte jamais
            </strong>
            . Vous ne payez qu&apos;après avoir fait deux modules entiers —
            personne ne devrait payer pour une formation qu&apos;il n&apos;a
            pas essayée.
          </p>
        </section>

        {/* ── Ce que ça change ──────────────────────────────── */}
        <section className="border-t-2 border-texte pt-5">
          <h2 className="titre-l m-0 text-[clamp(1.6rem,3.4vw,2.1rem)]">
            Ce que vous saurez faire
          </h2>
          <p className="mt-3 mb-8 max-w-[34rem] text-texte-2">
            Pas une liste de fonctions. Quatre situations que vous vivez déjà.
          </p>

          <ol className="m-0 grid list-none gap-0 border-t border-bord p-0">
            {AVANT_APRES.map((x) => (
              <li
                key={x.cell}
                className="grid grid-cols-1 gap-x-6 gap-y-3 border-b border-bord py-6 sm:grid-cols-[76px_minmax(0,1fr)]"
              >
                <span className="flex items-baseline gap-3 sm:flex-col sm:gap-2">
                  <span className="font-mono text-[11px] text-texte-3">
                    {x.cell}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.1em] text-texte-3 uppercase">
                    {x.ou}
                  </span>
                </span>
                <span className="block">
                  <span className="block max-w-[33rem] text-[0.98rem] text-texte-3 line-through decoration-texte-3/40">
                    {x.avant}
                  </span>
                  <span className="titre-m mt-2 block max-w-[33rem] text-[1.1rem] text-texte">
                    {x.apres}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Le programme ──────────────────────────────────── */}
        <section className="mt-16 border-t-2 border-texte pt-5">
          <h2 className="titre-l m-0 text-[clamp(1.6rem,3.4vw,2.1rem)]">
            Le programme
          </h2>
          <p className="mt-3 mb-8 max-w-[34rem] text-texte-2">
            Une seule entreprise du premier soir au certificat — six agences,
            trois devises, un reporting en dollars. On ne réapprend pas le
            contexte à chaque module.
          </p>

          <ol className="m-0 grid list-none gap-0 border-t border-bord p-0">
            {MODULES.map(([n, titre, quoi, gratuit]) => (
              <li
                key={n}
                className="grid grid-cols-1 items-baseline gap-x-6 gap-y-1 border-b border-bord py-[18px] sm:grid-cols-[92px_minmax(0,1fr)_auto]"
              >
                <span className="font-mono text-[11px] tracking-[0.1em] text-texte-2 uppercase">
                  Module {n}
                </span>
                <span className="block">
                  <span className="titre-m block text-[1.08rem] text-texte">
                    {titre}
                  </span>
                  <span className="mt-[2px] block max-w-[30rem] text-[0.93rem] text-texte-2">
                    {quoi}
                  </span>
                </span>
                <span
                  className={`font-mono text-[10px] tracking-[0.12em] uppercase ${
                    gratuit ? "text-accent-texte" : "text-texte-3"
                  }`}
                >
                  {gratuit ? "Gratuit" : "Masterclass"}
                </span>
              </li>
            ))}
            <li className="grid grid-cols-1 items-baseline gap-x-6 gap-y-1 border-b border-bord py-[18px] sm:grid-cols-[92px_minmax(0,1fr)_auto]">
              <span className="font-mono text-[11px] tracking-[0.1em] text-texte-2 uppercase">
                🏆 Final
              </span>
              <span className="block">
                <span className="titre-m block text-[1.08rem] text-texte">
                  Le capstone
                </span>
                <span className="mt-[2px] block max-w-[30rem] text-[0.93rem] text-texte-2">
                  Vingt et un fichiers, un brief de quatre phrases, et rien
                  d&apos;autre
                </span>
              </span>
              <span className="font-mono text-[10px] tracking-[0.12em] text-texte-3 uppercase">
                Masterclass
              </span>
            </li>
          </ol>
        </section>

        {/* ── Comment ça se passe ───────────────────────────── */}
        <section className="mt-16 border-t-2 border-texte pt-5">
          <h2 className="titre-l m-0 text-[clamp(1.6rem,3.4vw,2.1rem)]">
            Comment ça se passe
          </h2>
          <p className="mt-3 mb-8 max-w-[34rem] text-texte-2">
            Chaque module est bâti pareil. Comptez deux heures, que vous pouvez
            étaler.
          </p>

          <ol className="m-0 grid list-none gap-0 border-t border-bord p-0">
            {RYTHME.map(([quoi, duree, note], i) => (
              <li
                key={quoi}
                className="grid grid-cols-1 items-baseline gap-x-5 gap-y-1 border-b border-bord py-[18px] sm:grid-cols-[34px_minmax(0,1fr)_auto]"
              >
                <span className="font-mono text-[12px] text-texte-3">
                  {i + 1}
                </span>
                <span className="block">
                  <span className="titre-m block text-[1.06rem] text-texte">
                    {quoi}
                  </span>
                  <span className="mt-[2px] block max-w-[32rem] text-[0.93rem] text-texte-2">
                    {note}
                  </span>
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.08em] text-texte-3 uppercase">
                  {duree}
                </span>
              </li>
            ))}
          </ol>

          <div className="plage mt-9 px-6 py-5">
            <span className="etiquette mb-2 block">
              La correction entre pairs
            </span>
            <p className="m-0 max-w-[32rem] text-[1.02rem] leading-[1.5]">
              Vous corrigez <strong className="font-semibold">trois copies</strong>{" "}
              avant de voir votre note. Parce qu&apos;on apprend davantage en
              relisant trois copies qu&apos;en recevant une note — et parce que
              la lisibilité et la documentation ne se notent pas à la machine.
            </p>
            <span className="poignee" aria-hidden="true" />
          </div>

          <div className="mt-9">
            <ApercuCorrection />
          </div>

          <div className="mt-9 rounded-[10px] border border-bord p-6">
            <span className="etiquette mb-3 block">Les soirées enregistrées</span>
            <p className="m-0 max-w-[34rem] text-[1.02rem] leading-[1.5]">
              Les soirées d&apos;ouverture ont été filmées et sont{" "}
              <strong className="font-semibold">dans la formation</strong>, au
              même endroit que les leçons. Vous les regardez quand vous voulez,
              en pause, en arrière, à deux heures du matin si ça vous arrange.
              Rien à manquer, rien à rattraper.
            </p>
          </div>
        </section>

        {/* ── Les chiffres ──────────────────────────────────── */}
        <section className="mt-16 border-t-2 border-texte pt-5">
          <h2 className="titre-l m-0 mb-8 text-[clamp(1.6rem,3.4vw,2.1rem)]">
            Ce qui est déjà en ligne
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3">
            {CHIFFRES.map(([n, quoi]) => (
              <div key={quoi}>
                <p className="titre-xl m-0 text-[2.4rem] tabular-nums">{n}</p>
                <p className="mt-1 mb-0 font-mono text-[10.5px] tracking-[0.1em] text-texte-2 uppercase">
                  {quoi}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-[34rem] text-[0.96rem] text-texte-2">
            Tout est écrit, testé, et en ligne. Les onze travaux pratiques sont
            corrigés par la machine en quelques secondes — et chacun a été
            vérifié en déposant son propre corrigé, qui doit obtenir 20 sur 20.
          </p>
        </section>

        {/* ── Le prix ───────────────────────────────────────── */}
        <section className="mt-16 border-t-2 border-texte pt-5">
          <h2 className="titre-l m-0 text-[clamp(1.6rem,3.4vw,2.1rem)]">
            Le prix
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-[10px] border border-bord p-6">
              <p className="etiquette mb-3">Modules 0 et 1</p>
              <p className="titre-xl m-0 text-[2.6rem]">Gratuit</p>
              <p className="mt-4 mb-0 text-[0.96rem] leading-[1.55] text-texte-2">
                Dix leçons, le premier travail pratique corrigé par la machine,
                les QCM. Sans carte bancaire, sans limite de durée — et les
                leçons se lisent même sans créer de compte.
              </p>
            </div>

            <div className="rounded-[10px] border-2 border-[color:var(--plage-bord)] bg-[color:var(--plage-fond)] p-6">
              <p className="etiquette mb-3">Modules 2 à 10 + capstone</p>
              <p className="titre-xl m-0 text-[2.6rem]">
                37 $
                <span className="ml-2 align-middle font-mono text-[11px] tracking-[0.1em] text-texte-2 uppercase">
                  une seule fois
                </span>
              </p>
              <p className="mt-4 mb-0 text-[0.96rem] leading-[1.55] text-texte-2">
                Les neuf modules restants, le projet final, la correction entre
                pairs, la soutenance et le certificat{" "}
                <em>Avancé</em>. Pas d&apos;abonnement, rien à reconduire,{" "}
                <strong className="font-semibold text-texte">
                  et le prix ne monte jamais
                </strong>
                .
              </p>
              <ul className="mt-5 mb-0 flex list-none flex-col gap-[7px] p-0 text-[0.92rem] leading-[1.45] text-texte-2">
                {[
                  "L'accès à vie, et toutes les vidéos à mesure qu'elles sortent",
                  "La bibliothèque de prompts de la formation",
                  "Les 11 classeurs corrigés et commentés",
                  "Le modèle de tableau de bord, à brancher sur vos données",
                ].map((b) => (
                  <li key={b} className="flex items-baseline gap-[10px]">
                    <span
                      aria-hidden="true"
                      className="mt-[1px] h-[7px] w-[7px] shrink-0 rounded-[1px] bg-voltage"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/*  Le prix était annoncé sans jamais être défendu. Ces trois
              lignes sont vérifiables et suffisent : on ne promet pas un
              salaire, on compare une dépense à ce qu'elle remplace. */}
          <div className="mt-8 border-t border-bord pt-7">
            <p className="etiquette mb-4">Ce que 37 $ remplace</p>
            <ul className="m-0 flex max-w-[36rem] list-none flex-col gap-0 p-0">
              {[
                [
                  "Trois heures chaque lundi",
                  "à refaire le même rapport, c'est plus de cent cinquante heures par an. Le module 10 les ramène à un clic.",
                ],
                [
                  "Un abonnement à 10 $ par mois",
                  "coûte davantage dès le quatrième mois, et ne s'arrête jamais. Ici : une fois, et l'accès reste à vie.",
                ],
                [
                  "Un chiffre faux envoyé à la direction",
                  "se paie autrement qu'en dollars. Le module 2 apprend le total de contrôle qui l'attrape avant l'envoi.",
                ],
              ].map(([titre, suite]) => (
                <li
                  key={titre}
                  className="flex items-baseline gap-[10px] border-b border-bord-2 py-[13px] text-[0.98rem] leading-[1.55]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[7px] h-[7px] w-[7px] shrink-0 rounded-[1px] bg-voltage"
                  />
                  <span className="text-texte-2">
                    <strong className="font-semibold text-texte">{titre}</strong>{" "}
                    {suite}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 mb-0 max-w-[34rem] text-[0.95rem] leading-[1.55] text-texte-2">
              Et vous ne décidez qu&apos;après avoir fait deux modules entiers,
              travaux pratiques compris. C&apos;est la seule garantie qui vaille
              quelque chose : vous savez déjà ce que vous achetez.
            </p>
          </div>

          {/* ── Le cercle ─────────────────────────────────── */}
          <div className="mt-5 rounded-[10px] border border-bord p-6 sm:flex sm:items-start sm:justify-between sm:gap-8">
            <div className="max-w-[34rem]">
              <p className="etiquette mb-3">La masterclass, accompagnée</p>
              <p className="titre-m m-0 text-[1.3rem] text-texte">Le cercle</p>
              <p className="mt-3 mb-0 text-[0.96rem] leading-[1.55] text-texte-2">
                Tout ce que contient la masterclass, et{" "}
                <strong className="font-semibold text-texte">
                  un appel en tête à tête avec Oscar
                </strong>{" "}
                — trente minutes sur vos propres fichiers, pas sur un cas
                d&apos;école. Vous réservez votre créneau quand vous voulez.
                Plus un canal privé où il répond.
              </p>
            </div>
            <p className="titre-xl mt-5 mb-0 shrink-0 text-[2rem] sm:mt-0">
              97 $
            </p>
          </div>

          {/*  Sept des vingt premières ventes sont arrivées par mobile
              money ou Western Union. La page n'en disait pas un mot :
              quelqu'un sans carte bancaire lisait « 37 $ » et partait. */}
          <div className="mt-8 rounded-[10px] border border-bord p-6">
            <span className="etiquette mb-3 block">Payer sans carte bancaire</span>
            <p className="m-0 mb-4 max-w-[34rem] text-[1.02rem] leading-[1.55]">
              La page de paiement accepte la carte et affiche le prix dans
              votre monnaie. Mais une bonne partie des gens paient autrement,
              et c&apos;est prévu :{" "}
              <strong className="font-semibold">
                Airtel Money, Orange Money, M-Pesa, Wave, Western Union
              </strong>{" "}
              ou un virement.
            </p>
            <p className="m-0 max-w-[34rem] text-[0.95rem] leading-[1.55] text-texte-2">
              Écrivez-moi sur WhatsApp au{" "}
              <a
                href="https://wa.me/243971601855"
                className="text-texte underline decoration-[color:var(--voltage-2)] underline-offset-[3px]"
              >
                +243 971 601 855
              </a>{" "}
              ou à{" "}
              <a
                href="mailto:oscaraksanti@gmail.com"
                className="text-texte underline decoration-[color:var(--voltage-2)] underline-offset-[3px]"
              >
                oscaraksanti@gmail.com
              </a>{" "}
              : je vous donne le numéro, et votre accès s&apos;ouvre dès que
              l&apos;argent arrive.
            </p>
          </div>

        </section>

        {/* ── Le certificat ─────────────────────────────────── */}
        <section className="mt-16 border-t-2 border-texte pt-5">
          <h2 className="titre-l m-0 text-[clamp(1.6rem,3.4vw,2.1rem)]">
            Le certificat
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="etiquette mb-2">Fondations</p>
              <p className="m-0 text-[0.98rem] leading-[1.55] text-texte-2">
                Le travail pratique du module 1, rendu, et les corrections
                de vos pairs faites.
              </p>
            </div>
            <div>
              <p className="etiquette mb-2">Avancé</p>
              <p className="m-0 text-[0.98rem] leading-[1.55] text-texte-2">
                Le programme entier, le capstone rendu, une note d&apos;au moins
                12 sur 20, et une soutenance de dix minutes — écran partagé,
                trois questions tirées dans votre propre fichier.
              </p>
            </div>
          </div>
          <p className="mt-7 max-w-[34rem] text-[1.02rem] leading-[1.55]">
            Il porte un code unique et une page de vérification publique :
            quiconque le reçoit confirme en trois secondes qu&apos;il est réel.
          </p>
          <p className="mt-4 max-w-[34rem] text-[0.95rem] text-texte-3">
            La condition qui compte plus que les autres :{" "}
            <strong className="font-semibold text-texte">
              savoir expliquer chaque cellule de son fichier
            </strong>
            . Jamais « c&apos;est l&apos;IA qui l&apos;a fait ».
          </p>
        </section>

        {/* ── Qui ───────────────────────────────────────────── */}
        <section className="mt-16 border-t-2 border-texte pt-5">
          <h2 className="titre-l m-0 text-[clamp(1.6rem,3.4vw,2.1rem)]">
            Qui vous forme
          </h2>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
            <Image
              src="/oscar-aksanti.jpg"
              alt="Oscar Aksanti"
              width={112}
              height={112}
              className="h-[96px] w-[96px] shrink-0 rounded-[10px] object-cover sm:h-[112px] sm:w-[112px]"
            />
            <div className="min-w-0">
          <p className="mt-0 max-w-[36rem] text-[1.06rem] leading-[1.6]">
            <strong className="font-semibold">Oscar Aksanti</strong>, ingénieur
            en informatique, analyste de données et formateur, à Kinshasa. Ma
            formation Excel gratuite sur YouTube — dix heures, une seule vidéo —
            a servi à{" "}
            <strong className="font-semibold">plus de 100 000 personnes</strong>.
            Elle est toujours en ligne, toujours gratuite, et elle le restera.
          </p>
          <p className="mt-4 max-w-[36rem] text-[1.02rem] leading-[1.6] text-texte-2">
            Ce programme-ci n&apos;en est pas la suite : c&apos;est son
            contraire. La vidéo apprend Excel. Celui-ci apprend à{" "}
            <em>décider</em> avec Excel — et à travailler avec une IA sans lui
            faire confiance aveuglément.
          </p>
            </div>
          </div>
          <p className="mt-6">
            <a className="bouton-2" href={LIEN_TELEGRAM}>
              Rejoindre le groupe Telegram
            </a>
          </p>
        </section>

        {/* ── Les questions ─────────────────────────────────── */}
        <section className="mt-16 border-t-2 border-texte pt-5">
          <h2 className="titre-l m-0 mb-8 text-[clamp(1.6rem,3.4vw,2.1rem)]">
            Les questions qu&apos;on me pose
          </h2>
          <dl className="m-0 border-t border-bord">
            {QUESTIONS.map((x) => (
              <div key={x.q} className="border-b border-bord py-6">
                <dt className="titre-m m-0 mb-2 text-[1.08rem]">{x.q}</dt>
                <dd className="m-0 max-w-[36rem] text-[0.98rem] leading-[1.6] text-texte-2">
                  {x.r}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Le rappel ─────────────────────────────────────── */}
        <section className="mt-16 border-t-2 border-texte pt-8">
          <h2 className="titre-l m-0 mb-4 max-w-[20ch] text-[clamp(1.7rem,4vw,2.4rem)]">
            La première leçon commence dans deux minutes.
          </h2>
          <p className="mb-8 max-w-[34rem] text-[1.04rem] text-texte-2">
            Votre nom, votre email, et un lien de connexion arrive. Pas de mot
            de passe, pas de carte bancaire. Vous commencez par les modules 0
            et 1 — et vous déciderez de la suite en connaissance de cause.
          </p>
          <InscriptionRapide compact />

          <p className="mt-9 mb-0 max-w-[34rem] text-[0.95rem] leading-[1.6] text-texte-3">
            Déjà décidé ? La masterclass s&apos;ouvre depuis votre compte, en
            deux clics —{" "}
            <strong className="font-semibold text-texte-2">
              37 $, une seule fois, accès à vie
            </strong>
            . Et si vous payez par Airtel Money, Orange Money ou Western Union,
            écrivez-moi : c&apos;est la voie qu&apos;emprunte une vente sur
            trois.
          </p>
        </section>
      </main>

      <PiedPage />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { EnteteApp } from "@/components/entete-app";
import { profilCourant } from "@/lib/profil";

export const metadata: Metadata = { title: "Tableau de bord" };

const ETAPES = [
  { fait: true, texte: "Compte actif" },
  { fait: false, texte: "Module 1 — disponible lundi 21 au soir" },
  { fait: false, texte: "TP 1 rendu" },
  { fait: false, texte: "3 copies corrigées" },
];

export default async function TableauDeBord() {
  const profil = await profilCourant();
  const prenom = profil.nom.split(" ")[0];

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pt-12 pb-24">
        <h1 className="titre-xl m-0 mb-5 text-[clamp(1.9rem,4.6vw,2.8rem)]">
          {prenom ? `Bonjour ${prenom}.` : "Ton espace."}
        </h1>

        <p className="mb-8 max-w-[33rem] text-[1.06rem] text-texte-2">
          Ton accès est actif. Le module 1 s&apos;ouvrira ici{" "}
          <strong className="font-semibold text-texte">
            lundi 21 septembre à 21 h
          </strong>
          , juste après le direct.
        </p>

        <ol className="m-0 flex max-w-[33rem] list-none flex-col gap-0 border-t border-bord p-0">
          {ETAPES.map((e) => (
            <li
              key={e.texte}
              className="flex items-center gap-3 border-b border-bord-2 py-[14px]"
            >
              <span
                aria-hidden="true"
                className={`h-[14px] w-[14px] shrink-0 rounded-[2px] border-2 ${
                  e.fait
                    ? "border-[color:var(--plage-bord)] bg-voltage"
                    : "border-bord"
                }`}
              />
              <span
                className={`text-[0.98rem] ${e.fait ? "text-texte" : "text-texte-2"}`}
              >
                {e.texte}
              </span>
            </li>
          ))}
        </ol>

        {!profil.nom && (
          <div className="plage mt-10 px-6 py-5">
            <span className="etiquette mb-2 block">Une minute à prendre</span>
            <p className="m-0 mb-4 max-w-[30rem] text-[1.02rem] leading-[1.5]">
              Ton nom servira à établir ton certificat. Autant qu&apos;il soit
              écrit correctement dès maintenant.
            </p>
            <Link href="/profil" className="bouton">
              Compléter mon profil
            </Link>
            <span className="poignee" aria-hidden="true" />
          </div>
        )}
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnteteApp } from "@/components/entete-app";
import { TunnelChariow } from "@/components/tunnel-chariow";
import { listerProduits, mesAchats } from "@/lib/offres";
import { profilCourant } from "@/lib/profil";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Paiement",
};

/** « Aïcha Mbala » → prénom « Aïcha », nom « Mbala ». */
function couper(nom: string) {
  const parts = (nom ?? "").trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (parts.length === 0) return { prenom: "", nom: "" };
  if (parts.length === 1) return { prenom: parts[0], nom: "" };
  return { prenom: parts[0], nom: parts.slice(1).join(" ") };
}

export default async function PagePaiement({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const profil = await profilCourant();
  const produits = await listerProduits();

  const offre = produits.find((p) => p.ref === ref);
  //  Une offre inactive ne se paie pas — sauf pour l'administration,
  //  qui doit pouvoir l'essayer avant de l'ouvrir à tout le monde.
  if (!offre || (!offre.actif && profil.role !== "admin")) notFound();

  const achats = await mesAchats();
  const deja = achats.some((a) => a.produit === offre.produit);

  //  La boutique est déduite du lien stocké : une seule source, et
  //  rien à retoucher ici si elle change un jour.
  const boutique =
    offre.lien?.match(/^https?:\/\/([^/]+)/)?.[1] ?? "vjiegixw.mychariow.shop";

  const { prenom, nom } = couper(profil.nom);

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin={profil.role === "admin"} />

      <main className="relative z-1 mx-auto max-w-[680px] px-6 pt-10 pb-24">
        <Link
          href="/offres"
          className="etiquette mb-7 inline-block hover:text-texte"
        >
          ← Retour aux offres
        </Link>

        {deja ? (
          <div className="plage px-6 py-5">
            <span className="etiquette mb-2 block">C&apos;est déjà à toi</span>
            <p className="m-0 mb-4 max-w-[30rem] text-[1.02rem] leading-[1.5]">
              Tu as déjà réglé <strong>{offre.titre}</strong>. Inutile de payer
              une seconde fois — tout est ouvert.
            </p>
            <Link href="/modules" className="bouton">
              Reprendre la formation
            </Link>
            <span className="poignee" aria-hidden="true" />
          </div>
        ) : (
          <>
            <p className="etiquette mb-2">Paiement</p>
            <h1 className="titre-xl m-0 mb-3 text-[clamp(1.6rem,4vw,2.2rem)]">
              {offre.titre}
            </h1>
            <p className="m-0 mb-6 max-w-[34rem] text-[1.01rem] leading-[1.55] text-texte-2">
              {offre.detail}
            </p>

            <div className="mb-3 flex items-baseline justify-between border-y-2 border-texte py-4">
              <span className="etiquette">À régler, une seule fois</span>
              <span className="titre-xl m-0 text-[2rem] tabular-nums">
                {offre.montant} $
              </span>
            </div>
            {/*  Le tunnel affiche la monnaie du pays : c'est ce qui rend
                le mobile money possible. Sans cette phrase, voir
                « 57 361 RWF » sous « 37 $ » fait douter. */}
            <p className="mt-0 mb-7 text-[0.88rem] text-texte-3">
              Converti dans ta monnaie au moment du paiement — francs CFA,
              francs congolais, naira… Le montant reste le même.
            </p>

            <TunnelChariow
              produitRef={offre.ref}
              boutique={boutique}
              email={profil.email ?? ""}
              prenom={prenom}
              nom={nom}
            />

            <p className="mt-6 text-[0.9rem] leading-[1.55] text-texte-3">
              Paiement par mobile money ou par carte. Tes coordonnées sont
              déjà remplies avec{" "}
              <strong className="text-texte-2">{profil.email}</strong> —{" "}
              <strong className="text-texte-2">garde cette adresse</strong>,
              c&apos;est elle qui ouvre tes accès. Ton accès s&apos;ouvre dans
              les secondes qui suivent le paiement, et tu reçois un courriel de
              confirmation.
            </p>
          </>
        )}
      </main>
    </>
  );
}

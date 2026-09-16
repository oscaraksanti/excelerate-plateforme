import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions de vente",
  robots: { index: true, follow: true },
};

export default function Cgv() {
  return (
    <>
      <h1>Conditions de vente</h1>
      <p className="maj">Dernière mise à jour : 17 septembre 2026</p>

      <h2>Qui vend</h2>
      <p>
        <strong>Eurêka Services</strong>, RCCM CD/BKV/RCCM/21-A-00483, Kinshasa,
        République démocratique du Congo. Contact :{" "}
        <a href="mailto:contact@eurekase.net">contact@eurekase.net</a>, +243 97
        16 018 55.
      </p>

      <h2>Ce qui est vendu</h2>
      <ul>
        <li>
          <strong>La masterclass complète</strong> — les sept modules au-delà des
          trois soirées gratuites, leurs travaux pratiques, et le certificat
          avancé s&apos;il est obtenu.
        </li>
        <li>
          <strong>Le certificat des trois soirées</strong> — la validation seule,
          sans les modules supplémentaires.
        </li>
        <li>
          <strong>L&apos;accompagnement individuel</strong> — des séances en
          tête-à-tête, la masterclass comprise.
        </li>
      </ul>
      <p>
        Il s&apos;agit dans tous les cas de <strong>contenu numérique</strong> :
        vidéos, classeurs, énoncés et corrigés, accessibles en ligne. Aucun
        support physique n&apos;est expédié.
      </p>

      <h2>Les prix et le paiement</h2>
      <p>
        Les prix sont affichés <strong>en dollars américains</strong>, toutes
        taxes comprises. Le prix payé est celui affiché au moment de la commande.
      </p>
      <p>
        Le paiement passe par <strong>Chariow</strong>, qui accepte la carte
        bancaire et le mobile money. Nous ne voyons ni ne conservons aucune
        donnée bancaire.
      </p>

      <h2>La mise à disposition</h2>
      <p>
        <strong>L&apos;accès s&apos;ouvre automatiquement</strong>, en quelques
        secondes après le paiement, sur le compte correspondant à l&apos;adresse
        utilisée.
      </p>
      <p>
        Si tu as payé avec une adresse différente de celle de ton compte, tu peux
        rattacher toi-même ton paiement depuis la page{" "}
        <a href="/offres/acces">« retrouver mon paiement »</a>, avec la référence
        de ton reçu. En cas de blocage, écris-nous : nous réglons ça à la main.
      </p>
      <p>
        <strong>L&apos;accès est ouvert sans limite de durée</strong>, tant que
        la plateforme existe. Les mises à jour du contenu te sont acquises sans
        supplément.
      </p>

      <h2>La garantie de satisfaction</h2>
      <p>
        <strong>Quatorze jours.</strong> Si la formation ne te convient pas,
        écris-nous dans les quatorze jours suivant ton achat et nous te
        remboursons intégralement, sans avoir à te justifier.
      </p>
      <p>
        Une seule limite, de bon sens : la demande doit précéder l&apos;obtention
        d&apos;un certificat. Un certificat délivré vaut travail validé.
      </p>

      <h2>Le certificat</h2>
      <p>
        Le certificat ne s&apos;achète pas : <strong>il se mérite</strong>. Trois
        conditions, les mêmes pour tout le monde — tous les travaux pratiques
        rendus, toutes les corrections de pairs effectuées, et une moyenne
        d&apos;au moins <strong>12 sur 20</strong>.
      </p>
      <p>
        Chaque certificat porte un code et une page publique de vérification.
        Nous nous réservons le droit de révoquer un certificat obtenu par fraude
        — travail copié, compte partagé, notation de complaisance.
      </p>

      <h2>Ce dont nous ne répondons pas</h2>
      <ul>
        <li>
          Une connexion Internet insuffisante pour suivre une séance en direct.
        </li>
        <li>
          L&apos;indisponibilité momentanée de Microsoft Teams, de YouTube ou de
          Chariow.
        </li>
        <li>
          Les résultats professionnels obtenus après la formation : nous
          enseignons des méthodes, nous ne promettons ni emploi ni revenu.
        </li>
      </ul>

      <h2>En cas de désaccord</h2>
      <p>
        Écris-nous d&apos;abord :{" "}
        <a href="mailto:oscaraksanti@gmail.com">oscaraksanti@gmail.com</a>. Neuf
        fois sur dix, cela suffit. À défaut, le droit applicable est celui de la
        République démocratique du Congo, et les tribunaux de Kinshasa sont
        compétents.
      </p>
    </>
  );
}

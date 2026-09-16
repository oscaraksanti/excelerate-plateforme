import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Données personnelles",
  robots: { index: true, follow: true },
};

export default function Confidentialite() {
  return (
    <>
      <h1>Tes données personnelles</h1>
      <p className="maj">Dernière mise à jour : 17 septembre 2026</p>

      <p>
        Cette page dit exactement ce que nous savons de toi, pourquoi, et
        comment t&apos;en débarrasser. Elle est écrite pour être lue, pas pour
        être contournée.
      </p>

      <h2>Ce que nous collectons</h2>
      <ul>
        <li>
          <strong>Ton nom, ton adresse email et ton téléphone</strong> — tels que
          tu les as donnés à l&apos;inscription, ou tels que tu les corriges dans
          ton profil.
        </li>
        <li>
          <strong>Ce que tu fais sur la plateforme</strong> — les leçons
          ouvertes, les travaux déposés, les corrections rendues, les questions
          posées.
        </li>
        <li>
          <strong>Les classeurs que tu déposes</strong> pour les travaux
          pratiques.
        </li>
        <li>
          <strong>Tes achats</strong> — produit, montant, date. Jamais tes
          coordonnées bancaires : elles ne transitent pas par nous.
        </li>
      </ul>
      <p>
        Nous ne posons <strong>aucun traceur publicitaire</strong>, aucun outil
        de mesure d&apos;audience, aucun cookie tiers. Le seul cookie déposé sert
        à te garder connecté ; sans lui, tu devrais t&apos;identifier à chaque
        page.
      </p>

      <h2>Pourquoi</h2>
      <ul>
        <li>Te donner accès à la formation et suivre ta progression.</li>
        <li>
          Faire fonctionner la correction entre pairs — ta copie est transmise{" "}
          <strong>anonymement</strong> à d&apos;autres participants, et les leurs
          te sont transmises de la même façon.
        </li>
        <li>Établir ton certificat, s&apos;il t&apos;est délivré.</li>
        <li>
          T&apos;écrire à propos de la formation : rappels, mise en ligne
          d&apos;un module, corrections qu&apos;il te reste à rendre.
        </li>
      </ul>

      <h2>Qui d&apos;autre les voit</h2>
      <p>
        Personne, en dehors des prestataires strictement nécessaires au
        fonctionnement : <strong>Supabase</strong> (comptes et fichiers, en
        Irlande), <strong>Vercel</strong> (hébergement du site),{" "}
        <strong>Resend</strong> (envoi des courriels),{" "}
        <strong>systeme.io</strong> (envoi des courriels d&apos;information),{" "}
        <strong>Chariow</strong> (paiements).
      </p>
      <p>
        <strong>Nous ne vendons ni ne louons tes données.</strong> Jamais, à
        personne.
      </p>

      <h2>Combien de temps</h2>
      <ul>
        <li>
          <strong>Tant que ton compte existe</strong>, pour tout ce qui concerne
          ta formation.
        </li>
        <li>
          <strong>Trois ans après ton dernier passage</strong> si tu ne reviens
          plus, après quoi tout est effacé.
        </li>
        <li>
          <strong>Dix ans pour les pièces comptables</strong> liées à un achat —
          c&apos;est une obligation légale, pas un choix.
        </li>
        <li>
          <strong>Sans limite pour un certificat délivré</strong> : sa page de
          vérification doit rester consultable pour que ton certificat garde sa
          valeur. Tu peux demander sa révocation à tout moment.
        </li>
      </ul>

      <h2>Ce que tu peux exiger</h2>
      <p>
        Consulter ce que nous avons sur toi, le corriger, le récupérer dans un
        format lisible, ou le faire effacer. Nous appliquons le Règlement
        général sur la protection des données à <strong>tout le monde</strong>,
        quel que soit ton pays — c&apos;est plus simple, et c&apos;est plus
        juste.
      </p>
      <p>
        Une seule adresse pour ça :{" "}
        <a href="mailto:oscaraksanti@gmail.com">oscaraksanti@gmail.com</a>. Nous
        répondons sous trente jours, en général bien avant.
      </p>

      <h2>Les mineurs</h2>
      <p>
        La plateforme s&apos;adresse à des adultes. Si tu as moins de 16 ans,
        l&apos;accord de tes parents est nécessaire.
      </p>
    </>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: true, follow: true },
};

export default function MentionsLegales() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p className="maj">Dernière mise à jour : 17 septembre 2026</p>

      <h2>L&apos;éditeur</h2>
      <dl>
        <dt>Raison sociale</dt>
        <dd>Eurêka Services</dd>
        <dt>Registre</dt>
        <dd>RCCM CD/BKV/RCCM/21-A-00483</dd>
        <dt>Siège</dt>
        <dd>Kinshasa, République démocratique du Congo</dd>
        <dt>Responsable</dt>
        <dd>Oscar Aksanti, directeur de la publication</dd>
        <dt>Courriel</dt>
        <dd>
          <a href="mailto:contact@eurekase.net">contact@eurekase.net</a>
        </dd>
        <dt>Téléphone</dt>
        <dd>+243 97 16 018 55 · +243 89 79 79 632</dd>
        <dt>Site</dt>
        <dd>
          <a href="https://eurekase.net" rel="noopener noreferrer">eurekase.net</a>
        </dd>
      </dl>

      <h2>L&apos;hébergement</h2>
      <p>
        La plateforme est hébergée par <strong>Vercel Inc.</strong>, 440 N
        Barranca Ave #4133, Covina, CA 91723, États-Unis.
      </p>
      <p>
        Les données des comptes et des travaux déposés sont conservées par{" "}
        <strong>Supabase</strong>, sur une infrastructure située en{" "}
        <strong>Irlande, au sein de l&apos;Union européenne</strong>. Les envois
        de courriels passent par <strong>Resend</strong>. Les paiements sont
        traités par <strong>Chariow</strong> : la plateforme ne voit jamais tes
        données bancaires et n&apos;en conserve aucune.
      </p>

      <h2>La propriété intellectuelle</h2>
      <p>
        Les vidéos, textes, classeurs, énoncés et corrigés proposés sur cette
        plateforme sont la propriété d&apos;Eurêka Services. Ils te sont confiés
        pour <strong>ton usage personnel de formation</strong>.
      </p>
      <p>
        En clair, ce qui n&apos;est pas permis : rediffuser un accès, publier ou
        revendre les vidéos et les fichiers, les utiliser pour former d&apos;autres
        personnes à titre onéreux. Pour une utilisation en entreprise ou en
        équipe, une licence existe —{" "}
        <a href="mailto:oscaraksanti@gmail.com">écris-nous</a>, c&apos;est
        simple.
      </p>
      <p>
        Le travail que tu déposes reste le tien. Tu nous autorises simplement à
        le transmettre, de façon anonyme, aux autres participants chargés de le
        corriger, et à le conserver le temps de la formation.
      </p>

      <h2>La disponibilité</h2>
      <p>
        Nous faisons le nécessaire pour que la plateforme reste accessible en
        permanence, sans pouvoir le garantir : une panne d&apos;un hébergeur, une
        coupure réseau ou une maintenance peuvent l&apos;interrompre. Les séances
        en direct dépendent en outre de Microsoft Teams et de ta propre
        connexion.
      </p>

      <h2>Une question, un problème</h2>
      <p>
        Écris à <a href="mailto:oscaraksanti@gmail.com">oscaraksanti@gmail.com</a>{" "}
        ou par WhatsApp au <strong>+243 97 16 018 55</strong>. Nous répondons
        sous deux jours ouvrés.
      </p>
    </>
  );
}

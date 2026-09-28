"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { envoyerLien, type EtatConnexion } from "@/app/connexion/actions";

const DEPART: EtatConnexion = { ok: false, message: "" };

function Bouton({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton w-full text-[1.02rem]" disabled={pending}>
      {pending ? "Un instant…" : libelle}
    </button>
  );
}

/**
 * L'inscription de la page d'accueil : un nom, une adresse, et c'est tout.
 *
 * Pas de mot de passe — un lien de connexion part par email et ouvre
 * directement la premiere lecon. Le nom sert deux fois : a dire bonjour,
 * et a figurer sur le certificat.
 *
 * On vouvoie ici, comme toute la page d'accueil. L'application, elle,
 * tutoie — et c'est voulu : on passe au « tu » une fois entre. Mais ce
 * formulaire-ci disait « ton nom » sous un titre qui disait « vous »,
 * exactement au moment ou l'on demande de la confiance.
 */
export function InscriptionRapide({
  suite = "/modules/0/1",
  libelle = "Commencer — c'est gratuit",
  compact = false,
}: {
  suite?: string;
  libelle?: string;
  compact?: boolean;
}) {
  const [etat, action] = useActionState(envoyerLien, DEPART);

  if (etat.ok) {
    return (
      <div className="plage w-full max-w-[30rem] px-6 py-5">
        <span className="etiquette mb-2 block">Regardez vos emails</span>
        <p className="m-0 text-[1.02rem] leading-[1.5]">
          Un lien vient de partir vers{" "}
          <strong className="font-semibold">{etat.email}</strong>. Cliquez
          dessus et vous arrivez directement sur la première leçon.
        </p>
        <p className="mt-3 mb-0 text-[0.9rem] text-texte-2">
          Rien au bout de deux minutes ? Regardez dans les courriers
          indésirables ou l&apos;onglet Promotions. Ouvrez le lien dans votre
          navigateur habituel : vous n&apos;aurez plus jamais à vous
          reconnecter sur cet appareil.
        </p>
        <span className="poignee" aria-hidden="true" />
      </div>
    );
  }

  return (
    <form
      action={action}
      className={`flex w-full flex-col gap-3 ${compact ? "max-w-[30rem]" : "max-w-[32rem]"}`}
    >
      <input type="hidden" name="suite" value={suite} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-[6px]">
          <span className="etiquette">Votre nom complet</span>
          <input
            name="nom"
            type="text"
            required
            minLength={4}
            maxLength={80}
            autoComplete="name"
            placeholder="Aïcha Mbala"
            className="rounded-[8px] border border-bord bg-fond px-[14px] py-[13px] text-[1rem] text-texte outline-none transition-colors placeholder:text-texte-3 focus:border-texte-2"
          />
        </label>

        <label className="flex flex-col gap-[6px]">
          <span className="etiquette">Votre email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="aicha@exemple.com"
            className="rounded-[8px] border border-bord bg-fond px-[14px] py-[13px] text-[1rem] text-texte outline-none transition-colors placeholder:text-texte-3 focus:border-texte-2"
          />
        </label>
      </div>

      <Bouton libelle={libelle} />

      {etat.message && !etat.ok && (
        <p className="m-0 border-l-[3px] border-ko bg-fond-2 px-4 py-3 text-[0.94rem]">
          {etat.message}
        </p>
      )}

      <p className="m-0 text-[0.88rem] leading-[1.5] text-texte-3">
        <strong className="text-texte-2">Prénom et nom</strong> : c&apos;est
        exactement ce qui sera imprimé sur votre certificat. Pas de mot de
        passe à retenir, vous recevez un lien de connexion. Aucune carte
        bancaire — les deux premiers modules sont gratuits.
      </p>
    </form>
  );
}

"use server";

import { clientServeur } from "@/lib/supabase/serveur";

export type EtatConnexion = {
  ok: boolean;
  message: string;
  email?: string;
};

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function envoyerLien(
  _precedent: EtatConnexion,
  donnees: FormData,
): Promise<EtatConnexion> {
  const email = String(donnees.get("email") ?? "").trim().toLowerCase();
  const suite = String(donnees.get("suite") ?? "/tableau-de-bord");

  if (!EMAIL_VALIDE.test(email)) {
    return { ok: false, message: "Cette adresse ne ressemble pas à un email." };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const retour = `${site}/auth/confirmer?suite=${encodeURIComponent(suite)}`;

  const supabase = await clientServeur();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: retour },
  });

  if (error) {
    // Message utile, jamais l'erreur technique brute.
    const trop = error.status === 429 || /rate/i.test(error.message);
    return {
      ok: false,
      email,
      message: trop
        ? "Trop de demandes depuis cette adresse. Attends une minute et réessaie."
        : "L'envoi a échoué. Vérifie l'adresse, ou réessaie dans un instant.",
    };
  }

  return {
    ok: true,
    email,
    message: `Lien envoyé à ${email}. Il est valable une heure.`,
  };
}

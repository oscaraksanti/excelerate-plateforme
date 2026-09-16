"use server";

import { cookies } from "next/headers";
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

  // La destination voyage dans un cookie, pas dans l'URL de l'email :
  // le gabarit construit son lien a partir du Site URL de Supabase, et
  // n'a donc aucun moyen de la transporter. Sur un autre appareil le
  // cookie est absent, on retombe sur le tableau de bord.
  if (suite !== "/tableau-de-bord") {
    const magasin = await cookies();
    magasin.set("suite", suite, {
      httpOnly: true, sameSite: "lax", path: "/", maxAge: 3600,
      secure: process.env.NODE_ENV === "production",
    });
  }

  const supabase = await clientServeur();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${site}/auth/confirmer` },
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

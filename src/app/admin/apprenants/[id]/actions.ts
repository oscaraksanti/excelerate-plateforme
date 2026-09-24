"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/admin";
import { lienAppel } from "@/lib/appel";
import { envoyerAvisCertificat } from "@/lib/certificats";
import {
  courrielAppelCercle,
  courrielLibre,
  courrielRelanceCorrections,
  courrielRelanceDepot,
  courrielRelanceDepotClient,
} from "@/lib/courriel";
import { lireFiche } from "@/lib/fiche";
import { nomComplet } from "@/lib/formats";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";

export type Etat = { ok: boolean; message: string };

/**
 * Corriger l'identité.
 *
 * Cinq cents comptes portent un prénom seul ou rien du tout, et un
 * certificat ne s'établit pas là-dessus. C'est le seul endroit où
 * quelqu'un d'autre que l'intéressé peut réparer ça.
 */
export async function corrigerIdentite(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();

  const id = String(d.get("profil_id") ?? "");
  const nom = String(d.get("nom") ?? "").trim().replace(/\s+/g, " ");
  const telephone = String(d.get("telephone") ?? "").trim();
  if (!id) return { ok: false, message: "Fiche introuvable." };

  if (nom && !nomComplet(nom)) {
    return {
      ok: false,
      message:
        "Deux mots au minimum : c'est ce nom-là qui sera imprimé sur le certificat.",
    };
  }

  const { error } = await clientAdmin()
    .from("profils")
    .update({ nom, telephone: telephone || null })
    .eq("id", id);

  if (error) return { ok: false, message: `Échec : ${error.message}` };

  revalidatePath(`/admin/apprenants/${id}`);
  revalidatePath("/admin/apprenants");
  return { ok: true, message: "Fiche corrigée." };
}

/** Délivrer le certificat à cette personne, au niveau choisi. */
export async function delivrerPour(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();

  const id = String(d.get("profil_id") ?? "");
  const niveau = String(d.get("niveau") ?? "fondamentaux");
  if (!id) return { ok: false, message: "Fiche introuvable." };

  const supabase = await clientServeur();
  const { data: code, error } = await supabase.rpc("delivrer_certificat", {
    p_profil: id,
    p_niveau: niveau,
  });

  if (error) {
    return {
      ok: false,
      message: error.message.includes("nom")
        ? "Nom incomplet : corrige la fiche avant de délivrer."
        : `Échec : ${error.message}`,
    };
  }

  const parti = code ? await envoyerAvisCertificat(code as string) : false;

  revalidatePath(`/admin/apprenants/${id}`);
  revalidatePath("/admin/certificats");
  return {
    ok: true,
    message: parti
      ? `Certificat ${code} délivré, l'avis est parti.`
      : `Certificat ${code} délivré — mais l'avis n'est pas parti. Renvoie-le.`,
  };
}

/** Un message écrit à la main. */
export async function ecrire(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();

  const id = String(d.get("profil_id") ?? "");
  const sujet = String(d.get("sujet") ?? "").trim();
  const message = String(d.get("message") ?? "").trim();
  if (!sujet || !message) {
    return { ok: false, message: "Il faut un objet et un message." };
  }

  const { data: profil } = await clientAdmin()
    .from("profils")
    .select("email")
    .eq("id", id)
    .maybeSingle();

  if (!profil?.email) return { ok: false, message: "Cette personne n'a pas d'adresse." };

  const parti = await courrielLibre({ a: profil.email, sujet, message });
  revalidatePath(`/admin/apprenants/${id}`);
  return parti
    ? { ok: true, message: `Message envoyé à ${profil.email}.` }
    : { ok: false, message: "L'envoi a échoué — regarde le journal Resend." };
}

/** Les relances toutes faites, visées sur une seule personne. */
export async function relancerCette(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();

  const id = String(d.get("profil_id") ?? "");
  const quoi = String(d.get("quoi") ?? "");
  const fiche = await lireFiche(id);
  if (!fiche?.email) return { ok: false, message: "Cette personne n'a pas d'adresse." };

  const prenom = (fiche.nom ?? "").trim().split(/\s+/)[0] ?? "";
  let parti = false;

  if (quoi === "corrections") {
    const restant = fiche.travaux
      .filter((t) => t.copie_id)
      .reduce((s, t) => s + Math.max(0, t.requises - t.faites), 0);
    if (restant === 0) {
      return { ok: false, message: "Il n'a aucune correction en retard." };
    }
    parti = await courrielRelanceCorrections({ a: fiche.email, prenom, restant });
  } else if (quoi === "depot") {
    const paye = fiche.achats.length > 0;
    parti = paye
      ? await courrielRelanceDepotClient({ a: fiche.email, prenom })
      : await courrielRelanceDepot({
          a: fiche.email,
          prenom,
          finies: fiche.lecons_finies,
        });
  } else if (quoi === "appel") {
    const appel = await lienAppel();
    if (!appel) {
      return { ok: false, message: "Le lien de rendez-vous est éteint dans les réglages." };
    }
    parti = await courrielAppelCercle({ a: fiche.email, prenom, appel });
  } else if (quoi === "certificat") {
    const vivant = fiche.certificats.find((c) => !c.revoque_le);
    if (!vivant) return { ok: false, message: "Aucun certificat en vigueur." };
    parti = await envoyerAvisCertificat(vivant.code);
  } else {
    return { ok: false, message: "Message inconnu." };
  }

  revalidatePath(`/admin/apprenants/${id}`);
  return parti
    ? { ok: true, message: `Envoyé à ${fiche.email}.` }
    : { ok: false, message: "L'envoi a échoué — regarde le journal Resend." };
}

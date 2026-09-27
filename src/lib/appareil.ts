import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { clientAdmin } from "@/lib/supabase/admin";

/* ══════════════════════════════════════════════════════════════════
   Reconnaître un navigateur sans repasser par la boîte mail.

   Le jeton vit dans un cookie httpOnly de 400 jours ; la base n'en
   garde que l'empreinte. Personne — pas même quelqu'un qui lirait la
   table entière — ne peut s'en servir pour se connecter.

   Il ne franchit pas la frontière d'un navigateur : celui de WhatsApp
   et Chrome ont chacun leurs cookies. C'est une limite du web, pas de
   ce code, et c'est pour ça qu'on prévient aussi les gens quand ils
   ouvrent la plateforme dans une fenêtre intégrée.
   ══════════════════════════════════════════════════════════════════ */

export const COOKIE_APPAREIL = "appareil";
const AN_ET_DEMI = 400 * 24 * 60 * 60;

function empreinte(jeton: string) {
  return createHash("sha256").update(jeton).digest("hex");
}

/** Pose un jeton sur ce navigateur et l'enregistre. Sans bruit. */
export async function reconnaitreAppareil(profilId: string, agent?: string | null) {
  const jeton = randomBytes(32).toString("base64url");

  const { error } = await clientAdmin().from("appareils").insert({
    profil_id: profilId,
    empreinte: empreinte(jeton),
    agent: (agent ?? "").slice(0, 300) || null,
  });

  if (error) {
    console.error("[appareil] enregistrement impossible", error.message);
    return;
  }

  const magasin = await cookies();
  magasin.set(COOKIE_APPAREIL, jeton, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AN_ET_DEMI,
  });
}

/** L'adresse liée à ce navigateur, si on le connaît encore. */
export async function adresseDeLAppareil(jeton: string): Promise<string | null> {
  if (!jeton) return null;

  const admin = clientAdmin();
  const { data } = await admin
    .from("appareils")
    .select("id, profil_id, revoque_le, profils(email)")
    .eq("empreinte", empreinte(jeton))
    .maybeSingle();

  if (!data || data.revoque_le) return null;

  const profil = data.profils as unknown as { email: string | null } | null;
  if (!profil?.email) return null;

  //  On note le passage : c'est ce qui rendra la liste des appareils
  //  lisible dans le profil — « vu il y a deux jours » plutôt qu'une
  //  ligne muette.
  await admin
    .from("appareils")
    .update({ vu_le: new Date().toISOString() })
    .eq("id", data.id);

  return profil.email;
}

/**
 * Révoque CE navigateur, et lui seul.
 *
 * Se déconnecter au bureau ne doit pas déconnecter le téléphone :
 * c'est la règle qu'Oscar a posée, et elle est juste — une
 * déconnexion globale surprendrait plus qu'elle ne protégerait.
 */
export async function oublierCetAppareil() {
  const magasin = await cookies();
  const jeton = magasin.get(COOKIE_APPAREIL)?.value;

  if (jeton) {
    await clientAdmin()
      .from("appareils")
      .update({ revoque_le: new Date().toISOString() })
      .eq("empreinte", empreinte(jeton))
      .is("revoque_le", null);
  }

  magasin.delete(COOKIE_APPAREIL);
}

/** Depuis le profil : révoquer un appareil qu'on ne reconnaît pas. */
export async function revoquerAppareil(id: string, profilId: string) {
  await clientAdmin()
    .from("appareils")
    .update({ revoque_le: new Date().toISOString() })
    .eq("id", id)
    .eq("profil_id", profilId)
    .is("revoque_le", null);
}

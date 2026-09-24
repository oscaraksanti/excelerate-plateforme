import "server-only";
import { courrielCertificat } from "@/lib/courriel";
import { clientAdmin } from "@/lib/supabase/admin";

/**
 * Envoie l'avis de délivrance et note la date.
 *
 * Un seul chemin pour tous les appelants : la délivrance en lot, le
 * renvoi depuis la fiche, et la réémission après correction du nom.
 * Sans ça, trois courriels différents finiraient par circuler.
 *
 * Ne lève jamais : un certificat délivré reste délivré même si le
 * courriel échoue, et `courriel_le` vide le dit franchement.
 */
export async function envoyerAvisCertificat(code: string): Promise<boolean> {
  const admin = clientAdmin();

  const { data: cert } = await admin
    .from("certificats")
    .select("code, niveau, nom_affiche, note, mention, tps_rendus, corrections, profil_id, revoque_le")
    .eq("code", code)
    .maybeSingle();

  if (!cert || cert.revoque_le) return false;

  const { data: profil } = await admin
    .from("profils")
    .select("email, nom")
    .eq("id", cert.profil_id)
    .maybeSingle();

  if (!profil?.email) return false;

  try {
    const parti = await courrielCertificat({
      a: profil.email,
      prenom: (profil.nom ?? cert.nom_affiche ?? "").trim().split(/\s+/)[0] ?? "",
      nomAffiche: cert.nom_affiche,
      code: cert.code,
      mention: cert.mention,
      niveau: cert.niveau,
      note: cert.note === null ? null : Number(cert.note),
      tps: cert.tps_rendus ?? 0,
      corrections: cert.corrections ?? 0,
    });

    if (parti) {
      await admin
        .from("certificats")
        .update({ courriel_le: new Date().toISOString() })
        .eq("code", code);
    }
    return parti;
  } catch (e) {
    console.error("[certificat] avis non envoyé", e);
    return false;
  }
}

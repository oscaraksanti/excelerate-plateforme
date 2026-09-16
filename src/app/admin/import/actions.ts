"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/admin";
import { normaliserTelephone } from "@/lib/telephone";
import { clientAdmin } from "@/lib/supabase/admin";

export type Bilan = {
  ok: boolean;
  message: string;
  ajoutes?: number;
  ignores?: number;
  invalides?: string[];
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function importerInscrits(
  _precedent: Bilan,
  donnees: FormData,
): Promise<Bilan> {
  await exigerAdmin();

  const brut = String(donnees.get("lignes") ?? "");
  const lot = String(donnees.get("lot") ?? "").trim() || null;

  let lignes: { email: string; nom: string; telephone: string }[];
  try {
    lignes = JSON.parse(brut);
  } catch {
    return { ok: false, message: "Lecture du fichier impossible." };
  }
  if (!Array.isArray(lignes) || lignes.length === 0) {
    return { ok: false, message: "Aucune ligne à importer." };
  }
  if (lignes.length > 20000) {
    return { ok: false, message: "Plus de 20 000 lignes : découpe le fichier." };
  }

  // Nettoyage : minuscules, espaces, doublons, adresses invalides.
  const vus = new Set<string>();
  const propres: { email: string; nom: string; telephone: string | null; lot: string | null }[] = [];
  const invalides: string[] = [];

  for (const l of lignes) {
    const email = String(l.email ?? "").trim().toLowerCase();
    if (!EMAIL.test(email)) {
      if (email && invalides.length < 12) invalides.push(email);
      continue;
    }
    if (vus.has(email)) continue;
    vus.add(email);

    propres.push({
      email,
      nom: String(l.nom ?? "").trim().replace(/\s+/g, " ").slice(0, 80),
      telephone: l.telephone ? normaliserTelephone(String(l.telephone)) : null,
      lot,
    });
  }

  if (propres.length === 0) {
    return { ok: false, message: "Aucune adresse valide dans ce fichier." };
  }

  // Par paquets : une requête de 2 000 lignes passe mal, dix de 200 non.
  const admin = clientAdmin();
  const PAQUET = 500;
  for (let i = 0; i < propres.length; i += PAQUET) {
    const { error } = await admin
      .from("inscrits")
      .upsert(propres.slice(i, i + PAQUET), { onConflict: "email" });
    if (error) {
      return {
        ok: false,
        message: `Échec après ${i} lignes : ${error.message}`,
      };
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/import");

  const ignores = lignes.length - propres.length;
  return {
    ok: true,
    ajoutes: propres.length,
    ignores,
    invalides,
    message: `${propres.length} inscrit${propres.length > 1 ? "s" : ""} enregistré${propres.length > 1 ? "s" : ""}.`,
  };
}

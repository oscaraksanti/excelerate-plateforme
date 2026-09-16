"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/admin";
import { clientServeur } from "@/lib/supabase/serveur";

export type Etat = { ok: boolean; message: string };

export async function enregistrerDirect(_p: Etat, d: FormData): Promise<Etat> {
  await exigerAdmin();

  const titre = String(d.get("titre") ?? "").trim();
  const lien = String(d.get("lien") ?? "").trim();
  const quand = String(d.get("debut_le") ?? "").trim();
  const duree = Number(String(d.get("duree_min") ?? "120"));
  const actif = d.get("actif") === "on";

  if (lien && !/^https:\/\//i.test(lien)) {
    return { ok: false, message: "Le lien doit commencer par https://" };
  }
  if (!Number.isFinite(duree) || duree < 15 || duree > 600) {
    return { ok: false, message: "La durée doit être comprise entre 15 et 600 minutes." };
  }
  if (actif && !quand) {
    return { ok: false, message: "Choisis la date et l'heure avant d'allumer le bandeau." };
  }
  if (actif && !lien) {
    return {
      ok: false,
      message:
        "Sans lien, le bandeau s'affiche mais ne mène nulle part. Colle le lien Teams d'abord.",
    };
  }

  const valeur = {
    actif,
    titre,
    lien,
    debut_le: quand ? new Date(quand).toISOString() : null,
    duree_min: Math.trunc(duree),
  };

  const supabase = await clientServeur();
  const { error } = await supabase
    .from("reglages")
    .upsert({ cle: "direct", valeur, maj_le: new Date().toISOString() }, { onConflict: "cle" });

  if (error) return { ok: false, message: `Échec : ${error.message}` };

  // Le bandeau s'affiche partout : on rafraîchit tout l'arbre.
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: actif
      ? "Bandeau allumé. Il apparaît maintenant sur toutes les pages."
      : "Bandeau éteint.",
  };
}

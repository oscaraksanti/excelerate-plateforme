"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/admin";
import { clientServeur } from "@/lib/supabase/serveur";

export async function basculerProduit(donnees: FormData) {
  await exigerAdmin();
  const ref = String(donnees.get("ref") ?? "");
  const actif = String(donnees.get("actif") ?? "") === "1";
  if (!ref) return;

  const supabase = await clientServeur();
  await supabase.from("produits").update({ actif }).eq("ref", ref);

  revalidatePath("/admin/achats");
  revalidatePath("/offres");
}

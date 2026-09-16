import { redirect } from "next/navigation";
import { profilCourant, type Profil } from "@/lib/profil";

/** Garde-fou : toute page et toute action d'administration passe par ici. */
export async function exigerAdmin(): Promise<Profil> {
  const profil = await profilCourant();
  if (profil.role !== "admin") redirect("/tableau-de-bord");
  return profil;
}

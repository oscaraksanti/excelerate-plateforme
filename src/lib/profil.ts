import { redirect } from "next/navigation";
import { clientServeur } from "@/lib/supabase/serveur";

export type Profil = {
  id: string;
  email: string | null;
  nom: string;
  telephone: string | null;
  role: "apprenant" | "admin";
};

/**
 * Renvoie le profil de la personne connectee, ou redirige vers la
 * connexion. Le proxy protege deja les routes, mais on ne s'appuie
 * jamais sur lui seul pour lire des donnees.
 */
export async function profilCourant(): Promise<Profil> {
  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/connexion");

  const { data } = await supabase
    .from("profils")
    .select("id, email, nom, telephone, role")
    .eq("id", auth.user.id)
    .maybeSingle();

  // Le declencheur cree le profil a l'inscription ; ce repli couvre les
  // comptes crees avant sa pose.
  return (
    (data as Profil | null) ?? {
      id: auth.user.id,
      email: auth.user.email ?? null,
      nom: "",
      telephone: null,
      role: "apprenant",
    }
  );
}

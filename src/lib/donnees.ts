import { clientServeur } from "@/lib/supabase/serveur";

export type Module = {
  id: string;
  numero: number;
  titre: string;
  resume: string;
  acces: "gratuit" | "paye";
  publie: boolean;
  /** Nulle = ouvert. Dans le futur = annonce, mais rien ne s'ouvre. */
  publie_le: string | null;
};

export type Lecon = {
  id: string;
  module_id: string;
  numero: number;
  titre: string;
  video_source: "youtube" | "stream" | null;
  video_id: string | null;
  duree_min: number | null;
  corps_md: string;
  accroche: string;
  acces: "herite" | "libre" | "payant";
  publie_le: string | null;
  publie: boolean;
};

export type Ressource = {
  id: string;
  lecon_id: string;
  nom: string;
  chemin: string;
  taille_octets: number | null;
  ordre: number;
};

export type Commentaire = {
  id: string;
  corps: string;
  cree_le: string;
  profil_id: string;
  profils: { nom: string } | null;
};

const CHAMPS_MODULE = "id, numero, titre, resume, acces, publie, publie_le";
const CHAMPS_LECON =
  "id, module_id, numero, titre, video_source, video_id, duree_min, corps_md, accroche, acces, publie_le, publie";

/**
 * Les modules visibles par la personne connectee.
 * Aucun filtre sur `publie` ni sur `acces` ici : ce sont les regles
 * d'acces de la base qui decident, pas cette requete. Un oubli ici ne
 * peut donc rien faire fuiter.
 */
export async function listerModules(): Promise<Module[]> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("modules")
    .select(CHAMPS_MODULE)
    .order("numero");
  return (data as Module[]) ?? [];
}

export async function lireModule(numero: number): Promise<Module | null> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("modules")
    .select(CHAMPS_MODULE)
    .eq("numero", numero)
    .maybeSingle();
  return (data as Module | null) ?? null;
}

export async function listerLecons(moduleId: string): Promise<Lecon[]> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("lecons")
    .select(CHAMPS_LECON)
    .eq("module_id", moduleId)
    .order("numero");
  return (data as Lecon[]) ?? [];
}

export async function lireLecon(
  moduleId: string,
  numero: number,
): Promise<Lecon | null> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("lecons")
    .select(CHAMPS_LECON)
    .eq("module_id", moduleId)
    .eq("numero", numero)
    .maybeSingle();
  return (data as Lecon | null) ?? null;
}

export async function listerRessources(leconId: string): Promise<Ressource[]> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("ressources")
    .select("id, lecon_id, nom, chemin, taille_octets, ordre")
    .eq("lecon_id", leconId)
    .order("ordre");
  return (data as Ressource[]) ?? [];
}

/** Les identifiants des lecons deja terminees, pour cocher la liste. */
export async function leconsTerminees(): Promise<Set<string>> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("progression")
    .select("lecon_id")
    .eq("terminee", true);
  return new Set((data ?? []).map((l: { lecon_id: string }) => l.lecon_id));
}

export async function listerCommentaires(
  leconId: string,
): Promise<Commentaire[]> {
  const supabase = await clientServeur();
  const { data } = await supabase
    .from("commentaires")
    .select("id, corps, cree_le, profil_id, profils(nom)")
    .eq("lecon_id", leconId)
    .is("parent_id", null)
    .order("cree_le", { ascending: false })
    .limit(80);
  return (data as unknown as Commentaire[]) ?? [];
}

/** Adresse publique d'un fichier de l'espace « ressources ». */
export function adresseRessource(chemin: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/ressources/${chemin}`;
}

export { formaterTaille } from "@/lib/formats";

/**
 * Note le passage sur une lecon. Appele pendant le rendu de la page :
 * c'est une ecriture idempotente, sans revalidation, donc sans effet de
 * bord sur le cache.
 */
export async function enregistrerPassage(leconId: string) {
  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;

  const { data } = await supabase
    .from("progression")
    .select("terminee")
    .eq("profil_id", auth.user.id)
    .eq("lecon_id", leconId)
    .maybeSingle();

  await supabase.from("progression").upsert(
    {
      profil_id: auth.user.id,
      lecon_id: leconId,
      terminee: data?.terminee ?? false,
      vue_le: new Date().toISOString(),
    },
    { onConflict: "profil_id,lecon_id" },
  );

  return Boolean(data?.terminee);
}

export type EntreeSommaire = {
  id: string;
  numero: number;
  titre: string;
  duree_min: number | null;
  accroche: string;
  a_video: boolean;
  verrouille: boolean;
  raison: "brouillon" | "programmee" | "payant" | null;
  publie_le: string | null;
};

/**
 * Le sommaire d'un module : TOUTES ses leçons publiées, y compris celles
 * qu'on ne peut pas ouvrir. Voir sept leçons cadenassées fait plus pour
 * la vente que n'importe quel argument — mais le contenu, lui, ne sort
 * jamais : la fonction ne renvoie ni le corps ni l'identifiant vidéo.
 */
export async function sommaireModule(moduleId: string): Promise<EntreeSommaire[]> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("sommaire_module", { p_module: moduleId });
  return (data as EntreeSommaire[]) ?? [];
}

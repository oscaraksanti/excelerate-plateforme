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

export type Message = {
  id: string;
  parent_id: string | null;
  corps: string;
  cree_le: string;
  profil_id: string;
  /** Prénom et initiale, calculés par la base. Jamais l'identité complète. */
  auteur: string;
  est_instructeur: boolean;
  est_moi: boolean;
  utiles: number;
  moi_utile: boolean;
  /** Sur un message d'ouverture : la réponse qui a résolu la question. */
  reponse_acceptee: string | null;
  /** Sur une réponse : est-ce celle qui a résolu son fil ? */
  est_acceptee: boolean;
  /** L'auteur du fil, ou l'instructeur : ceux qui peuvent la désigner. */
  je_peux_resoudre: boolean;
};

/** Un message d'ouverture et ses réponses, dans l'ordre. */
export type Fil = Message & { reponses: Message[] };

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

/**
 * Le fil de discussion d'une leçon : les messages d'ouverture, chacun
 * avec ses réponses.
 *
 * Passe par une fonction de la base plutôt que par la table : « profil :
 * je lis le mien » empêche un apprenant de lire le profil d'un autre,
 * et `profils(nom)` revenait donc vide pour tout le monde. La fonction
 * franchit cette règle une fois, sous contrôle, et ne sort que le nom
 * d'usage.
 */
export async function filDiscussion(leconId: string): Promise<Fil[]> {
  const supabase = await clientServeur();
  const { data } = await supabase.rpc("fil_commentaires", { p_lecon: leconId });
  const messages = (data as Message[]) ?? [];

  //  La base trie par date croissante. On garde cet ordre dans les
  //  réponses — une conversation se lit dans le sens où elle s'est
  //  tenue — et on inverse les fils, pour que les questions récentes
  //  soient en haut.
  const parent = new Map(messages.map((m) => [m.id, m.parent_id]));
  const racine = (m: Message) => {
    let id: string | null = m.parent_id;
    //  Deux niveaux à l'écriture, mais on remonte quand même : une
    //  donnée ancienne ou bricolée ne doit pas faire disparaître un
    //  message de l'affichage.
    for (let garde = 0; id && garde < 20; garde++) {
      const suivant: string | null = parent.get(id) ?? null;
      if (!suivant) return id;
      id = suivant;
    }
    return id;
  };

  const fils = new Map<string, Fil>();
  for (const m of messages) {
    if (!m.parent_id) fils.set(m.id, { ...m, reponses: [] });
  }
  for (const m of messages) {
    if (!m.parent_id) continue;
    const r = racine(m);
    if (r) fils.get(r)?.reponses.push(m);
  }

  //  Dans un fil résolu, la réponse retenue passe devant : quelqu'un
  //  qui arrive avec la même question doit la lire en premier, pas
  //  dérouler huit messages pour la trouver.
  for (const f of fils.values()) {
    f.reponses.sort((a, b) => Number(b.est_acceptee) - Number(a.est_acceptee));
  }

  return [...fils.values()].reverse().slice(0, 80);
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

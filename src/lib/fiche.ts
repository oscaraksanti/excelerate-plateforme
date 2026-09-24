import "server-only";
import { clientAdmin } from "@/lib/supabase/admin";

/* ══════════════════════════════════════════════════════════════════
   La fiche complète d'un apprenant.

   Lue avec les droits complets, et donc réservée aux pages qui ont
   déjà appelé exigerAdmin(). Les règles d'accès de la base masquent
   la copie d'autrui et les corrections reçues avant l'heure : c'est
   juste pour un apprenant, ça rendrait la fiche aveugle pour Oscar.
   ══════════════════════════════════════════════════════════════════ */

export type Achat = {
  produit: string;
  montant: number | null;
  paye_le: string;
  chariow_ref: string;
};

export type TravauxTp = {
  tp_id: string;
  module: number;
  titre: string;
  acces: "gratuit" | "paye";
  copie_id: string | null;
  depose_le: string | null;
  note_machine: number | null;
  note_pairs: number | null;
  note_finale: number | null;
  definitive: boolean;
  /** Corrections reçues sur SA copie. */
  recues: number;
  /** Corrections qu'il a rendues sur ce TP. */
  faites: number;
  requises: number;
  /** Copies d'autrui qu'il garde sans les avoir corrigées. */
  retenues: number;
  /** Parmi elles, celles qui dorment depuis plus de 48 h. */
  dormantes: number;
};

export type Certificat = {
  code: string;
  niveau: string;
  nom_affiche: string;
  note: number | null;
  mention: string;
  emis_le: string;
  revoque_le: string | null;
  revoque_motif: string | null;
  courriel_le: string | null;
};

export type Fiche = {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  role: string;
  origine: string;
  cree_le: string;
  poids_correcteur: number;
  vu_le: string | null;
  lecons_ouvertes: number;
  lecons_finies: number;
  lecons_total: number;
  messages: number;
  achats: Achat[];
  travaux: TravauxTp[];
  certificats: Certificat[];
};

type Copie = {
  id: string;
  tp_id: string;
  depose_le: string;
  note_machine: number | null;
  note_pairs: number | null;
  note_finale: number | null;
  note_definitive: boolean;
};

type LigneTp = {
  id: string;
  numero: number;
  titre: string;
  corrections_requises: number;
  modules: { numero: number; acces: "gratuit" | "paye" } | null;
};

export async function lireFiche(profilId: string): Promise<Fiche | null> {
  const admin = clientAdmin();

  const { data: profil } = await admin
    .from("profils")
    .select("id, nom, email, telephone, role, origine, cree_le, poids_correcteur")
    .eq("id", profilId)
    .maybeSingle();

  if (!profil) return null;

  const [
    { data: auth },
    { data: achats },
    { data: tps },
    { data: copies },
    { data: rendues },
    { data: retenues },
    { data: progres },
    { data: lecons },
    { count: messages },
    { data: certificats },
  ] = await Promise.all([
    admin.auth.admin.getUserById(profilId),
    admin
      .from("achats")
      .select("produit, montant, paye_le, chariow_ref")
      .eq("profil_id", profilId)
      .order("paye_le", { ascending: false }),
    admin
      .from("tps")
      .select("id, numero, titre, corrections_requises, modules!inner(numero, acces, publie)")
      .eq("publie", true)
      .eq("modules.publie", true),
    admin
      .from("copies")
      .select("id, tp_id, depose_le, note_machine, note_pairs, note_finale, note_definitive")
      .eq("profil_id", profilId),
    //  Ce qu'il a corrigé.
    admin.from("corrections").select("id, copies!inner(tp_id)").eq("correcteur_id", profilId),
    //  Ce qu'il retient sans le rendre.
    admin
      .from("attributions")
      .select("id, attribue_le, copies!inner(tp_id)")
      .eq("correcteur_id", profilId)
      .eq("statut", "en_attente"),
    admin.from("progression").select("lecon_id, terminee").eq("profil_id", profilId),
    admin.from("lecons").select("id").eq("publie", true),
    admin
      .from("commentaires")
      .select("id", { count: "exact", head: true })
      .eq("profil_id", profilId),
    admin
      .from("certificats")
      .select(
        "code, niveau, nom_affiche, note, mention, emis_le, revoque_le, revoque_motif, courriel_le",
      )
      .eq("profil_id", profilId)
      .order("emis_le", { ascending: false }),
  ]);

  const mesCopies = new Map<string, Copie>();
  for (const c of (copies as Copie[] | null) ?? []) mesCopies.set(c.tp_id, c);

  //  Les corrections reçues, copie par copie. Une seule requête, et
  //  seulement s'il a déposé quelque chose.
  const recuesParCopie = new Map<string, number>();
  const ids = [...mesCopies.values()].map((c) => c.id);
  if (ids.length > 0) {
    const { data: recues } = await admin
      .from("corrections")
      .select("copie_id")
      .in("copie_id", ids);
    for (const r of (recues as { copie_id: string }[] | null) ?? []) {
      recuesParCopie.set(r.copie_id, (recuesParCopie.get(r.copie_id) ?? 0) + 1);
    }
  }

  type Jointe = { copies: { tp_id: string } | { tp_id: string }[] | null };
  const tpDe = (x: Jointe) =>
    Array.isArray(x.copies) ? x.copies[0]?.tp_id : x.copies?.tp_id;

  const faites = (rendues as unknown as Jointe[] | null) ?? [];
  const gardees =
    (retenues as unknown as (Jointe & { attribue_le: string })[] | null) ?? [];
  const limite = Date.now() - 48 * 3600 * 1000;

  const travaux: TravauxTp[] = ((tps as unknown as LigneTp[] | null) ?? [])
    .map((t) => {
      const copie = mesCopies.get(t.id) ?? null;
      const siennes = gardees.filter((a) => tpDe(a) === t.id);
      return {
        tp_id: t.id,
        module: t.modules?.numero ?? 0,
        titre: t.titre,
        acces: t.modules?.acces ?? "gratuit",
        copie_id: copie?.id ?? null,
        depose_le: copie?.depose_le ?? null,
        note_machine: copie?.note_machine ?? null,
        note_pairs: copie?.note_pairs ?? null,
        note_finale: copie?.note_finale ?? null,
        definitive: Boolean(copie?.note_definitive),
        recues: copie ? (recuesParCopie.get(copie.id) ?? 0) : 0,
        faites: faites.filter((k) => tpDe(k) === t.id).length,
        requises: t.corrections_requises,
        retenues: siennes.length,
        dormantes: siennes.filter((a) => new Date(a.attribue_le).getTime() < limite)
          .length,
      };
    })
    .sort((a, b) => a.module - b.module);

  const publiees = new Set(((lecons as { id: string }[] | null) ?? []).map((l) => l.id));
  const suivies = (
    (progres as { lecon_id: string; terminee: boolean }[] | null) ?? []
  ).filter((g) => publiees.has(g.lecon_id));

  return {
    id: profil.id,
    nom: profil.nom ?? "",
    email: profil.email,
    telephone: profil.telephone,
    role: profil.role,
    origine: profil.origine,
    cree_le: profil.cree_le,
    poids_correcteur: Number(profil.poids_correcteur ?? 1),
    vu_le: auth?.user?.last_sign_in_at ?? null,
    lecons_ouvertes: suivies.length,
    lecons_finies: suivies.filter((g) => g.terminee).length,
    lecons_total: publiees.size,
    messages: messages ?? 0,
    achats: (achats as Achat[] | null) ?? [],
    travaux,
    certificats: (certificats as Certificat[] | null) ?? [],
  };
}

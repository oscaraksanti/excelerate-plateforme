import { NextResponse, type NextRequest } from "next/server";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";

/**
 * Sert le classeur d'un pair a corriger.
 *
 * L'adresse ne contient que l'identifiant de l'attribution : ni le nom
 * du fichier, ni celui de son auteur. Le serveur verifie que cette
 * attribution appartient bien a la personne connectee, puis relit le
 * fichier avec les droits complets — les regles d'acces interdisent a
 * l'apprenant de le lire directement, et c'est voulu.
 */
export async function GET(
  _requete: NextRequest,
  { params }: { params: Promise<{ attribution: string }> },
) {
  const { attribution } = await params;

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });
  }

  const admin = clientAdmin();
  const { data: ligne } = await admin
    .from("attributions")
    .select("id, correcteur_id, copies(chemin)")
    .eq("id", attribution)
    .maybeSingle();

  if (!ligne || ligne.correcteur_id !== auth.user.id) {
    return NextResponse.json({ erreur: "Copie introuvable" }, { status: 404 });
  }

  const chemin = (ligne.copies as unknown as { chemin: string } | null)?.chemin;
  if (!chemin) {
    return NextResponse.json({ erreur: "Fichier introuvable" }, { status: 404 });
  }

  const { data: fichier, error } = await admin.storage.from("depots").download(chemin);
  if (error || !fichier) {
    return NextResponse.json({ erreur: "Fichier illisible" }, { status: 404 });
  }

  return new NextResponse(await fichier.arrayBuffer(), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // Nom neutre : le nom d'origine trahirait souvent l'auteur.
      "Content-Disposition": `attachment; filename="copie-a-corriger.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  });
}

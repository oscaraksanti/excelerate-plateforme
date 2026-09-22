import { NextResponse, type NextRequest } from "next/server";
import { clientAdmin } from "@/lib/supabase/admin";
import { clientServeur } from "@/lib/supabase/serveur";

/**
 * Sert la capture d'écran jointe à un message.
 *
 * L'adresse ne porte que l'identifiant du message. Le contrôle d'accès
 * est fait par la règle « commentaires : lecture si leçon visible » :
 * si la ligne sort pour cette personne, elle a le droit de voir
 * l'image. On relit ensuite le fichier avec les droits complets —
 * l'espace est privé, et il doit le rester : une capture Excel contient
 * de vraies données d'entreprise.
 */
const TYPES: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
};

export async function GET(
  _requete: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await clientServeur();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });
  }

  const { data: message } = await supabase
    .from("commentaires")
    .select("id, image")
    .eq("id", id)
    .maybeSingle();

  if (!message?.image) {
    return NextResponse.json({ erreur: "Image introuvable" }, { status: 404 });
  }

  const { data: fichier, error } = await clientAdmin()
    .storage.from("captures")
    .download(message.image);

  if (error || !fichier) {
    return NextResponse.json({ erreur: "Image illisible" }, { status: 404 });
  }

  const ext = message.image.split(".").pop()?.toLowerCase() ?? "webp";

  return new NextResponse(await fichier.arrayBuffer(), {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      //  Privé : elle ne doit pas se retrouver dans le cache d'un
      //  intermédiaire, mais le navigateur peut la garder un moment.
      "Cache-Control": "private, max-age=3600",
    },
  });
}

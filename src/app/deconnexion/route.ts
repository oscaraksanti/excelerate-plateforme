import { NextResponse, type NextRequest } from "next/server";
import { oublierCetAppareil } from "@/lib/appareil";
import { clientServeur } from "@/lib/supabase/serveur";

/**
 * Se deconnecter.
 *
 * On oublie CE navigateur, et lui seul : quelqu'un qui sort au bureau
 * ne doit pas se retrouver dehors sur son telephone. Les autres
 * appareils restent reconnus, et se revoquent depuis le profil.
 */
export async function POST(requete: NextRequest) {
  const supabase = await clientServeur();
  await oublierCetAppareil();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", requete.url), { status: 303 });
}

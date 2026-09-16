import { NextResponse, type NextRequest } from "next/server";
import { clientServeur } from "@/lib/supabase/serveur";

export async function POST(requete: NextRequest) {
  const supabase = await clientServeur();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", requete.url), { status: 303 });
}

import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { BandeauDirect } from "@/components/bandeau-direct";
import { SelecteurTheme } from "@/components/theme";
import { lireDirect } from "@/lib/direct";
import { clientServeur } from "@/lib/supabase/serveur";

/**
 * L'en-tete lit la photo lui-meme.
 *
 * La faire descendre depuis chaque page aurait demande de toucher une
 * vingtaine d'appels pour une vignette de 22 pixels — et le jour ou
 * l'un d'eux aurait ete oublie, la photo aurait disparu sur cette
 * page-la sans que personne ne comprenne pourquoi.
 */
async function maPhoto(): Promise<string | null> {
  try {
    const supabase = await clientServeur();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const { data } = await supabase
      .from("profils")
      .select("avatar")
      .eq("id", auth.user.id)
      .maybeSingle();
    return (data?.avatar as string | null) ?? null;
  } catch {
    return null;
  }
}

export async function EnteteApp({ nom, admin }: { nom: string; admin: boolean }) {
  const direct = await lireDirect();
  const avatar = await maPhoto();

  return (
    <>
      <BandeauDirect direct={direct} />
      <header className="sticky top-0 z-10 border-b border-bord bg-fond/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-4 px-6 py-[14px]">
          <Link
            href="/tableau-de-bord"
            className="etiquette flex items-center gap-[10px]"
          >
            <i className="h-[7px] w-[7px] rounded-full bg-voltage not-italic" />
            <span>Excelerate IA</span>
          </Link>

          <nav className="flex items-center gap-5 font-mono text-[11px] tracking-[0.12em] text-texte-2 uppercase">
            <Link href="/modules" className="hover:text-texte">
              Modules
            </Link>
            <Link href="/corrections" className="hover:text-texte">
              Corriger
            </Link>
            <Link href="/offres" className="hover:text-texte">
              Offres
            </Link>
            {admin && (
              <Link href="/admin" className="hover:text-texte">
                Admin
              </Link>
            )}
            <Link
              href="/mon-parcours"
              className="flex items-center gap-[7px] hover:text-texte"
            >
              <Avatar nom={nom} avatar={avatar} taille={22} />
              <span className="hidden sm:inline">{nom || "Mon parcours"}</span>
            </Link>
            <SelecteurTheme />
            <form action="/deconnexion" method="post">
              <button
                type="submit"
                className="cursor-pointer font-mono text-[11px] tracking-[0.12em] text-texte-3 uppercase hover:text-texte"
              >
                Sortir
              </button>
            </form>
          </nav>
        </div>
      </header>
    </>
  );
}

import { EnteteApp } from "@/components/entete-app";
import { NavAdmin } from "@/components/nav-admin";
import { exigerAdmin } from "@/lib/admin";

export default async function DispositionAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const profil = await exigerAdmin();

  return (
    <>
      <div className="trame" aria-hidden="true" />
      <EnteteApp nom={profil.nom} admin />

      <div className="relative z-1 mx-auto grid max-w-[1160px] grid-cols-1 gap-8 px-6 pt-8 pb-24 lg:grid-cols-[186px_minmax(0,1fr)] lg:gap-10">
        <NavAdmin />
        <main className="min-w-0">{children}</main>
      </div>
    </>
  );
}

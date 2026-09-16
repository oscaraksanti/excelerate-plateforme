"use server";

import { exigerAdmin } from "@/lib/admin";
import { courrielRelanceCorrections } from "@/lib/courriel";
import { clientServeur } from "@/lib/supabase/serveur";

export type EtatRelance = { ok: boolean; message: string };

/**
 * Relance ceux qui ont depose leur copie mais pas fini leurs corrections.
 *
 * Envoi sequentiel avec une pause : un domaine d'envoi neuf ne supporte
 * pas une rafale, et rien ne presse a ce point.
 */
export async function relancerCorrections(
  _p: EtatRelance,
  _d: FormData,
): Promise<EtatRelance> {
  await exigerAdmin();

  const supabase = await clientServeur();
  const { data } = await supabase.rpc("a_relancer");
  const gens = (data as { email: string; nom: string; restant: number }[]) ?? [];

  if (gens.length === 0) {
    return { ok: true, message: "Personne à relancer." };
  }

  let partis = 0;
  for (const g of gens) {
    const ok = await courrielRelanceCorrections({
      a: g.email,
      prenom: (g.nom ?? "").split(" ")[0] ?? "",
      restant: g.restant,
    });
    if (ok) partis += 1;
    await new Promise((r) => setTimeout(r, 120));
  }

  return {
    ok: partis > 0,
    message:
      partis === gens.length
        ? `${partis} relance${partis > 1 ? "s" : ""} envoyée${partis > 1 ? "s" : ""}.`
        : `${partis} relance(s) sur ${gens.length}. Les autres ont échoué — regarde le journal Resend.`,
  };
}

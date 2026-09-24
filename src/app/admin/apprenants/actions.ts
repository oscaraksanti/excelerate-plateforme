"use server";

import { exigerAdmin } from "@/lib/admin";
import {
  courrielRelanceCorrections,
  courrielRelanceDepot,
  courrielRelanceDepotClient,
} from "@/lib/courriel";
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

/**
 * Relance ceux qui n'ont pas encore depose de copie.
 *
 * Deux lettres, jamais la meme : celui qui a paye a acquis un
 * certificat, et un certificat ne s'obtient pas sans travaux rendus.
 * Lui envoyer la relance d'une liste gratuite serait une faute.
 *
 * La base ne rend que ceux a qui la phrase veut dire quelque chose :
 * une lecon du module 1 terminee, ou un achat vieux de plus d'un jour.
 * Ecrire aux 862 comptes sans copie serait un envoi de masse — c'est
 * le travail de systeme.io, pas celui d'un domaine d'envoi jeune.
 */
export async function relancerDepots(
  _p: EtatRelance,
  _d: FormData,
): Promise<EtatRelance> {
  await exigerAdmin();

  const supabase = await clientServeur();
  const { data } = await supabase.rpc("a_relancer_depot");
  const gens =
    (data as { email: string; nom: string; finies: number; a_paye: boolean }[]) ?? [];

  if (gens.length === 0) {
    return { ok: true, message: "Personne à relancer." };
  }

  let partis = 0;
  for (const g of gens) {
    const prenom = (g.nom ?? "").trim().split(/\s+/)[0] ?? "";
    const ok = g.a_paye
      ? await courrielRelanceDepotClient({ a: g.email, prenom })
      : await courrielRelanceDepot({ a: g.email, prenom, finies: g.finies });
    if (ok) partis += 1;
    //  600 ms : Resend accepte deux envois par seconde, et rien ne
    //  presse au point de se faire limiter.
    await new Promise((r) => setTimeout(r, 600));
  }

  return {
    ok: partis > 0,
    message:
      partis === gens.length
        ? `${partis} relance${partis > 1 ? "s" : ""} envoyée${partis > 1 ? "s" : ""}.`
        : `${partis} relance(s) sur ${gens.length}. Les autres ont échoué — regarde le journal Resend.`,
  };
}

"use server";

import { clientServeur } from "@/lib/supabase/serveur";

export type Verdict = {
  ok: boolean;
  juste: boolean;
  bonne: string;
  explication: string;
};

/**
 * Enregistre une reponse et rend le verdict.
 *
 * C'est la base qui decide si la reponse est juste : le navigateur ne
 * connait pas la bonne reponse avant d'avoir repondu, et ne peut donc
 * pas la deviner en lisant le code de la page.
 */
export async function repondreQcm(
  questionId: string,
  choix: string,
): Promise<Verdict> {
  const supabase = await clientServeur();
  const { data, error } = await supabase.rpc("repondre_qcm", {
    p_question: questionId,
    p_choix: choix,
  });

  const r = Array.isArray(data) ? data[0] : data;
  if (error || !r) {
    return { ok: false, juste: false, bonne: "", explication: "" };
  }
  return {
    ok: true,
    juste: Boolean(r.juste),
    bonne: String(r.bonne ?? ""),
    explication: String(r.explication ?? ""),
  };
}

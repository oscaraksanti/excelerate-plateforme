import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client a privileges complets : contourne TOUTES les regles d'acces.
 * Reserve au point d'entree Chariow, a l'import des contacts et a la
 * correction machine. Ne jamais l'importer dans un composant client.
 */
export function clientAdmin() {
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cle) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, cle, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

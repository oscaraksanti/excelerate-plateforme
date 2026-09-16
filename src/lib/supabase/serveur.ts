import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase cote serveur : composants, actions, route handlers.
 * `cookies()` est asynchrone depuis Next 15, d'ou le await.
 */
export async function clientServeur() {
  const magasin = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return magasin.getAll();
        },
        setAll(aPoser) {
          try {
            aPoser.forEach(({ name, value, options }) =>
              magasin.set(name, value, options),
            );
          } catch {
            // Appelé depuis un composant serveur : le proxy rafraichit
            // deja la session, on peut ignorer sans risque.
          }
        },
      },
    },
  );
}

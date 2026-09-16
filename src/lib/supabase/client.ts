"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Client Supabase pour le navigateur. Ne voit que la clé publique. */
export function clientNavigateur() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

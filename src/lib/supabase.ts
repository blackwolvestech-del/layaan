// Browser Supabase client for the shared LAYAAN database (the same project the CRM uses).
// Only the public URL and the publishable (anon) key are used here: the catalogue is read through
// the read-only `storefront_*` RPCs and customers' own data through the `my_*` RPCs, all of which
// enforce access in the database. Orders are placed by the server functions in /api (service key
// on the server only).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const key = ((import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

/** The shared client. Throws a clear error when the environment variables are missing. */
export function supabase(): SupabaseClient {
  if (!client) {
    if (!url || !key) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see .env.example).");
    client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "layaan-auth" },
    });
  }
  return client;
}

/** Public URL of the project (used to resolve CRM uploads stored in Supabase Storage). */
export const supabaseUrl = url ?? "";

/** Access token of the signed-in customer, for authenticated calls to /api. */
export async function accessToken(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase().auth.getSession();
  return data.session?.access_token ?? null;
}

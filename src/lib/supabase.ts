// Browser Supabase client for the shared LAYAAN database (the same project the CRM uses).
// Only the public URL and the publishable (anon) key are used here: the catalogue is read through
// the read-only `storefront_*` RPCs and customers' own data through the `my_*` RPCs, all of which
// enforce access in the database. Orders are placed by the server functions in /api (service key
// on the server only).
import type { SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const key = ((import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(url && key);

let client: Promise<SupabaseClient> | null = null;

/** The shared client. Throws a clear error when the environment variables are missing. */
export function supabase(): Promise<SupabaseClient> {
  if (!client) {
    if (!url || !key) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see .env.example).");
    // Auth/RPC SDK code is split from the initial storefront bundle. Public catalogue reads use
    // the lightweight PostgREST RPC helper below; the SDK is fetched when account auth is needed.
    client = import("@supabase/supabase-js").then(({ createClient }) => createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "layaan-auth" },
    }));
  }
  return client;
}

/** Public URL of the project (used to resolve CRM uploads stored in Supabase Storage). */
export const supabaseUrl = url ?? "";
export const supabasePublishableKey = key ?? "";

/** Small REST RPC call for public read-only functions, avoiding the full SDK on the shop entry. */
export async function publicRpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${encodeURIComponent(name)}`, {
    method: "POST",
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${supabasePublishableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(detail?.message ?? `Catalogue request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

/** Access token of the signed-in customer, for authenticated calls to /api. */
export async function accessToken(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await (await supabase()).auth.getSession();
  return data.session?.access_token ?? null;
}

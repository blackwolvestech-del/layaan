// Shared helpers for the storefront's server functions (Vercel Functions in /api).
// Files under api/_lib are not routes. The service key is read here from SERVER-ONLY environment
// variables (never VITE_-prefixed), so it is never bundled into the browser app.
import { createClient, type PostgrestError, type SupabaseClient } from "@supabase/supabase-js";

const url = () => (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "").trim();
const publishableKey = () => (process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? "").trim();
const serviceKey = () => (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "").trim();

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly extra?: Record<string, unknown>,
  ) {
    super(message);
  }
}

let admin: SupabaseClient | null = null;

/** Service-role client: bypasses RLS. Use only for the storefront RPCs that require it. */
export function adminClient(): SupabaseClient {
  if (!url() || !serviceKey()) throw new HttpError(503, "The shop's order service is not configured yet. Please try again later.");
  admin ??= createClient(url(), serviceKey(), { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

/** Client acting as the signed-in customer (RLS and the my_* RPCs apply). */
export function userClient(token: string): SupabaseClient {
  if (!url() || !publishableKey()) throw new HttpError(503, "The shop is not configured yet.");
  return createClient(url(), publishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export function bearer(req: Request): string | null {
  const v = req.headers.get("authorization");
  const m = v?.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

/** The signed-in customer's verified email, or null for a guest. Invalid tokens are rejected. */
export async function verifiedUser(req: Request): Promise<{ token: string; email: string } | null> {
  const token = bearer(req);
  if (!token) return null;
  const { data, error } = await adminClient().auth.getUser(token);
  if (error || !data.user?.email) throw new HttpError(401, "Your session has expired. Please sign in again.");
  return { token, email: data.user.email.toLowerCase() };
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export async function readJson(req: Request, maxBytes = 64_000): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "Request too large.");
  try {
    const body = JSON.parse(text) as unknown;
    if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {
    /* fall through */
  }
  throw new HttpError(400, "Invalid request.");
}

/** Maps a database error (PostgREST PTxxx codes) to an HTTP error with a customer-safe message. */
export function dbError(error: PostgrestError): HttpError {
  const status = /^PT\d{3}$/.test(error.code) ? Number(error.code.slice(2)) : 500;
  if (status >= 500) {
    console.error("[api] database error", error.code, error.message);
    return new HttpError(500, "Something went wrong on our side. You have not been charged — please try again.");
  }
  let problems: string[] = [];
  try {
    const details = error.details ? (JSON.parse(error.details) as Record<string, string>) : {};
    problems = Object.values(details).filter((v): v is string => typeof v === "string");
  } catch {
    /* details is plain text */
  }
  return new HttpError(status, error.message, { code: error.hint === "stock_changed" ? "stock_changed" : undefined, problems });
}

/** Wraps a handler with method checks and uniform JSON errors. */
export function handler(fn: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      return await fn(req);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message, ...err.extra }, err.status);
      console.error("[api] unexpected error", err);
      return json({ error: "Something went wrong on our side. Please try again." }, 500);
    }
  };
}

export const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

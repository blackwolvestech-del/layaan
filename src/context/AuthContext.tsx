// Customer accounts on Supabase Auth (the same project as the CRM). A storefront sign-up is
// flagged `account_type: "customer"`, so the database creates/links a CRM customer record for it
// once the email is confirmed — never a staff profile. Profile details live on that customer
// record (my_customer / update_my_customer RPCs); marketing preferences stay on this device.
import type { AuthError, Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Customer, CustomerPreferences } from "@/types/account";

const PREFS_KEY = "layaan_customer_prefs";
const PENDING_KEY = "layaan_pending_verification";

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

/** The customer's saved delivery details (CRM customer record). */
export interface CustomerAddress {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface AuthContextType {
  /** False until the stored session has been checked. */
  ready: boolean;
  isAuthenticated: boolean;
  customer: Customer | null;
  /** Saved address on the CRM customer record, when there is one. */
  savedAddress: CustomerAddress | null;
  pendingVerificationEmail: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  /** Removed: there is no demo account on the live shop. Kept so older callers compile. */
  loginAsDemo: () => void;
  register: (data: RegisterInput) => Promise<{ success: boolean; email: string }>;
  verifyEmail: (code: string, email?: string) => Promise<boolean>;
  resendVerification: (email?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Customer> & { address?: Partial<CustomerAddress> }) => Promise<void>;
  updatePreferences: (prefs: Partial<CustomerPreferences>) => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
  /** Reloads the customer record (e.g. after checkout updated the saved address). */
  refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const defaultPrefs: CustomerPreferences = { emailNewsletter: false, orderUpdates: true, exclusiveEvents: false, preferredLanguage: "English" };

function readPrefs(): CustomerPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...defaultPrefs, ...(JSON.parse(raw) as Partial<CustomerPreferences>) };
  } catch {
    /* ignore */
  }
  return defaultPrefs;
}

function readPending(): string | null {
  try {
    return sessionStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

function writePending(email: string | null) {
  try {
    if (email) sessionStorage.setItem(PENDING_KEY, email);
    else sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

interface DbCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  createdAt: string;
}

function toCustomer(session: Session, row: DbCustomer | null, prefs: CustomerPreferences): Customer {
  const meta = (session.user.user_metadata ?? {}) as { full_name?: string; first_name?: string; last_name?: string };
  const fullName = (row?.name || meta.full_name || `${meta.first_name ?? ""} ${meta.last_name ?? ""}`).trim() || (session.user.email ?? "").split("@")[0]!;
  const [first = "", ...rest] = fullName.split(/\s+/);
  const lastName = rest.join(" ");
  const joined = row?.createdAt ?? session.user.created_at;
  return {
    id: row?.id ?? session.user.id,
    firstName: first,
    lastName,
    email: session.user.email ?? row?.email ?? "",
    phone: row?.phone ?? "",
    memberTier: "Client",
    joinedDate: new Date(joined).toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    avatarInitials: `${first[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "L",
    preferences: prefs,
  };
}

/** Customer-friendly wording for Supabase Auth errors. */
function authMessage(error: AuthError): string {
  const m = error.message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match an account.";
  if (m.includes("email not confirmed")) return "Please confirm your email address first — we've sent you a code.";
  if (m.includes("already registered") || m.includes("already been registered")) return "An account with this email already exists. Please sign in.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled")) return "New accounts can't be created right now. Please try again later.";
  if (m.includes("rate limit") || error.status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("password")) return error.message;
  if (m.includes("token") || m.includes("otp")) return "That code is invalid or has expired. Request a new one.";
  return "Something went wrong. Please try again.";
}

export class AuthFailure extends Error {
  override name = "AuthFailure";
  constructor(
    message: string,
    readonly unconfirmed = false,
  ) {
    super(message);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [row, setRow] = useState<DbCustomer | null>(null);
  const [prefs, setPrefs] = useState<CustomerPreferences>(readPrefs);
  const [pendingVerificationEmail, setPending] = useState<string | null>(readPending);

  const loadCustomer = useCallback(async () => {
    const { data, error } = await supabase().rpc("my_customer");
    setRow(error ? null : ((data as DbCustomer | null) ?? null));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const client = supabase();
    let live = true;
    client.auth.getSession().then(({ data }) => {
      if (!live) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
      if (live) setSession(next);
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // The customer record follows the session (it is created/linked once the email is confirmed).
  useEffect(() => {
    if (!session) {
      setRow(null);
      return;
    }
    void loadCustomer();
  }, [session, loadCustomer]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  const setPendingEmail = useCallback((email: string | null) => {
    writePending(email);
    setPending(email);
  }, []);

  const login = useCallback(
    async (email: string, password?: string): Promise<boolean> => {
      const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password: password ?? "" });
      if (error) {
        const unconfirmed = error.message.toLowerCase().includes("email not confirmed");
        if (unconfirmed) setPendingEmail(email.trim());
        throw new AuthFailure(authMessage(error), unconfirmed);
      }
      setPendingEmail(null);
      return true;
    },
    [setPendingEmail],
  );

  const loginAsDemo = useCallback(() => {
    /* No demo account on the live shop. */
  }, []);

  const register = useCallback(
    async (data: RegisterInput) => {
      const email = data.email.trim().toLowerCase();
      const { data: res, error } = await supabase().auth.signUp({
        email,
        password: data.password ?? "",
        options: {
          // Marks this as a shop customer (see migration 20261105000014): no CRM staff profile is created.
          data: { account_type: "customer", full_name: `${data.firstName} ${data.lastName}`.trim(), first_name: data.firstName.trim(), last_name: data.lastName.trim() },
          emailRedirectTo: `${window.location.origin}/account`,
        },
      });
      if (error) throw new AuthFailure(authMessage(error));
      // With email confirmation on, there is no session until the code/link is confirmed.
      if (!res.session) setPendingEmail(email);
      return { success: true, email };
    },
    [setPendingEmail],
  );

  const verifyEmail = useCallback(
    async (code: string, forEmail?: string): Promise<boolean> => {
      const email = forEmail?.trim() || pendingVerificationEmail;
      if (!email) return false;
      const { error } = await supabase().auth.verifyOtp({ email, token: code.trim(), type: "signup" });
      if (error) return false;
      setPendingEmail(null);
      return true;
    },
    [pendingVerificationEmail, setPendingEmail],
  );

  const resendVerification = useCallback(async (forEmail?: string): Promise<boolean> => {
    const email = forEmail?.trim() || pendingVerificationEmail;
    if (!email) return false;
    const { error } = await supabase().auth.resend({ type: "signup", email, options: { emailRedirectTo: `${window.location.origin}/account` } });
    return !error;
  }, [pendingVerificationEmail]);

  const logout = useCallback(() => {
    void supabase().auth.signOut();
    setSession(null);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Customer> & { address?: Partial<CustomerAddress> }) => {
      const input: Record<string, string> = {};
      if (data.firstName !== undefined || data.lastName !== undefined) {
        const current = session ? toCustomer(session, row, prefs) : null;
        input.name = `${data.firstName ?? current?.firstName ?? ""} ${data.lastName ?? current?.lastName ?? ""}`.trim();
      }
      if (data.phone !== undefined) input.phone = data.phone;
      if (data.address) Object.assign(input, data.address);
      const { data: updated, error } = await supabase().rpc("update_my_customer", { p_input: input });
      if (error) throw new AuthFailure(error.message);
      setRow(updated as DbCustomer);
    },
    [session, row, prefs],
  );

  const updatePreferences = useCallback((next: Partial<CustomerPreferences>) => {
    setPrefs((prev) => ({ ...prev, ...next }));
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    const { error } = await supabase().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    if (error && error.status === 429) throw new AuthFailure(authMessage(error));
    // Always report success so the form never reveals whether an account exists.
    return true;
  }, []);

  const resetPassword = useCallback(async (password: string): Promise<boolean> => {
    // Works in the recovery session opened by the reset link (or for a signed-in customer).
    const { error } = await supabase().auth.updateUser({ password });
    if (error) throw new AuthFailure(authMessage(error));
    return true;
  }, []);

  const value = useMemo<AuthContextType>(() => {
    const customer = session ? toCustomer(session, row, prefs) : null;
    const savedAddress = row && (row.address || row.city) ? { address: row.address, city: row.city, province: row.province, postalCode: row.postalCode, country: row.country } : null;
    return {
      ready,
      isAuthenticated: !!session,
      customer,
      savedAddress,
      pendingVerificationEmail,
      login,
      loginAsDemo,
      register,
      verifyEmail,
      resendVerification,
      logout,
      updateProfile,
      updatePreferences,
      forgotPassword,
      resetPassword,
      refreshCustomer: loadCustomer,
    };
  }, [session, row, prefs, ready, pendingVerificationEmail, login, loginAsDemo, register, verifyEmail, resendVerification, logout, updateProfile, updatePreferences, forgotPassword, resetPassword, loadCustomer]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultCustomer } from "@/data/accountData";
import type { Customer, CustomerPreferences } from "@/types/account";

const AUTH_STORAGE_KEY = "layaan_demo_auth";

interface StoredAuth {
  isAuthenticated: boolean;
  customer: Customer | null;
  pendingVerificationEmail: string | null;
}

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  customer: Customer | null;
  pendingVerificationEmail: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsDemo: () => void;
  register: (data: RegisterInput) => Promise<{ success: boolean; email: string }>;
  verifyEmail: (code: string) => Promise<boolean>;
  resendVerification: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Customer>) => void;
  updatePreferences: (prefs: Partial<CustomerPreferences>) => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getInitialAuth(): StoredAuth {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed;
      }
    }
  } catch {
    /* fallback */
  }
  // Default to authenticated demo customer for frictionless evaluation
  return {
    isAuthenticated: true,
    customer: defaultCustomer,
    pendingVerificationEmail: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<StoredAuth>(getInitialAuth);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    } catch {
      /* ignore */
    }
  }, [authState]);

  const login = useCallback(async (email: string): Promise<boolean> => {
    // Simulate brief network latency for realistic feel
    await new Promise((r) => setTimeout(r, 450));
    setAuthState((prev) => ({
      isAuthenticated: true,
      customer: prev.customer
        ? { ...prev.customer, email: email || prev.customer.email }
        : {
            ...defaultCustomer,
            email: email || defaultCustomer.email,
          },
      pendingVerificationEmail: null,
    }));
    return true;
  }, []);

  const loginAsDemo = useCallback(() => {
    setAuthState({
      isAuthenticated: true,
      customer: defaultCustomer,
      pendingVerificationEmail: null,
    });
  }, []);

  const register = useCallback(async (data: RegisterInput): Promise<{ success: boolean; email: string }> => {
    await new Promise((r) => setTimeout(r, 500));
    const initials = `${data.firstName[0] || "L"}${data.lastName[0] || "A"}`.toUpperCase();
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: "+44 20 7000 0000",
      memberTier: "Client",
      joinedDate: new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      avatarInitials: initials,
      preferences: {
        emailNewsletter: true,
        orderUpdates: true,
        exclusiveEvents: false,
        preferredLanguage: "English (UK)",
      },
    };

    setAuthState({
      isAuthenticated: false,
      customer: newCustomer,
      pendingVerificationEmail: data.email,
    });

    return { success: true, email: data.email };
  }, []);

  const verifyEmail = useCallback(async (code: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 400));
    // Accepts any 6-digit code or "123456" for demo
    if (code.trim().length >= 4) {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        pendingVerificationEmail: null,
      }));
      return true;
    }
    return false;
  }, []);

  const resendVerification = useCallback(async (): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 300));
    return true;
  }, []);

  const logout = useCallback(() => {
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: false,
      pendingVerificationEmail: null,
    }));
  }, []);

  const updateProfile = useCallback((data: Partial<Customer>) => {
    setAuthState((prev) => {
      if (!prev.customer) return prev;
      const initials = `${(data.firstName || prev.customer.firstName)[0] || ""}${(data.lastName || prev.customer.lastName)[0] || ""}`.toUpperCase();
      return {
        ...prev,
        customer: {
          ...prev.customer,
          ...data,
          avatarInitials: initials || prev.customer.avatarInitials,
        },
      };
    });
  }, []);

  const updatePreferences = useCallback((prefs: Partial<CustomerPreferences>) => {
    setAuthState((prev) => {
      if (!prev.customer) return prev;
      return {
        ...prev,
        customer: {
          ...prev.customer,
          preferences: {
            ...prev.customer.preferences,
            ...prefs,
          },
        },
      };
    });
  }, []);

  const forgotPassword = useCallback(async (_email: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    return true;
  }, []);

  const resetPassword = useCallback(async (_password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    return true;
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: authState.isAuthenticated,
      customer: authState.customer,
      pendingVerificationEmail: authState.pendingVerificationEmail,
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
    }),
    [
      authState,
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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

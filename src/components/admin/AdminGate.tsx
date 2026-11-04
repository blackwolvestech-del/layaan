import { useState, type FormEvent, type ReactNode } from "react";
import { Field, fieldAria, Notice } from "@/components/commerce/controls";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { adminAuthService } from "@/services";

/** Keeps back-office pages out of search results. */
export const AdminMeta = () => <meta name="robots" content="noindex, nofollow" />;

function AdminSignIn() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Enter the administrator access code.");
      return;
    }
    setBusy(true);
    const ok = await adminAuthService.signIn(code);
    setBusy(false);
    if (!ok) setError("That access code is not valid.");
  };

  return (
    <form noValidate onSubmit={onSubmit} className="mx-auto max-w-md border border-line bg-surface p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Icon name="lock" className="text-gold-ink" />
        <h2 className="heading-caps !text-base">Administrator sign-in</h2>
      </div>
      <p className="mt-3 text-sm text-ink-2">Order and customer measurement data is restricted to LAYAAN administrators.</p>
      <Field id="admin-code" label="Access code" error={error} className="mt-6">
        <input {...fieldAria("admin-code", error)} type="password" autoComplete="current-password" className="input" value={code} onChange={(e) => (setCode(e.target.value), setError(undefined))} disabled={busy} />
      </Field>
      <Button type="submit" className="mt-6 w-full" disabled={busy} aria-busy={busy}>
        {busy ? "Checking…" : "Sign in"}
      </Button>
    </form>
  );
}

/** Renders back-office content only for a signed-in administrator. */
export function AdminGate({ children }: { children: ReactNode }) {
  const signedIn = adminAuthService.use();
  if (!adminAuthService.isConfigured()) {
    return (
      <Notice tone="error" title="Admin access is not configured" className="mx-auto max-w-xl">
        Set VITE_ADMIN_ACCESS_CODE for this deployment to enable the back office.
      </Notice>
    );
  }
  return signedIn ? children : <AdminSignIn />;
}

export function AdminSignOut() {
  return (
    <Button variant="ghost" size="sm" onClick={() => adminAuthService.signOut()}>
      <Icon name="logout" size={15} /> Sign out
    </Button>
  );
}

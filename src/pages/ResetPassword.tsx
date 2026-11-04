import { useState } from "react";
import { GoldOrbs } from "@/components/layout/PageHeader";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/misc";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const email = params.get("email") || "client@layaan-atelier.com";

  const { resetPassword } = useAuth();
  const { toast } = useUi();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    await resetPassword(newPassword);
    setLoading(false);
    setSuccess(true);
    toast("Password updated successfully.");
  };

  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden className="field-gradient absolute inset-0 -z-20 opacity-60" />
      <GoldOrbs />
    <div className="container-x py-12 sm:py-20">
      <title>Set New Password — LAYAAN Atelier</title>

      <div className="mx-auto max-w-md">
        <Reveal className="border border-line bg-surface p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <p className="eyebrow mb-2">Account Security</p>
            <h1 className="page-title !text-2xl sm:!text-3xl">Set New Password</h1>
            <p className="tagline mt-2 text-xs text-muted">
              Create a new secure password for <strong className="font-mono text-ink">{email}</strong>.
            </p>
          </div>

          {success ? (
            <div className="mt-8 space-y-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
                <Icon name="check" size={26} />
              </div>
              <div className="border border-line bg-surface-2/40 p-4 text-xs text-ink-2">
                <p className="font-semibold text-ink">Password Updated</p>
                <p className="mt-1 text-muted leading-relaxed">
                  Your password has been successfully reset. You may now sign in with your updated credentials.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Sign In With New Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="new-password" className="nav-caps block text-xs text-muted">
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input !pr-10 text-xs"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-ink"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
                  </button>
                </div>
                <p className="mt-1 text-[0.6875rem] text-muted">At least 8 characters recommended</p>
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="nav-caps block text-xs text-muted">
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input mt-1 text-xs"
                  autoComplete="new-password"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
                {loading ? "Updating…" : "Reset Password"}
              </Button>

              <div className="border-t border-line pt-4 text-center">
                <Link to="/login" className="text-xs text-gold-ink hover:underline">
                  ← Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </div>
    </div>
  );
}

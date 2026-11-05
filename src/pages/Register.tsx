import { useState } from "react";
import { GoldOrbs } from "@/components/layout/PageHeader";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/misc";

export default function Register() {
  const { register } = useAuth();
  const { toast } = useUi();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please provide your full legal name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms of Sale and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const res = await register({ firstName, lastName, email, password });
      toast("Account registered. Please verify your email.");
      navigate(`/verify-email?email=${encodeURIComponent(res.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during account creation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden className="field-gradient absolute inset-0 -z-20 opacity-60" />
      <GoldOrbs />
    <div className="container-x py-12 sm:py-20">
      <title>Create an Account — LAYAAN Atelier</title>

      <div className="mx-auto max-w-lg">
        <Reveal className="border border-line bg-surface p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <p className="eyebrow mb-2">Exclusive Membership</p>
            <h1 className="page-title !text-2xl sm:!text-3xl">Register Account</h1>
            <p className="tagline mt-2 text-xs text-muted">
              Join the LAYAAN Atelier clientele for bespoke styling, priority notifications, and luxury services.
            </p>
          </div>

          {error && (
            <div className="mt-6 border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-first-name" className="nav-caps block text-xs text-muted">
                  First Name
                </label>
                <input
                  id="reg-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Sophia"
                  className="input mt-1 text-xs"
                  required
                />
              </div>
              <div>
                <label htmlFor="reg-last-name" className="nav-caps block text-xs text-muted">
                  Last Name
                </label>
                <input
                  id="reg-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Laurent"
                  className="input mt-1 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="nav-caps block text-xs text-muted">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sophia@example.com"
                className="input mt-1 text-xs"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="nav-caps block text-xs text-muted">
                Password (Min 8 Characters)
              </label>
              <div className="relative mt-1">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <div>
              <label htmlFor="reg-confirm-password" className="nav-caps block text-xs text-muted">
                Confirm Password
              </label>
              <input
                id="reg-confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input mt-1 text-xs"
                autoComplete="new-password"
                required
              />
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-ink-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-gold"
                  required
                />
                <span>
                  I agree to the LAYAAN{" "}
                  <Link to="/terms" className="text-gold-ink underline underline-offset-2 hover:text-ink">
                    Terms of Sale
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="text-gold-ink underline underline-offset-2 hover:text-ink">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            <div className="pt-3">
              <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
                {loading ? "Registering…" : "Create Client Account"}
              </Button>
            </div>
          </form>

          <div className="mt-8 border-t border-line pt-6 text-center text-xs text-muted">
            <p>Already have an account?</p>
            <Link
              to="/login"
              className="mt-1.5 inline-block font-semibold tracking-wider text-ink uppercase underline underline-offset-4 hover:text-gold-ink"
            >
              Sign In to Your Account
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
    </div>
  );
}

import { useState } from "react";
import { GoldOrbs } from "@/components/layout/PageHeader";
import { Link, useNavigate } from "react-router";
import { AuthFailure, useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/misc";

export default function Login() {
  const { login } = useAuth();
  const { toast } = useUi();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast("Welcome to your LAYAAN client account.");
      navigate("/account");
    } catch (err) {
      if (err instanceof AuthFailure && err.unconfirmed) {
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      setError(err instanceof Error ? err.message : "Unable to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden className="field-gradient absolute inset-0 -z-20 opacity-60" />
      <GoldOrbs />
    <div className="container-x py-12 sm:py-20">
      <title>Client Sign In — LAYAAN Atelier</title>

      <div className="mx-auto max-w-md">
        <Reveal className="border border-line bg-surface p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <p className="eyebrow mb-2">Private Client Salon</p>
            <h1 className="page-title !text-2xl sm:!text-3xl">Sign In</h1>
            <p className="tagline mt-2 text-xs text-muted">
              Access your personal wardrobe, order histories, and tailored client services.
            </p>
          </div>

          {error && (
            <div className="mt-6 border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className="nav-caps block text-xs text-muted">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input mt-1 text-xs"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="nav-caps block text-xs text-muted">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-gold-ink hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input !pr-10 text-xs"
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-ink-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-gold"
                />
                Remember me on this device
              </label>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
              {loading ? "Authenticating…" : "Sign In"}
            </Button>

          </form>

          <div className="mt-8 border-t border-line pt-6 text-center text-xs text-muted">
            <p>New to LAYAAN Atelier?</p>
            <Link
              to="/register"
              className="mt-1.5 inline-block font-semibold tracking-wider text-ink uppercase underline underline-offset-4 hover:text-gold-ink"
            >
              Create a Client Account
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
    </div>
  );
}

import { useState } from "react";
import { GoldOrbs } from "@/components/layout/PageHeader";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/misc";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid registered email address.");
      return;
    }

    setLoading(true);
    await forgotPassword(email);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden className="field-gradient absolute inset-0 -z-20 opacity-60" />
      <GoldOrbs />
    <div className="container-x py-12 sm:py-20">
      <title>Forgot Password — LAYAAN Atelier</title>

      <div className="mx-auto max-w-md">
        <Reveal className="border border-line bg-surface p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <p className="eyebrow mb-2">Account Recovery</p>
            <h1 className="page-title !text-2xl sm:!text-3xl">Reset Password</h1>
            <p className="tagline mt-2 text-xs text-muted">
              Enter the email associated with your client account to receive password reset instructions.
            </p>
          </div>

          {submitted ? (
            <div className="mt-8 space-y-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream text-gold-ink">
                <Icon name="mail" size={24} />
              </div>
              <div className="border border-line bg-surface-2/40 p-4 text-xs text-ink-2">
                <p className="font-semibold text-ink">Reset Instructions Dispatched (Simulated)</p>
                <p className="mt-1 leading-relaxed text-muted">
                  We have prepared password reset instructions for <strong className="font-mono text-ink">{email}</strong>.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to={`/reset-password?email=${encodeURIComponent(email)}`}
                  className="block w-full border border-gold bg-gold py-3 text-xs font-semibold tracking-wider text-accent-contrast uppercase hover:brightness-105"
                >
                  Simulate Password Reset Now
                </Link>

                <Link
                  to="/login"
                  className="inline-block text-xs font-semibold tracking-wider text-muted uppercase hover:text-ink"
                >
                  ← Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="recovery-email" className="nav-caps block text-xs text-muted">
                  Registered Email Address
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input mt-1 text-xs"
                  autoComplete="email"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
                {loading ? "Processing…" : "Send Reset Link"}
              </Button>

              <div className="border-t border-line pt-4 text-center">
                <Link to="/login" className="text-xs text-gold-ink hover:underline">
                  Remember your password? Sign in
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

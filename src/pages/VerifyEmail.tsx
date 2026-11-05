import { useEffect, useRef, useState } from "react";
import { GoldOrbs } from "@/components/layout/PageHeader";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/misc";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const emailParam = params.get("email");
  const { pendingVerificationEmail, customer, verifyEmail, resendVerification } = useAuth();
  const { toast } = useUi();
  const navigate = useNavigate();

  const targetEmail = emailParam || pendingVerificationEmail || customer?.email || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(45);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleChange = (index: number, val: string) => {
    setError("");
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const next = [...digits];
      for (let i = 0; i < 6; i++) {
        next[i] = pasted[i] || "";
      }
      setDigits(next);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 4) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    const success = await verifyEmail(code, targetEmail);
    setLoading(false);

    if (success) {
      setVerifiedSuccess(true);
      toast("Email verified successfully. Welcome to LAYAAN.");
      setTimeout(() => {
        navigate("/account");
      }, 1400);
    } else {
      setError("That code is invalid or has expired. Check the latest email from us, or request a new code.");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const sent = await resendVerification(targetEmail);
    setResendCooldown(60);
    toast(sent ? `A new code has been sent to ${targetEmail}` : "We couldn't send a new code right now. Please try again shortly.");
  };

  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden className="field-gradient absolute inset-0 -z-20 opacity-60" />
      <GoldOrbs />
    <div className="container-x py-12 sm:py-20">
      <title>Verify Email — LAYAAN Atelier</title>

      <div className="mx-auto max-w-md">
        <Reveal className="border border-line bg-surface p-8 shadow-sm sm:p-10 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-cream text-gold-ink">
            <Icon name="mail" size={26} />
          </div>

          <p className="eyebrow mb-2">Security Verification</p>
          <h1 className="page-title !text-2xl sm:!text-3xl">Verify Your Email</h1>
          <p className="tagline mt-2 text-xs text-muted">
            We have sent a 6-digit confirmation code to:
          </p>
          <p className="mt-1 font-mono text-xs font-semibold text-ink break-all">
            {targetEmail}
          </p>

          {verifiedSuccess ? (
            <div className="mt-8 border border-success/30 bg-success/10 p-6 text-center">
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-success text-white">
                <Icon name="check" size={20} />
              </div>
              <h4 className="font-display text-lg text-ink">Verification Complete</h4>
              <p className="mt-1 text-xs text-muted">Redirecting you to your client account…</p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="mt-8 space-y-6">
              {error && (
                <div className="border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
                  {error}
                </div>
              )}

              {/* 6 Digit Input Blocks */}
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="h-12 w-11 rounded border border-line-strong bg-surface text-center font-mono text-lg font-bold text-ink focus:border-gold focus:outline-none sm:h-14 sm:w-12 sm:text-xl"
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
                  {loading ? "Verifying…" : "Confirm Verification"}
                </Button>

              </div>

              <div className="flex items-center justify-between border-t border-line/70 pt-4 text-xs">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-muted hover:text-ink disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
                </button>

                <Link to="/login" className="text-gold-ink hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          <div className="mt-8 border-t border-line pt-4 text-[0.6875rem] text-muted">
            <p>Can't find it? Check your spam folder. You can also confirm using the link in the same email.</p>
          </div>
        </Reveal>
      </div>
    </div>
    </div>
  );
}

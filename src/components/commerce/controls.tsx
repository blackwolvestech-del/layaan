import clsx from "clsx";
import { motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { formatMoney, MAX_QUANTITY } from "@/data/commerce";
import type { Money, SizeId } from "@/types/commerce";
import { Icon } from "../ui/Icon";

export function Price({ amount, className }: { amount: Money; className?: string }) {
  return <span className={clsx("tabular-nums", className)}>{formatMoney(amount)}</span>;
}

/** Size choice as a native radio group, styled as chips (arrow keys work out of the box). */
export function SizeSelector({ sizes, value, onChange, error, name, compact, legendAction, isAvailable }: { sizes: SizeId[]; value: SizeId | null; onChange: (s: SizeId) => void; error?: string | undefined; name?: string; compact?: boolean; legendAction?: ReactNode; /** Sold-out sizes are shown but can't be chosen. */ isAvailable?: (s: SizeId) => boolean }) {
  const auto = useId();
  const errorId = `${auto}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      {/* A floated legend sits on the fieldset's first line beside the optional action. */}
      <legend className="nav-caps float-left mb-3 flex min-h-8 items-center">
        Size{value && <span className="ml-2 tracking-normal text-muted normal-case">— {value}</span>}
      </legend>
      {legendAction && <div className="float-right mb-3 flex min-h-8 items-center">{legendAction}</div>}
      <div className="clear-both flex flex-wrap gap-2">
        {sizes.map((s) => {
          const soldOut = isAvailable ? !isAvailable(s) : false;
          return (
            <label key={s} className="relative" title={soldOut ? `${s} — sold out` : undefined}>
              <input type="radio" name={name ?? auto} value={s} checked={value === s} onChange={() => onChange(s)} disabled={soldOut} className="peer sr-only" aria-invalid={error ? true : undefined} aria-label={soldOut ? `${s}, sold out` : undefined} />
              <span
                className={clsx(
                  "grid place-items-center rounded-[2px] border text-xs font-semibold tracking-[0.1em] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]",
                  compact ? "h-10 min-w-10 px-2" : "h-12 min-w-14 px-3",
                  soldOut
                    ? "cursor-not-allowed border-line text-muted line-through opacity-50"
                    : clsx("cursor-pointer", value === s ? "border-ink bg-ink text-bg" : error ? "border-danger text-ink hover:border-ink" : "border-line-strong text-ink hover:border-ink"),
                )}
              >
                {s}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function QuantityStepper({ value, onChange, label = "Quantity", size = "md", max = MAX_QUANTITY }: { value: number; onChange: (n: number) => void; label?: string; size?: "sm" | "md"; max?: number }) {
  const btn = clsx("grid place-items-center transition-colors hover:bg-surface-2 disabled:opacity-35", size === "sm" ? "h-9 w-9" : "h-12 w-11");
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-[2px] border border-line-strong">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Icon name="minus" size={14} />
      </button>
      <motion.output key={value} initial={{ opacity: 0.4, y: -3 }} animate={{ opacity: 1, y: 0 }} aria-live="polite" aria-label={`${label}: ${value}`} className={clsx("text-center text-sm font-semibold tabular-nums", size === "sm" ? "w-7" : "w-9")}>
        {value}
      </motion.output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}

/** Label + control + error text, wired for screen readers. */
export function Field({ id, label, error, hint, optional, children, className }: { id: string; label: string; error?: string | undefined; hint?: string; optional?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">
        {label}
        {optional && <span className="font-normal tracking-normal text-muted normal-case">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-danger">
          <Icon name="info" size={13} /> {error}
        </p>
      )}
    </div>
  );
}

/** aria props for an input rendered inside <Field>. */
export const fieldAria = (id: string, error?: string, hint?: boolean) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
});

export function Notice({ tone = "info", title, children, className }: { tone?: "info" | "error" | "success"; title?: string; children?: ReactNode; className?: string }) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={clsx(
        "flex gap-3 rounded-[2px] border px-4 py-3 text-sm",
        tone === "info" && "border-line bg-surface-2 text-ink-2",
        tone === "error" && "border-danger/40 bg-danger/5 text-ink",
        tone === "success" && "border-success/40 bg-success/5 text-ink",
        className,
      )}
    >
      <Icon name={tone === "success" ? "check" : "info"} size={18} className={clsx("mt-0.5 shrink-0", tone === "error" ? "text-danger" : tone === "success" ? "text-success" : "text-gold-ink")} />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={clsx(title && "mt-0.5", "text-ink-2")}>{children}</div>}
      </div>
    </div>
  );
}

/** Loading placeholder rows for async pages. */
export function LoadingBlock({ label = "Loading", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-label={label} className="space-y-3 py-6">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-[2px] bg-surface-2" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

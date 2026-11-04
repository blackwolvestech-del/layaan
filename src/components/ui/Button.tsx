import clsx from "clsx";
import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router";

type Variant = "primary" | "gold" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-[2px] font-sans font-semibold uppercase tracking-[0.16em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "btn-shine bg-ink text-bg hover:bg-ink-2",
  gold: "btn-shine bg-gold text-accent-contrast hover:brightness-105",
  outline: "btn-fill border border-ink/80 text-ink [--fill:var(--ink)] hover:text-bg",
  ghost: "text-ink hover:bg-surface-2",
  light: "btn-fill border border-white/60 text-white [--fill:#fff] hover:text-black",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-[0.625rem]",
  md: "min-h-12 px-6 text-[0.6875rem]",
  lg: "min-h-14 px-8 text-xs",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "primary", size = "md", className, children, type = "button", ...rest }, ref) {
  return (
    <motion.button ref={ref} type={type} whileTap={{ scale: 0.98 }} transition={{ duration: 0.12 }} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </motion.button>
  );
});

/** Router link styled as a button. */
export function ButtonLink({ variant = "primary", size = "md", className, children, ...rest }: LinkProps & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

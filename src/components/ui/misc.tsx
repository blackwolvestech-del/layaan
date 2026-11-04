import clsx from "clsx";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { blurReveal, fadeUp, revealViewport } from "@/utils/motion";
import { Icon, type IconName } from "./Icon";

/** Scroll reveal for editorial content. Reduced motion renders immediately without movement. */
export function Reveal({
  children,
  as = "div",
  className,
  variant = "fadeUp",
  delay = 0,
}: {
  children: ReactNode;
  as?: "div" | "section" | "li" | "article" | "header";
  className?: string;
  variant?: "fadeUp" | "blur";
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as as ElementType;
    return <Plain className={className}>{children}</Plain>;
  }
  const Comp = motion[as] as ElementType;
  const v: Variants = variant === "blur" ? blurReveal : fadeUp;
  return (
    <Comp className={className} initial="hidden" whileInView="show" viewport={revealViewport} variants={v} transition={{ delay }}>
      {children}
    </Comp>
  );
}

export function Tag({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "gold" | "code"; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-[2px] px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.14em] uppercase",
        tone === "neutral" && "bg-surface-2 text-ink-2",
        tone === "gold" && "bg-gold-soft text-gold-ink",
        tone === "code" && "code-accent border border-line normal-case !text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Marks information still awaiting confirmation from the brand. */
export function PendingNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={clsx("code-accent inline-flex items-center gap-1.5", className)}>
      <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-warning" />
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, action, className, id }: { eyebrow?: string; title: ReactNode; action?: ReactNode; className?: string; id?: string }) {
  return (
    <div className={clsx("mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h2 id={id} className="heading-caps text-balance">
          {title}
        </h2>
        {eyebrow && <p className="tagline mt-2">{eyebrow}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action, icon = "search" }: { title: string; body?: ReactNode; action?: ReactNode; icon?: IconName }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      <span className="relative grid h-20 w-20 place-items-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-dashed border-gold/60"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="grid h-14 w-14 place-items-center rounded-full border border-line bg-surface text-gold-ink"
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon name={icon} size={22} />
        </motion.span>
      </span>
      <h3 className="heading-caps !text-base">{title}</h3>
      {body && <div className="max-w-md text-sm text-muted">{body}</div>}
      {action}
    </div>
  );
}

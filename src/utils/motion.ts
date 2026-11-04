// Shared motion language. Motion (motion.dev) is the primary animation system; these tokens
// keep durations and easings consistent across pages, drawers, cards and feedback.
import type { Transition, Variants } from "motion/react";

export const ease = {
  editorial: [0.22, 1, 0.36, 1] as const,
  swift: [0.32, 0.72, 0, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
};

export const duration = {
  instant: 0.12,
  quick: 0.22,
  base: 0.42,
  slow: 0.7,
  cinematic: 1.1,
};

export const spring = {
  soft: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } satisfies Transition,
  snappy: { type: "spring", stiffness: 520, damping: 34 } satisfies Transition,
  drawer: { type: "spring", stiffness: 380, damping: 40, mass: 0.9 } satisfies Transition,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.editorial } },
};

export const blurReveal: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
  show: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: duration.cinematic, ease: ease.editorial } },
};

export const staggerParent = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.editorial } },
  exit: { opacity: 0, y: -6, transition: { duration: duration.quick, ease: ease.exit } },
};

/** Viewport settings for reveals: content is visible by default if JS/IO is unavailable. */
export const revealViewport = { once: true, amount: 0.2, margin: "0px 0px -8% 0px" } as const;

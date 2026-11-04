import { useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";

/** Skew (degrees) that follows page scroll speed and settles back to 0 — a soft "fabric" lag. */
export function useScrollSkew(max = 3) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 300, damping: 50 });
  return useTransform(velocity, [-2500, 0, 2500], reduce ? [0, 0, 0] : [max, 0, -max], { clamp: true });
}

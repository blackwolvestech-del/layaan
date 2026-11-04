import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";

const spring = { stiffness: 220, damping: 15, mass: 0.4 };

/** Pulls its child gently toward the mouse while hovered, then springs back. Mouse only. */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);
  if (reduce) return <span className={className}>{children}</span>;
  return (
    <motion.span
      ref={ref}
      className={className ?? "inline-block"}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

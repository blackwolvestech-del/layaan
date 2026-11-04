import clsx from "clsx";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { ReactNode } from "react";

const spring = { stiffness: 180, damping: 18, mass: 0.5 };

/**
 * 3D tilt toward the mouse with a soft light that follows the cursor. Children render inside the
 * tilted plane; `glare` sits above them. Mouse only; flat for touch and reduced motion.
 */
export function TiltCard({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const gx = useTransform(px, (v) => v * 100);
  const gy = useTransform(py, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.3), transparent 50%)`;
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 25 });

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div className={clsx("[perspective:1000px]", className)}>
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
          glareOpacity.set(1);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
          glareOpacity.set(0);
        }}
      >
        {children}
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 z-10 mix-blend-soft-light" style={{ backgroundImage: glare, opacity: glareOpacity }} />
      </motion.div>
    </div>
  );
}

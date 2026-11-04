import { motion, useReducedMotion } from "motion/react";

/**
 * Celebratory burst of gold sparks from the centre of its (relative) parent. Remount it (change its
 * `key`) to replay. Decorative; nothing renders for reduced motion.
 */
export function GoldBurst({ count = 14, radius = 60, spreadY = 0.6, delay = 0 }: { count?: number; radius?: number; spreadY?: number; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 z-10">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const dist = radius + (i % 3) * radius * 0.37;
        const size = i % 2 ? 5 : 7;
        return (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 block rounded-full bg-gold"
            style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * spreadY, opacity: 0, scale: 0.2 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
          />
        );
      })}
    </span>
  );
}

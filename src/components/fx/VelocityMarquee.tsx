import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useRef } from "react";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * Endless line of oversized type that drifts on its own and speeds up (and flips direction)
 * with the page's scroll velocity. Static for reduced motion.
 */
export function VelocityMarquee({ items, baseVelocity = -2.2, className }: { items: string[]; baseVelocity?: number; className?: string }) {
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 5], { clamp: false });
  const direction = useRef(1);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = direction.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += direction.current * move * Math.abs(f);
    base.set(base.get() + move);
  });

  const line = (
    <span className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className={i % 2 ? "text-stroke-gold" : ""}>{t}</span>
          <span aria-hidden className="mx-[0.4em] inline-block h-[0.14em] w-[0.14em] rotate-45 bg-gold" />
        </span>
      ))}
    </span>
  );

  return (
    <div className={className} aria-label={items.join(", ")} role="img">
      <motion.div aria-hidden className="flex w-max whitespace-nowrap" style={reduce ? undefined : { x }}>
        {line}
        {line}
      </motion.div>
    </div>
  );
}

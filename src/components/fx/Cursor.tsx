import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Gold follower ring for fine pointers (the native cursor stays visible). Over links and buttons
 * it tightens; over elements with `data-cursor="Label"` it opens into a disc with that label.
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [interactive, setInteractive] = useState(false);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 450, damping: 38, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 450, damping: 38, mass: 0.5 });

  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches && !reduce);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = e.target as Element | null;
      const labelled = t?.closest?.("[data-cursor]");
      setLabel(labelled?.getAttribute("data-cursor") ?? null);
      setInteractive(!labelled && !!t?.closest?.("a, button, [role='button'], input, select, textarea, label"));
    };
    const leave = () => setVisible(false);
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const size = label ? 84 : interactive ? 46 : 30;
  return (
    <motion.div aria-hidden className="pointer-events-none fixed top-0 left-0 z-[95]" style={{ x: sx, y: sy }}>
      <motion.div
        className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-gold"
        animate={{
          width: size,
          height: size,
          opacity: visible ? 1 : 0,
          scale: down ? 0.85 : 1,
          backgroundColor: label ? "rgb(176 138 62 / 0.92)" : interactive ? "rgb(176 138 62 / 0.12)" : "rgb(176 138 62 / 0)",
        }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              key={label}
              className="absolute inset-0 grid place-items-center text-[0.625rem] font-semibold tracking-[0.18em] text-[#fffdf8] uppercase"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

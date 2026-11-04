import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ease } from "@/utils/motion";

/** Number that rolls smoothly to each new value (prices, totals, counts). */
export function AnimatedNumber({ value, format = (n) => String(Math.round(n)), className }: { value: number; format?: (n: number) => string; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const fmt = useRef(format);
  fmt.current = format;

  useEffect(() => {
    if (reduce) {
      from.current = value;
      setShown(value);
      return;
    }
    const controls = animate(from.current, value, { duration: 0.7, ease: ease.editorial, onUpdate: (v) => setShown(v) });
    from.current = value;
    return () => controls.stop();
  }, [value, reduce]);

  return <span className={className ?? "tabular-nums"}>{fmt.current(shown)}</span>;
}

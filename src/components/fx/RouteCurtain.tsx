import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { brandAssets } from "@/data/assets";

/**
 * Page-change curtain: on every navigation (not the first load) a dark panel with a gold edge and
 * the logo lifts away to reveal the new page. Pointer-transparent; skipped for reduced motion.
 */
export function RouteCurtain({ pathname }: { pathname: string }) {
  const reduce = useReducedMotion();
  const first = useRef(true);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setRun((n) => n + 1);
  }, [pathname]);

  if (reduce) return null;
  return (
    <AnimatePresence>
      {run > 0 && (
        <motion.div
          key={run}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[88] flex items-center justify-center border-b-2 border-gold bg-[#15120e]"
          initial={{ y: "0%" }}
          animate={{ y: "-101%" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
          onAnimationComplete={() => setRun(0)}
        >
          <motion.img src={brandAssets.logoPng} alt="" className="h-10 w-auto sm:h-12" initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -24 }} transition={{ duration: 0.45, ease: "easeIn" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

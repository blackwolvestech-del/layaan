import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { brandAssets } from "@/data/assets";
import { ease } from "@/utils/motion";
import { lockScroll } from "@/utils/scroll";

const KEY = "layaan-intro-seen";

function seen() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

/**
 * Opening curtain, once per browser session: the gold logo is unveiled while a counter runs to
 * 100, then the two halves of the curtain part to reveal the page. Skipped for reduced motion.
 */
export function Preloader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => !reduce && !seen());
  const progress = useMotionValue(0);
  const count = useTransform(progress, (v) => String(Math.round(v)).padStart(3, "0"));
  const reveal = useTransform(progress, (v) => `inset(${100 - v}% 0 0 0)`);
  const bar = useTransform(progress, (v) => v / 100);

  useEffect(() => {
    if (!show) return;
    const unlock = lockScroll();
    const controls = animate(progress, 100, { duration: 1.6, ease: [0.65, 0, 0.35, 1] });
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      setShow(false);
    }, 1900);
    return () => {
      controls.stop();
      window.clearTimeout(t);
      unlock();
    };
  }, [show, progress]);

  const half = "absolute inset-x-0 h-1/2 bg-[#15120e]";
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="preloader" aria-hidden className="fixed inset-0 z-[100]" exit={{ transition: { duration: 1 } }}>
          <motion.div className={`${half} top-0`} exit={{ y: "-100%", transition: { duration: 0.95, ease: [0.76, 0, 0.24, 1] } }} />
          <motion.div className={`${half} bottom-0`} exit={{ y: "100%", transition: { duration: 0.95, ease: [0.76, 0, 0.24, 1] } }} />
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center gap-8" exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.35 } }}>
            <div className="relative">
              {/* Dim outline of the logo, then the full-gold logo rising through it. */}
              <img src={brandAssets.logoPng} alt="" className="h-14 w-auto opacity-15 sm:h-20" />
              <motion.img src={brandAssets.logoPng} alt="" className="absolute inset-0 h-14 w-auto sm:h-20" style={{ clipPath: reveal }} />
            </div>
            <div className="flex w-56 items-center gap-4">
              <div className="relative h-px flex-1 overflow-hidden bg-white/15">
                <motion.span className="absolute inset-0 origin-left bg-[#c9a45c]" style={{ scaleX: bar }} />
              </div>
              <motion.span className="font-mono text-xs tracking-[0.2em] text-[#d8b772] tabular-nums">{count}</motion.span>
            </div>
            <motion.p className="nav-caps !text-[0.625rem] text-white/50" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6, ease: ease.editorial } }}>
              Contemporary Western womenswear
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** True while the intro curtain is still to play this session (used to delay page entrances). */
export function introPending() {
  return !seen() && !matchMedia("(prefers-reduced-motion: reduce)").matches;
}

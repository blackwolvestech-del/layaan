import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLenis } from "@/utils/scroll";

/** Floating "back to top" button whose gold ring fills with page progress. Appears after the first screen. */
export function BackToTop() {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const { scrollY, scrollYProgress } = useScroll();
  const ring = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setShow(v > window.innerHeight * 0.9));

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={toTop}
          aria-label="Back to top"
          className="glass group fixed bottom-4 left-4 z-[80] grid h-12 w-12 place-items-center rounded-full text-ink sm:bottom-6 sm:left-6"
          initial={{ opacity: 0, scale: 0.4, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.4, y: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
        >
          <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5" />
            <motion.circle cx="24" cy="24" r="22" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" style={{ pathLength: ring }} />
          </svg>
          <Icon name="arrowRight" size={15} className="-rotate-90 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

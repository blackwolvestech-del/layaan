import clsx from "clsx";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ElementType } from "react";
import { ease } from "@/utils/motion";

const parent = (stagger: number, delay: number): Variants => ({ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } });
const char: Variants = {
  hidden: { y: "115%", rotate: 8, opacity: 0 },
  show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 0.9, ease: ease.editorial } },
};

/**
 * Letter-by-letter reveal: each character rises out of a mask with a slight rotation.
 * Screen readers get the plain text once (a visually hidden copy; the animated letters are aria-hidden).
 * @param trigger "view" animates when scrolled into view; "mount" animates immediately.
 */
export function SplitText({ id, text, as = "span", className, stagger = 0.028, delay = 0, trigger = "view" }: { id?: string; text: string; as?: "span" | "h1" | "h2" | "p"; className?: string; stagger?: number; delay?: number; trigger?: "view" | "mount" }) {
  const reduce = useReducedMotion();
  const Tag = as as ElementType;
  if (reduce)
    return (
      <Tag id={id} className={className}>
        {text}
      </Tag>
    );
  const words = text.split(" ");
  const MotionTag = motion[as] as ElementType;
  const play = trigger === "mount" ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.5 } };
  return (
    <MotionTag id={id} className={className} initial="hidden" {...play} variants={parent(stagger, delay)}>
      <span className="sr-only">{text}</span>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
          {Array.from(w).map((c, ci) => (
            <span key={ci} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span className={clsx("inline-block origin-bottom-left will-change-transform")} variants={char}>
                {c}
              </motion.span>
            </span>
          ))}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </MotionTag>
  );
}

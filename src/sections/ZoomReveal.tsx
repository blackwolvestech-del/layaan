import clsx from "clsx";
import { motion, useInView, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AnimatedNumber } from "@/components/fx/AnimatedNumber";
import { Magnetic } from "@/components/fx/Magnetic";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { categories, collections, imageByFile, products } from "@/data/products";

// Triptych of one look: the middle frame is the "window", the sides appear as it opens.
const FILES = ["DSC00519.jpg", "DSC00707.jpg", "DSC00672.jpg"] as const;

function useWide() {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(min-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia?.("(min-width: 768px)");
    if (!mq) return;
    const update = () => setWide(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}

function Stats({ className }: { className?: string }) {
  const ref = useRef<HTMLDListElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const stats = [
    { n: products.length, label: "Looks" },
    { n: collections.length, label: "Collections" },
    { n: categories.length, label: "Categories" },
  ];
  return (
    <dl ref={ref} className={clsx("flex gap-8 sm:gap-12", className)}>
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col-reverse gap-1">
          <dt className="nav-caps !text-[0.625rem] !text-white/65">{s.label}</dt>
          <dd className="font-display text-[clamp(2.25rem,1.6rem+2.4vw,3.75rem)] leading-none">
            <AnimatedNumber value={seen ? s.n : 0} format={(v) => String(Math.round(v)).padStart(2, "0")} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Caption() {
  return (
    <div className="container-x flex h-full flex-col justify-end pb-10 text-white sm:pb-14">
      <p className="nav-caps flex items-center gap-3 !text-[#e0c07c]">
        <span aria-hidden className="h-px w-8 bg-[#e0c07c]" /> The full wardrobe
      </p>
      <h2 id="zoom-title" className="mt-4 max-w-3xl font-display text-[clamp(2.25rem,1.5rem+3.4vw,4.75rem)] leading-[1.02] text-balance">
        From everyday to occasion
      </h2>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
        <Stats />
        <Magnetic>
          <ButtonLink to="/shop" size="lg" className="!bg-white !text-black hover:!bg-white/90">
            Explore every look <Icon name="arrowRight" size={16} />
          </ButtonLink>
        </Magnetic>
      </div>
    </div>
  );
}

/**
 * Scroll-scrubbed "window" reveal: an arched frame in the middle of the screen widens until the
 * campaign triptych fills the viewport, while the words either side part and the caption rises.
 * Reduced motion gets the finished, static frame.
 */
export function ZoomReveal() {
  const reduce = useReducedMotion();
  const wide = useWide();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const sideStart = wide ? 36 : 16;
  const top = useTransform(p, [0, 0.6], [16, 0]);
  const side = useTransform(p, [0, 0.6], [sideStart, 0]);
  const radius = useTransform(p, [0, 0.5], [600, 0]);
  const clipPath = useMotionTemplate`inset(${top}% ${side}% ${top}% ${side}% round ${radius}px ${radius}px 0px 0px)`;
  const imgScale = useTransform(p, [0, 0.7], [1.25, 1]);
  const leftX = useTransform(p, [0, 0.5], ["0vw", "-45vw"]);
  const rightX = useTransform(p, [0, 0.5], ["0vw", "45vw"]);
  const wordsOpacity = useTransform(p, [0.2, 0.45], [1, 0]);
  const veil = useTransform(p, [0.5, 0.8], [0, 1]);
  const captionY = useTransform(p, [0.6, 0.85], [60, 0]);
  const captionOpacity = useTransform(p, [0.6, 0.82], [0, 1]);
  const hintOpacity = useTransform(p, [0, 0.08], [1, 0]);
  const captionEvents = useTransform(captionOpacity, (o) => (o > 0.5 ? "auto" : "none"));

  const frames = (
    <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3">
      {FILES.map((f, i) => (
        <div key={f} className={clsx("relative overflow-hidden", i !== 1 && "hidden md:block")}>
          <Img image={imageByFile(f)} sizes="(min-width: 768px) 34vw, 100vw" className="absolute inset-0" decorative />
        </div>
      ))}
    </div>
  );

  if (reduce) {
    return (
      <section ref={ref} aria-labelledby="zoom-title" className="relative h-[100svh] min-h-[36rem] overflow-hidden bg-ink">
        {frames}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="relative h-full">
          <Caption />
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} aria-labelledby="zoom-title" className="relative h-[320vh] bg-bg">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* The words either side of the window. */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-between py-[5svh] font-display text-[clamp(2.5rem,1rem+5vw,7rem)] leading-none text-ink md:flex-row md:px-[4vw] md:py-0" style={{ opacity: wordsOpacity }}>
          <motion.span className="italic" style={{ x: leftX }}>
            Dressed
          </motion.span>
          <motion.span className="text-stroke-gold" style={{ x: rightX }}>
            to arrive
          </motion.span>
        </motion.div>

        <motion.div className="absolute inset-0 bg-ink will-change-[clip-path]" style={{ clipPath }}>
          <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
            {frames}
          </motion.div>
          <motion.div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" style={{ opacity: veil }} />
          <motion.div className="relative h-full" style={{ y: captionY, opacity: captionOpacity, pointerEvents: captionEvents }}>
            <Caption />
          </motion.div>
        </motion.div>

        <motion.p aria-hidden className="nav-caps absolute inset-x-0 bottom-8 z-10 hidden flex-col md:flex items-center gap-3 !text-[0.625rem] text-muted" style={{ opacity: hintOpacity }}>
          Keep scrolling
          <span className="relative h-10 w-px overflow-hidden bg-line-strong">
            <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-gold" animate={{ y: ["-100%", "200%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
          </span>
        </motion.p>
      </div>
    </section>
  );
}

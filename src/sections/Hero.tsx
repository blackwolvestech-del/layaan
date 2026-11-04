import clsx from "clsx";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { introPending } from "@/components/fx/Preloader";
import { Magnetic } from "@/components/fx/Magnetic";
import { SplitText } from "@/components/fx/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { reel } from "@/data/assets";
import { heroSlides } from "@/data/copy";
import { imageByFile } from "@/data/products";
import { ease } from "@/utils/motion";

const INTERVAL = 7000;

/**
 * Full-width campaign slider. On desktop the looping campaign reel sits between two stills of
 * the current look; on mobile the reel fills the frame. The reel is muted and inline, and
 * reduced-motion users get its poster. The first slide renders immediately.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const first = useRef(true);
  // On the first visit the intro curtain covers the hero; start its entrance as the curtain opens.
  const [introDelay] = useState(() => (introPending() ? 1.75 : 0));
  const sectionRef = useRef<HTMLElement>(null);

  // Mouse parallax: side panels drift against the cursor, the reel and copy with it.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 90, damping: 20 });
  const smy = useSpring(my, { stiffness: 90, damping: 20 });
  const sideX = useTransform(smx, [-0.5, 0.5], [22, -22]);
  const sideY = useTransform(smy, [-0.5, 0.5], [14, -14]);
  const midX = useTransform(smx, [-0.5, 0.5], [-10, 10]);
  const copyX = useTransform(smx, [-0.5, 0.5], [-8, 8]);
  // Warm light that follows the cursor across the campaign frames.
  const glowX = useTransform(smx, (v) => (v + 0.5) * 100);
  const glowY = useTransform(smy, (v) => (v + 0.5) * 100);
  const glow = useMotionTemplate`radial-gradient(38rem circle at ${glowX}% ${glowY}%, rgb(224 192 124 / 0.22), transparent 60%)`;

  // Scroll: panels ease in closer while the copy lifts and fades as the hero leaves.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const panelScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.14]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  const count = heroSlides.length;
  const slide = heroSlides[index]!;

  const go = useCallback(
    (n: number) => {
      first.current = false;
      setIndex((n + count) % count);
      setProgressKey((k) => k + 1);
    },
    [count],
  );

  // Restart the timer and progress bar whenever auto-advance resumes.
  useEffect(() => {
    if (!paused) setProgressKey((k) => k + 1);
  }, [paused]);

  // Auto-advance, paused on hover/focus, in background tabs and for reduced motion.
  useEffect(() => {
    if (reduce || paused) return;
    const t = window.setTimeout(() => go(index + 1), INTERVAL);
    const onVis = () => document.hidden && setPaused(true);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [index, paused, reduce, go, progressKey]);

  const animateIn = (!first.current || introDelay > 0) && !reduce;
  const entranceDelay = first.current ? introDelay : 0.25;

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Featured looks"
      className="relative isolate h-[calc(100svh-7.5rem)] min-h-[34rem] max-h-[56rem] overflow-hidden bg-ink"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => {
        setPaused(false);
        mx.set(0);
        my.set(0);
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <motion.div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3" style={{ scale: panelScale }}>
        {(["left", "right"] as const).map((side) => {
          const img = imageByFile(slide.files[side === "left" ? 0 : 2]);
          return (
            <div key={side} className={clsx("relative hidden overflow-hidden md:block", side === "left" ? "md:col-start-1" : "md:col-start-3")}>
              <motion.div className="absolute -inset-8" style={{ x: sideX, y: sideY }}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={slide.id}
                  className="absolute inset-0"
                  initial={animateIn ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: ease.editorial }}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={reduce ? false : { scale: 1.12 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: reduce ? 0 : 7.5, ease: "linear", delay: side === "right" ? 0.15 : 0 }}
                  >
                    <Img image={img} priority={index === 0} sizes="34vw" className="h-full w-full" decorative />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
        <div className="relative overflow-hidden md:col-start-2 md:row-start-1">
          {reel && (
            <motion.video style={{ x: midX }} className="absolute -inset-x-4 inset-y-0 h-full w-[calc(100%+2rem)] max-w-none object-cover" poster={reel.poster} autoPlay={!reduce} muted loop playsInline preload="auto" aria-hidden>
              <source src="/videos/hero.mp4" type="video/mp4" />
            </motion.video>
          )}
        </div>
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      {!reduce && <motion.div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ backgroundImage: glow }} />}

      {/* Scroll cue. */}
      {!reduce && (
        <motion.div aria-hidden className="pointer-events-none absolute top-6 right-6 hidden flex-col items-center gap-3 text-white/70 lg:flex" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: introDelay + 1.2 } }}>
          <span className="nav-caps !text-[0.625rem] [writing-mode:vertical-rl]">Scroll</span>
          <span className="relative h-16 w-px overflow-hidden bg-white/25">
            <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-gold" animate={{ y: ["-100%", "200%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
          </span>
        </motion.div>
      )}

      <motion.div className="container-x relative flex h-full flex-col justify-end pb-6 text-white sm:pb-8" style={{ y: copyY, opacity: copyOpacity, x: copyX }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={slide.id} className="max-w-xl" initial="hidden" animate="show" exit="exit" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: animateIn ? entranceDelay : 0 } }, exit: {} }}>
            {[
              <p key="e" className="nav-caps mb-4 flex items-center gap-3 !text-white/85">
                <span className="h-px w-8 bg-gold" aria-hidden /> {slide.eyebrow}
              </p>,
              // Letter-by-letter headline (SplitText keeps the plain text for screen readers).
              animateIn ? (
                <SplitText key="t" as="h1" trigger="mount" text={slide.title} delay={entranceDelay + 0.1} stagger={0.024} className="font-display text-[clamp(2rem,1.35rem+2.6vw,3.75rem)] leading-[1.05] text-balance" />
              ) : (
                <h1 key="t" className="font-display text-[clamp(2rem,1.35rem+2.6vw,3.75rem)] leading-[1.05] text-balance">
                  {slide.title}
                </h1>
              ),
              <p key="b" className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-white/85 sm:text-base">
                {slide.body}
              </p>,
              <div key="c" className="mt-7 flex flex-wrap gap-3">
                <Magnetic>
                  <ButtonLink to={slide.cta.to} size="lg" className="!bg-white !text-black hover:!bg-white/90">
                    {slide.cta.label} <Icon name="arrowRight" size={16} />
                  </ButtonLink>
                </Magnetic>
                {slide.secondary && (
                  <Magnetic>
                    <ButtonLink to={slide.secondary.to} size="lg" variant="light">
                      {slide.secondary.label}
                    </ButtonLink>
                  </Magnetic>
                )}
              </div>,
            ].map((node, i) => (
              <div key={i} className="overflow-hidden">
                <motion.div
                  variants={{
                    hidden: animateIn ? { y: "105%", opacity: 0 } : { y: 0, opacity: 1 },
                    show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: ease.editorial } },
                    exit: { y: "-40%", opacity: 0, transition: { duration: 0.3 } },
                  }}
                >
                  {node}
                </motion.div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center gap-6">
          <div className="flex gap-2" role="tablist" aria-label="Choose slide">
            {heroSlides.map((s, i) => (
              <button key={s.id} type="button" role="tab" aria-selected={i === index} aria-label={`Slide ${i + 1}: ${s.title}`} onClick={() => go(i)} className="group flex h-11 items-center">
                <span className="relative block h-[2px] w-10 overflow-hidden bg-white/30 sm:w-16">
                  {i === index && (
                    <motion.span
                      key={progressKey}
                      className="absolute inset-y-0 left-0 bg-white"
                      initial={{ width: reduce || paused ? "100%" : "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: reduce || paused ? 0 : INTERVAL / 1000, ease: "linear" }}
                    />
                  )}
                  {i < index && <span className="absolute inset-0 bg-white/70" />}
                </span>
              </button>
            ))}
          </div>
          <span className="code-accent !text-white/75 tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={() => go(index - 1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/40 transition-colors hover:bg-white hover:text-black" aria-label="Previous slide">
              <Icon name="arrowLeft" size={16} />
            </button>
            <button type="button" onClick={() => go(index + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/40 transition-colors hover:bg-white hover:text-black" aria-label="Next slide">
              <Icon name="arrowRight" size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

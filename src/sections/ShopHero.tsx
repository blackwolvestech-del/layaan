import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { SplitText } from "@/components/fx/SplitText";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { Img } from "@/components/ui/Img";
import { placements } from "@/data/assets";
import { imageByFile } from "@/data/products";
import { ease } from "@/utils/motion";

/** Collage photos: file, position/size (percent of the collage box), depth and tilt. */
const COLLAGE = [
  { file: placements.collectionCovers.tailoring, box: "left-[4%] top-[8%] w-[46%]", depth: 1, rotate: -5 },
  { file: placements.collectionCovers["statement-sleeves"], box: "right-[2%] top-0 w-[40%]", depth: 0.55, rotate: 4 },
  { file: placements.collectionCovers.occasion, box: "left-[34%] bottom-0 w-[42%]", depth: 1.45, rotate: -1.5 },
] as const;

function FloatingPhoto({ file, box, depth, rotate, index, mx, my, scroll }: (typeof COLLAGE)[number] & { index: number; mx: MotionValue<number>; my: MotionValue<number>; scroll: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const x = useTransform(mx, [-0.5, 0.5], [28 * depth, -28 * depth]);
  const mouseY = useTransform(my, [-0.5, 0.5], [18 * depth, -18 * depth]);
  const scrollY = useTransform(scroll, [0, 1], [0, reduce ? 0 : -140 * depth]);
  const y = useTransform(() => mouseY.get() + scrollY.get());
  return (
    <motion.div className={`absolute ${box}`} style={{ x, y, zIndex: Math.round(depth * 10) }}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 80, rotate: 0, clipPath: "inset(100% 0 0 0)" }}
        animate={{ opacity: 1, y: 0, rotate, clipPath: "inset(0% 0 0 0)" }}
        transition={{ duration: 1.3, ease: ease.editorial, delay: 0.25 + index * 0.15 }}
      >
        {/* Idle float, offset per photo. */}
        <motion.div animate={reduce ? undefined : { y: [0, -10, 0] }} transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut", delay: index * 0.8 }}>
          <Img image={imageByFile(file)} sizes="(min-width: 1024px) 22vw, 40vw" priority={index === 0} className="aspect-[3/4] rounded-[2px] shadow-[0_40px_80px_-35px_rgb(0_0_0/0.55)]" decorative />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Editorial shop header: giant animated title beside a floating, parallax photo collage. */
export function ShopHero({ count }: { count: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const mx = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);

  return (
    <section
      ref={ref}
      aria-labelledby="shop-title"
      className="grain relative isolate overflow-hidden border-b border-line"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <div aria-hidden className="field-gradient absolute inset-0 -z-10" />
      <div className="container-x grid min-h-[min(46rem,78svh)] items-center gap-10 pt-6 pb-14 lg:grid-cols-12 lg:pb-10">
        <motion.div className="lg:col-span-6" style={{ y: titleY }}>
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Shop" }]} />
          <motion.p className="nav-caps mt-10 flex items-center gap-3 text-muted lg:mt-16" initial={reduce ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: ease.editorial }}>
            <span aria-hidden className="h-px w-10 bg-gold" /> {count} looks
          </motion.p>
          <SplitText as="h1" trigger="mount" text="The Collection" delay={0.15} stagger={0.035} className="mt-5 font-display text-[clamp(3rem,1.6rem+6.5vw,8rem)] leading-[0.92] tracking-[-0.03em]" />
          <motion.p className="tagline mt-6 max-w-md" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: ease.editorial, delay: 0.7 }}>
            Tailoring, coordinated sets and longline styles — search and filter every look.
          </motion.p>
          <motion.a
            href="#collection"
            className="nav-caps group mt-10 inline-flex min-h-11 items-center gap-3 hover:text-gold-ink"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-line-strong transition-colors group-hover:border-gold">
              <motion.span aria-hidden className="block h-3 w-px bg-current" animate={reduce ? undefined : { y: [-10, 10] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }} />
            </span>
            Browse the looks
          </motion.a>
        </motion.div>
        <div aria-hidden className="relative mx-auto aspect-[5/4] w-full max-w-xl lg:col-span-6 lg:max-w-none">
          {COLLAGE.map((c, i) => (
            <FloatingPhoto key={c.file} {...c} index={i} mx={mx} my={my} scroll={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}

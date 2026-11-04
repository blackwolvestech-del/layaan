import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Fragment, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { SplitText } from "../fx/SplitText";
import { ease } from "@/utils/motion";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <Fragment key={`${c.label}-${i}`}>
            <li>
              {c.to && i < items.length - 1 ? (
                <Link to={c.to} className="link-underline hover:text-ink">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink-2">
                  {c.label}
                </span>
              )}
            </li>
            {i < items.length - 1 && (
              <li aria-hidden className="text-line-strong">
                /
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

/** Slow-drifting blurred gold glows behind a header (decorative; none for reduced motion). */
export function GoldOrbs() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const orbs = [
    { size: "28rem", left: "-6%", top: "-40%", dur: 16 },
    { size: "22rem", left: "62%", top: "-30%", dur: 19 },
    { size: "18rem", left: "36%", top: "40%", dur: 22 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {orbs.map((o, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold/15 blur-3xl"
          style={{ width: o.size, height: o.size, left: o.left, top: o.top }}
          animate={{ x: [0, 50, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/**
 * Title block for inner pages, in the storefront's retail voice: centred uppercase title,
 * small eyebrow and an italic tagline. Sets the document title too. The title assembles letter by
 * letter over a drifting gold glow; gold rules draw in; the block eases away as the page scrolls.
 */
export function PageHeader({ title, eyebrow, intro, crumbs, docTitle, children }: { title: ReactNode; eyebrow?: string; intro?: ReactNode; crumbs?: Crumb[]; docTitle: string; children?: ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 70]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, reduce ? 1 : 0.15]);
  const fade = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: ease.editorial, delay } });

  return (
    <header ref={ref} className="relative isolate overflow-hidden">
      <title>{`${docTitle} — LAYAAN Atelier`}</title>
      <div aria-hidden className="field-gradient absolute inset-0 -z-20 opacity-60" />
      <GoldOrbs />
      <div className="container-x pt-6 pb-10 sm:pt-8 sm:pb-12">
        {crumbs && <Breadcrumbs items={[{ label: "Home", to: "/" }, ...crumbs]} />}
        <motion.div className="relative mt-10 flex flex-col items-center pb-10 text-center sm:mt-14" style={{ y, opacity }}>
          {eyebrow && (
            <motion.p className="nav-caps mb-5 flex items-center gap-3 text-muted" {...fade(0)}>
              <motion.span aria-hidden className="h-px w-8 origin-right bg-gold" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: ease.editorial, delay: 0.2 }} />
              {eyebrow}
              <motion.span aria-hidden className="h-px w-8 origin-left bg-gold" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: ease.editorial, delay: 0.2 }} />
            </motion.p>
          )}
          {typeof title === "string" ? <SplitText as="h1" trigger="mount" text={title} delay={0.1} stagger={0.03} className="page-title text-balance" /> : <h1 className="page-title text-balance">{title}</h1>}
          {intro && (
            <motion.p className="tagline mt-5 max-w-xl text-balance" {...fade(0.45)}>
              {intro}
            </motion.p>
          )}
          {children && (
            <motion.div className="mt-6 flex flex-wrap justify-center gap-3" {...fade(0.6)}>
              {children}
            </motion.div>
          )}
          {/* Bottom rule draws out from the centre. */}
          <motion.span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, ease: ease.editorial, delay: 0.3 }} />
        </motion.div>
      </div>
    </header>
  );
}

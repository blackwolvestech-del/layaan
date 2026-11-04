import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router";
import { Reveal } from "../ui/misc";
import { Logo } from "./Logo";
import { categoryNav, collectionNav, helpNav, legalNav } from "./nav";

const columns = [
  { title: "Shop", links: [{ to: "/shop", label: "Shop all" }, ...categoryNav, { to: "/wishlist", label: "Wishlist" }] },
  { title: "Collections", links: [...collectionNav, { to: "/lookbook", label: "Lookbook" }] },
  { title: "Customer care", links: helpNav },
  { title: "LAYAAN", links: [{ to: "/about", label: "About" }, ...legalNav] },
];

const WORD = "LAYAAN";
const wordClass = "block pb-2 text-center font-display text-[clamp(4.5rem,1.5rem+15vw,17rem)] leading-[0.85] tracking-[-0.02em]";

/**
 * Giant outlined wordmark (decorative). Letters rise at staggered speeds as the footer scrolls in,
 * and a gold spotlight fills the outline wherever the mouse moves.
 */
function Wordmark() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const sx = useSpring(mx, { stiffness: 200, damping: 30 });
  const sy = useSpring(my, { stiffness: 200, damping: 30 });
  const mask = useMotionTemplate`radial-gradient(circle clamp(90px, 14vw, 220px) at ${sx}px ${sy}px, #000 20%, transparent 100%)`;
  return (
    <div
      ref={ref}
      aria-hidden
      className="container-x relative overflow-hidden"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        mx.set(-999);
        my.set(-999);
      }}
    >
      <span className={`${wordClass} text-stroke-gold`}>
        {Array.from(WORD).map((c, i) => (
          <Letter key={i} c={c} i={i} progress={scrollYProgress} />
        ))}
      </span>
      {!reduce && (
        <motion.span className={`${wordClass} pointer-events-none absolute inset-x-0 top-0 text-gold`} style={{ WebkitMaskImage: mask, maskImage: mask }}>
          {Array.from(WORD).map((c, i) => (
            <Letter key={i} c={c} i={i} progress={scrollYProgress} />
          ))}
        </motion.span>
      )}
    </div>
  );
}

function Letter({ c, i, progress }: { c: string; i: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const from = 60 + ((i * 53) % 5) * 22;
  const y = useTransform(progress, [0, 1], reduce ? ["0%", "0%"] : [`${from}%`, "0%"]);
  const rotate = useTransform(progress, [0, 1], reduce ? [0, 0] : [i % 2 ? 6 : -6, 0]);
  return (
    <motion.span className="inline-block" style={{ y, rotate }}>
      {c}
    </motion.span>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-2">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
        <Reveal className="lg:col-span-4">
          <Logo height={42} />
          <p className="tagline mt-6 max-w-xs">Contemporary Western womenswear — from everyday to occasion.</p>
        </Reveal>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
          {columns.map((col, i) => (
            <Reveal key={col.title} delay={i * 0.06}>
              <nav aria-label={col.title}>
                <p className="nav-caps mb-5">{col.title}</p>
                <ul className="space-y-3 text-sm">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="link-underline text-muted hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>
          ))}
        </div>
      </div>
      <Wordmark />
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LAYAAN Atelier. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

import clsx from "clsx";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router";
import { Magnetic } from "@/components/fx/Magnetic";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { useUi } from "@/context/UiContext";
import { categories, productById } from "@/data/products";
import type { Product } from "@/types/product";

const IDS = ["teal-statement-sleeve-suit", "emerald-tie-neck-maxi", "crimson-belted-satin-co-ord", "ivory-longline-coat-gold-fastenings"];

function Card({ product, i, total, progress }: { product: Product; i: number; total: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const { openQuickView } = useUi();
  const ref = useRef<HTMLDivElement>(null);
  // This card's own pass through the viewport drives the photo's inner parallax.
  const { scrollYProgress: own } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const imgScale = useTransform(own, [0, 1], reduce ? [1, 1] : [1.35, 1]);
  // Cards already passed shrink back into the stack as later ones slide over them.
  const target = 1 - (total - 1 - i) * 0.045;
  const scale = useTransform(progress, [i / total, 1], reduce ? [1, 1] : [1, target]);
  const dim = useTransform(progress, [i / total, 1], reduce ? [0, 0] : [0, (total - 1 - i) * 0.12]);
  const dark = i % 2 === 1;
  const category = categories.find((c) => c.id === product.category)?.name;
  const extra = product.images[1] ?? product.images[0];

  return (
    <div ref={ref} className="sticky flex h-[88svh] max-h-[48rem] min-h-[34rem] items-start justify-center" style={{ top: `calc(var(--header-h, 5rem) + 1rem + ${i * 14}px)` }}>
      <motion.article
        style={{ scale }}
        className={clsx(
          "relative grid h-[calc(100%-3rem)] w-full origin-top grid-rows-[1.15fr_1fr] overflow-hidden rounded-[4px] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.45)] md:grid-cols-[1.1fr_1fr] md:grid-rows-1",
          dark ? "bg-[#15120e] text-[#f4ede1]" : "bg-cream text-ink",
        )}
      >
        <button type="button" onClick={() => openQuickView(product.id)} className="relative block min-h-0 overflow-hidden" aria-label={`Quick view: ${product.label}`} data-cursor="View">
          <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
            <Img image={product.images[0]} sizes="(min-width: 768px) 55vw, 100vw" className="h-full w-full" decorative />
          </motion.div>
          <span className="code-accent absolute top-4 left-4 rounded-[2px] bg-black/40 px-2 py-1 !text-white/85 backdrop-blur-sm">
            {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </button>

        <div className="relative flex min-h-0 flex-col justify-between gap-6 p-6 sm:p-10 lg:p-14">
          <span aria-hidden className={clsx("pointer-events-none absolute -top-6 right-4 font-display text-[clamp(6rem,4rem+8vw,13rem)] leading-none italic select-none", dark ? "text-white/[0.06]" : "text-ink/[0.06]")}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="relative">
            <p className={clsx("nav-caps", dark ? "!text-[#d8b772]" : "text-gold-ink")}>
              {product.colour} · {category}
            </p>
            <h3 className="mt-4 font-display text-[clamp(1.75rem,1.2rem+2.2vw,3.25rem)] leading-[1.05] text-balance">{product.label}</h3>
            <p className={clsx("mt-4 hidden max-w-md leading-relaxed sm:block", dark ? "text-white/70" : "text-ink-2")}>{product.description}</p>
            <ul className="mt-5 hidden flex-wrap gap-2 sm:flex">
              {product.includedPieces.map((piece) => (
                <li key={piece} className={clsx("nav-caps rounded-full border px-3 py-1.5 !text-[0.5625rem]", dark ? "border-white/20" : "border-line-strong")}>
                  {piece}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative flex items-end justify-between gap-6">
            <Magnetic>
              <Link to={`/products/${product.id}`} className={clsx("nav-caps group inline-flex min-h-12 items-center gap-3 border-b pb-1", dark ? "border-white/40 hover:border-[#d8b772] hover:text-[#d8b772]" : "border-ink/40 hover:border-gold hover:text-gold-ink")}>
                View the look <Icon name="arrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <div className="hidden w-24 shrink-0 overflow-hidden rounded-[2px] lg:block">
              <Img image={extra} sizes="96px" className="aspect-[3/4]" decorative />
            </div>
          </div>
        </div>
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: dim }} />
      </motion.article>
    </div>
  );
}

/** "Signature looks": full-width cards that pin and stack, each shrinking back as the next slides over it. */
export function StackedLooks() {
  const ref = useRef<HTMLDivElement>(null);
  const looks = IDS.map(productById).filter((p): p is Product => !!p);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section aria-labelledby="signature-title" className="container-x py-14 sm:py-20">
      <SectionTitle id="signature-title" title="Signature looks" tagline="one silhouette at a time" viewAll="/shop" />
      <div ref={ref} className="relative">
        {looks.map((p, i) => (
          <Card key={p.id} product={p} i={i} total={looks.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/product";
import { fadeUp, revealViewport, staggerParent } from "@/utils/motion";
import { Icon } from "../ui/Icon";
import { SectionTitle } from "../ui/SectionTitle";
import { ProductCard } from "./ProductCard";
import { useScrollSkew } from "../fx/useScrollSkew";

/**
 * Horizontal product carousel (native scroll-snap, so touch, trackpad and keyboard all work)
 * with previous/next buttons that disable at either end.
 */
export function ProductRail({ id, title, tagline, viewAll, products }: { id: string; title: string; tagline?: string; viewAll?: string; products: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [edges, setEdges] = useState({ start: true, end: false });
  const skewY = useScrollSkew(2.5);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const by = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
  const arrow = "grid h-11 w-11 place-items-center rounded-full border border-line-strong transition-colors hover:border-ink hover:bg-ink hover:text-bg disabled:pointer-events-none disabled:opacity-30";

  return (
    <section aria-labelledby={`${id}-title`} className="py-14 sm:py-20">
      <div className="container-x">
        <SectionTitle id={`${id}-title`} title={title} tagline={tagline} viewAll={viewAll}>
          <button type="button" className={arrow} onClick={() => by(-1)} disabled={edges.start} aria-label={`Previous — ${title}`}>
            <Icon name="arrowLeft" size={16} />
          </button>
          <button type="button" className={arrow} onClick={() => by(1)} disabled={edges.end} aria-label={`Next — ${title}`}>
            <Icon name="arrowRight" size={16} />
          </button>
        </SectionTitle>
      </div>
      <motion.div
        ref={scroller}
        role="region"
        aria-label={`${title} — scroll for more`}
        tabIndex={0}
        data-lenis-prevent-horizontal
        className="scrollbar-none snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-[clamp(1rem,0.4rem+2.6vw,3rem)]"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={revealViewport}
        variants={staggerParent(0.08)}
      >
        <motion.ul className="flex w-max gap-3 px-[clamp(1rem,0.4rem+2.6vw,3rem)] sm:gap-5" style={{ skewY }}>
          {products.map((p) => (
            <motion.li key={p.id} variants={fadeUp} className="w-[66vw] shrink-0 snap-start sm:w-[40vw] md:w-[30vw] lg:w-[calc((min(100vw,90rem)-6rem-3.75rem)/4)]">
              <ProductCard product={p} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 66vw" animate={false} />
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}

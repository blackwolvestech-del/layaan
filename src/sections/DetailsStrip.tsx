import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { SplitText } from "@/components/fx/SplitText";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { useUi } from "@/context/UiContext";
import type { Product } from "@/types/product";

/**
 * "Every angle": all photographs of a look in one row that glides sideways as the page scrolls
 * past (no pinning, so scrolling never feels trapped). Each photo opens the full-screen viewer.
 * Reduced motion: an ordinary horizontally scrollable row.
 */
export function DetailsStrip({ product }: { product: Product }) {
  const reduce = useReducedMotion();
  const { openLightbox } = useUi();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const distance = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const x = useTransform(() => (reduce ? 0 : -scrollYProgress.get() * distance.get()));

  // How far the row must travel so its last photo reaches the right edge.
  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;
    const measure = () => distance.set(Math.max(0, track.scrollWidth - section.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(section);
    return () => ro.disconnect();
  }, [distance, product.id]);

  return (
    <section ref={sectionRef} aria-labelledby="angles-title" className="relative mt-14 overflow-hidden bg-[#15120e] py-14 text-[#f4ede1] sm:mt-20 sm:py-20 lg:mt-24 lg:py-24">
      <div className="container-x mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="nav-caps !text-[#d8b772]">The details</p>
          <SplitText as="h2" text="Every angle" className="mt-3 font-display text-[clamp(2.25rem,1.4rem+3.8vw,4.75rem)] leading-none" />
        </div>
        <p className="code-accent !text-white/55">{String(product.images.length).padStart(2, "0")} photographs · tap to enlarge</p>
      </div>
      <div className={reduce ? "scrollbar-none overflow-x-auto" : undefined}>
        <motion.div ref={trackRef} className="flex w-max gap-4 px-[clamp(1rem,0.4rem+2.6vw,3rem)] sm:gap-6" style={{ x }}>
          {product.images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => openLightbox({ images: product.images, index: i, title: product.label })}
              aria-label={`Enlarge photo ${i + 1} of ${product.images.length}`}
              data-cursor="Enlarge"
              className="group relative block w-[62vw] shrink-0 overflow-hidden rounded-[2px] sm:w-[34vw] lg:w-[22vw]"
            >
              <Img image={img} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 34vw, 62vw" className="aspect-[3/4] transition-transform duration-[1.2s] ease-[var(--ease-editorial)] group-hover:scale-105" decorative />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="code-accent !text-white/85">{String(i + 1).padStart(2, "0")}{img.view ? ` · ${img.view}` : ""}</span>
                <Icon name="zoom" size={16} />
              </span>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

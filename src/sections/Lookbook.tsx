import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { useUi } from "@/context/UiContext";
import { placements } from "@/data/assets";
import { imageByFile, productForFile } from "@/data/products";

/** Current height of the sticky site header (published by Header as --header-h). */
function headerHeight() {
  return document.querySelector<HTMLElement>("header")?.offsetHeight ?? 0;
}

/**
 * Horizontal look strip. On large screens GSAP pins it just below the sticky header and scrolls
 * the track sideways; elsewhere it is a swipeable row with arrow buttons.
 */
export function HorizontalLookbook({ showPageLink = true }: { showPageLink?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { openQuickView } = useUi();
  const [pinned, setPinned] = useState(false);
  const frames = placements.lookbook.map((f) => ({ img: imageByFile(f), product: productForFile(f) })).filter((x) => x.img && x.product);

  // GSAP owns this section only (pin + track translate). Motion never animates these elements.
  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px) and (pointer: fine)");
    if (reduce || !mq.matches || !sectionRef.current || !trackRef.current) return;
    let ctx: { revert: () => void } | undefined;
    let ro: ResizeObserver | undefined;
    let cancelled = false;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !sectionRef.current || !trackRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const track = trackRef.current;
      ctx = gsap.context(() => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            // Pin below the sticky header so the heading is never covered.
            start: () => `top ${headerHeight()}px`,
            end: () => `+=${distance()}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      }, sectionRef);
      // The header compacts on scroll; recalculate the pin position when its height changes.
      const header = document.querySelector("header");
      let raf = 0;
      if (header) {
        ro = new ResizeObserver(() => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => ScrollTrigger.refresh());
        });
        ro.observe(header);
      }
      setPinned(true);
    });
    return () => {
      cancelled = true;
      ro?.disconnect();
      ctx?.revert();
      setPinned(false);
    };
  }, [reduce]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section
      id="lookbook"
      ref={sectionRef}
      aria-labelledby="lookbook-title"
      className="relative overflow-hidden bg-[#15120e] pt-14 pb-16 text-[#f4ede1] sm:pt-16 sm:pb-20 lg:flex lg:h-[calc(100svh-var(--header-h,6.5rem))] lg:flex-col lg:justify-center lg:gap-6 lg:pt-7 lg:pb-10"
    >
      <div className="container-x mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 lg:mb-0">
        <div>
          <p className="nav-caps !text-[#d8b772]">Lookbook</p>
          <h2 id="lookbook-title" className="heading-caps mt-2">
            {frames.length} looks, one wardrobe
          </h2>
          {pinned && <p className="code-accent mt-2 !text-white/60">scroll ↓ to travel →</p>}
        </div>
        <div className="flex items-center gap-4">
          {showPageLink && (
            <Link to="/lookbook" className="nav-caps group inline-flex min-h-11 items-center gap-2 !text-[#d8b772] hover:underline hover:underline-offset-4">
              Open the full lookbook <Icon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          <div className={pinned ? "hidden" : "flex gap-2"}>
            <button type="button" onClick={() => scrollBy(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10" aria-label="Previous looks">
              <Icon name="arrowLeft" size={16} />
            </button>
            <button type="button" onClick={() => scrollBy(1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10" aria-label="Next looks">
              <Icon name="arrowRight" size={16} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className={pinned ? "overflow-visible" : "scrollbar-none snap-x snap-mandatory overflow-x-auto overscroll-x-contain"}
        tabIndex={pinned ? undefined : 0}
        role="region"
        aria-label="Lookbook — scroll horizontally or use the arrow buttons"
      >
        <div ref={trackRef} className="flex w-max gap-5 px-[clamp(1rem,0.4rem+2.6vw,3rem)] will-change-transform">
          {frames.map(({ img, product }, i) => (
            <button
              key={img!.id}
              type="button"
              onClick={() => openQuickView(product!.id)}
              // On large screens the width is capped by the available height (3:4 photo + caption),
              // so every photo fits on screen with room below.
              className="group relative block w-[78vw] shrink-0 snap-start text-left sm:w-[48vw] lg:w-[min(27vw,calc((100svh-var(--header-h,6.5rem)-13rem)*0.75))]"
              aria-haspopup="dialog"
            >
              <span className="relative block aspect-[3/4] overflow-hidden rounded-[2px] ring-1 ring-white/10 transition-all duration-700 ease-[var(--ease-editorial)] group-hover:ring-white/30 group-hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.4)]">
                <Img image={img} sizes="(min-width: 1024px) 27vw, (min-width: 640px) 48vw, 78vw" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105" />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 ease-[var(--ease-editorial)] group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-0 bottom-3.5 hidden justify-center lg:flex">
                  <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/60 px-3.5 py-1.5 text-[0.625rem] font-semibold tracking-[0.16em] uppercase text-white shadow-lg backdrop-blur-md transition-all duration-500 ease-[var(--ease-editorial)] translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                    <span>Quick view</span>
                    <Icon name="plus" size={11} />
                  </span>
                </div>
              </span>
              <span className="mt-3 flex items-baseline justify-between gap-3">
                <span className="product-title text-[0.8125rem] transition-colors duration-300 group-hover:text-gold">{product!.label}</span>
                <span className="code-accent !text-white/60">{String(i + 1).padStart(2, "0")}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

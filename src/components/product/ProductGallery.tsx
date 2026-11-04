import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useUi } from "@/context/UiContext";
import type { ProductImage } from "@/types/product";
import { ease } from "@/utils/motion";
import { Icon } from "../ui/Icon";
import { Img } from "../ui/Img";

/** Most thumbnails shown at once; the rest are reached via prev/next. */
const MAX_THUMBS = 5;

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  sizes: string;
  /** Load the first image eagerly (product page LCP). */
  priority?: boolean;
  /** Thumbnails beside the image on large screens (product page) or below it (quick view). */
  layout?: "below" | "side";
  /** Magnify the photo under the mouse (product page). */
  hoverZoom?: boolean;
}

/** Main photo with prev/next, thumbnails, keyboard arrows and an "Enlarge" lightbox. */
export function ProductGallery({ images, title, sizes, priority, layout = "below", hoverZoom = false }: ProductGalleryProps) {
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const { openLightbox } = useUi();
  const [index, setIndex] = useState(0);
  const [start, setStart] = useState(0);
  const reduce = useReducedMotion();
  const count = images.length;
  const current = images[index];
  const visible = images.slice(start, start + MAX_THUMBS);

  useEffect(() => {
    setIndex(0);
    setStart(0);
  }, [images]);

  const go = (n: number) => {
    const next = (n + count) % count;
    setIndex(next);
    // Slide the thumbnail window just enough to keep the selection in view.
    setStart((s) => (next < s ? next : next >= s + MAX_THUMBS ? next - MAX_THUMBS + 1 : s));
  };

  return (
    <div
      className={clsx("flex min-w-0 gap-3", layout === "side" ? "flex-col-reverse lg:flex-row" : "flex-col")}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        role="tablist"
        aria-label={`Photos of ${title}`}
        className={clsx("scrollbar-none flex max-w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-1", layout === "side" && "lg:max-h-[82vh] lg:w-20 lg:shrink-0 lg:snap-none lg:flex-col lg:overflow-y-auto", layout === "below" && "order-last")}
      >
        {visible.map((img, offset) => {
          const i = start + offset;
          return (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}${img.view ? ` — ${img.view}` : ""}`}
              onClick={() => go(i)}
              className={clsx("w-14 shrink-0 snap-start overflow-hidden rounded-[2px] border-2 transition-opacity lg:w-full", layout === "below" && "lg:w-14", i === index ? "border-gold" : "border-transparent opacity-60 hover:opacity-100")}
            >
              <Img image={img} sizes="80px" className="aspect-[3/4]" decorative />
            </button>
          );
        })}
      </div>
      <div
        className={clsx("relative aspect-[3/4] flex-1 overflow-hidden rounded-[2px] bg-surface-2", hoverZoom && lens && "cursor-zoom-in")}
        data-cursor={hoverZoom ? "Zoom" : undefined}
        // Zoom lens: magnify around the pointer (mouse only; controls on top switch it off).
        onPointerMove={(e) => {
          if (!hoverZoom || reduce || e.pointerType !== "mouse") return;
          if ((e.target as Element).closest("button")) return setLens(null);
          const r = e.currentTarget.getBoundingClientRect();
          setLens({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onPointerLeave={() => setLens(null)}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={current?.id}
            className="absolute inset-0"
            initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)", scale: 1.02 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: ease.editorial }}
          >
            <div className="h-full w-full transition-transform duration-500 ease-[var(--ease-editorial)]" style={lens ? { transform: "scale(2)", transformOrigin: `${lens.x}% ${lens.y}%` } : undefined}>
              <Img image={current} sizes={sizes} priority={priority && index === 0} className="h-full w-full" />
            </div>
          </motion.div>
        </AnimatePresence>
        <button type="button" onClick={() => openLightbox({ images, index, title })} className="glass absolute right-3 bottom-3 flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold">
          <Icon name="zoom" size={16} /> Enlarge
        </button>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(index - 1)} className="glass absolute top-1/2 left-3 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full" aria-label="Previous photo">
              <Icon name="arrowLeft" size={16} />
            </button>
            <button type="button" onClick={() => go(index + 1)} className="glass absolute top-1/2 right-3 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full" aria-label="Next photo">
              <Icon name="arrowRight" size={16} />
            </button>
          </>
        )}
        <span className="code-accent absolute top-3 left-3 rounded-[2px] bg-black/40 px-2 py-1 !text-white/85 tabular-nums" aria-live="polite">
          {String(index + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
          <span className="sr-only">: {current?.alt}</span>
        </span>
      </div>
    </div>
  );
}

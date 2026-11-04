import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { SplitText } from "@/components/fx/SplitText";
import type { RingHandle, RingItem } from "@/components/media/RingGallery";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { useUi } from "@/context/UiContext";
import { categories, products } from "@/data/products";
import { ease } from "@/utils/motion";

const RingGallery = lazy(() => import("@/components/media/RingGallery"));

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Showpiece section: every look on a 3D ring that turns with scroll and drag. The look index
 * below is the accessible control (keyboard / screen readers); reduced-motion and no-WebGL
 * visitors get a still grid of the same looks.
 */
export function AtelierRing() {
  const reduce = useReducedMotion();
  const { openQuickView } = useUi();
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<RingHandle>(null);
  const [visible, setVisible] = useState(false);
  const [front, setFront] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [gl] = useState(() => typeof document !== "undefined" && webglAvailable());
  const items: RingItem[] = useMemo(() => // Derivatives: WebP/AVIF at every width, JPEG only at 1200 (used as the fallback).
    products.map((p) => ({ id: p.id, src: `${p.images[0]!.basePath}-800.webp`, fallback: `${p.images[0]!.basePath}-1200.jpg` })), []);
  const current = products[front]!;
  const category = categories.find((c) => c.id === current.category)?.name;
  const use3d = gl && !reduce;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="ring-title" className="relative overflow-hidden bg-[#15120e] py-20 text-[#f4ede1] sm:py-28">
      {/* Warm glow behind the ring. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-[60%] max-w-5xl rounded-full bg-[#c9a45c]/10 blur-[120px]" />
      <div className="container-x relative">
        <div className="flex flex-col items-center text-center">
          <p className="nav-caps !text-[#d8b772]">The atelier</p>
          <SplitText as="h2" text="In the round" className="mt-4 font-display text-[clamp(2.5rem,1.5rem+4.5vw,5.5rem)] leading-none" />
          <p className="tagline mt-4 !text-white/60">{use3d ? "drag, scroll or choose a look below" : "every look in the collection"}</p>
        </div>
      </div>

      {use3d ? (
        <>
          <div className="relative mt-6 h-[74vh] min-h-[26rem] max-h-[54rem] cursor-grab" data-cursor={hovering ? "View" : "Drag"}>
            {visible && (
              <Suspense fallback={null}>
                <RingGallery
                  ref={ringRef}
                  items={items}
                  active={visible}
                  className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full"
                  onSelect={(i) => openQuickView(products[i]!.id)}
                  onFront={setFront}
                  onHover={setHovering}
                />
              </Suspense>
            )}
          </div>
          {/* Caption for the look facing the viewer. */}
          <div className="container-x relative -mt-4 flex min-h-24 flex-col items-center text-center" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={current.id} initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(6px)" }} transition={{ duration: 0.45, ease: ease.editorial }}>
                <p className="code-accent !text-white/50">
                  {String(front + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")} · {current.colour} · {category}
                </p>
                <p className="mt-2 text-sm font-semibold tracking-[0.1em] uppercase">{current.label}</p>
                <Link to={`/products/${current.id}`} className="nav-caps mt-3 inline-flex min-h-10 items-center gap-2 !text-[#d8b772] hover:underline hover:underline-offset-4">
                  View the look <Icon name="arrowRight" size={13} />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      ) : (
        <ul className="container-x mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {products.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => openQuickView(p.id)} className="group block w-full text-left" aria-haspopup="dialog" aria-label={`Quick view: ${p.label}`}>
                <Img image={p.images[0]} sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 50vw" className="aspect-[3/4]" decorative />
                <span className="mt-2 block text-xs font-semibold tracking-[0.06em] uppercase">{p.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {use3d && (
        <nav aria-label="Look index" className="container-x relative mt-8">
          <ul className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:justify-center">
            {products.map((p, i) => (
              <li key={p.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => ringRef.current?.focus(i)}
                  aria-current={i === front ? "true" : undefined}
                  aria-label={p.label}
                  className={`relative min-h-10 rounded-full border px-4 text-[0.6875rem] font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition-colors ${i === front ? "border-[#c9a45c] text-[#f4ede1]" : "border-white/15 text-white/55 hover:border-white/40 hover:text-white"}`}
                >
                  {i === front && <motion.span layoutId="ring-index" className="absolute inset-0 rounded-full bg-[#c9a45c]/15" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative">{p.colour}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}

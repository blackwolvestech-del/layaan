import clsx from "clsx";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { offerFor, stockFor } from "@/data/commerce";
import { categories, hoverImage, type Product, type ProductImage } from "@/data/products";
import { ease, fadeUp } from "@/utils/motion";
import { useUi } from "@/context/UiContext";
import { useWishlist } from "@/hooks/useWishlist";
import type { SizeId } from "@/types/commerce";
import { Price } from "@/components/commerce/controls";
import { useAddToBag } from "@/components/commerce/useAddToBag";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";

export function WishlistButton({ product, className, variant = "overlay" }: { product: Product; className?: string; variant?: "overlay" | "inline" }) {
  const { has, toggle } = useWishlist();
  const { toast, openOverlay } = useUi();
  const saved = has(product.id);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.label} from wishlist` : `Save ${product.label} to wishlist`}
      onClick={(e) => {
        e.stopPropagation();
        const added = toggle(product.id);
        toast(added ? "Saved to your wishlist on this device" : "Removed from your wishlist", added ? { label: "View", onClick: () => openOverlay("wishlist") } : undefined);
      }}
      className={clsx(
        "grid place-items-center transition-colors",
        variant === "overlay" ? "glass h-10 w-10 rounded-full" : "min-h-12 gap-2 border border-line-strong px-5 text-[0.6875rem] font-semibold tracking-[0.16em] uppercase hover:border-ink",
        variant === "inline" && "flex",
        saved ? "text-gold-ink" : "text-ink",
        className,
      )}
    >
      <motion.span key={String(saved)} initial={{ scale: saved ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} className="grid place-items-center">
        <Icon name="heart" size={18} fill={saved ? "currentColor" : "none"} />
      </motion.span>
      {variant === "inline" && <span>{saved ? "Saved" : "Save"}</span>}
    </motion.button>
  );
}

const PREVIEW_DELAY = 220; // ms of steady hover before the image pops out
const PREVIEW_SCALE = 1.6; // enlarged size relative to the card image
const EDGE = 16; // keep the pop-up this far from the viewport edges

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Where the enlarged image sits: centred on the card, as large as fits, kept inside the viewport. */
function previewRect(card: DOMRect): Rect {
  const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
  const maxH = window.innerHeight - headerH - EDGE * 2;
  const maxW = window.innerWidth - EDGE * 2;
  let height = Math.min(card.height * PREVIEW_SCALE, maxH);
  let width = (height * card.width) / card.height;
  if (width > maxW) {
    width = maxW;
    height = (width * card.height) / card.width;
  }
  const cx = card.left + card.width / 2;
  const cy = card.top + card.height / 2;
  const left = Math.min(Math.max(cx - width / 2, EDGE), window.innerWidth - EDGE - width);
  const top = Math.min(Math.max(cy - height / 2, headerH + EDGE), window.innerHeight - EDGE - height);
  return { left, top, width, height };
}

/** Pointer position over the card photo, normalised to -0.5 … 0.5 on each axis. */
interface Tilt {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

const tiltSpring = { stiffness: 170, damping: 18, mass: 0.6 };

/**
 * Hover pop-up: only the product photo grows out of the card to a larger floating view, then
 * shrinks back into the card. While open it tilts in 3D toward the cursor, the photo inside
 * drifts the opposite way (parallax) and a soft light follows the pointer. Decorative and
 * pointer-transparent, so it never blocks clicks.
 */
function ImagePreview({ card, image, sizes, tilt }: { card: DOMRect | null; image: ProductImage | undefined; sizes: string; tilt: Tilt }) {
  const target = card ? previewRect(card) : null;
  // Transform that maps the pop-up back onto the card, used for the grow-in and shrink-out.
  const fromCard =
    card && target
      ? { x: card.left + card.width / 2 - (target.left + target.width / 2), y: card.top + card.height / 2 - (target.top + target.height / 2), scale: card.width / target.width, opacity: 0.4 }
      : undefined;
  const [last, setLast] = useState(fromCard);
  if (fromCard && (fromCard.x !== last?.x || fromCard.y !== last?.y || fromCard.scale !== last?.scale)) setLast(fromCard);

  // Cursor-driven motion, smoothed with springs.
  const rotateX = useSpring(useTransform(tilt.y, [-0.5, 0.5], [9, -9]), tiltSpring);
  const rotateY = useSpring(useTransform(tilt.x, [-0.5, 0.5], [-11, 11]), tiltSpring);
  const shiftX = useSpring(useTransform(tilt.x, [-0.5, 0.5], [16, -16]), tiltSpring);
  const shiftY = useSpring(useTransform(tilt.y, [-0.5, 0.5], [12, -12]), tiltSpring);
  const glareX = useTransform(tilt.x, [-0.5, 0.5], [15, 85]);
  const glareY = useTransform(tilt.y, [-0.5, 0.5], [10, 90]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.28), transparent 55%)`;

  return createPortal(
    <AnimatePresence>
      {target && (
        <motion.div key="preview" data-card-preview aria-hidden className="pointer-events-none fixed inset-0 z-40" style={{ perspective: 1400 }}>
          {/* Soft dim + blur behind the image to focus attention on it. */}
          <motion.div
            className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55, transition: { duration: 0.45, ease: ease.editorial } }}
            exit={{ opacity: 0, transition: { duration: 0.3, ease: ease.exit } }}
          />
          {/* The photo springs out of the card: rises out of a soft blur with a small twist. */}
          <motion.div
            className="absolute overflow-hidden bg-surface-2"
            style={{ left: target.left, top: target.top, width: target.width, height: target.height, rotateX, rotateY }}
            initial={{ ...fromCard, rotate: -3, filter: "blur(6px)", borderRadius: 2, boxShadow: "0 0px 0px -20px rgb(0 0 0 / 0)" }}
            animate={{
              x: 0,
              y: 0,
              scale: 1,
              rotate: 0,
              opacity: 1,
              filter: "blur(0px)",
              borderRadius: 12,
              boxShadow: "0 60px 100px -35px rgb(0 0 0 / 0.65)",
              transition: { type: "spring", stiffness: 230, damping: 19, mass: 0.9, opacity: { duration: 0.2 }, filter: { duration: 0.45, ease: ease.editorial } },
            }}
            exit={{ ...last, rotate: -2, opacity: 0, filter: "blur(4px)", borderRadius: 2, boxShadow: "0 0px 0px -20px rgb(0 0 0 / 0)", transition: { duration: 0.34, ease: ease.swift, opacity: { duration: 0.34, delay: 0.1 } } }}
          >
            {/* Inner photo settles from a gentle zoom, then drifts against the tilt for depth. */}
            <motion.div
              className="h-full w-full"
              style={{ x: shiftX, y: shiftY }}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1.08, transition: { duration: 1.1, ease: ease.editorial } }}
              exit={{ scale: 1.12, transition: { duration: 0.3 } }}
            >
              {/* Same `sizes` as the card, so the already-downloaded photo is reused (no blank flash). */}
              <Img image={image} sizes={sizes} priority className="h-full w-full" decorative />
            </motion.div>
            {/* Light that follows the cursor. */}
            <motion.span className="absolute inset-0 mix-blend-soft-light" style={{ backgroundImage: glare }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.5 } }} exit={{ opacity: 0 }} />
            {/* One soft light sweep across the photo as it lands. */}
            <motion.span
              className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ x: "0%", opacity: 0 }}
              animate={{ x: "320%", opacity: [0, 1, 0], transition: { duration: 1.1, ease: ease.editorial, delay: 0.15 } }}
            />
            {/* Fine editorial inner frame that draws in once the photo has landed. */}
            <motion.span
              className="absolute inset-3 rounded-[6px] border border-white/45"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.6, ease: ease.editorial } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Size picker that slides over the bottom of the card image; choosing a size adds to the bag. */
function QuickAddPanel({ product, open, onClose }: { product: Product; open: boolean; onClose: (restoreFocus: boolean) => void }) {
  const offer = offerFor(product.id);
  const addToBag = useAddToBag();
  const [added, setAdded] = useState<SizeId | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setAdded(null);
    panel.current?.querySelector<HTMLButtonElement>("[data-size]")?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      if (!panel.current?.contains(t) && !t.closest?.("[data-quick-add]")) onClose(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, onClose]);

  // After a successful add, show the confirmation briefly, then close.
  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => onClose(true), 1200);
    return () => window.clearTimeout(t);
  }, [added, onClose]);

  if (!offer) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          role="group"
          aria-label={`Choose a size for ${product.label}`}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              onClose(true);
            }
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
          transition={{ duration: 0.35, ease: ease.editorial }}
          className="glass-strong absolute inset-x-2 bottom-2 z-10 rounded-[2px] p-3 text-ink"
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.p key="added" role="status" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[4.25rem] items-center justify-center gap-2 text-[0.6875rem] font-semibold tracking-[0.12em] uppercase">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-bg">
                  <Icon name="check" size={14} />
                </span>
                Added · size {added}
              </motion.p>
            ) : (
              <motion.div key="pick" exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="nav-caps !text-[0.625rem]">Select size</p>
                  <button type="button" onClick={() => onClose(true)} aria-label="Close size picker" className="-my-1.5 -mr-1.5 grid h-9 w-9 place-items-center rounded-full hover:bg-surface-2">
                    <Icon name="close" size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {offer.sizes.map((s) => {
                    const stock = stockFor(product.id, s);
                    const soldOut = stock !== null && stock <= 0;
                    return (
                      <button
                        key={s}
                        type="button"
                        data-size
                        disabled={soldOut}
                        onClick={() => {
                          addToBag(product, s);
                          setAdded(s);
                        }}
                        aria-label={soldOut ? `Size ${s}, sold out` : `Add size ${s} to bag`}
                        className="grid h-10 place-items-center rounded-[2px] border border-line-strong text-[0.6875rem] font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-bg disabled:pointer-events-none disabled:border-line disabled:text-muted disabled:line-through disabled:opacity-50"
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * @param animate set false when a parent (e.g. a rail) already animates the card.
 * @param fill on large screens the card fills its grid area (a 2×2 feature tile): the photo frame
 *   grows to the height left after the caption, so the caption's bottom lines up with the
 *   neighbouring cards instead of leaving empty space below.
 */
export function ProductCard({ product, sizes = "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw", animate = true, fill = false }: { product: Product; sizes?: string; animate?: boolean; fill?: boolean }) {
  const reduce = useReducedMotion();
  const { openQuickView } = useUi();
  const hover = hoverImage(product);
  const offer = offerFor(product.id);
  const category = categories.find((c) => c.id === product.category)?.name;
  const href = `/products/${product.id}`;
  const [picking, setPicking] = useState(false);
  const [previewCard, setPreviewCard] = useState<DOMRect | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const previewTimer = useRef<number>(undefined);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const hidePreview = useCallback(() => {
    window.clearTimeout(previewTimer.current);
    setPreviewCard(null);
    tiltX.set(0);
    tiltY.set(0);
  }, [tiltX, tiltY]);
  // The pop-up is positioned from the card's on-screen box, so any scroll or resize closes it.
  useEffect(() => {
    if (!previewCard) return;
    window.addEventListener("scroll", hidePreview, { passive: true });
    window.addEventListener("resize", hidePreview);
    return () => {
      window.removeEventListener("scroll", hidePreview);
      window.removeEventListener("resize", hidePreview);
    };
  }, [previewCard, hidePreview]);
  useEffect(() => () => window.clearTimeout(previewTimer.current), []);
  useEffect(() => {
    if (picking) hidePreview();
  }, [picking, hidePreview]);
  const desktopTrigger = useRef<HTMLButtonElement>(null);
  const touchTrigger = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<RefObject<HTMLButtonElement | null> | null>(null);
  const openPicker = (from: RefObject<HTMLButtonElement | null>) => {
    returnFocus.current = from;
    setPicking(true);
  };
  const closePicker = useCallback((restoreFocus: boolean) => {
    setPicking(false);
    if (restoreFocus) returnFocus.current?.current?.focus({ preventScroll: true });
  }, []);
  // Made-to-measure looks need the customer's measurements, so their bag button opens quick view.
  const custom = !!product.measurementProfile;
  const quickAdd = (from: RefObject<HTMLButtonElement | null>) => (custom ? openQuickView(product.id) : openPicker(from));
  const quickAddLabel = custom ? `Customize your size: ${product.label}` : `Add ${product.label} to bag`;
  const barBtn = "nav-caps flex items-center justify-center gap-2 py-3.5 !text-[0.65625rem] text-ink transition-colors hover:bg-ink hover:text-bg";

  return (
    <motion.article
      layout={animate && !reduce}
      variants={animate && !reduce ? fadeUp : undefined}
      className={clsx("group", fill && "lg:flex lg:h-full lg:flex-col")}
      onPointerLeave={hidePreview}
    >
      {/* overflow-hidden keeps the hidden quick-view bar from overlapping the text below. */}
      <div className={clsx("relative overflow-hidden", fill && "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col")}>
        {/* Image link is hidden from the tab order; the title link below is the focusable one. */}
        <Link
          to={href}
          tabIndex={-1}
          aria-hidden
          data-cursor="View"
          className={clsx("block", fill && "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col")}
          // Mouse only (touch and pen never pop), after a short steady hover over the photo.
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse" || reduce) return;
            window.clearTimeout(previewTimer.current);
            previewTimer.current = window.setTimeout(() => frameRef.current && setPreviewCard(frameRef.current.getBoundingClientRect()), PREVIEW_DELAY);
          }}
          onPointerMove={(e) => {
            const r = frameRef.current?.getBoundingClientRect();
            if (!r || e.pointerType !== "mouse") return;
            tiltX.set((e.clientX - r.left) / r.width - 0.5);
            tiltY.set((e.clientY - r.top) / r.height - 0.5);
          }}
          onPointerLeave={hidePreview}
          onPointerDown={hidePreview}
        >
          <div ref={frameRef} className={clsx("relative aspect-[3/4] overflow-hidden bg-surface-2", fill && "lg:aspect-auto lg:min-h-0 lg:flex-1")}>
            {/* The main photo stays visible underneath, so the hover swap never shows a blank frame. */}
            <Img image={product.images[0]} sizes={sizes} className="absolute inset-0" decorative />
            {hover && <Img image={hover} sizes={sizes} decorative className="absolute inset-0 opacity-0 transition-opacity duration-[1.2s] ease-[var(--ease-editorial)] group-hover:opacity-100 max-lg:hidden" />}
            <span className="code-accent absolute bottom-3 left-3 rounded-[2px] bg-black/35 px-1.5 py-0.5 !text-white/85 lg:hidden">{product.images.length} photos</span>
          </div>
        </Link>
        {/* Desktop hover bar: quick view + add to bag (also revealed on keyboard focus). */}
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full grid-cols-2 divide-x divide-line bg-bg/92 opacity-0 backdrop-blur-sm transition-all duration-500 ease-[var(--ease-editorial)] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 lg:grid">
          <button type="button" onClick={() => openQuickView(product.id)} aria-haspopup="dialog" aria-label={`Quick view: ${product.label}`} className={barBtn}>
            Quick view <Icon name="plus" size={13} />
          </button>
          {offer && (
            <button type="button" ref={desktopTrigger} data-quick-add onClick={() => quickAdd(desktopTrigger)} aria-expanded={custom ? undefined : picking} aria-haspopup={custom ? "dialog" : undefined} aria-label={quickAddLabel} className={barBtn}>
              {custom ? (
                <>
                  Customize size <Icon name="ruler" size={14} />
                </>
              ) : (
                <>
                  Add to bag <Icon name="bag" size={14} />
                </>
              )}
            </button>
          )}
        </div>
        {/* Touch and smaller screens have no hover: a single bag button opens the size picker. */}
        {offer && (
          <button
            type="button"
            ref={touchTrigger}
            data-quick-add
            onClick={() => quickAdd(touchTrigger)}
            aria-expanded={custom ? undefined : picking}
            aria-haspopup={custom ? "dialog" : undefined}
            aria-label={quickAddLabel}
            className="glass absolute right-3 bottom-3 grid h-10 w-10 place-items-center rounded-full text-ink lg:hidden"
          >
            <Icon name="bag" size={18} />
          </button>
        )}
        {!custom && <QuickAddPanel product={product} open={picking} onClose={closePicker} />}
        <div className="absolute top-3 right-3">
          <WishlistButton product={product} />
        </div>
      </div>
      <ImagePreview card={previewCard} image={product.images[0]} sizes={sizes} tilt={{ x: tiltX, y: tiltY }} />
      <Link to={href} className="mt-3 block focus-visible:outline-offset-4">
        <h3 className="text-[0.8125rem] font-semibold tracking-[0.06em] text-balance uppercase transition-colors group-hover:text-gold-ink">{product.label}</h3>
        <p className="mt-1 text-xs text-muted">
          {product.colour} · {category}
        </p>
        {offer && (
          <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[0.8125rem]">
            <Price amount={offer.price} className="font-semibold" />
            {offer.compareAt && <Price amount={offer.compareAt} className="text-xs text-muted line-through" />}
            {!offer.available && <span className="text-[0.6875rem] font-semibold tracking-[0.12em] text-danger uppercase">Sold out</span>}
          </span>
        )}
      </Link>
    </motion.article>
  );
}

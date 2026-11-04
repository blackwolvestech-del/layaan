import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Dialog } from "radix-ui";
import { useEffect, useState, type PointerEvent } from "react";
import { ease } from "@/utils/motion";
import { lockScroll } from "@/utils/scroll";
import { useUi } from "@/context/UiContext";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";

/** Full-screen image viewer with keyboard navigation (←/→), click-to-zoom and pan. */
export function Lightbox() {
  const { lightbox, closeLightbox } = useUi();
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const reduce = useReducedMotion();
  const open = !!lightbox;

  useEffect(() => {
    if (lightbox) {
      setIndex(lightbox.index);
      setZoomed(false);
    }
  }, [lightbox]);
  useEffect(() => (open ? lockScroll() : undefined), [open]);

  const images = lightbox?.images ?? [];
  const count = images.length;
  const go = (n: number) => {
    setZoomed(false);
    setIndex((n + count) % count);
  };
  const current = images[index];

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && closeLightbox()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[80] bg-black/92" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") go(index + 1);
                if (e.key === "ArrowLeft") go(index - 1);
              }}
            >
              <motion.div data-lenis-prevent className="fixed inset-0 z-[85] flex flex-col text-white outline-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                  <Dialog.Title className="truncate font-display text-lg">{lightbox?.title}</Dialog.Title>
                  <div className="flex items-center gap-3">
                    <span className="code-accent !text-white/70 tabular-nums">
                      {index + 1} / {count}
                    </span>
                    <Dialog.Close className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label="Close image viewer">
                      <Icon name="close" />
                    </Dialog.Close>
                  </div>
                </div>
                <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={zoomed}
                    aria-label={zoomed ? "Zoom out" : "Zoom in"}
                    onClick={() => setZoomed((z) => !z)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setZoomed((z) => !z);
                      }
                    }}
                    onPointerMove={onMove}
                    className={clsx("relative h-full max-h-[calc(100dvh-9rem)] w-full overflow-hidden", zoomed ? "cursor-zoom-out" : "cursor-zoom-in")}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.div
                        key={current?.id}
                        className="absolute inset-0"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: ease.editorial }}
                      >
                        <div className="h-full w-full transition-transform duration-300" style={{ transform: zoomed ? "scale(2.2)" : "none", transformOrigin: `${origin.x}% ${origin.y}%` }}>
                          <Img image={current} sizes="100vw" fit="contain" className="h-full w-full !bg-transparent" />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {count > 1 && (
                    <>
                      <button type="button" onClick={() => go(index - 1)} className="absolute top-1/2 left-2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:left-4" aria-label="Previous image">
                        <Icon name="arrowLeft" />
                      </button>
                      <button type="button" onClick={() => go(index + 1)} className="absolute top-1/2 right-2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:right-4" aria-label="Next image">
                        <Icon name="arrowRight" />
                      </button>
                    </>
                  )}
                </div>
                <p className="px-4 py-3 text-center text-xs text-white/70 sm:px-6">{current?.alt}</p>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

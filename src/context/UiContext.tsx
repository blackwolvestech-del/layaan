import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { ProductImage } from "@/data/products";
import { ease } from "@/utils/motion";

type Overlay = "menu" | "search" | "wishlist" | "cart" | null;

export interface LightboxState {
  images: ProductImage[];
  index: number;
  title: string;
}

interface Toast {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void } | undefined;
}

interface UiCtx {
  overlay: Overlay;
  openOverlay: (o: Exclude<Overlay, null>) => void;
  closeOverlay: () => void;
  quickViewId: string | null;
  openQuickView: (id: string) => void;
  closeQuickView: () => void;
  lightbox: LightboxState | null;
  openLightbox: (s: LightboxState) => void;
  closeLightbox: () => void;
  toast: (message: string, action?: Toast["action"]) => void;
}

const Ctx = createContext<UiCtx | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback<UiCtx["toast"]>(
    (message, action) => {
      const id = ++seq.current;
      setToasts((t) => [...t.slice(-2), { id, message, action }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo<UiCtx>(
    () => ({
      overlay,
      openOverlay: (o) => setOverlay(o),
      closeOverlay: () => setOverlay(null),
      quickViewId,
      openQuickView: (id) => {
        setOverlay(null);
        setQuickViewId(id);
      },
      closeQuickView: () => setQuickViewId(null),
      lightbox,
      openLightbox: setLightbox,
      closeLightbox: () => setLightbox(null),
      toast,
    }),
    [overlay, quickViewId, lightbox, toast],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              role="status"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.18 } }}
              transition={{ duration: 0.36, ease: ease.editorial }}
              className="glass-strong pointer-events-auto flex max-w-sm items-center gap-4 rounded-sm px-4 py-3 text-sm text-ink"
            >
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span className="flex-1">{t.message}</span>
              {t.action && (
                <button
                  type="button"
                  className="shrink-0 text-xs font-semibold tracking-wide text-gold-ink uppercase underline-offset-4 hover:underline"
                  onClick={() => {
                    t.action?.onClick();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              )}
              <button type="button" aria-label="Dismiss notification" className="-mr-1 grid h-8 w-8 shrink-0 place-items-center text-muted hover:text-ink" onClick={() => dismiss(t.id)}>
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useUi() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUi must be used inside UiProvider");
  return v;
}

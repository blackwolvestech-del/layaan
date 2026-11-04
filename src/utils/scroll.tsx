// Scrolling roles (one document scroll context):
//  - Lenis: optional smooth wheel scrolling; disabled for reduced motion, touch input and open overlays.
//  - GSAP ScrollTrigger: only the pinned horizontal lookbook.
//  - Motion useScroll: progress bar and light scroll-linked parallax.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type Lenis from "lenis";

const LenisCtx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisCtx);

let lockCount = 0;
let lenisRef: Lenis | null = null;

/** Reference-counted scroll lock shared by overlays; always restores scrolling on close. */
export function lockScroll() {
  lockCount += 1;
  if (lockCount === 1) {
    document.documentElement.classList.add("scroll-locked");
    lenisRef?.stop();
  }
  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.documentElement.classList.remove("scroll-locked");
      lenisRef?.start();
    }
  };
}

const prefersReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Jumps to the top of the page (used on route changes). */
export function scrollToTop() {
  if (lenisRef) lenisRef.scrollTo(0, { immediate: true });
  else window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReduced() || matchMedia("(pointer: coarse)").matches) return;
    let instance: Lenis | null = null;
    let raf = 0;
    let cancelled = false;
    void import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      instance = new LenisCtor({ lerp: 0.12, smoothWheel: true, autoRaf: false, prevent: (node) => !!node.closest("[data-lenis-prevent]") });
      lenisRef = instance;
      if (lockCount > 0) instance.stop();
      const loop = (t: number) => {
        instance?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      setLenis(instance);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      instance?.destroy();
      lenisRef = null;
      setLenis(null);
    };
  }, []);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}

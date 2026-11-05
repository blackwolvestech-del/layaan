import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigation } from "react-router";
import { BackToTop } from "@/components/fx/BackToTop";
import { Cursor } from "@/components/fx/Cursor";
import { RouteCurtain } from "@/components/fx/RouteCurtain";
import { Lightbox } from "@/components/product/Lightbox";
import { QuickView } from "@/components/product/QuickView";
import { useUi } from "@/context/UiContext";
import { useCatalogVersion } from "@/data/catalogStore";
import { pageTransition } from "@/utils/motion";
import { scrollToTop, SmoothScrollProvider } from "@/utils/scroll";
import { Footer } from "./Footer";
import { AnnouncementBar, Header } from "./Header";
import { CartDrawer, MobileMenu, SearchOverlay, WishlistDrawer } from "./Overlays";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-gradient-to-r from-gold/40 via-gold to-gold/40" style={{ scaleX }} />;
}

/** Thin bar while a lazily loaded page is being fetched. */
function RouteProgress() {
  const nav = useNavigation();
  if (nav.state === "idle") return null;
  return <div role="progressbar" aria-label="Loading page" className="fixed inset-x-0 top-0 z-[56] h-[2px] animate-pulse bg-gold" />;
}

/** Shared header, footer and overlays for every page, with page transitions and focus management. */
export function SiteLayout() {
  // Re-render the shop when the live catalogue refreshes (e.g. stock changed in the CRM).
  useCatalogVersion();
  const { pathname } = useLocation();
  const { closeOverlay, closeQuickView, closeLightbox } = useUi();
  const reduce = useReducedMotion();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  // New page: close overlays, return to the top and move focus to the page content.
  useEffect(() => {
    closeOverlay();
    closeQuickView();
    closeLightbox();
    if (first.current) {
      first.current = false;
      return;
    }
    scrollToTop();
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SmoothScrollProvider>
      <a href="#main" className="sr-only z-[100] bg-ink px-4 py-3 text-sm text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <ScrollProgress />
      <RouteProgress />
      <AnnouncementBar />
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className="outline-none">
        {/* The first page paints immediately (no fade) so the hero is never delayed. */}
        <motion.div key={pathname} variants={pageTransition} initial={reduce || first.current ? false : "initial"} animate="enter">
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <MobileMenu />
      <SearchOverlay />
      <WishlistDrawer />
      <CartDrawer />
      <QuickView />
      <Lightbox />
      <BackToTop />
      <div aria-hidden className="grain-overlay" />
      <Cursor />
      <RouteCurtain pathname={pathname} />
    </SmoothScrollProvider>
  );
}

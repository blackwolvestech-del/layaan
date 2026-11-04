import clsx from "clsx";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { placements } from "@/data/assets";
import { collections, imageByFile, products } from "@/data/products";
import { useUi } from "@/context/UiContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { ease, fadeUp, staggerParent } from "@/utils/motion";
import { nextNavState } from "@/utils/navScroll";
import { Icon } from "../ui/Icon";
import { Img } from "../ui/Img";
import { Logo } from "./Logo";
import { announcements, categoryNav, collectionNav, primaryNav } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

const validIds = new Set(products.map((p) => p.id));

/** Scrolling announcement ticker (pauses on hover; static for reduced motion). */
export function AnnouncementBar() {
  const items = [...announcements, ...announcements];
  return (
    <div className="marquee relative z-40 overflow-hidden bg-ink py-2 text-bg" role="region" aria-label="Announcements">
      <ul className="marquee-track flex w-max gap-12 whitespace-nowrap" aria-hidden>
        {items.map((a, i) => (
          <li key={i} className="nav-caps flex items-center gap-12 !text-[0.65625rem]">
            {a}
            <span className="h-1 w-1 rounded-full bg-gold" />
          </li>
        ))}
      </ul>
      <p className="sr-only">{announcements.join(". ")}</p>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          aria-hidden
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 22 }}
          className="absolute top-1 right-0.5 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-gold px-1 text-[0.625rem] font-bold text-accent-contrast tabular-nums"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function useIsActive() {
  const { pathname, search } = useLocation();
  return (to: string) => {
    const [path, query] = to.split("?");
    if (query) return pathname === path && search.includes(query);
    if (to === "/shop") return pathname === "/shop" && !search.includes("category=");
    return pathname === path || (path !== "/" && pathname.startsWith(`${path}/`));
  };
}

function NavItem({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link to={to} className={clsx("nav-caps group relative flex h-11 items-center px-3.5 transition-colors", active ? "text-gold-ink" : "text-ink hover:text-gold-ink")} aria-current={active ? "page" : undefined}>
      {label}
      <span className={clsx("absolute inset-x-3.5 bottom-2 h-px origin-left bg-current transition-transform duration-500 ease-[var(--ease-editorial)]", active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
    </Link>
  );
}

/** Full-width mega menu: shop by category / by collection, with banner imagery. */
function MegaMenu({ open, id, onClose }: { open: boolean; id: string; onClose: () => void }) {
  const banners = collections.slice(0, 3);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          initial={{ opacity: 0, y: -10, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
          exit={{ opacity: 0, y: -6, clipPath: "inset(0 0 100% 0)", transition: { duration: 0.2 } }}
          transition={{ duration: 0.45, ease: ease.editorial }}
          className="absolute inset-x-0 top-full z-50 border-y border-line bg-surface shadow-[0_24px_48px_-24px_rgb(0_0_0/0.25)]"
        >
          <motion.div className="container-x grid grid-cols-[1fr_1fr_3fr] gap-10 py-10" initial="hidden" animate="show" variants={staggerParent(0.04, 0.1)}>
            {[
              { title: "Shop by category", links: [{ to: "/shop", label: "Shop all" }, ...categoryNav] },
              { title: "Shop by collection", links: [{ to: "/collections", label: "All collections" }, ...collectionNav] },
            ].map((col) => (
              <div key={col.title}>
                <motion.p variants={fadeUp} className="nav-caps mb-5 text-muted">
                  {col.title}
                </motion.p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <motion.li key={l.to} variants={fadeUp}>
                      <Link to={l.to} onClick={onClose} className="link-underline text-sm text-ink-2 hover:text-ink">
                        {l.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-4">
              {banners.map((c) => (
                <motion.div key={c.id} variants={fadeUp}>
                  <Link to={`/collections/${c.id}`} onClick={onClose} className="group/b block">
                    <span className="relative block aspect-[4/5] overflow-hidden">
                      <Img image={imageByFile(placements.collectionCovers[c.id])} sizes="240px" className="absolute inset-0 transition-transform duration-[1.2s] ease-[var(--ease-editorial)] group-hover/b:scale-105" decorative />
                    </span>
                    <span className="nav-caps mt-3 flex items-center justify-between">
                      {c.name} <Icon name="arrowRight" size={13} className="transition-transform group-hover/b:translate-x-1" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const { openOverlay } = useUi();
  const { ids } = useWishlist(validIds);
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { scrollY } = useScroll();
  const location = useLocation();
  const isActive = useIsActive();
  // scrolled: past the top of the page. minimal: scrolled and last moving down (compact floating bar).
  const [scrolled, setScrolled] = useState(false);
  const [minimal, setMinimal] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = nextNavState(y, scrollY.getPrevious() ?? y, minimal);
    setScrolled(next.scrolled);
    setMinimal(next.minimal);
  });
  useEffect(() => {
    if (minimal) setMegaOpen(false);
  }, [minimal]);

  // Publish the live header height (--header-h) so pinned sections can sit just below it.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => setMegaOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMegaOpen(false);
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setMegaOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [megaOpen]);

  const hoverMega = (v: boolean) => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    window.clearTimeout(timer.current);
    if (v) setMegaOpen(true);
    else timer.current = window.setTimeout(() => setMegaOpen(false), 180);
  };

  const iconBtn = "relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-surface-2";

  return (
    // The header keeps its height in both states (no layout jump). In the minimal state its
    // background fades away so content scrolls beneath, and only the floating top bar stays.
    <header
      ref={wrap}
      onFocusCapture={() => setMinimal(false)}
      className={clsx(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[var(--ease-editorial)] motion-reduce:transition-none",
        minimal ? "pointer-events-none border-transparent bg-transparent" : "bg-bg/92 backdrop-blur-md",
        !minimal && (scrolled ? "border-line shadow-[0_8px_30px_-20px_rgb(0_0_0/0.35)]" : "border-transparent"),
      )}
    >
      <div className={clsx("container-x transition-[padding] duration-500 ease-[var(--ease-editorial)] motion-reduce:transition-none", minimal && "pt-2")}>
        <div
          className={clsx(
            "pointer-events-auto grid grid-cols-[1fr_auto_1fr] items-center border transition-[height,padding,border-radius,background-color,border-color,box-shadow] duration-500 ease-[var(--ease-editorial)] motion-reduce:transition-none",
            minimal ? "glass h-14 rounded-full px-2 sm:px-3" : "h-[4.5rem] rounded-none border-transparent px-0",
          )}
        >
          <div className="flex items-center gap-1">
            {!minimal && (
              <button type="button" className={clsx(iconBtn, "lg:hidden")} aria-label="Open menu" onClick={() => openOverlay("menu")}>
                <Icon name="menu" />
              </button>
            )}
            <button type="button" className="nav-caps hidden h-11 items-center gap-2 rounded-full px-3 text-muted transition-colors hover:text-ink lg:flex" onClick={() => openOverlay("search")}>
              <Icon name="search" size={18} /> Search
            </button>
            <button type="button" className={clsx(iconBtn, "lg:hidden")} aria-label="Search the collection" onClick={() => openOverlay("search")}>
              <Icon name="search" />
            </button>
            {/* Phones: in the minimal bar the theme switch moves left, where the menu button was. */}
            {minimal && <ThemeToggle className="sm:hidden" />}
          </div>
          <Logo height={scrolled ? 28 : 34} className="transition-all duration-500" />
          <div className="flex items-center justify-end gap-0.5">
            {/* On phones the full bar keeps the theme switch in the menu, leaving room for the bag. */}
            <ThemeToggle className="max-sm:hidden" />
            {/* Account link (full bar only; on phones it lives in the menu). */}
            {!minimal && (
              <Link to={isAuthenticated ? "/account" : "/login"} className={clsx(iconBtn, "max-sm:hidden")} aria-label={isAuthenticated ? "Your account" : "Sign in to your account"}>
                <Icon name="user" />
              </Link>
            )}
            <button type="button" className={iconBtn} aria-label={`Wishlist, ${ids.length} saved`} onClick={() => openOverlay("wishlist")}>
              <Icon name="heart" />
              <CountBadge count={ids.length} />
            </button>
            <button type="button" className={iconBtn} aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`} onClick={() => openOverlay("cart")}>
              <Icon name="bag" />
              <CountBadge count={itemCount} />
            </button>
          </div>
        </div>
      </div>
      <nav
        aria-label="Primary"
        inert={minimal}
        className={clsx(
          "hidden border-t transition-[opacity,transform,border-color] duration-500 ease-[var(--ease-editorial)] motion-reduce:transition-none lg:block",
          minimal ? "pointer-events-none -translate-y-3 border-transparent opacity-0" : "border-line/70",
        )}
      >
        <ul className="flex items-center justify-center">
          {primaryNav.map((item) =>
            item.mega ? (
              <li key={item.to} onPointerEnter={() => hoverMega(true)} onPointerLeave={() => hoverMega(false)}>
                <button
                  type="button"
                  aria-expanded={megaOpen}
                  aria-controls={megaId}
                  onClick={() => setMegaOpen((o) => !o)}
                  className={clsx("nav-caps group relative flex h-11 items-center gap-1 px-3.5 transition-colors", isActive("/collections") || megaOpen ? "text-gold-ink" : "text-ink hover:text-gold-ink")}
                >
                  {item.label}
                  <Icon name="chevronDown" size={13} className={clsx("transition-transform duration-300", megaOpen && "rotate-180")} />
                </button>
              </li>
            ) : (
              <li key={item.to}>
                <NavItem to={item.to} label={item.label} active={isActive(item.to)} />
              </li>
            ),
          )}
        </ul>
        <div onPointerEnter={() => hoverMega(true)} onPointerLeave={() => hoverMega(false)}>
          <MegaMenu open={megaOpen} id={megaId} onClose={() => setMegaOpen(false)} />
        </div>
      </nav>
    </header>
  );
}

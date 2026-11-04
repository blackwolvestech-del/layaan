import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { categories, collections, products } from "@/data/products";
import { matchesQuery } from "@/utils/catalogue";
import { fadeUp, staggerParent } from "@/utils/motion";
import { useUi } from "@/context/UiContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/currency";
import { useWishlist } from "@/hooks/useWishlist";
import { Link, useNavigate } from "react-router";
import { CartLineItem } from "@/components/commerce/CartLineItem";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { EmptyState } from "@/components/ui/misc";
import { collectionNav, helpNav, primaryNav } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

const names = Object.fromEntries([...categories, ...collections].map((t) => [t.id, t.name]));
const validIds = new Set(products.map((p) => p.id));

export function MobileMenu() {
  const { overlay, closeOverlay, openOverlay } = useUi();
  const { ids } = useWishlist(validIds);
  const { isAuthenticated, customer } = useAuth();
  const { itemCount } = useCart();

  return (
    <Drawer open={overlay === "menu"} onOpenChange={(o) => !o && closeOverlay()} title="Menu" side="left">
      <nav aria-label="Mobile" className="px-5 py-6">
        <motion.ul className="space-y-1" initial="hidden" animate="show" variants={staggerParent(0.05, 0.1)}>
          {[{ to: "/", label: "Home" }, ...primaryNav].map((item) => (
            <motion.li key={item.to} variants={fadeUp}>
              <Link to={item.to} onClick={closeOverlay} className="nav-caps flex min-h-13 items-center justify-between border-b border-line !text-[0.8125rem]">
                {item.label}
                <Icon name="arrowRight" size={16} className="text-muted" />
              </Link>
              {"mega" in item && item.mega && (
                <ul className="mt-1 mb-3 space-y-1 pl-4">
                  {collectionNav.map((c) => (
                    <li key={c.to}>
                      <Link to={c.to} onClick={closeOverlay} className="flex min-h-11 items-center text-sm text-ink-2">
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </motion.li>
          ))}
        </motion.ul>

        <div className="mt-6 border-t border-line pt-4">
          <p className="nav-caps mb-3 text-muted">Account & Services</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to={isAuthenticated ? "/account" : "/login"}
                onClick={closeOverlay}
                className="flex min-h-11 items-center justify-between border border-line px-4 font-medium"
              >
                <span className="flex items-center gap-2">
                  <Icon name="user" size={18} />
                  {isAuthenticated ? (customer ? `${customer.firstName}'s Account` : "Your Account") : "Sign in / Register"}
                </span>
                <Icon name="chevronRight" size={14} className="text-muted" />
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                onClick={closeOverlay}
                className="flex min-h-11 items-center justify-between border border-line px-4 font-medium"
              >
                <span className="flex items-center gap-2">
                  <Icon name="bag" size={18} />
                  Shopping Bag ({itemCount})
                </span>
                <Icon name="chevronRight" size={14} className="text-muted" />
              </Link>
            </li>
          </ul>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-x-4 text-sm text-muted">
          {helpNav.map((l) => (
            <li key={l.to}>
              <Link to={l.to} onClick={closeOverlay} className="flex min-h-10 items-center hover:text-ink">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
          <button type="button" onClick={() => openOverlay("cart")} className="flex min-h-12 items-center gap-2 border border-line px-4">
            <Icon name="bag" size={18} /> Bag ({itemCount})
          </button>
          <Link to="/wishlist" className="flex min-h-12 items-center gap-2 border border-line px-4">
            <Icon name="heart" size={18} /> Wishlist ({ids.length})
          </Link>
          <button type="button" onClick={() => openOverlay("search")} className="flex min-h-12 items-center gap-2 border border-line px-4">
            <Icon name="search" size={18} /> Search
          </button>
          <Link to="/account/orders" className="flex min-h-12 items-center gap-2 border border-line px-4">
            <Icon name="box" size={18} /> Orders
          </Link>
          <div className="col-span-2 flex min-h-12 items-center justify-between border border-line pl-4">
            Light / dark theme <ThemeToggle />
          </div>
        </div>
      </nav>
    </Drawer>
  );
}

export function SearchOverlay() {
  const { overlay, closeOverlay, openQuickView } = useUi();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const deferred = useDeferredValue(q.trim());
  const results = useMemo(() => (deferred.length > 1 ? products.filter((p) => matchesQuery(p, deferred, names)) : []), [deferred]);
  useEffect(() => {
    if (overlay !== "search") setQ("");
  }, [overlay]);

  return (
    <Drawer open={overlay === "search"} onOpenChange={(o) => !o && closeOverlay()} title="Search the collection" side="top" hideTitle className="!max-w-none">
      <div className="container-x py-6 sm:py-10">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) {
              closeOverlay();
              navigate(`/search?q=${encodeURIComponent(q.trim())}`);
            }
          }} className="flex items-center gap-3 border-b border-ink/70 pb-3">
          <Icon name="search" size={22} className="text-muted" />
          <label htmlFor="site-search" className="sr-only">
            Search the collection
          </label>
          <input
            id="site-search"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search suits, sleeves, colours…"
            className="min-h-12 min-w-0 flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-muted/70 sm:text-4xl"
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="button" onClick={closeOverlay} className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-surface-2" aria-label="Close search">
            <Icon name="close" />
          </button>
        </form>
        <div className="mt-6 min-h-24">
          <p className="sr-only" aria-live="polite">
            {deferred.length > 1 ? `${results.length} results` : ""}
          </p>
          {deferred.length > 1 && results.length === 0 && <p className="text-sm text-muted">No outfits match “{deferred}”. Try a colour or “suit”, “sleeve”, “longline”.</p>}
          {results.length > 0 && (
            <Link to={`/search?q=${encodeURIComponent(deferred)}`} onClick={closeOverlay} className="mb-4 inline-flex min-h-10 items-center gap-2 text-xs font-semibold tracking-[0.16em] text-gold-ink uppercase">
              See all {results.length} results <Icon name="arrowRight" size={14} />
            </Link>
          )}
          {results.length > 0 && (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {results.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => openQuickView(p.id)} className="group block w-full text-left">
                    <Img image={p.images[0]} sizes="180px" className="aspect-[3/4] rounded-[2px]" />
                    <span className="product-title mt-2 block text-xs leading-snug group-hover:underline">{p.label}</span>
                    <span className="block text-xs text-muted">{p.colour}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {deferred.length <= 1 && (
            <div className="flex flex-wrap gap-2">
              <span className="code-accent mr-2 self-center">try:</span>
              {["Suit", "Sleeve", "Satin", "Ivory", "Longline", "Skirt", "Emerald"].map((s) => (
                <button key={s} type="button" onClick={() => setQ(s)} className="min-h-10 rounded-full border border-line px-4 text-xs hover:border-ink">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export function WishlistDrawer() {
  const { overlay, closeOverlay, openQuickView } = useUi();
  const { ids, toggle, clear } = useWishlist(validIds);
  const saved = ids.map((id) => products.find((p) => p.id === id)!).filter(Boolean);
  return (
    <Drawer
      open={overlay === "wishlist"}
      onOpenChange={(o) => !o && closeOverlay()}
      title={`Wishlist${saved.length ? ` (${saved.length})` : ""}`}
      description="Saved on this device only"
      footer={
        saved.length > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <Link to="/wishlist" onClick={closeOverlay} className="text-xs font-semibold tracking-[0.14em] uppercase underline underline-offset-4">
              Open wishlist page
            </Link>
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear all
            </Button>
          </div>
        ) : null
      }
    >
      {saved.length === 0 ? (
        <EmptyState
          icon="heart"
          title="Nothing saved yet"
          body="Tap the heart on any outfit to keep it here. Your wishlist stays on this device."
          action={
            <ButtonLink to="/shop" variant="outline" onClick={closeOverlay}>
              Browse the pieces
            </ButtonLink>
          }
        />
      ) : (
        <ul className="divide-y divide-line px-5 sm:px-6">
          {saved.map((p) => (
            <motion.li key={p.id} layout className="flex gap-4 py-5">
              <button type="button" onClick={() => openQuickView(p.id)} className="w-20 shrink-0" aria-label={`Quick view: ${p.label}`}>
                <Img image={p.images[0]} sizes="80px" className="aspect-[3/4] rounded-[2px]" />
              </button>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <button type="button" onClick={() => openQuickView(p.id)} className="product-title text-left text-sm leading-tight hover:underline">
                  {p.label}
                </button>
                <p className="text-xs text-muted">{p.colour}</p>
                <button type="button" onClick={() => toggle(p.id)} className="mt-auto self-start text-xs underline underline-offset-4">
                  Remove
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}

export function CartDrawer() {
  const { overlay, closeOverlay } = useUi();
  const { items, subtotal, itemCount } = useCart();
  return (
    <Drawer
      open={overlay === "cart"}
      onOpenChange={(o) => !o && closeOverlay()}
      title={`Your bag${itemCount ? ` (${itemCount})` : ""}`}
      description="Saved on this device"
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="nav-caps">Subtotal</span>
              <span className="text-base font-semibold tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted">Shipping is shown at checkout.</p>
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink to="/cart" variant="outline" onClick={closeOverlay}>
                View bag
              </ButtonLink>
              <ButtonLink to="/checkout" onClick={closeOverlay}>
                Checkout
              </ButtonLink>
            </div>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon="bag"
          title="Your bag is empty"
          body="Add a look from the collection and it will wait here, even if you refresh."
          action={
            <ButtonLink to="/shop" variant="outline" onClick={closeOverlay}>
              Continue shopping
            </ButtonLink>
          }
        />
      ) : (
        <ul className="divide-y divide-line px-5 sm:px-6">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CartLineItem key={item.id} item={item} compact onNavigate={closeOverlay} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Drawer>
  );
}

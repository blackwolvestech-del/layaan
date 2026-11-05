# LAYAAN Atelier — storefront

The LAYAAN Atelier website. It shares **one Supabase database with the LAYAAN CRM**
(`../Lyaan-CRM`): products, photos, prices and per-size stock are managed in the CRM and read
live here; orders placed here appear in the CRM immediately, and status changes made in the CRM
show on the customer's order pages.

The interface follows a modern fashion-retail layout (announcement ticker, centred logo, uppercase
navigation with a mega menu, full-width hero slider, category tiles, product carousels, "shop the
look"), in both light and dark themes, with Motion (motion.dev) animations throughout.

Stack: React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router 8 · Motion · Radix UI dialogs ·
GSAP ScrollTrigger (lookbook strip only) · Lenis (optional smooth scrolling) · Three.js (one decorative layer).

## Quick start


Requires Node.js 22.12 or newer. Everything runs from the project root.

```bash
npm install
cp .env.example .env.local   # then fill in the values (see "Environment variables")
npm run dev        # http://localhost:5173 — also serves the /api functions locally
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build at http://localhost:4173
```

| Script | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript project check (`tsc -b`) |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest + jsdom, against an in-memory fake of the database/API) |
| `npm run catalog:fixture` | Refreshes `tests/fixtures/catalog.json` from the live catalogue |
| `npm run assets:build` | Regenerates optimised images/video from `assets/source/` (see below) |
| `npm run assets:contact-sheets` | Labelled contact sheets of the original photos, for cataloguing |

## Project structure

```
index.html                 HTML shell (theme applied before first paint; noindex for the demo)
public/
  images/products/         optimised outfit photographs, one folder per look (+ editorial/)
  images/brand/            logo (gold lettering keyed from the supplied artwork), favicons
  videos/                  campaign reel (H.264 MP4) and poster
  _redirects               SPA fallback for Netlify / Cloudflare Pages
src/
  main.tsx                 entry point (theme, Motion and UI providers)
  App.tsx                  React Router route table
  pages/                   one file per route (see "Pages and routes")
  sections/                large page sections: Hero, CategoryTiles, ShopTheLook, ReelBanner,
                           Lookbook (horizontal strip), FeaturedCollections, CampaignGallery, BrandIntro
  components/
    layout/                SiteLayout (shared shell), Header + mega menu + announcement ticker,
                           Footer, Overlays (mobile menu, search, wishlist drawer), PageHeader,
                           PagePlaceholder, RouteError, nav.ts (all navigation links)
    product/               ProductCard, ProductGrid, ProductRail (carousel), ProductGallery,
                           ProductInfo, QuickView, Lightbox
    catalogue/             CatalogueBrowser (search + filters + grid, state in the URL)
    media/                 ReelPlayer, SilkCanvas (Three.js)
    ui/                    Button/ButtonLink, Drawer/Modal, Img, Icon, SectionTitle, misc
  context/                 ThemeContext (light/dark), UiContext (overlays, quick view, lightbox, toasts)
  hooks/                   useWishlist (device-only), useCatalogueParams (URL filter state)
  data/                    local demo data: products, copy (hero slides, rails), asset placements,
                           catalog.generated.json
  types/                   Product and catalogue types (the contract a future API should satisfy)
  utils/                   search/filter logic, motion tokens, scroll helpers
  styles/index.css         design tokens (light + dark) and global styles
tests/unit/                Vitest unit tests
scripts/assets/            asset pipeline: outfit grouping, derivatives, catalogue export
assets/
  manifest.json            source file → look → derivative → placement map
  reference/               supplied logo artwork and packaging PDF (not served)
  source/                  original photographs and reel (git-ignored, not served)
```

## Design system

- **Colours:** semantic CSS variables in `src/styles/index.css` (`--bg`, `--ink`, `--gold`, …),
  redefined under `[data-theme="dark"]`. Every component uses the tokens, so both themes are complete.
- **Type:** Manrope for interface text and uppercase headings (`.heading-caps`, `.page-title`,
  `.nav-caps`); Fraunces for display lines and italic taglines (`.tagline`). Both self-hosted (OFL).
- **Headings:** homepage sections use `SectionTitle` (centred uppercase title + italic tagline +
  "View all"); inner pages use `PageHeader` (breadcrumbs, eyebrow, title, tagline).
- **Motion:** shared durations and easings in `src/utils/motion.ts`. Everything honours
  `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` plus CSS fallbacks).

## What the site does

- Multi-page navigation with page transitions, scroll-to-top and focus moved to the new page.
- Announcement ticker, sticky header that compacts on scroll, and a collections mega menu
  (hover, click, Escape and outside-click to close).
- Hero slider: three looks, each shown as a three-photo triptych (single photo on mobile), with slow zoom,
  staggered text, auto-advance with a progress bar, pause on hover/focus, arrows and keyboard support.
- Category tiles, product carousels per collection, "shop the look", and a reel banner with parallax.
- Shop, collection and search pages with local search and filters (category, collection, colour)
  stored in the URL, so filtered views can be shared and the back button works.
- Product pages with a photo gallery, lightbox with zoom, and related looks; quick view from any card.
- Lookbook page (all looks, horizontal strip, campaign gallery) and campaign reel with play/pause and sound.
- Wishlist (drawer and page), saved only in the browser on the current device (`localStorage`).
- Light/dark theme toggle: follows the system until chosen, then remembered on the device.

Not included (hidden, by design): prices, sizes, stock, cart, checkout, accounts, forms, reviews,
offers. Product pages and the quick view state that ordering opens at launch.

## Pages and routes

All pages share `src/components/layout/SiteLayout.tsx` (header, footer, overlays, theme), so a page
file only renders its own content. Pages marked **Scaffold** render `PagePlaceholder`
("Page under development") and have a `TODO` comment describing what the assigned developer should build.

| Route | File | Status |
| --- | --- | --- |
| `/` | `src/pages/Home.tsx` | Built |
| `/shop` | `src/pages/Shop.tsx` | Built |
| `/collections` | `src/pages/Collections.tsx` | Built |
| `/collections/:slug` | `src/pages/Collection.tsx` | Built |
| `/products/:slug` | `src/pages/ProductDetails.tsx` | Built |
| `/search?q=` | `src/pages/SearchResults.tsx` | Built |
| `/wishlist` | `src/pages/Wishlist.tsx` | Built |
| `/lookbook` | `src/pages/Lookbook.tsx` | Built |
| `/about` | `src/pages/About.tsx` | Built (brand story pending approved copy) |
| `/cart` | `src/pages/Cart.tsx` | Scaffold |
| `/checkout` | `src/pages/Checkout.tsx` | Scaffold |
| `/order-confirmation/:orderId` | `src/pages/OrderConfirmation.tsx` | Scaffold |
| `/track-order` | `src/pages/OrderTracking.tsx` | Scaffold |
| `/login` | `src/pages/Login.tsx` | Scaffold |
| `/register` | `src/pages/Register.tsx` | Scaffold |
| `/forgot-password` | `src/pages/ForgotPassword.tsx` | Scaffold |
| `/reset-password` | `src/pages/ResetPassword.tsx` | Scaffold |
| `/verify-email` | `src/pages/VerifyEmail.tsx` | Scaffold |
| `/account` | `src/pages/Account.tsx` | Scaffold |
| `/account/orders` | `src/pages/Orders.tsx` | Scaffold |
| `/account/orders/:orderId` | `src/pages/OrderDetails.tsx` | Scaffold |
| `/account/addresses` | `src/pages/Addresses.tsx` | Scaffold |
| `/account/settings` | `src/pages/AccountSettings.tsx` | Scaffold |
| `/contact` | `src/pages/Contact.tsx` | Scaffold |
| `/faq` | `src/pages/FAQ.tsx` | Scaffold |
| `/size-guide` | `src/pages/SizeGuide.tsx` | Scaffold |
| `/shipping` | `src/pages/Shipping.tsx` | Scaffold |
| `/returns` | `src/pages/Returns.tsx` | Scaffold |
| `/privacy-policy` | `src/pages/PrivacyPolicy.tsx` | Scaffold |
| `/terms` | `src/pages/Terms.tsx` | Scaffold |
| `/admin`, `/admin/orders` | `src/pages/admin/AdminOrders.tsx` | Built (back office, admin sign-in) |
| `/admin/orders/:orderId` | `src/pages/admin/AdminOrderDetails.tsx` | Built (incl. Custom Size Measurements) |
| any other path | `src/pages/NotFound.tsx` | Built |

To add a page: create it in `src/pages/`, register it in the `routes` array in `src/App.tsx`
(lazy-loaded like the others), start it with `PageHeader`, and add any links to
`src/components/layout/nav.ts`.

## Supabase integration

### Architecture

```
Browser (Vite SPA)                         Vercel Functions (/api, server only)          Supabase (shared with CRM)
───────────────────                        ──────────────────────────────────           ──────────────────────────
catalogue  ── rpc storefront_catalog ───────────────────────────────────────────────▶  products, product_images,
              rpc storefront_product / storefront_settings  (anon, read-only)           product_variants, store_settings
account    ── Supabase Auth + rpc my_customer / my_orders / my_order (own data only) ▶  customers, orders, order_items…
checkout   ── POST /api/orders ─────────▶  service key → rpc create_storefront_order ─▶  orders + items + stock − + CRM notification
tracking   ── POST /api/orders/lookup ──▶  service key → rpc storefront_order_lookup
returns    ── POST /api/returns ────────▶  service key → rpc storefront_request_return ▶ order activity + CRM notification
```

* **Tables stay closed to the public.** The browser never queries tables; it calls SECURITY
  DEFINER functions that return a fixed public shape (ACTIVE products only, no staff notes).
* **The service key never reaches the browser.** It is a server-only variable read by `api/_lib/server.ts`.
* SQL lives in the CRM repo: `../Lyaan-CRM/supabase/migrations/20261105000012…14` (image rules,
  size inventory, storefront access). All three are applied to the live project.

### Products, images and categories

* `src/data/catalogStore.ts` loads the catalogue before the app renders (branded loading/error
  screen in `src/main.tsx`), maps rows onto the existing `Product` shape, refreshes on tab focus
  (after 60 s), and re-reads a product on its page and every bag product before checkout.
* Product URLs are unchanged: `/products/<key>`, where `key` is the product's `legacy_id` (the
  original look key) or its slug for products created in the CRM.
* **Collections and categories keep the site's own names, order, banners and images**
  (`catalog.generated.json`). The CRM assigns products to them by the same identifiers:
  category slug (`suits-co-ords`, `tops-blouses`, `longline-styles`) and collection keys in
  `products.collections` (`tailoring`, `statement-sleeves`, `occasion`, `everyday-to-evening`).
  Empty sections show the existing empty state.
* Images keep their stored order (position 0 = card/cover). URLs pointing at the site's own
  `/images/products/...` use the optimised AVIF/WebP derivatives; images uploaded in the CRM
  (`/uploads/...`) are served from the public Supabase Storage bucket `uploads`.
* Display order: products newly created in the CRM first (newest first), then the original looks
  in the site's existing editorial order. Shop sorting/filters work on the live data.

### Inventory, cart and checkout

* Stock is per size (`product_variants.stock`). Sold-out sizes are shown struck through and can't
  be selected; quantities are capped at the size's stock; the bag flags lines that are sold out
  or over stock; checkout re-checks live stock before sending.
* The database is the authority: `create_storefront_order` locks each size row, recomputes
  prices, delivery (standard/express/free threshold from store settings) and totals, refuses to
  oversell, creates the order, items, status event and CRM notification, and deducts stock — all
  in one transaction, idempotent on the checkout attempt key. Orders are cash on delivery and
  start as payment **PENDING**; nothing is ever marked paid by the storefront.
* Made-to-measure products (`measurement_profile`) take the customer's measurements (inches);
  they are stored on the order item with production status `QUEUED` and never touch size stock.
* Cancelling/returning an order in the CRM restores the size stock (`update_order_status`).

### Customer accounts

* Supabase Auth. Sign-up sends `account_type: "customer"`; the database then creates/links a
  `customers` row (once the email is confirmed) instead of a CRM staff profile, so customers have
  no CRM access. Guest orders with the same email appear in the account after confirmation.
* Order history and details use `my_orders` / `my_order` (only the caller's orders). Guests see
  their confirmation during the visit and can track with order number + checkout email/phone.
* The default address is stored on the CRM customer record; extra addresses are a device-only
  address book. Communication preferences are device-only.

### Required Supabase dashboard settings

1. **Authentication → Providers → Email:** enable sign-ups (the CRM disabled public sign-up).
2. **Authentication → Email Templates → Confirm signup:** include `{{ .Token }}` so customers get
   the 6-digit code the verify page asks for (the link in the same email also works).
3. **Authentication → URL Configuration:** add the storefront origins (e.g.
   `https://layaan.vercel.app/**`, `http://localhost:5173/**`) to the redirect allow list so
   confirmation and password-reset links return to the site.

## Environment variables

| Name | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | browser + server | Project URL (same as the CRM) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | browser + server | Publishable/anon key (`VITE_SUPABASE_ANON_KEY` also accepted) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Used by `/api` to place and look up orders. Never prefix with `VITE_` |
| `VITE_CRM_URL` | browser (optional) | CRM origin, linked from `/admin` |

`.env.local` is git-ignored; `.env.example` lists the names with placeholders.

## Made-to-measure sizing and the back office

- Products with a `measurement_profile` (`upper`, `trouser`, `two-piece`) offer "Customize your
  size" with the matching fields; others use their size chart and per-size stock.
- Entries in progress are kept per product for the browser session; measurements are stored on
  the bag line and saved with the order item, shown in the bag, checkout, confirmation, the
  customer's order pages and the CRM (Orders / Custom orders).
- The back office is the **LAYAAN CRM**. The storefront's `/admin` routes now point there.

## Regenerating media

Originals live in `assets/source/photos` and `assets/source/reels` (git-ignored). To rebuild derivatives:

```bash
npm run assets:build
```

This writes AVIF/WebP at 480/800/1200/1800 px widths plus a 1200 px JPEG fallback per photo
(content-hashed filenames), the keyed logo, and a 720p H.264 reel with poster, then refreshes
`assets/manifest.json` and `src/data/catalog.generated.json`. Existing outputs are skipped, so
re-runs are quick; a full rebuild from scratch takes a long time because of AVIF encoding.

## Deployment (Vercel)

* Framework preset **Vite**; build `npm run build`; output `dist/`. Functions in `/api` deploy
  automatically (Node.js runtime).
* `vercel.json` rewrites every path **except `/api/*`** to `index.html` (SPA routing).
* Set the variables from "Environment variables" for Production and Preview, then redeploy.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| "We couldn't load the collection" on start | `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` set at build time; project not paused |
| "The order service isn't reachable" at checkout | `/api` deployed (not rewritten to `index.html`); restart `npm run dev` after config changes |
| "Order service is not configured" (503) | `SUPABASE_SERVICE_ROLE_KEY` missing on the server |
| Every size shows sold out | Enter per-size stock in the CRM (Inventory) — new and imported products start at 0 |
| Product missing from the shop | Product must be **Active** in the CRM (needs 4–9 images) |
| Sign-up says accounts can't be created | Enable email sign-ups in Supabase Auth |

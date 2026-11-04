# LAYAAN Atelier — storefront demo

A **frontend-only**, multi-page demonstration of the LAYAAN Atelier storefront, built for client
approval. It runs entirely as a static React site: no server, database, accounts, payments, email
or API. Backend development starts only after the demo is approved.

The interface follows a modern fashion-retail layout (announcement ticker, centred logo, uppercase
navigation with a mega menu, full-width hero slider, category tiles, product carousels, "shop the
look"), in both light and dark themes, with Motion (motion.dev) animations throughout.

Stack: React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router 8 · Motion · Radix UI dialogs ·
GSAP ScrollTrigger (lookbook strip only) · Lenis (optional smooth scrolling) · Three.js (one decorative layer).

## Quick start


Requires Node.js 22.12 or newer. Everything runs from the project root.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build at http://localhost:4173
```

| Script | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript project check (`tsc -b`) |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest + jsdom) |
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

## What the demo does

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

## Demo data

`src/data/catalog.generated.json` is produced by `scripts/assets` from the local photographs.
The 117 photographs were grouped visually into **13 looks** (plus 4 two-look editorial shots);
the 6 photos of a removed look are listed in `excludedPhotos`. See `scripts/assets/catalog.mjs`. Look names are **descriptive labels**, not official product names.
Nothing about prices, fabrics, care, sizes, origin, founders, offers or reviews is stated anywhere.

Editable content:
- Hero slides and homepage carousels — `src/data/copy.ts` (`heroSlides`, `homeRails`)
- Brand introduction and pillars — `src/data/copy.ts` (`copy.intro`)
- Collection covers, lookbook strip and gallery photos — `src/data/assets.ts`
- Navigation and announcement ticker — `src/components/layout/nav.ts`

To connect a real backend after approval, provide data in the shapes defined in `src/types/`
and replace the imports in `src/data/`; components receive plain props and don't fetch anything.

## Made-to-measure sizing and the back office

- Every product **without** a size chart (`src/data/sizeCharts.ts`) gets a `measurementProfile`
  derived from its pieces (`measurementProfileFor` in `src/utils/measurements.ts`): `upper`
  (10 fields), `trouser` (8) or `two-piece` (both). Its purchase panel offers "Customize your size"
  instead of XS–XL. Products with a chart are unchanged.
- Entries in progress are kept per product for the browser session; once added, measurements (inches)
  are stored on the bag line, copied onto the order item and shown in the bag, checkout,
  confirmation, Account → Orders and `/admin/orders/:id` ("Custom Size Measurements").
- Order access: an order is visible to the signed-in account that placed it and to the browser
  session that placed it (`canViewOrder` in `src/services/local.ts`). Checkout sends an idempotency
  key so a retry never creates a second order, and an order is only confirmed once it has been saved.
- Back office: set `VITE_ADMIN_ACCESS_CODE` (e.g. in a git-ignored `.env.development.local`, or in
  the hosting environment). Without it `/admin` shows "Admin access is not configured".

**Preview limitation:** there is no backend yet, so orders live in each browser's `localStorage`
and the admin code is compiled into the client bundle. This gates the screens but is not real
security, and the admin only sees orders stored in the same browser. Before launch, implement
`OrderService` and `AdminOrderService` (`src/services/types.ts`) against an API that authenticates
customers and administrators and enforces the same ownership rule server-side.

## Regenerating media

Originals live in `assets/source/photos` and `assets/source/reels` (git-ignored). To rebuild derivatives:

```bash
npm run assets:build
```

This writes AVIF/WebP at 480/800/1200/1800 px widths plus a 1200 px JPEG fallback per photo
(content-hashed filenames), the keyed logo, and a 720p H.264 reel with poster, then refreshes
`assets/manifest.json` and `src/data/catalog.generated.json`. Existing outputs are skipped, so
re-runs are quick; a full rebuild from scratch takes a long time because of AVIF encoding.

## Deployment

`npm run build` outputs a static site in `dist/`. Because routes are handled in the browser,
the host must serve `index.html` for unknown paths so deep links and refreshes work:
`public/_redirects` does this on Netlify/Cloudflare Pages; on other hosts configure an equivalent
SPA fallback (e.g. a Vercel rewrite of `/(.*)` to `/index.html`). `npm run preview` already does
this locally. The site carries `noindex` while it is a demo.

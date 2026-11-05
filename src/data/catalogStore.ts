// Live catalogue from the shared Supabase database (the CRM is where products, prices, photos and
// per-size stock are managed). `storefront_catalog()` returns every ACTIVE product; this module
// maps those rows onto the storefront's own Product / ProductOffer shapes so pages and components
// keep working unchanged.
//
// The catalogue is loaded once before the app renders (see main.tsx), refreshed when the tab
// regains focus, and single products are refreshed on their product page and at checkout, so
// stock changes made in the CRM show up without a reload.
import { useSyncExternalStore } from "react";
import { isSupabaseConfigured, supabase, supabaseUrl } from "@/lib/supabase";
import type { Money, ProductOffer, SizeId, VariantOffer } from "@/types/commerce";
import type { MeasurementProfile } from "@/types/measurements";
import type { CategoryId, CollectionId, Product, ProductImage, ProductSizeChart } from "@/types/product";
import type { SourceImage } from "@/types/catalog";
import { catalog } from "./catalog";

/** Row shape returned by the `storefront_catalog()` / `storefront_product()` RPCs. */
export interface DbProduct {
  id: string;
  key: string;
  slug: string;
  name: string;
  sku: string;
  category: { slug: string; name: string } | null;
  colour: string;
  collections: string[];
  includedPieces: string[];
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  trackInventory: boolean;
  forceOutOfStock: boolean;
  measurementProfile: MeasurementProfile | null;
  sizeChart: ProductSizeChart | null;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  images: { url: string; alt: string }[];
  variants: { id: string; size: string; sku: string; price: number; stock: number | null }[];
}

export interface StoreSettings {
  currency: string;
  standardShipping: Money;
  expressShipping: Money;
  freeShippingOver: Money | null;
  customLeadWeeksMin: number;
  customLeadWeeksMax: number;
  lowStockThreshold: number;
}

// ---------------------------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------------------------

function focalFor(view: string | null): { focalX: number; focalY: number } {
  switch (view) {
    case "portrait":
      return { focalX: 50, focalY: 22 };
    case "detail":
      return { focalX: 50, focalY: 45 };
    case "seated":
      return { focalX: 50, focalY: 40 };
    default:
      return { focalX: 50, focalY: 28 };
  }
}

export function toProductImage(img: SourceImage): ProductImage {
  return {
    id: img.file.replace(/\.[a-z]+$/i, ""),
    basePath: img.basePath,
    width: img.width,
    height: img.height,
    alt: img.alt,
    placeholder: img.placeholder,
    view: img.view,
    ...focalFor(img.view),
  };
}

const sourceByBasePath = new Map<string, SourceImage>([...catalog.looks.flatMap((l) => l.images), ...catalog.editorial].map((i) => [i.basePath, i]));

/** "/images/products/<look>/<file>-<width>.<ext>" (absolute or relative) → its derivative base path. */
const LOCAL_DERIVATIVE = /(\/images\/products\/[^/?#]+\/[^/?#]+?)-\d+\.(?:jpe?g|webp|avif|png)(?:[?#].*)?$/i;

/** Absolute URL for an image the CRM stored (`/uploads/...` lives in the public Storage bucket). */
export function resolveImageUrl(url: string): string {
  if (url.startsWith("/uploads/")) return `${supabaseUrl}/storage/v1/object/public/uploads/${url.slice("/uploads/".length)}`;
  return url;
}

/**
 * A database image as a ProductImage. Photographs already optimised in /public keep their
 * responsive AVIF/WebP derivatives; images uploaded through the CRM are served as uploaded.
 */
export function dbImage(url: string, alt: string, index: number): ProductImage {
  const local = LOCAL_DERIVATIVE.exec(url)?.[1];
  const source = local ? sourceByBasePath.get(local) : undefined;
  if (local && source) return { ...toProductImage(source), alt: alt || source.alt };
  return {
    id: `img-${index}-${url.split("/").pop() ?? index}`,
    basePath: local ?? "",
    src: local ? undefined : resolveImageUrl(url),
    // Product photography is portrait; the real size is unknown for uploads.
    width: 900,
    height: 1600,
    alt,
    placeholder: "",
    view: null,
    focalX: 50,
    focalY: 28,
  };
}

// ---------------------------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------------------------

const lookByKey = new Map(catalog.looks.map((l) => [l.key, l]));
const editorialOrder = new Map(catalog.looks.map((l, i) => [l.key, i]));

/**
 * Display order: products newly added in the CRM first (newest first), then the original looks in
 * the site's existing editorial order — so the current pages keep their arrangement.
 */
function byDisplayOrder(a: DbProduct, b: DbProduct) {
  const ia = editorialOrder.get(a.key);
  const ib = editorialOrder.get(b.key);
  if (ia === undefined && ib === undefined) return b.createdAt.localeCompare(a.createdAt);
  if (ia === undefined) return -1;
  if (ib === undefined) return 1;
  return ia - ib;
}

function toProduct(row: DbProduct): Product {
  const look = lookByKey.get(row.key);
  return {
    id: row.key,
    dbId: row.id,
    label: row.name,
    colour: row.colour,
    category: (row.category?.slug ?? "") as CategoryId,
    collections: row.collections as CollectionId[],
    description: row.description || row.shortDescription,
    includedPieces: row.includedPieces,
    // Styling notes are editorial, from the photo shoot; they are not stored in the CRM.
    unconfirmedPieces: look?.unconfirmedPieces ?? [],
    stylingProps: look?.stylingProps ?? [],
    images: row.images.map((i, n) => dbImage(i.url, i.alt, n)),
    sizeChart: row.sizeChart && typeof row.sizeChart === "object" && Array.isArray(row.sizeChart.sections) ? row.sizeChart : null,
    measurementProfile: row.measurementProfile,
    createdAt: row.createdAt,
    featured: row.featured,
  };
}

function toOffer(row: DbProduct): ProductOffer {
  const variants: VariantOffer[] = row.variants.map((v) => ({ id: v.id, size: v.size as SizeId, sku: v.sku, price: v.price, stock: row.forceOutOfStock ? 0 : v.stock }));
  const custom = row.measurementProfile !== null;
  const available = !row.forceOutOfStock && (custom || (variants.length > 0 ? variants.some((v) => v.stock === null || v.stock > 0) : row.stockStatus !== "OUT_OF_STOCK"));
  return {
    productId: row.key,
    price: row.price,
    compareAt: row.compareAtPrice && row.compareAtPrice > row.price ? row.compareAtPrice : null,
    priceConfirmed: true,
    sizes: variants.map((v) => v.size),
    variants,
    available,
    madeToMeasure: custom,
  };
}

// ---------------------------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------------------------

/** Live arrays: filled in place so modules that imported them keep the same reference. */
export const liveProducts: Product[] = [];
const offerMap = new Map<string, ProductOffer>();
let settings: StoreSettings | null = null;
let version = 0;
let loadedAt = 0;
const listeners = new Set<() => void>();

function emit() {
  version += 1;
  listeners.forEach((l) => l());
}

/** Replaces the whole catalogue (also used by tests with a fixture). */
export function setCatalog(rows: DbProduct[], nextSettings?: StoreSettings | null) {
  liveProducts.splice(0, liveProducts.length, ...[...rows].sort(byDisplayOrder).map(toProduct));
  offerMap.clear();
  rows.forEach((r) => offerMap.set(r.key, toOffer(r)));
  if (nextSettings !== undefined) settings = nextSettings;
  loadedAt = Date.now();
  emit();
}

/** Updates (or removes, when null) one product after a fresh read. */
function upsertProduct(key: string, row: DbProduct | null) {
  const at = liveProducts.findIndex((p) => p.id === key);
  if (!row) {
    if (at >= 0) liveProducts.splice(at, 1);
    offerMap.delete(key);
  } else {
    const product = toProduct(row);
    if (at >= 0) liveProducts[at] = product;
    else liveProducts.push(product);
    offerMap.set(row.key, toOffer(row));
  }
  emit();
}

export const offerFor = (productId: string): ProductOffer | undefined => offerMap.get(productId);
export const storeSettings = () => settings;

/** Stock for one size: a number, or null when the size is not stock-limited. 0 when unknown. */
export function stockFor(productId: string, size: string): number | null {
  const offer = offerMap.get(productId);
  if (!offer) return 0;
  if (size === "Custom") return offer.madeToMeasure && offer.available ? null : 0;
  const v = offer.variants.find((x) => x.size.toLowerCase() === size.toLowerCase());
  return v ? v.stock : 0;
}

export function variantFor(productId: string, size: string): VariantOffer | undefined {
  return offerMap.get(productId)?.variants.find((v) => v.size.toLowerCase() === size.toLowerCase());
}

// ---------------------------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------------------------

export class CatalogUnavailableError extends Error {
  override name = "CatalogUnavailableError";
}

async function fetchAll(): Promise<{ rows: DbProduct[]; settings: StoreSettings | null }> {
  if (!isSupabaseConfigured) throw new CatalogUnavailableError("The shop is not connected to its database yet (missing Supabase settings).");
  const db = supabase();
  const [cat, set] = await Promise.all([db.rpc("storefront_catalog"), db.rpc("storefront_settings")]);
  if (cat.error) throw new CatalogUnavailableError(cat.error.message);
  return { rows: (cat.data ?? []) as DbProduct[], settings: set.error ? null : (set.data as StoreSettings | null) };
}

let inflight: Promise<void> | null = null;

/** Loads (or reloads) the whole catalogue. Concurrent calls share one request. */
export function loadCatalog(): Promise<void> {
  inflight ??= fetchAll()
    .then(({ rows, settings: s }) => setCatalog(rows, s))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Re-reads one product (stock, price, photos) straight from the database. */
export async function refreshProduct(key: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { data, error } = await supabase().rpc("storefront_product", { p_key: key });
  if (error) return;
  upsertProduct(key, (data as DbProduct | null) ?? null);
}

/** Refreshes products in the bag before checkout, so availability is current. */
export async function refreshProducts(keys: string[]): Promise<void> {
  await Promise.all([...new Set(keys)].map(refreshProduct));
}

const STALE_MS = 60_000;

if (typeof window !== "undefined") {
  const onFocus = () => {
    if (loadedAt && Date.now() - loadedAt > STALE_MS && document.visibilityState === "visible") loadCatalog().catch(() => undefined);
  };
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onFocus);
}

/** Re-renders the caller whenever the catalogue changes. */
export function useCatalogVersion(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
    () => version,
  );
}

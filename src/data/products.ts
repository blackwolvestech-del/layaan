// Products come from the shared Supabase database (managed in the LAYAAN CRM) through
// ./catalogStore.ts. This module keeps the storefront's existing API so pages and components are
// unchanged:
//   * `products` is the live catalogue (filled before the app renders, refreshed in place);
//   * categories and collections keep the site's own names, order and imagery — the CRM assigns
//     products to them with the same identifiers (category slug, collection keys);
//   * editorial photographs (hero, lookbook, banners) stay local assets.
import type { CategoryId, CollectionId, Product, ProductImage } from "@/types/product";
import { catalog } from "./catalog";
import { liveProducts, toProductImage } from "./catalogStore";

export type { CategoryId, CollectionId, Product, ProductImage, Taxonomy } from "@/types/product";
export { toProductImage };

/** Most photographs a product can have (the CRM allows 4–9 per product). */
export const MAX_PRODUCT_IMAGES = 9;

/** The live catalogue. Same array instance for the whole visit; contents follow the database. */
export const products: Product[] = liveProducts;

export const categories = catalog.categories.map((c) => ({ id: c.key as CategoryId, name: c.name }));
export const collections = catalog.collections.map((c) => ({ id: c.key as CollectionId, name: c.name }));

export const productById = (id: string) => products.find((p) => p.id === id);

/** A second photograph of the same outfit, for hover states. Prefers another full-length view. */
export function hoverImage(p: Product): ProductImage | undefined {
  return p.images.slice(1).find((i) => i.view === "full" || i.view === "side" || i.view === "three-quarter") ?? p.images[1];
}

/** Finds an image by original filename across products and editorial shots (local assets). */
export function imageByFile(file: string): ProductImage | undefined {
  const src = [...catalog.looks.flatMap((l) => l.images), ...catalog.editorial].find((i) => i.file === file);
  return src ? toProductImage(src) : undefined;
}

/** The product a photograph belongs to, including photographs not shown in its gallery. */
export function productForFile(file: string): Product | undefined {
  const look = catalog.looks.find((l) => l.images.some((i) => i.file === file));
  return look ? productById(look.key) : undefined;
}

// Shopping bag, persisted on this device (localStorage) so a refresh keeps it. Only product ids,
// sizes, quantities and custom measurements are stored; names, photos and prices are always read
// from the catalogue.
import { useMemo } from "react";
import { MAX_QUANTITY, offerFor, variantFor } from "@/data/commerce";
import { productById } from "@/data/products";
import type { Cart, CartItem, CartLine, LineSize, Money } from "@/types/commerce";
import type { CustomMeasurements } from "@/types/measurements";
import { createLocalStore, isRecord } from "@/utils/localStore";
import { CUSTOM_SIZE, isValidCustomMeasurements, measurementsKey } from "@/utils/measurements";

export const CART_KEY = "layaan-demo-cart";
const empty: Cart = { items: [], updatedAt: new Date(0).toISOString() };

/**
 * Whether a size suits the product: standard sizes for products with a size chart, "Custom" with a
 * complete set of measurements for made-to-measure products.
 */
export function fitsProduct(productId: string, size: unknown, measurements: unknown): boolean {
  const product = productById(productId);
  if (!product) return false;
  if (product.measurementProfile) return size === CUSTOM_SIZE && isValidCustomMeasurements(product.measurementProfile, measurements);
  return typeof size === "string" && !!variantFor(productId, size) && measurements === undefined;
}

/** Unit price of a line: the size's own price when the CRM sets one, else the product price. */
export function unitPriceFor(productId: string, size: string): Money | undefined {
  const offer = offerFor(productId);
  if (!offer) return undefined;
  return size === CUSTOM_SIZE ? offer.price : (variantFor(productId, size)?.price ?? offer.price);
}

export function parseCart(raw: unknown): Cart {
  if (!isRecord(raw) || !Array.isArray(raw.items)) return empty;
  const items = raw.items
    .filter((i): i is CartItem => isRecord(i) && typeof i.productId === "string" && Number.isInteger(i.quantity) && fitsProduct(i.productId, i.size, i.measurements))
    .map((i) => ({ productId: i.productId, size: i.size, quantity: clampQty(i.quantity), ...(i.measurements && { measurements: i.measurements }) }))
    .slice(0, 50);
  return { items, updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : empty.updatedAt };
}

export const cartStore = createLocalStore<Cart>(CART_KEY, parseCart, empty);

export const clampQty = (n: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(n)));
/** One line per product + size; custom sizes get one line per distinct set of measurements. */
export const lineKey = (productId: string, size: LineSize, measurements?: CustomMeasurements) => `${productId}__${size}${measurements ? `__${measurementsKey(measurements)}` : ""}`;
const keyOf = (i: CartItem) => lineKey(i.productId, i.size, i.measurements);

// Pure updates (exported for tests).
export function addItem(items: CartItem[], productId: string, size: LineSize, quantity = 1, measurements?: CustomMeasurements): CartItem[] {
  const key = lineKey(productId, size, measurements);
  const existing = items.find((i) => keyOf(i) === key);
  if (existing) return items.map((i) => (i === existing ? { ...i, quantity: clampQty(i.quantity + quantity) } : i));
  return [...items, { productId, size, quantity: clampQty(quantity), ...(measurements && { measurements }) }];
}
export const setQuantity = (items: CartItem[], key: string, quantity: number) => items.map((i) => (keyOf(i) === key ? { ...i, quantity: clampQty(quantity) } : i));
export const removeItem = (items: CartItem[], key: string) => items.filter((i) => keyOf(i) !== key);

/**
 * Joins stored items with the catalogue; items whose product no longer exists, or whose size no
 * longer suits the product (e.g. missing measurements for a made-to-measure look), are skipped.
 */
export function resolveLines(items: CartItem[]): CartLine[] {
  return items.flatMap((i) => {
    const product = productById(i.productId);
    const unitPrice = unitPriceFor(i.productId, i.size);
    if (!product || unitPrice === undefined || !fitsProduct(i.productId, i.size, i.measurements)) return [];
    return [{ ...i, key: keyOf(i), product, unitPrice, lineTotal: unitPrice * i.quantity }];
  });
}

const update = (fn: (items: CartItem[]) => CartItem[]) => cartStore.set((c) => ({ items: fn(c.items), updatedAt: new Date().toISOString() }));

export const cartActions = {
  add: (productId: string, size: LineSize, quantity = 1, measurements?: CustomMeasurements) => update((items) => addItem(items, productId, size, quantity, measurements)),
  setQuantity: (key: string, quantity: number) => update((items) => setQuantity(items, key, quantity)),
  remove: (key: string) => update((items) => removeItem(items, key)),
  clear: () => update(() => []),
};

export function useCart() {
  const cart = cartStore.use();
  return useMemo(() => {
    const lines = resolveLines(cart.items);
    const subtotal: Money = lines.reduce((s, l) => s + l.lineTotal, 0);
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    return { lines, subtotal, count, ...cartActions };
  }, [cart]);
}

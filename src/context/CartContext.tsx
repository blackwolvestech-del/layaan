import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useCatalogVersion } from "@/data/catalogStore";
import { MINOR_UNITS, maxQuantityFor, shippingCostFor, stockFor } from "@/data/commerce";
import { productById } from "@/data/products";
import { fitsProduct, lineKey, unitPriceFor } from "@/hooks/useCart";
import type { CartItem } from "@/types/account";
import { CUSTOM_SIZE } from "@/utils/measurements";

const CART_STORAGE_KEY = "layaan_demo_cart_pkr";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  /** Standard delivery for this bag (whole currency units), as the database will charge it. */
  shipping: number;
  total: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  resetToDefault: () => void;
  /** "Sold out" / "Only 2 left in this size" when the line can't be ordered as it is; otherwise null. */
  stockIssue: (item: CartItem) => string | null;
  /** True when every line can be ordered in its quantity. */
  canCheckout: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

function getInitialCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Drop lines whose product or size no longer exists (e.g. a size removed in the CRM).
      if (Array.isArray(parsed)) return (parsed as CartItem[]).filter((item) => item && typeof item.productId === "string" && fitsProduct(item.productId, item.selectedSize, item.measurements));
    }
  } catch {
    /* fallback */
  }
  return [];
}

/** Why a line can't be ordered as it is, from the live per-size stock. */
export function stockIssueFor(item: Pick<CartItem, "productId" | "selectedSize" | "quantity">): string | null {
  const product = productById(item.productId);
  if (!product) return "No longer available";
  const stock = stockFor(item.productId, item.selectedSize);
  if (stock === null) return null;
  if (stock <= 0) return item.selectedSize === CUSTOM_SIZE ? "Not available to order right now" : "Sold out in this size";
  if (item.quantity > stock) return `Only ${stock} left in this size`;
  return null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [stored, setItems] = useState<CartItem[]>(getInitialCart);
  const catalogVersion = useCatalogVersion();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* ignore */
    }
  }, [stored]);

  // Names, photos and prices always follow the live catalogue; only references are trusted from storage.
  const items = useMemo(() => {
    void catalogVersion;
    return stored.map((item) => {
      const product = productById(item.productId);
      const unit = unitPriceFor(item.productId, item.selectedSize);
      if (!product) return item;
      return {
        ...item,
        productLabel: product.label,
        colour: product.colour,
        productImage: product.images[0] ?? item.productImage,
        price: unit !== undefined ? unit / MINOR_UNITS : item.price,
      };
    });
  }, [stored, catalogVersion]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    // Custom sizes include a measurements key, so different measurements stay on separate lines.
    const id = item.measurements ? lineKey(item.productId, item.selectedSize, item.measurements) : `${item.productId}-${item.selectedSize}`;
    const max = maxQuantityFor(item.productId, item.selectedSize);
    if (max <= 0) return;
    setItems((prev) => {
      const existing = prev.find((x) => x.id === id);
      if (existing) {
        return prev.map((x) => (x.id === id ? { ...x, quantity: Math.min(max, x.quantity + (item.quantity || 1)) } : x));
      }
      return [...prev, { ...item, id, quantity: Math.min(max, item.quantity || 1) }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((x) => {
          if (x.id === id) {
            const nextQty = x.quantity + delta;
            // Never above the size's stock; a sold-out line can still be reduced or removed.
            const max = Math.max(maxQuantityFor(x.productId, x.selectedSize), Math.min(x.quantity, nextQty));
            return nextQty > 0 ? { ...x, quantity: Math.min(nextQty, max) } : null;
          }
          return x;
        })
        .filter((x): x is CartItem => x !== null),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /** Kept for compatibility: the bag now starts empty (no demo items). */
  const resetToDefault = useCallback(() => {
    setItems([]);
  }, []);

  const stockIssue = useCallback((item: CartItem) => {
    void catalogVersion;
    return stockIssueFor(item);
  }, [catalogVersion]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const shipping = useMemo(() => (items.length === 0 ? 0 : shippingCostFor("standard", Math.round(subtotal * MINOR_UNITS)) / MINOR_UNITS), [subtotal, items.length]);
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);
  const canCheckout = useMemo(() => items.length > 0 && items.every((i) => !stockIssueFor(i)), [items]);

  const value = useMemo<CartContextType>(
    () => ({
      items,
      itemCount,
      subtotal,
      shipping,
      total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      resetToDefault,
      stockIssue,
      canCheckout,
    }),
    [items, itemCount, subtotal, shipping, total, addItem, removeItem, updateQuantity, clearCart, resetToDefault, stockIssue, canCheckout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

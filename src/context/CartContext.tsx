import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildDefaultCartItems } from "@/data/accountData";
import { MINOR_UNITS, offerFor } from "@/data/commerce";
import { fitsProduct, lineKey } from "@/hooks/useCart";
import type { CartItem } from "@/types/account";

const CART_STORAGE_KEY = "layaan_demo_cart_pkr";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  resetToDefault: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

function getInitialCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Re-price saved lines from the catalogue so a stored bag never shows outdated prices, and
        // drop lines whose size no longer suits the product (e.g. a made-to-measure look without measurements).
        return (parsed as CartItem[])
          .filter((item) => fitsProduct(item.productId, item.selectedSize, item.measurements))
          .map((item) => {
            const offer = offerFor(item.productId);
            return offer ? { ...item, price: offer.price / MINOR_UNITS } : item;
          });
      }
    }
  } catch {
    /* fallback */
  }
  return buildDefaultCartItems();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    // Custom sizes include a measurements key, so different measurements stay on separate lines.
    const id = item.measurements ? lineKey(item.productId, item.selectedSize, item.measurements) : `${item.productId}-${item.selectedSize}`;
    setItems((prev) => {
      const existing = prev.find((x) => x.id === id);
      if (existing) {
        return prev.map((x) => (x.id === id ? { ...x, quantity: x.quantity + (item.quantity || 1) } : x));
      }
      return [...prev, { ...item, id }];
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
            return nextQty > 0 ? { ...x, quantity: nextQty } : null;
          }
          return x;
        })
        .filter((x): x is CartItem => x !== null),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const resetToDefault = useCallback(() => {
    setItems(buildDefaultCartItems());
  }, []);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  // Luxury orders above PKR 25,000 receive complimentary express courier shipping
  const shipping = useMemo(() => (subtotal > 25000 || items.length === 0 ? 0 : 2500), [subtotal, items.length]);
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

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
    }),
    [items, itemCount, subtotal, shipping, total, addItem, removeItem, updateQuantity, clearCart, resetToDefault],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildDefaultOrders, defaultAddresses, defaultReviews } from "@/data/accountData";
import type { Address, Order, ProductReview } from "@/types/account";

const DATA_STORAGE_KEY = "layaan_demo_account_data_pkr";

interface AccountDataState {
  addresses: Address[];
  orders: Order[];
  reviews: ProductReview[];
}

interface AccountDataContextType {
  addresses: Address[];
  orders: Order[];
  reviews: ProductReview[];
  addAddress: (addr: Omit<Address, "id">) => void;
  updateAddress: (id: string, addr: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addReview: (review: Omit<ProductReview, "id" | "createdAt" | "verifiedPurchase">) => void;
  getOrder: (orderIdOrNumber: string) => Order | undefined;
  getReviewsForProduct: (productId: string) => ProductReview[];
  resetData: () => void;
}

const AccountDataContext = createContext<AccountDataContextType | null>(null);

function getInitialData(): AccountDataState {
  try {
    const raw = localStorage.getItem(DATA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.addresses) && Array.isArray(parsed.orders)) {
        return parsed;
      }
    }
  } catch {
    /* fallback */
  }
  return {
    addresses: defaultAddresses,
    orders: buildDefaultOrders(),
    reviews: defaultReviews,
  };
}

export function AccountDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AccountDataState>(getInitialData);

  useEffect(() => {
    try {
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data]);

  const addAddress = useCallback((addr: Omit<Address, "id">) => {
    const newAddress: Address = {
      ...addr,
      id: `addr_${Date.now()}`,
    };
    setData((prev) => {
      let updated = [...prev.addresses];
      if (newAddress.isDefaultShipping) {
        updated = updated.map((a) => ({ ...a, isDefaultShipping: false }));
      }
      return {
        ...prev,
        addresses: [...updated, newAddress],
      };
    });
  }, []);

  const updateAddress = useCallback((id: string, addr: Partial<Address>) => {
    setData((prev) => {
      let updated = prev.addresses.map((a) => (a.id === id ? { ...a, ...addr } : a));
      if (addr.isDefaultShipping) {
        updated = updated.map((a) => (a.id === id ? { ...a, isDefaultShipping: true } : { ...a, isDefaultShipping: false }));
      }
      return { ...prev, addresses: updated };
    });
  }, []);

  const deleteAddress = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((a) => a.id !== id),
    }));
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a) => ({
        ...a,
        isDefaultShipping: a.id === id,
      })),
    }));
  }, []);

  const addReview = useCallback((rev: Omit<ProductReview, "id" | "createdAt" | "verifiedPurchase">) => {
    const newReview: ProductReview = {
      ...rev,
      id: `rev_${Date.now()}`,
      createdAt: "Today",
      verifiedPurchase: true,
    };
    setData((prev) => ({
      ...prev,
      reviews: [newReview, ...prev.reviews],
    }));
  }, []);

  const getOrder = useCallback(
    (orderIdOrNumber: string): Order | undefined => {
      const clean = orderIdOrNumber.trim().toLowerCase();
      // No fallback: an unknown reference must never show a different order.
      return data.orders.find((o) => o.id.toLowerCase() === clean || o.orderNumber.toLowerCase() === clean);
    },
    [data.orders],
  );

  const getReviewsForProduct = useCallback(
    (productId: string): ProductReview[] => {
      return data.reviews.filter((r) => r.productId === productId);
    },
    [data.reviews],
  );

  const resetData = useCallback(() => {
    setData({
      addresses: defaultAddresses,
      orders: buildDefaultOrders(),
      reviews: defaultReviews,
    });
  }, []);

  const value = useMemo<AccountDataContextType>(
    () => ({
      addresses: data.addresses,
      orders: data.orders,
      reviews: data.reviews,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      addReview,
      getOrder,
      getReviewsForProduct,
      resetData,
    }),
    [data, addAddress, updateAddress, deleteAddress, setDefaultAddress, addReview, getOrder, getReviewsForProduct, resetData],
  );

  return <AccountDataContext.Provider value={value}>{children}</AccountDataContext.Provider>;
}

export function useAccountData() {
  const ctx = useContext(AccountDataContext);
  if (!ctx) throw new Error("useAccountData must be used inside AccountDataProvider");
  return ctx;
}

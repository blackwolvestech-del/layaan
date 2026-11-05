// Account overview data for the signed-in customer:
//   * orders: the customer's real orders from the shared database (same records as the CRM),
//     in the shape the account overview renders;
//   * addresses: the default delivery address is the CRM customer record's address (synced both
//     ways); further addresses are an address book kept on this device for convenience.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dbImage } from "@/data/catalogStore";
import { MINOR_UNITS } from "@/data/commerce";
import { productById } from "@/data/products";
import { orderService } from "@/services";
import type { Address, Order, ProductReview } from "@/types/account";
import type { Order as CommerceOrder } from "@/types/commerce";
import { useAuth } from "./AuthContext";

const BOOK_KEY = "layaan_address_book";

interface AccountDataContextType {
  addresses: Address[];
  orders: Order[];
  /** Live commerce orders (for pages that use the order service shape). */
  liveOrders: CommerceOrder[];
  ordersLoading: boolean;
  reviews: ProductReview[];
  addAddress: (addr: Omit<Address, "id">) => void;
  updateAddress: (id: string, addr: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addReview: (review: Omit<ProductReview, "id" | "createdAt" | "verifiedPurchase">) => void;
  getOrder: (orderIdOrNumber: string) => Order | undefined;
  getReviewsForProduct: (productId: string) => ProductReview[];
  resetData: () => void;
  reloadOrders: () => void;
}

const AccountDataContext = createContext<AccountDataContextType | null>(null);

const STATUS: Record<NonNullable<CommerceOrder["status"]>, Order["status"]> = {
  processing: "Processing",
  confirmed: "Processing",
  shipped: "In Transit",
  "out-for-delivery": "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const major = (n: number) => n / MINOR_UNITS;

/** A live order in the account overview's shape. */
export function toAccountOrder(o: CommerceOrder): Order {
  const placed = new Date(o.createdAt);
  return {
    id: o.id,
    orderNumber: o.id,
    orderDate: placed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    status: STATUS[o.status ?? "processing"],
    items: o.items.map((i) => {
      const product = productById(i.productId);
      return {
        productId: i.productId,
        productSlug: i.productId,
        productLabel: i.label,
        colour: i.colour || product?.colour || "",
        productImage: product?.images[0] ?? dbImage(i.imageUrl ?? "", i.label, 0),
        selectedSize: i.size,
        quantity: i.quantity,
        price: major(i.unitPrice),
      };
    }),
    subtotal: major(o.totals.subtotal),
    shippingCost: major(o.totals.shipping ?? 0),
    tax: 0,
    total: major(o.totals.total),
    shippingAddress: {
      id: `${o.id}-ship`,
      fullName: `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`.trim(),
      addressLine1: o.shippingAddress.line1,
      addressLine2: o.shippingAddress.line2,
      city: o.shippingAddress.city,
      stateProvince: o.shippingAddress.region,
      postalCode: o.shippingAddress.postalCode,
      country: o.shippingAddress.country,
      phone: o.contact.phone,
      isDefaultShipping: false,
      isDefaultBilling: false,
    },
    paymentMethod: { type: o.payment.method === "cod" ? "Cash on delivery" : "Advance payment", last4: "" },
    trackingNumber: "",
    carrier: "",
    estimatedDelivery: "",
    timeline: [],
  };
}

function readBook(userId: string | undefined): Address[] {
  if (!userId) return [];
  try {
    const all = JSON.parse(localStorage.getItem(BOOK_KEY) ?? "{}") as Record<string, Address[]>;
    return Array.isArray(all[userId]) ? all[userId] : [];
  } catch {
    return [];
  }
}

function writeBook(userId: string | undefined, book: Address[]) {
  if (!userId) return;
  try {
    const all = JSON.parse(localStorage.getItem(BOOK_KEY) ?? "{}") as Record<string, Address[]>;
    all[userId] = book;
    localStorage.setItem(BOOK_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function AccountDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, customer, savedAddress, updateProfile } = useAuth();
  // Device address book key: the account's email (stable across sessions).
  const userId = isAuthenticated ? customer?.email.toLowerCase() || undefined : undefined;
  const [liveOrders, setLiveOrders] = useState<CommerceOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [book, setBook] = useState<Address[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLiveOrders([]);
      return;
    }
    let live = true;
    setOrdersLoading(true);
    orderService
      .listOrders()
      .then((orders) => live && setLiveOrders(orders))
      .catch(() => live && setLiveOrders([]))
      .finally(() => live && setOrdersLoading(false));
    return () => {
      live = false;
    };
  }, [isAuthenticated, userId, reload]);

  // Address book: device-saved addresses, with the CRM record's address as the default.
  useEffect(() => {
    const saved = readBook(userId);
    if (savedAddress && customer) {
      const crm: Address = {
        id: "crm-default",
        fullName: `${customer.firstName} ${customer.lastName}`.trim(),
        addressLine1: savedAddress.address,
        city: savedAddress.city,
        stateProvince: savedAddress.province,
        postalCode: savedAddress.postalCode,
        country: savedAddress.country,
        phone: customer.phone,
        isDefaultShipping: true,
        isDefaultBilling: true,
      };
      setBook([crm, ...saved.filter((a) => a.id !== "crm-default").map((a) => ({ ...a, isDefaultShipping: false, isDefaultBilling: false }))]);
    } else {
      setBook(saved);
    }
  }, [userId, savedAddress, customer]);

  /** The default address is stored on the CRM customer record. */
  const syncDefault = useCallback(
    (addr: Address) => {
      void updateProfile({ phone: addr.phone || undefined, address: { address: [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", "), city: addr.city, province: addr.stateProvince, postalCode: addr.postalCode } }).catch(() => undefined);
    },
    [updateProfile],
  );

  const persist = useCallback(
    (next: Address[]) => {
      setBook(next);
      writeBook(
        userId,
        next.filter((a) => a.id !== "crm-default"),
      );
      const def = next.find((a) => a.isDefaultShipping);
      if (def && def.id !== "crm-default") syncDefault(def);
    },
    [userId, syncDefault],
  );

  const addAddress = useCallback(
    (addr: Omit<Address, "id">) => {
      const created: Address = { ...addr, id: `addr_${Date.now()}` };
      const first = book.length === 0;
      const isDefault = created.isDefaultShipping || first;
      persist([...book.map((a) => (isDefault ? { ...a, isDefaultShipping: false } : a)), { ...created, isDefaultShipping: isDefault }]);
    },
    [book, persist],
  );

  const updateAddress = useCallback(
    (id: string, addr: Partial<Address>) => {
      let next = book.map((a) => (a.id === id ? { ...a, ...addr } : a));
      if (addr.isDefaultShipping) next = next.map((a) => ({ ...a, isDefaultShipping: a.id === id }));
      const edited = next.find((a) => a.id === id);
      if (edited?.id === "crm-default") syncDefault(edited);
      persist(next);
    },
    [book, persist, syncDefault],
  );

  const deleteAddress = useCallback((id: string) => persist(book.filter((a) => a.id !== id)), [book, persist]);

  const setDefaultAddress = useCallback((id: string) => persist(book.map((a) => ({ ...a, isDefaultShipping: a.id === id }))), [book, persist]);

  const orders = useMemo(() => liveOrders.map(toAccountOrder), [liveOrders]);

  const getOrder = useCallback(
    (ref: string): Order | undefined => {
      const clean = ref.trim().toLowerCase();
      return orders.find((o) => o.id.toLowerCase() === clean);
    },
    [orders],
  );

  const value = useMemo<AccountDataContextType>(
    () => ({
      addresses: book,
      orders,
      liveOrders,
      ordersLoading,
      // Reviews are moderated in the CRM; none are collected on this page yet.
      reviews: [],
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      addReview: () => undefined,
      getOrder,
      getReviewsForProduct: () => [],
      resetData: () => setReload((n) => n + 1),
      reloadOrders: () => setReload((n) => n + 1),
    }),
    [book, orders, liveOrders, ordersLoading, addAddress, updateAddress, deleteAddress, setDefaultAddress, getOrder],
  );

  return <AccountDataContext.Provider value={value}>{children}</AccountDataContext.Provider>;
}

export function useAccountData() {
  const ctx = useContext(AccountDataContext);
  if (!ctx) throw new Error("useAccountData must be used inside AccountDataProvider");
  return ctx;
}

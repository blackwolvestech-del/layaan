// Live implementations of the service contracts, backed by the shared Supabase database (the
// same orders the LAYAAN CRM manages):
//   * placing an order and guest lookups go through the storefront's server functions (/api),
//     which call the database with the service key — prices, stock and totals are recomputed there;
//   * signed-in customers read their own orders through the `my_orders` / `my_order` RPCs;
//   * a guest's confirmation is kept for this browser session (order number + contact) and
//     refreshed from the database with the same order-number + email check as "Track my order".
import { useMemo } from "react";
import { productById } from "@/data/products";
import { DELIVERY_DAYS, shippingMethodById } from "@/data/commerce";
import { accessToken, isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Order, OrderItem, OrderStatus, PaymentStatus, ReturnReason, ReturnRequest, TrackingEvent, TrackingInfo } from "@/types/commerce";
import type { CustomMeasurements } from "@/types/measurements";
import { createLocalStore, isRecord } from "@/utils/localStore";
import { CommerceError, type OrderService, type ReturnService, type TrackingService } from "./types";

// ---------------------------------------------------------------------------------------------
// Database order shape (private.storefront_order_json) → storefront Order
// ---------------------------------------------------------------------------------------------

export interface DbOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURNED";
  paymentMethod: "COD" | "PREPAID";
  paymentStatus: "PENDING" | "PAID" | "PARTIALLY_PAID" | "REFUNDED" | "FAILED";
  shippingMethod: "standard" | "express";
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  amountPaid: number;
  email: string | null;
  shippingAddress: { name: string; phone: string; address: string; city: string; province: string; postalCode: string; country: string };
  items: {
    id: string;
    productKey: string | null;
    name: string;
    sku: string;
    size: string | null;
    image: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    measurements: CustomMeasurements | null;
    customInstructions: string;
    productionStatus: string | null;
    productionDueOn: string | null;
  }[];
  timeline: { status: DbOrder["status"]; at: string }[];
  returns: { id: string; items: { orderItemId: string; quantity: number }[]; reason: ReturnReason; comments: string; status: ReturnRequest["status"]; createdAt: string }[];
}

const STATUS: Record<DbOrder["status"], OrderStatus> = {
  PENDING: "processing",
  CONFIRMED: "confirmed",
  PROCESSING: "confirmed",
  PACKED: "confirmed",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out-for-delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
};

const STATUS_COPY: Record<DbOrder["status"], string> = {
  PENDING: "Order received and being reviewed by the atelier.",
  CONFIRMED: "Order confirmed by the atelier.",
  PROCESSING: "Your order is being prepared.",
  PACKED: "Packed and ready for dispatch.",
  SHIPPED: "Parcel handed to the delivery partner.",
  OUT_FOR_DELIVERY: "Out for delivery to the shipping address.",
  DELIVERED: "Delivered.",
  CANCELLED: "Order cancelled.",
  RETURNED: "Return received by the atelier.",
};

function paymentStatus(o: DbOrder): PaymentStatus {
  switch (o.paymentStatus) {
    case "PAID":
      return "paid";
    case "PARTIALLY_PAID":
      return "partially-paid";
    case "REFUNDED":
      return "refunded";
    case "FAILED":
      return "failed";
    default:
      return o.paymentMethod === "COD" ? "pay-on-delivery" : "awaiting-payment";
  }
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export function toOrder(o: DbOrder): Order {
  const method = shippingMethodById(o.shippingMethod);
  const items: OrderItem[] = o.items.map((i) => {
    const product = i.productKey ? productById(i.productKey) : undefined;
    return {
      id: i.id,
      productId: i.productKey ?? "",
      label: i.name,
      colour: product?.colour ?? "",
      imageId: null,
      imageUrl: i.image,
      size: (i.size ?? "") as OrderItem["size"],
      ...(i.measurements && { measurements: i.measurements }),
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.totalPrice,
    };
  });
  const events: TrackingEvent[] = o.timeline.map((e) => ({ status: STATUS[e.status], at: e.at, description: STATUS_COPY[e.status] })).reverse();
  return {
    id: o.orderNumber,
    createdAt: o.createdAt,
    ownerEmail: o.email,
    currency: "PKR",
    items,
    contact: { email: o.email ?? "", phone: o.shippingAddress.phone },
    shippingAddress: {
      ...splitName(o.shippingAddress.name),
      line1: o.shippingAddress.address,
      line2: "",
      city: o.shippingAddress.city,
      region: o.shippingAddress.province,
      postalCode: o.shippingAddress.postalCode,
      country: regionNames?.of(o.shippingAddress.country) ?? o.shippingAddress.country,
    },
    shippingMethod: { id: o.shippingMethod, label: method?.label ?? o.shippingMethod, description: method?.description ?? "", price: o.shipping, estimate: null },
    payment: { method: o.paymentMethod === "COD" ? "cod" : "advance", status: paymentStatus(o) },
    totals: { subtotal: o.subtotal, shipping: o.shipping, total: o.total },
    status: STATUS[o.status],
    events,
    returns: o.returns.map((r) => ({ id: r.id, orderId: o.orderNumber, createdAt: r.createdAt, items: r.items, reason: r.reason, comments: r.comments, status: r.status })),
  };
}

// ---------------------------------------------------------------------------------------------
// Guest receipts (this browser session only)
// ---------------------------------------------------------------------------------------------

const RECEIPTS_KEY = "layaan-order-receipts";
const isOrder = (o: unknown): o is Order => isRecord(o) && typeof o.id === "string" && Array.isArray(o.items) && isRecord(o.contact);

/** Orders placed in this browser session (snapshots), so a guest can see and refresh their confirmation. */
export const receiptOrders = createLocalStore<Order[]>(RECEIPTS_KEY, (raw) => (Array.isArray(raw) ? raw.filter(isOrder).slice(0, 20) : []), [], "session");
/** Order numbers this session placed (OrderViewer.receipts). */
export const receiptStore = {
  get: () => receiptOrders.get().map((o) => o.id),
  /** Stable while the receipts don't change (safe as a hook dependency). */
  use: function useReceipts() {
    const orders = receiptOrders.use();
    return useMemo(() => orders.map((o) => o.id), [orders]);
  },
};

function remember(order: Order) {
  receiptOrders.set((all) => [order, ...all.filter((o) => o.id !== order.id)].slice(0, 20));
}

const sameId = (a: string, b: string) => a.trim().toUpperCase().replace(/^#/, "") === b.trim().toUpperCase().replace(/^#/, "");

// ---------------------------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------------------------

async function api<T>(path: string, body: unknown): Promise<T> {
  const token = await accessToken();
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CommerceError("We couldn't reach the atelier. Please check your connection and try again.");
  }
  const isJson = res.headers.get("content-type")?.includes("application/json");
  if (!isJson) {
    // e.g. the /api functions are not deployed, or a dev server started without them.
    console.error(`[orders] ${path} returned ${res.status} (${res.headers.get("content-type") ?? "no content type"})`);
    throw new CommerceError("The order service isn't reachable right now. You have not been charged — please try again in a moment.");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; problems?: string[] } & T;
  if (!res.ok) {
    const problems = data.problems?.length ? ` ${data.problems.join(" · ")}` : "";
    throw new CommerceError(`${data.error ?? "Something went wrong. Please try again."}${problems}`);
  }
  return data;
}

async function signedIn(): Promise<boolean> {
  return (await accessToken()) !== null;
}

async function myOrders(): Promise<Order[]> {
  const { data, error } = await supabase().rpc("my_orders");
  if (error) throw new CommerceError("We couldn't load your orders. Please try again.");
  return ((data ?? []) as DbOrder[]).map(toOrder);
}

async function myOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase().rpc("my_order", { p_number: id.replace(/^#/, "") });
  if (error) throw new CommerceError("We couldn't load this order. Please try again.");
  return data ? toOrder(data as DbOrder) : null;
}

/** Fresh copy of a guest receipt (by order number + checkout email); falls back to the snapshot. */
async function refreshReceipt(snapshot: Order): Promise<Order> {
  try {
    const { order } = await api<{ order: DbOrder }>("/api/orders/lookup", { orderNumber: snapshot.id, contact: snapshot.contact.email || snapshot.contact.phone });
    const fresh = toOrder(order);
    remember(fresh);
    return fresh;
  } catch {
    return snapshot;
  }
}

// ---------------------------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------------------------

export const supabaseOrderService: OrderService = {
  async placeOrder(draft) {
    const result = await api<{ order: DbOrder | null; orderNumber?: string }>("/api/orders", {
      contact: draft.contact,
      shippingAddress: draft.shippingAddress,
      shippingMethodId: draft.shippingMethodId,
      paymentMethod: draft.paymentMethod,
      idempotencyKey: draft.idempotencyKey,
      items: draft.items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity, ...(i.measurements && { measurements: i.measurements }) })),
    });
    if (!result.order) throw new CommerceError(`Your order ${result.orderNumber ?? ""} was placed, but we couldn't load its details. Use "Track my order" with your order number and email.`);
    const order = toOrder(result.order);
    remember(order);
    return order;
  },
  async listOrders(viewer) {
    const mine = isSupabaseConfigured && (await signedIn()) ? await myOrders() : [];
    const guest = await Promise.all(receiptOrders.get().filter((r) => (!viewer || viewer.receipts.includes(r.id)) && !mine.some((m) => m.id === r.id)).map(refreshReceipt));
    return [...mine, ...guest].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getOrder(id) {
    if (isSupabaseConfigured && (await signedIn())) {
      const mine = await myOrder(id);
      if (mine) return mine;
    }
    const snapshot = receiptOrders.get().find((o) => sameId(o.id, id));
    return snapshot ? refreshReceipt(snapshot) : null;
  },
  async getOrderForViewer(id, viewer) {
    const order = await supabaseOrderService.getOrder(id);
    if (!order) return null;
    // Signed-in owners get it from my_order; guests only for receipts of this session.
    const own = viewer.email !== null && order.ownerEmail?.toLowerCase() === viewer.email.toLowerCase();
    return own || viewer.receipts.some((r) => sameId(r, order.id)) ? order : null;
  },
};

/**
 * Estimated delivery: 7–14 days when the order has a made-to-measure (custom size) piece,
 * otherwise 3–4 days, with the matching date range from the order date.
 */
export function estimateDelivery(order: Order): string | null {
  const status = order.status ?? "processing";
  if (status === "delivered") return "Delivered";
  if (status === "cancelled" || status === "returned") return null;
  const custom = order.items.some((i) => i.size === "Custom");
  const [min, max] = custom ? DELIVERY_DAYS.custom : DELIVERY_DAYS.standard;
  const placed = new Date(order.createdAt);
  const day = (n: number) => new Date(placed.getTime() + n * 86_400_000);
  const from = day(min);
  const to = day(max);
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", opts).format(d);
  const range = sameMonth ? `${fmt(from, { day: "numeric" })}–${fmt(to, { day: "numeric", month: "short", year: "numeric" })}` : `${fmt(from, { day: "numeric", month: "short" })} – ${fmt(to, { day: "numeric", month: "short", year: "numeric" })}`;
  return `${min}–${max} days${custom ? " (made to measure)" : ""} · ${range}`;
}

export const supabaseTrackingService: TrackingService = {
  async getTracking(order): Promise<TrackingInfo> {
    const status = order.status ?? "processing";
    const shipped = ["shipped", "out-for-delivery", "delivered"].includes(status);
    return {
      orderId: order.id,
      status,
      carrier: shipped ? "Delivery partner (to be confirmed)" : null,
      reference: null,
      events: order.events ?? [],
      estimatedDelivery: estimateDelivery(order),
    };
  },
  async lookup(orderId, contact) {
    try {
      const { order } = await api<{ order: DbOrder }>("/api/orders/lookup", { orderNumber: orderId, contact });
      return toOrder(order);
    } catch (err) {
      if (err instanceof CommerceError && /couldn't find/i.test(err.message)) return null;
      throw err;
    }
  },
};

export const supabaseReturnService: ReturnService = {
  async listReturns(orderId) {
    if (orderId) return (await supabaseOrderService.getOrder(orderId))?.returns ?? [];
    const orders = await supabaseOrderService.listOrders();
    return orders.flatMap((o) => o.returns ?? []);
  },
  async createReturn(input) {
    const order = await supabaseOrderService.getOrder(input.orderId);
    if (!order) throw new CommerceError("We couldn't find that order.");
    const { return: created } = await api<{ return: { id: string; items: ReturnRequest["items"]; reason: ReturnReason; comments: string; status: ReturnRequest["status"]; createdAt: string } }>("/api/returns", {
      orderNumber: order.id,
      contact: order.contact.email || order.contact.phone,
      items: input.items,
      reason: input.reason,
      comments: input.comments,
    });
    return { id: created.id, orderId: order.id, createdAt: created.createdAt, items: created.items, reason: created.reason, comments: created.comments, status: created.status };
  },
};

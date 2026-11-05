// Browser-only implementations of the service contracts, for the frontend preview.
// Nothing is sent anywhere and no payment is taken: orders and return requests are saved in this
// browser's localStorage, and tracking progress is SIMULATED from the time the order was placed.
import { CURRENCY, initialPaymentStatus, isPaymentMethodAvailable, shippingMethodById } from "@/data/commerce";
import { productById } from "@/data/products";
import { fitsProduct, resolveLines } from "@/hooks/useCart";
import type { Order, OrderItem, OrderStatus, OrderViewer, ReturnRequest, TrackingEvent, TrackingInfo } from "@/types/commerce";
import { createLocalStore, isRecord } from "@/utils/localStore";
import { CommerceError, NotAuthorisedError, type AdminAuthService, type AdminOrderService, type OrderService, type ReturnService, type TrackingService } from "./types";

export const ORDERS_KEY = "layaan-demo-orders";
export const RETURNS_KEY = "layaan-demo-returns";
export const RECEIPTS_KEY = "layaan-demo-order-receipts";
export const ADMIN_SESSION_KEY = "layaan-demo-admin-session";

const isOrder = (o: unknown): o is Order => isRecord(o) && typeof o.id === "string" && typeof o.createdAt === "string" && Array.isArray(o.items) && isRecord(o.totals) && isRecord(o.contact) && isRecord(o.shippingAddress) && isRecord(o.shippingMethod);
const isReturn = (r: unknown): r is ReturnRequest => isRecord(r) && typeof r.id === "string" && typeof r.orderId === "string" && Array.isArray(r.items);

export const orderStore = createLocalStore<Order[]>(ORDERS_KEY, (raw) => (Array.isArray(raw) ? raw.filter(isOrder) : []), []);
export const returnStore = createLocalStore<ReturnRequest[]>(RETURNS_KEY, (raw) => (Array.isArray(raw) ? raw.filter(isReturn) : []), []);
/** Orders placed in this browser session, so a guest can see their own confirmation (and refresh it). */
export const receiptStore = createLocalStore<string[]>(RECEIPTS_KEY, (raw) => (Array.isArray(raw) ? raw.filter((r): r is string => typeof r === "string").slice(0, 20) : []), [], "session");

const normaliseEmail = (email: string | null | undefined) => email?.trim().toLowerCase() || null;

/**
 * Ownership rule: an order is visible to the account that placed it, and to the browser session
 * that placed it (guest receipts). Orders saved before ownership was recorded stay visible on the
 * device that holds them. A backend must enforce the same rule server-side.
 */
export function canViewOrder(order: Order, viewer: OrderViewer): boolean {
  if (order.ownerEmail === undefined) return true;
  if (viewer.receipts.includes(order.id)) return true;
  const email = normaliseEmail(viewer.email);
  return email !== null && order.ownerEmail === email;
}

/** True when the saved copy of the order matches what was created (measurements included). */
function persisted(order: Order) {
  try {
    const saved = (JSON.parse(localStorage.getItem(ORDERS_KEY) ?? "[]") as unknown[]).find((o) => isRecord(o) && o.id === order.id);
    return !!saved && JSON.stringify(saved) === JSON.stringify(order);
  } catch {
    return false;
  }
}

/** Simulated network latency, so loading states are visible and realistic. */
const latency = (ms = 450) => new Promise((r) => setTimeout(r, ms));

function randomCode(length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export const localOrderService: OrderService = {
  async placeOrder(draft) {
    await latency(900);
    // A retried checkout attempt returns the order it already created instead of a duplicate.
    const previous = draft.idempotencyKey ? orderStore.get().find((o) => o.idempotencyKey === draft.idempotencyKey) : undefined;
    if (previous) {
      receiptStore.set((all) => (all.includes(previous.id) ? all : [previous.id, ...all]));
      return previous;
    }
    // Made-to-measure pieces need a complete set of the customer's measurements.
    const unsized = draft.items.find((i) => !fitsProduct(i.productId, i.size, i.measurements));
    if (unsized) throw new CommerceError(`Please check the size for ${productById(unsized.productId)?.label ?? "an item in your bag"}.`);
    // Price from the catalogue, never from what the client sent.
    const lines = resolveLines(draft.items);
    if (lines.length === 0) throw new CommerceError("Your bag is empty or its items are no longer available.");
    const method = shippingMethodById(draft.shippingMethodId);
    if (!method) throw new CommerceError("Please choose a delivery method.");
    // Only currently accepted methods: advance payment stays rejected until its gateway is live.
    if (!isPaymentMethodAvailable(draft.paymentMethod)) throw new CommerceError("This payment method isn't available yet. Please choose Cash on delivery.");

    const items: OrderItem[] = lines.map((l, i) => ({
      id: `${i + 1}`,
      productId: l.productId,
      label: l.product.label,
      colour: l.product.colour,
      imageId: l.product.images[0]?.id ?? null,
      size: l.size,
      ...(l.measurements && { measurements: l.measurements }),
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      lineTotal: l.lineTotal,
    }));
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const order: Order = {
      id: `LA-${randomCode(6)}`,
      createdAt: new Date().toISOString(),
      ownerEmail: normaliseEmail(draft.ownerEmail),
      ...(draft.idempotencyKey && { idempotencyKey: draft.idempotencyKey }),
      currency: CURRENCY,
      items,
      contact: { ...draft.contact },
      shippingAddress: { ...draft.shippingAddress },
      shippingMethod: method,
      // Never marked paid here: advance payments wait for real verification.
      payment: { method: draft.paymentMethod, status: initialPaymentStatus(draft.paymentMethod) },
      // Delivery is charged once, from the catalogue rate, never from what the client sent.
      totals: { subtotal, shipping: method.price, total: subtotal + (method.price ?? 0) },
    };
    orderStore.set((all) => [order, ...all].slice(0, 50));
    // Never confirm an order (or its measurements) that was not actually saved.
    if (!persisted(order)) {
      orderStore.set((all) => all.filter((o) => o.id !== order.id));
      throw new CommerceError("We couldn't save your order on this device. Please check that browser storage is enabled and try again. You have not been charged.");
    }
    receiptStore.set((all) => [order.id, ...all.filter((id) => id !== order.id)]);
    return order;
  },
  async listOrders(viewer) {
    await latency();
    return orderStore
      .get()
      .filter((o) => !viewer || canViewOrder(o, viewer))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getOrderForViewer(id, viewer) {
    const order = await localOrderService.getOrder(id);
    return order && canViewOrder(order, viewer) ? order : null;
  },
  async getOrder(id) {
    await latency();
    return orderStore.get().find((o) => o.id.toUpperCase() === id.trim().toUpperCase()) ?? null;
  },
};

// ---------------------------------------------------------------------------------------------
// Simulated tracking. Replace `localTrackingService` with a carrier/shipping API client that
// returns the same TrackingInfo shape.
// ---------------------------------------------------------------------------------------------

export const STATUS_FLOW: Exclude<OrderStatus, "cancelled" | "returned">[] = ["processing", "confirmed", "shipped", "out-for-delivery", "delivered"];

/** Minutes after placing the order at which each simulated stage is reached (preview only). */
export const DEMO_STAGE_MINUTES = [0, 1, 3, 5, 8] as const;

const STAGE_COPY: Record<Exclude<OrderStatus, "cancelled" | "returned">, string> = {
  processing: "Order received and being prepared.",
  confirmed: "Order confirmed by the atelier.",
  shipped: "Parcel handed to the delivery partner.",
  "out-for-delivery": "Out for delivery to the shipping address.",
  delivered: "Delivered.",
};

/** An advance-payment order is not processed until its payment is verified. */
export const awaitingPayment = (order: Order) => order.payment?.status === "awaiting-payment";

export function simulateTracking(order: Order, now = Date.now()): TrackingInfo {
  const placed = new Date(order.createdAt).getTime();
  if (awaitingPayment(order)) {
    return { orderId: order.id, status: "processing", carrier: null, reference: null, estimatedDelivery: null, events: [{ status: "processing", at: order.createdAt, description: "Order received. Awaiting advance payment confirmation before processing." }] };
  }
  const events: TrackingEvent[] = [];
  STATUS_FLOW.forEach((status, i) => {
    const at = placed + (DEMO_STAGE_MINUTES[i] ?? 0) * 60_000;
    if (at <= now) events.push({ status, at: new Date(at).toISOString(), description: STAGE_COPY[status] });
  });
  const status = events.at(-1)?.status ?? "processing";
  const shipped = STATUS_FLOW.indexOf(status as (typeof STATUS_FLOW)[number]) >= STATUS_FLOW.indexOf("shipped");
  return {
    orderId: order.id,
    status,
    carrier: shipped ? "Delivery partner (to be confirmed)" : null,
    reference: shipped ? `TRK-${order.id.replace(/^LA-/, "")}` : null,
    events: events.reverse(),
    estimatedDelivery: null,
  };
}

export const localTrackingService: TrackingService = {
  async getTracking(order) {
    await latency(300);
    return simulateTracking(order);
  },
  async lookup(orderId, email) {
    const order = await localOrderService.getOrder(orderId);
    return order && order.contact.email.trim().toLowerCase() === email.trim().toLowerCase() ? order : null;
  },
};

/** Quantity already requested for return, per order item id. */
export function returnedQuantities(requests: ReturnRequest[]) {
  const map = new Map<string, number>();
  for (const r of requests) if (r.status !== "rejected") for (const i of r.items) map.set(i.orderItemId, (map.get(i.orderItemId) ?? 0) + i.quantity);
  return map;
}

export const localReturnService: ReturnService = {
  async listReturns(orderId) {
    await latency(250);
    const all = returnStore.get();
    return orderId ? all.filter((r) => r.orderId === orderId) : all;
  },
  async createReturn(input) {
    await latency(800);
    const order = orderStore.get().find((o) => o.id === input.orderId);
    if (!order) throw new CommerceError("We couldn't find that order on this device.");
    if (simulateTracking(order).status !== "delivered") throw new CommerceError("Returns can be requested once an order has been delivered.");
    const already = returnedQuantities(returnStore.get().filter((r) => r.orderId === order.id));
    const items = input.items.filter((i) => i.quantity > 0 && order.items.some((oi) => oi.id === i.orderItemId && i.quantity <= oi.quantity - (already.get(oi.id) ?? 0)));
    if (items.length === 0) throw new CommerceError("Select at least one item to return.");
    const request: ReturnRequest = { id: `RT-${randomCode(6)}`, orderId: order.id, createdAt: new Date().toISOString(), items, reason: input.reason, comments: input.comments.trim().slice(0, 1000), status: "requested" };
    returnStore.set((all) => [request, ...all]);
    return request;
  },
};

// ---------------------------------------------------------------------------------------------
// Back office (preview). The access code comes from VITE_ADMIN_ACCESS_CODE at build time and the
// session lives in sessionStorage: this gates the screens only. Real protection needs a backend
// that authenticates administrators and authorises every order request server-side.
// ---------------------------------------------------------------------------------------------

const adminSessionStore = createLocalStore<boolean>(ADMIN_SESSION_KEY, (raw) => raw === true, false, "session");
const adminAccessCode = () => (import.meta.env.VITE_ADMIN_ACCESS_CODE as string | undefined)?.trim() || null;

export const localAdminAuthService: AdminAuthService & { use: () => boolean } = {
  isConfigured: () => adminAccessCode() !== null,
  isSignedIn: () => adminAccessCode() !== null && adminSessionStore.get(),
  async signIn(code) {
    await latency(400);
    const expected = adminAccessCode();
    const ok = expected !== null && code.trim() === expected;
    adminSessionStore.set(ok);
    return ok;
  },
  signOut: () => adminSessionStore.set(false),
  use: () => adminSessionStore.use() && adminAccessCode() !== null,
};

function requireAdmin() {
  if (!localAdminAuthService.isSignedIn()) throw new NotAuthorisedError("Administrator sign-in required.");
}

export const localAdminOrderService: AdminOrderService = {
  async listOrders() {
    requireAdmin();
    await latency();
    return [...orderStore.get()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getOrder(id) {
    requireAdmin();
    await latency();
    return orderStore.get().find((o) => o.id.toUpperCase() === id.trim().toUpperCase()) ?? null;
  },
};

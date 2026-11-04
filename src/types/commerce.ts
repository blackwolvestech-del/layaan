// Shopping, order, tracking and returns shapes. The storefront only depends on these types,
// so the local (browser-only) services in src/services can later be swapped for API calls.
import type { CustomMeasurements } from "./measurements";
import type { Product } from "./product";

export type { Product };

/** Amounts are integers in the currency's minor unit (e.g. paisa, cents) to avoid float drift. */
export type Money = number;

export type SizeId = "XS" | "S" | "M" | "L" | "XL";

/** A standard size, or "Custom" for a made-to-measure product sized from the customer's measurements. */
export type LineSize = SizeId | "Custom";

/** Commercial details for a catalogue product. Product content stays in the catalogue. */
export interface ProductOffer {
  productId: string;
  price: Money;
  /** False while the price is a demo placeholder awaiting the brand's approval. */
  priceConfirmed: boolean;
  sizes: SizeId[];
}

/** What the browser persists: references only, never copied product content or prices. */
export interface CartItem {
  productId: string;
  size: LineSize;
  quantity: number;
  /** The customer's own measurements (inches), present only when size is "Custom". */
  measurements?: CustomMeasurements;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

/** A cart item joined with the current catalogue product and offer, for display and totals. */
export interface CartLine extends CartItem {
  key: string;
  product: Product;
  unitPrice: Money;
  lineTotal: Money;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export type ShippingMethodId = "standard" | "express";

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  description: string;
  /** null until the business confirms rates; totals then show shipping as "to be confirmed". */
  price: Money | null;
  /** Human-readable estimate, or null until confirmed. */
  estimate: string | null;
}

/** Payment methods offered at checkout. */
export type CheckoutPaymentMethodId = "cod" | "advance";

/** Every payment method an order can carry: "card" is kept for orders saved before COD/advance existed. */
export type PaymentMethodId = CheckoutPaymentMethodId | "card";

export interface PaymentOption {
  id: CheckoutPaymentMethodId;
  label: string;
  description: string;
  /**
   * False while the method is shown as "coming soon": it cannot be selected at checkout and the
   * order service rejects it. Flip to true once its payment gateway is integrated and configured.
   */
  available: boolean;
}

export type PaymentStatus =
  /** Cash on delivery: the full amount is collected when the order is delivered. */
  | "pay-on-delivery"
  /** Advance payment chosen but not yet verified: the order is not processed until it is. */
  | "awaiting-payment"
  /** Legacy preview card orders. */
  | "not-charged"
  | "authorised"
  | "paid"
  | "refunded";

/** Payment details kept on the order. Card numbers are never stored. */
export interface PaymentSummary {
  method: PaymentMethodId;
  /** Only a payment provider (or a verified manual check) may set "authorised" / "paid". */
  status: PaymentStatus;
}

export interface OrderTotals {
  subtotal: Money;
  shipping: Money | null;
  total: Money;
}

export type OrderStatus = "processing" | "confirmed" | "shipped" | "out-for-delivery" | "delivered" | "cancelled";

export interface TrackingEvent {
  status: OrderStatus;
  /** ISO timestamp. */
  at: string;
  description: string;
  location?: string;
}

export interface TrackingInfo {
  orderId: string;
  status: OrderStatus;
  carrier: string | null;
  reference: string | null;
  events: TrackingEvent[];
  /** Human-readable estimate, or null when not available. */
  estimatedDelivery: string | null;
}

/** Snapshot of a purchased product: stays correct even if the catalogue changes later. */
export interface OrderItem {
  id: string;
  productId: string;
  label: string;
  colour: string;
  imageId: string | null;
  size: LineSize;
  /** Measurements the piece is made to (inches), present only when size is "Custom". */
  measurements?: CustomMeasurements;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
}

export interface Order {
  id: string;
  /** ISO timestamp. */
  createdAt: string;
  /**
   * Email of the signed-in account that placed the order (lower case), or null for a guest
   * checkout. Absent on orders saved before ownership was recorded.
   */
  ownerEmail?: string | null;
  /** Checkout attempt key: retrying the same attempt returns this order instead of a duplicate. */
  idempotencyKey?: string;
  currency: string;
  items: OrderItem[];
  contact: ContactInfo;
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  payment: PaymentSummary;
  totals: OrderTotals;
}

/** Everything checkout collects; the order service turns it into an Order. */
export interface CheckoutDraft {
  contact: ContactInfo;
  shippingAddress: ShippingAddress;
  shippingMethodId: ShippingMethodId;
  paymentMethod: CheckoutPaymentMethodId;
  items: CartItem[];
  /** Email of the signed-in account placing the order; null or absent for a guest. */
  ownerEmail?: string | null;
  /** Unique per checkout attempt; a retry with the same key never creates a second order. */
  idempotencyKey?: string;
}

/** Who is asking to see an order: the signed-in account, and orders placed in this browser session. */
export interface OrderViewer {
  email: string | null;
  /** Order ids this browser session placed (guest receipts). */
  receipts: readonly string[];
}

export type ReturnReason = "size-too-small" | "size-too-large" | "not-as-expected" | "damaged" | "changed-mind" | "other";

export interface ReturnRequestItem {
  orderItemId: string;
  quantity: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  createdAt: string;
  items: ReturnRequestItem[];
  reason: ReturnReason;
  comments: string;
  status: "requested" | "approved" | "received" | "refunded" | "rejected";
}

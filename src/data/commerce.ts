// Commercial data for the storefront. Product prices, sizes and per-size stock come from the CRM
// (Supabase) via ./catalogStore.ts; delivery charges come from the CRM's store settings, so the
// totals shown here match what the database charges when the order is placed.
import type { CheckoutPaymentMethodId, Money, PaymentOption, PaymentStatus, ShippingMethod, ShippingMethodId } from "@/types/commerce";
import { offerFor, stockFor, storeSettings, variantFor } from "./catalogStore";

export { offerFor, stockFor, variantFor };

/** Store currency (the CRM stores PKR). */
export const CURRENCY = "PKR";
/** Minor units per major unit for CURRENCY (amounts are stored as integers, as in the CRM). */
export const MINOR_UNITS = 100;

/** Fallback delivery charges (PKR 300 standard, PKR 500 express) until store settings load. */
const DEFAULT_STANDARD = 300 * MINOR_UNITS;
const DEFAULT_EXPRESS = 500 * MINOR_UNITS;

/** Delivery times set by LAYAAN Atelier, in days from the order date. */
export const DELIVERY_DAYS = { standard: [3, 4], custom: [7, 14] } as const;
export const DELIVERY_TIME_COPY = `Standard sizes arrive in ${DELIVERY_DAYS.standard[0]}–${DELIVERY_DAYS.standard[1]} days; made-to-measure (custom size) pieces in ${DELIVERY_DAYS.custom[0]}–${DELIVERY_DAYS.custom[1]} days.`;

const shippingCopy: Record<ShippingMethodId, { label: string; description: string }> = {
  standard: { label: "Standard delivery", description: DELIVERY_TIME_COPY },
  express: { label: "Express delivery", description: `Priority dispatch. ${DELIVERY_TIME_COPY}` },
};

function rateFor(id: ShippingMethodId): Money {
  const s = storeSettings();
  if (id === "express") return s?.expressShipping ?? DEFAULT_EXPRESS;
  return s?.standardShipping ?? DEFAULT_STANDARD;
}

/** Delivery options shown at checkout, priced live from the CRM's store settings. */
export const shippingMethods: ShippingMethod[] = (["standard", "express"] as const).map((id) => ({
  id,
  ...shippingCopy[id],
  get price() {
    return rateFor(id);
  },
  estimate: null,
}));

export const shippingMethodById = (id: string) => shippingMethods.find((m) => m.id === id);

/**
 * Delivery charge for an order, exactly as the database computes it: express is always charged;
 * standard is free from the store's free-delivery threshold, when one is set.
 */
export function shippingCostFor(id: ShippingMethodId, subtotal: Money): Money {
  const free = storeSettings()?.freeShippingOver ?? null;
  if (id === "standard" && free !== null && subtotal >= free) return 0;
  return rateFor(id);
}

/** Delivery time for made-to-measure (custom size) pieces. */
export function customLeadTime(): string {
  return `${DELIVERY_DAYS.custom[0]}–${DELIVERY_DAYS.custom[1]} days`;
}

/**
 * Payment options shown at checkout. Cash on delivery is the only active method for now; advance
 * payment is listed as "coming soon" until a payment gateway is integrated — then set
 * `available: true` (the checkout already handles selecting it and collecting its details).
 */
export const paymentMethods: PaymentOption[] = [
  { id: "cod", label: "Cash on delivery", description: "Pay the full amount when your order is delivered. No advance payment needed.", available: true },
  { id: "advance", label: "Advance payment", description: "Pay online before dispatch. Your order is processed once your payment is confirmed.", available: false },
];

export const paymentMethodById = (id: string) => paymentMethods.find((m) => m.id === id);

/** True only for a known payment method that is currently accepted at checkout. */
export const isPaymentMethodAvailable = (id: string) => paymentMethodById(id)?.available === true;

/**
 * Payment status a new order starts with. Nothing is ever marked paid here: an advance payment
 * stays "awaiting-payment" until a payment provider or the atelier verifies it.
 */
export const initialPaymentStatus = (method: CheckoutPaymentMethodId): PaymentStatus => (method === "cod" ? "pay-on-delivery" : "awaiting-payment");

/** Most units of one line per order (the database accepts up to 20). */
export const MAX_QUANTITY = 10;

/** Most units of a line the customer can add: the size's stock, capped at MAX_QUANTITY. */
export function maxQuantityFor(productId: string, size: string): number {
  const stock = stockFor(productId, size);
  return stock === null ? MAX_QUANTITY : Math.max(0, Math.min(MAX_QUANTITY, stock));
}

export function formatMoney(amount: Money, currency = CURRENCY) {
  return new Intl.NumberFormat("en", { style: "currency", currency, currencyDisplay: "code", maximumFractionDigits: 0 }).format(amount / MINOR_UNITS);
}

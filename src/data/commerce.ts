// Commercial data for the storefront preview. Product content (names, photos, descriptions)
// stays in the catalogue (data/products.ts); this file only adds what checkout needs.
//
// Prices for most looks are confirmed by the brand (CONFIRMED_PRICES). Everything else below —
// remaining prices, shipping rates and delivery times — is demo data, flagged in the UI, and must
// be replaced with approved values (or an API response) before launch.
import type { CheckoutPaymentMethodId, Money, PaymentOption, PaymentStatus, ProductOffer, ShippingMethod, SizeId } from "@/types/commerce";
import { products } from "./products";

/** Demo currency — replace with the store's currency. */
export const CURRENCY = "PKR";
/** Minor units per major unit for CURRENCY (amounts are stored as integers). */
export const MINOR_UNITS = 100;

/** Demo size run — replace per product once the brand's size range is confirmed. */
export const SIZES: SizeId[] = ["XS", "S", "M", "L", "XL"];

/**
 * Prices in major units (PKR), keyed by catalogue product id, exactly as supplied by LAYAAN Atelier
 * in "layaan size chart Contact number.docx".
 */
const CONFIRMED_PRICES: Record<string, number> = {
  "beige-layered-trouser-set": 16500, // 3 piece
  "crimson-belted-satin-co-ord": 15500, // 2 piece and a waist belt
  "rust-jacket-wide-leg-trousers": 14500, // 2 piece
  "navy-wrap-trouser-suit": 15000, // 2 piece
  "ivory-pinstripe-suit": 14500,
  "lime-jewelled-button-tunic-set": 19500,
  "cream-cape-sleeve-longline-layer": 38000, // cream gown with black inner
  "magenta-satin-button-jacket": 18000, // 1 piece coat
  "emerald-tie-neck-maxi": 15000,
  "black-ivory-lace-trim-set": 14500,
};

/** Demo prices for looks the brand has not priced yet (made to measure). Flagged in the UI. */
const DEMO_PRICES: Record<string, number> = {
  "teal-statement-sleeve-suit": 28500,
  "ivory-longline-coat-gold-fastenings": 26000,
};
const FALLBACK_PRICE = 20000;

export const offers: ProductOffer[] = products.map((p) => {
  const confirmed = CONFIRMED_PRICES[p.id];
  return {
    productId: p.id,
    price: (confirmed ?? DEMO_PRICES[p.id] ?? FALLBACK_PRICE) * MINOR_UNITS,
    priceConfirmed: confirmed !== undefined,
    sizes: SIZES,
  };
});

const offerMap = new Map(offers.map((o) => [o.productId, o]));
export const offerFor = (productId: string): ProductOffer | undefined => offerMap.get(productId);

/**
 * Delivery options shown at checkout. Charges are fixed by LAYAAN Atelier (PKR 300 standard,
 * PKR 500 express); delivery times are not confirmed yet, so estimate stays null.
 */
export const shippingMethods: ShippingMethod[] = [
  { id: "standard", label: "Standard delivery", description: "Delivery time to be confirmed by LAYAAN Atelier.", price: 300 * MINOR_UNITS, estimate: null },
  { id: "express", label: "Express delivery", description: "Priority dispatch. Delivery time to be confirmed by LAYAAN Atelier.", price: 500 * MINOR_UNITS, estimate: null },
];

export const shippingMethodById = (id: string) => shippingMethods.find((m) => m.id === id);

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

export const MAX_QUANTITY = 10;

export function formatMoney(amount: Money, currency = CURRENCY) {
  return new Intl.NumberFormat("en", { style: "currency", currency, currencyDisplay: "code", maximumFractionDigits: 0 }).format(amount / MINOR_UNITS);
}

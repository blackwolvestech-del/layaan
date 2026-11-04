// Checkout form model and validation (pure, so it is unit-testable and reusable server-side).
import { isPaymentMethodAvailable } from "@/data/commerce";
import type { CheckoutPaymentMethodId, ContactInfo, ShippingAddress, ShippingMethodId } from "@/types/commerce";

/** Card fields (advance payment only) are validated for format only and never stored or sent anywhere. */
export interface CardFields {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export interface CheckoutValues extends ContactInfo, ShippingAddress, CardFields {
  shippingMethodId: ShippingMethodId;
  paymentMethod: CheckoutPaymentMethodId;
}

export type CheckoutField = keyof CheckoutValues;
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

export const emptyCheckout: CheckoutValues = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
  shippingMethodId: "standard",
  paymentMethod: "cod",
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

/** Display order for the error summary (matches the form order). */
export const fieldOrder: CheckoutField[] = ["email", "phone", "firstName", "lastName", "line1", "line2", "city", "region", "postalCode", "country", "shippingMethodId", "paymentMethod", "cardName", "cardNumber", "expiry", "cvc"];

export const fieldLabels: Record<CheckoutField, string> = {
  email: "Email",
  phone: "Phone",
  firstName: "First name",
  lastName: "Last name",
  line1: "Address",
  line2: "Apartment, suite, etc.",
  city: "City",
  region: "State / province",
  postalCode: "Postal code",
  country: "Country / region",
  shippingMethodId: "Delivery method",
  paymentMethod: "Payment method",
  cardName: "Name on card",
  cardNumber: "Card number",
  expiry: "Expiry date",
  cvc: "Security code",
};

const digits = (s: string) => s.replace(/\D/g, "");

export function luhn(number: string) {
  const d = digits(number);
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return d.length > 0 && sum % 10 === 0;
}

export const formatCardNumber = (v: string) =>
  digits(v)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

export function formatExpiry(v: string) {
  const d = digits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

/** Card fields are only collected for an advance payment; cash on delivery needs none. */
export const CARD_FIELDS: (keyof CardFields)[] = ["cardName", "cardNumber", "expiry", "cvc"];
export const needsCard = (paymentMethod: CheckoutPaymentMethodId) => paymentMethod === "advance";

export function validateCheckout(v: CheckoutValues, now = new Date()): CheckoutErrors {
  const e: CheckoutErrors = {};
  const card = needsCard(v.paymentMethod);
  const required: CheckoutField[] = ["email", "phone", "firstName", "lastName", "line1", "city", "country", ...(card ? CARD_FIELDS : [])];
  for (const f of required) if (!String(v[f]).trim()) e[f] = `Enter your ${fieldLabels[f].toLowerCase()}.`;

  if (!e.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Enter a valid email address, like name@example.com.";
  if (!e.phone && (digits(v.phone).length < 7 || !/^[+\d\s()-]+$/.test(v.phone.trim()))) e.phone = "Enter a valid phone number.";
  if (!isPaymentMethodAvailable(v.paymentMethod)) e.paymentMethod = "Choose an available payment method.";
  if (!card) return e;

  if (!e.cardNumber) {
    const n = digits(v.cardNumber);
    if (n.length < 12 || n.length > 19 || !luhn(n)) e.cardNumber = "Enter a valid card number.";
  }
  if (!e.expiry) {
    const m = /^(\d{2})\/(\d{2})$/.exec(v.expiry.trim());
    const month = m ? Number(m[1]) : 0;
    const year = m ? 2000 + Number(m[2]) : 0;
    if (!m || month < 1 || month > 12) e.expiry = "Enter the expiry date as MM/YY.";
    else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) e.expiry = "This card has expired.";
  }
  if (!e.cvc && !/^\d{3,4}$/.test(v.cvc.trim())) e.cvc = "Enter the 3 or 4 digit security code.";
  return e;
}

// POST /api/orders — place an order from the storefront checkout.
//
// The browser sends only references (product key, size, quantity, measurements) and the
// customer's details. Prices, stock, delivery charge and totals are recomputed by the database in
// `create_storefront_order`, which locks each size, refuses to oversell, creates the order, its
// items, the status event and the CRM notification, and deducts per-size stock — all in one
// transaction. It is idempotent on the checkout attempt key. Nothing is ever marked paid here.
import { adminClient, dbError, handler, HttpError, json, readJson, str, verifiedUser } from "./_lib/server.js";

const COUNTRY_NAMES = (() => {
  const map = new Map<string, string>();
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  for (let a = 65; a <= 90; a++)
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b);
      try {
        const name = names.of(code);
        if (name && name !== code) map.set(name.toLowerCase(), code);
      } catch {
        /* not a region */
      }
    }
  return map;
})();

/** "Pakistan" / "pk" → "PK". Unknown names are rejected rather than guessed. */
function countryCode(input: string): string | null {
  const v = input.trim();
  if (/^[a-z]{2}$/i.test(v)) return v.toUpperCase();
  return COUNTRY_NAMES.get(v.toLowerCase()) ?? null;
}

const PHONE = /^\+?[0-9][0-9 ()-]{6,19}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isMeasurements(v: unknown): v is Record<string, Record<string, number>> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const groups = Object.entries(v as Record<string, unknown>);
  return (
    groups.length > 0 &&
    groups.every(([k, g]) => (k === "body" || k === "trouser") && g && typeof g === "object" && Object.values(g as Record<string, unknown>).every((n) => typeof n === "number" && Number.isFinite(n) && n > 0 && n < 200))
  );
}

export const POST = handler(async (req) => {
  const body = await readJson(req);
  const user = await verifiedUser(req);

  const contact = (body.contact ?? {}) as Record<string, unknown>;
  const address = (body.shippingAddress ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const email = user?.email ?? str(contact.email, 254).toLowerCase();
  const phone = str(contact.phone, 30);
  const name = `${str(address.firstName, 60)} ${str(address.lastName, 60)}`.trim();
  const line1 = str(address.line1, 200);
  const line2 = str(address.line2, 100);
  const city = str(address.city, 80);
  const country = countryCode(str(address.country, 60));

  if (!EMAIL.test(email)) errors.email = "Enter a valid email address.";
  if (!PHONE.test(phone)) errors.phone = "Enter a valid phone number.";
  if (name.length < 2) errors.firstName = "Enter your name.";
  if (line1.length < 4) errors.line1 = "Enter your street address.";
  if (city.length < 2) errors.city = "Enter your city.";
  if (!country) errors.country = "Enter a valid country (e.g. Pakistan).";

  const shippingMethod = body.shippingMethodId === "express" ? "express" : body.shippingMethodId === "standard" ? "standard" : null;
  if (!shippingMethod) errors.shippingMethodId = "Choose a delivery option.";
  // Only cash on delivery is accepted until a payment gateway confirms advance payments.
  if (body.paymentMethod !== "cod") errors.paymentMethod = "This payment method isn't available yet. Please choose Cash on delivery.";

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0 || rawItems.length > 30) throw new HttpError(422, "Your bag is empty or has too many lines.");
  const items = rawItems.map((raw, i) => {
    const it = (raw ?? {}) as Record<string, unknown>;
    const productId = str(it.productId, 140);
    const size = str(it.size, 20);
    const quantity = Number(it.quantity);
    const custom = size.toLowerCase() === "custom";
    if (!productId || !size || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) errors[`items.${i}`] = "Invalid item in your bag.";
    if (custom && !isMeasurements(it.measurements)) errors[`items.${i}`] = "Please check the measurements for your made-to-measure piece.";
    return {
      productId,
      size: custom ? "Custom" : size,
      quantity,
      ...(custom && { measurements: it.measurements, customInstructions: str(it.customInstructions, 1000) }),
    };
  });

  if (Object.keys(errors).length > 0) throw new HttpError(422, "Please check your details.", { fields: errors, problems: Object.values(errors) });

  const externalRef = str(body.idempotencyKey, 80);
  const input = {
    ...(externalRef.length >= 6 && { externalRef }),
    customer: {
      name,
      email,
      phone,
      address: [line1, line2].filter(Boolean).join(", "),
      city,
      province: str(address.region, 80),
      postalCode: str(address.postalCode, 20),
      country,
    },
    items,
    paymentMethod: "COD",
    shippingMethod,
    note: str(body.note, 1000),
  };

  const db = adminClient();
  const placed = await db.rpc("create_storefront_order", { p_input: input });
  if (placed.error) throw dbError(placed.error);
  const orderNumber = (placed.data as { order: { orderNumber: string } }).order.orderNumber;

  const order = await db.rpc("storefront_order_lookup", { p_number: orderNumber, p_contact: email });
  if (order.error || !order.data) {
    // The order exists; only the read-back failed. Return the number so the customer can track it.
    return json({ order: null, orderNumber }, 201);
  }
  return json({ order: order.data, duplicate: (placed.data as { duplicate: boolean }).duplicate }, 201);
});

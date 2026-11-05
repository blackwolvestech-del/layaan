// POST /api/orders/lookup — guest order tracking: order number + the email or phone used at
// checkout. Returns the order in its customer-facing shape (no internal notes).
import { adminClient, dbError, handler, HttpError, json, readJson, str } from "../_lib/server.js";

export const POST = handler(async (req) => {
  const body = await readJson(req, 4_000);
  const orderNumber = str(body.orderNumber, 30).replace(/^#/, "");
  const contact = str(body.contact, 254);
  if (orderNumber.length < 3 || contact.length < 5) throw new HttpError(422, "Enter your order number and the email or phone used at checkout.");
  const { data, error } = await adminClient().rpc("storefront_order_lookup", { p_number: orderNumber, p_contact: contact });
  if (error) throw dbError(error);
  if (!data) throw new HttpError(404, "We couldn't find an order with those details.");
  return json({ order: data });
});

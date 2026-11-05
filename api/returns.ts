// POST /api/returns — return request for a delivered order. The shopper proves access either by
// being the signed-in owner (my_order with their token) or with the order number + checkout
// email/phone. The request is recorded on the order in the CRM (activity + staff notification);
// stock and order status are changed by staff when the parcel is received.
import { adminClient, dbError, handler, HttpError, json, readJson, str, userClient, verifiedUser } from "./_lib/server.js";

export const POST = handler(async (req) => {
  const body = await readJson(req, 16_000);
  const orderNumber = str(body.orderNumber, 30);
  if (!orderNumber) throw new HttpError(422, "Order number is required.");

  const user = await verifiedUser(req);
  let allowed = false;
  if (user) {
    const own = await userClient(user.token).rpc("my_order", { p_number: orderNumber });
    allowed = !own.error && !!own.data;
  }
  if (!allowed && str(body.contact, 254)) {
    const found = await adminClient().rpc("storefront_order_lookup", { p_number: orderNumber, p_contact: str(body.contact, 254) });
    allowed = !found.error && !!found.data;
  }
  if (!allowed) throw new HttpError(404, "We couldn't find that order.");

  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 50).map((raw) => {
    const it = (raw ?? {}) as Record<string, unknown>;
    return { orderItemId: str(it.orderItemId, 60), quantity: Number(it.quantity) || 0 };
  });

  const { data, error } = await adminClient().rpc("storefront_request_return", {
    p_input: { orderNumber, items, reason: str(body.reason, 40), comments: str(body.comments, 1000) },
  });
  if (error) throw dbError(error);
  return json({ return: data }, 201);
});

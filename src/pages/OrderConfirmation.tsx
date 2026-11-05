import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { LoadingBlock } from "@/components/commerce/controls";
import { AddressBlock, formatDate, OrderItemRow, PaymentDetails, Totals } from "@/components/commerce/OrderParts";
import { GoldOrbs } from "@/components/layout/PageHeader";
import { GoldBurst } from "@/components/fx/GoldBurst";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/misc";
import { useAsync } from "@/hooks/useAsync";
import { useOrderViewer } from "@/hooks/useOrderViewer";
import { orderService } from "@/services";
import { estimateDelivery } from "@/services/supabase";

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden className="field-gradient absolute inset-0 -z-20 opacity-60" />
      <GoldOrbs />
      <div className="container-x py-12 sm:py-20">
        <div className="mx-auto max-w-2xl">{children}</div>
      </div>
    </div>
  );
}

/** Shown when the order can't be loaded: never falls back to another (sample) order. */
function Unavailable({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Frame>
      <title>Order confirmation — LAYAAN Atelier</title>
      <div className="border border-line bg-surface p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-line text-gold-ink">
          <Icon name="info" size={28} />
        </span>
        <h1 className="page-title !text-2xl sm:!text-3xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-2">{body}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {action}
          <ButtonLink to="/account/orders" variant="outline">
            Your orders
          </ButtonLink>
          <ButtonLink to="/track-order" variant="outline">
            Track an order
          </ButtonLink>
        </div>
      </div>
    </Frame>
  );
}

export default function OrderConfirmation() {
  const { orderId = "" } = useParams<{ orderId: string }>();
  const viewer = useOrderViewer();
  // The order placed at checkout, looked up by the reference in the URL (so a refresh shows the same
  // order). Only the account or browser session that placed it may see it.
  const [state, reload] = useAsync(() => (orderId ? orderService.getOrderForViewer(orderId, viewer) : Promise.resolve(null)), [orderId, viewer]);

  if (state.status === "loading") {
    return (
      <Frame>
        <title>Order confirmation — LAYAAN Atelier</title>
        <LoadingBlock label="Loading your order" />
      </Frame>
    );
  }
  if (state.status === "error") {
    return (
      <Unavailable
        title="We couldn't load your order"
        body="Your order details could not be retrieved just now. Please try again."
        action={
          <Button onClick={reload}>
            Try again
          </Button>
        }
      />
    );
  }
  const order = state.data;
  if (!order) {
    return <Unavailable title="Order not found" body={orderId ? `We couldn't find order ${orderId} for your account or this browser session. If you placed it as a guest, track it with your order number and email.` : "No order reference was provided."} />;
  }

  const customItems = order.items.filter((i) => i.measurements).length;

  return (
    <Frame>
      <title>Order Confirmed — LAYAAN Atelier</title>
      <Reveal className="border border-line bg-surface p-6 text-center shadow-sm sm:p-12">
        <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-gold/40 bg-gold-soft/20 text-gold-ink">
          <Icon name="check" size={36} strokeWidth={2} />
          <GoldBurst count={22} radius={90} spreadY={0.9} delay={0.35} />
        </div>

        <p className="eyebrow mb-2">Order Confirmed</p>
        <h1 className="page-title !text-3xl sm:!text-4xl">Thank You for Your Order</h1>
        <p className="tagline mt-3 text-sm text-muted">
          {customItems > 0 ? "Your made-to-measure pieces will be cut to the measurements you entered." : "Your order has been received by the atelier."}
        </p>

        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border border-line bg-surface-2/60 px-5 py-2.5 text-xs">
          <span className="text-muted">Order Reference:</span>
          <span className="font-mono font-bold text-ink">{order.id}</span>
          <span className="text-muted">· {formatDate(order.createdAt, true)}</span>
        </div>

        <div className="mt-10 border-t border-line pt-8 text-left">
          <h2 className="heading-caps mb-1 !text-sm text-ink">Summary of Pieces</h2>
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
          </ul>
          <div className="mt-2 border-t border-line pt-4">
            <Totals {...order.totals} shippingLabel={order.shippingMethod.label} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-line pt-6 text-left sm:grid-cols-3">
          <div>
            <h2 className="nav-caps mb-2 text-muted">Shipping to</h2>
            <AddressBlock address={order.shippingAddress} email={order.contact.email} phone={order.contact.phone} />
          </div>
          <div>
            <h2 className="nav-caps mb-2 text-muted">Delivery</h2>
            <p className="text-sm font-semibold">{order.shippingMethod.label}</p>
            <p className="mt-1 text-sm text-ink-2">Estimated delivery: {estimateDelivery(order) ?? "to be confirmed"}</p>
          </div>
          <div>
            <h2 className="nav-caps mb-2 text-muted">Payment</h2>
            <PaymentDetails payment={order.payment} total={order.totals.total} />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink to={`/account/orders/${order.id}`} variant="primary" size="md">
            <Icon name="box" size={16} /> View order
          </ButtonLink>
          <ButtonLink to={`/track-order?order=${order.id}`} variant="outline" size="md">
            <Icon name="truck" size={16} /> Track order
          </ButtonLink>
        </div>

        <div className="mt-8 border-t border-line pt-6 text-xs text-muted">
          <p>
            Keep your order reference for any questions, and contact{" "}
            <Link to="/contact" className="text-gold-ink underline underline-offset-2">
              Atelier Concierge
            </Link>{" "}
            if anything needs changing.
          </p>
        </div>
      </Reveal>
    </Frame>
  );
}

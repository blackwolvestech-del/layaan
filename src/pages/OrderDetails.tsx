import { useParams } from "react-router";
import { LoadingBlock, Notice } from "@/components/commerce/controls";
import { AddressBlock, formatDate, OrderItemRow, Panel, PaymentDetails, StatusBadge, Totals, TrackingTimeline } from "@/components/commerce/OrderParts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, Tag } from "@/components/ui/misc";
import { useAsync } from "@/hooks/useAsync";
import { useOrderViewer } from "@/hooks/useOrderViewer";
import { orderService, returnService, trackingService } from "@/services";
import { estimateDelivery } from "@/services/supabase";
import { returnReasons } from "@/data/returns";

export default function OrderDetails() {
  const { orderId = "" } = useParams();
  const viewer = useOrderViewer();
  const [state, reload] = useAsync(async () => {
    // Only the account (or browser session) that placed an order can open it.
    const order = await orderService.getOrderForViewer(orderId, viewer);
    if (!order) return null;
    const [tracking, returns] = await Promise.all([trackingService.getTracking(order), returnService.listReturns(order.id)]);
    return { order, tracking, returns };
  }, [orderId, viewer]);

  const crumbs = [{ label: "Your orders", to: "/account/orders" }, { label: orderId }];

  if (state.status !== "success" || !state.data) {
    return (
      <>
        <PageHeader docTitle={`Order ${orderId}`} eyebrow="Your account" title="Order details" crumbs={crumbs} />
        <div className="container-x">
          {state.status === "loading" && <LoadingBlock label="Loading order" />}
          {state.status === "error" && (
            <Notice tone="error" title="We couldn't load this order">
              <Button variant="outline" size="sm" className="mt-3" onClick={reload}>
                Try again
              </Button>
            </Notice>
          )}
          {state.status === "success" && (
            <EmptyState icon="box" title="Order not found" body={`We couldn't find order ${orderId} for your account.`} action={<ButtonLink to="/account/orders">Back to your orders</ButtonLink>} />
          )}
        </div>
      </>
    );
  }

  const { order, tracking, returns } = state.data;
  const delivered = tracking.status === "delivered";

  return (
    <>
      <PageHeader docTitle={`Order ${order.id}`} eyebrow={`Placed ${formatDate(order.createdAt)}`} title={`Order ${order.id}`} crumbs={crumbs}>
        <StatusBadge status={tracking.status} />
      </PageHeader>
      <div className="container-x space-y-6">
        <Panel
          title="Order status"
          action={
            <Button variant="ghost" size="sm" onClick={reload}>
              Refresh
            </Button>
          }
        >
          <TrackingTimeline status={tracking.status} events={tracking.events} />
          <div className="mt-8 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Carrier</dt>
                <dd>{tracking.carrier ?? "Assigned when your order ships"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Tracking reference</dt>
                <dd className="font-mono">{tracking.reference ?? "Not yet available"}</dd>
              </div>
            </dl>
            {tracking.reference && (
              <ButtonLink to={`/track-order?order=${order.id}`} variant="outline" size="sm">
                <Icon name="truck" size={16} /> Track order
              </ButtonLink>
            )}
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-12">
          <Panel title={`Items (${order.items.length})`} className="lg:col-span-7">
            <ul className="-mt-4 divide-y divide-line">
              {order.items.map((i) => (
                <OrderItemRow key={i.id} item={i} />
              ))}
            </ul>
            <div className="mt-2 border-t border-line pt-4">
              <Totals {...order.totals} shippingLabel={order.shippingMethod.label} />
            </div>
          </Panel>
          <div className="space-y-6 lg:col-span-5">
            <Panel title="Shipping address">
              <AddressBlock address={order.shippingAddress} email={order.contact.email} phone={order.contact.phone} />
            </Panel>
            <Panel title="Delivery & payment">
              <p className="text-sm font-semibold">{order.shippingMethod.label}</p>
              <p className="mt-1 text-sm text-ink-2">Estimated delivery: {tracking.estimatedDelivery ?? estimateDelivery(order) ?? "to be confirmed"}</p>
              <div className="mt-4 border-t border-line pt-4">
                <PaymentDetails payment={order.payment} total={order.totals.total} />
              </div>
            </Panel>
            <Panel title="Returns">
              {returns.length > 0 && (
                <ul className="mb-4 space-y-2">
                  {returns.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-mono">{r.id}</span>
                      <span className="text-xs text-muted">{returnReasons.find((x) => x.id === r.reason)?.label}</span>
                      <Tag tone="gold">{r.status}</Tag>
                    </li>
                  ))}
                </ul>
              )}
              {delivered ? (
                <ButtonLink to={`/returns?order=${order.id}`} variant="outline" size="sm">
                  <Icon name="returns" size={16} /> Request a return
                </ButtonLink>
              ) : (
                <p className="text-sm text-muted">Returns can be requested once your order has been delivered.</p>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}

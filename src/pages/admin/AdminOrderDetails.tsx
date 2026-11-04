import { useParams } from "react-router";
import { AdminGate, AdminMeta, AdminSignOut } from "@/components/admin/AdminGate";
import { LoadingBlock, Notice, Price } from "@/components/commerce/controls";
import { formatLineSize, GROUP_LABELS } from "@/components/commerce/CustomSize";
import { AddressBlock, formatDate, Panel, PaymentDetails, Totals } from "@/components/commerce/OrderParts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, Tag } from "@/components/ui/misc";
import { useAsync } from "@/hooks/useAsync";
import { adminOrderService } from "@/services";
import type { Order, OrderItem } from "@/types/commerce";
import { fieldsFor } from "@/utils/measurements";

/** One customised item's measurements, laid out for garment preparation. */
function MeasurementCard({ order, item }: { order: Order; item: OrderItem }) {
  const m = item.measurements!;
  const groups = (["body", "trouser"] as const).filter((g) => m[g]);
  const headingId = `measurements-${item.id}`;
  return (
    <article aria-labelledby={headingId} className="break-inside-avoid border border-line bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-surface-2/60 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 id={headingId} className="text-[0.8125rem] font-semibold tracking-[0.06em] uppercase">
            {item.label}
          </h3>
          <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted">
            <div className="flex gap-1">
              <dt>Product ID:</dt>
              <dd className="font-mono text-ink-2">{item.productId}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Order:</dt>
              <dd className="font-mono text-ink-2">{order.id}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Item:</dt>
              <dd className="text-ink-2">#{item.id}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Colour:</dt>
              <dd className="text-ink-2">{item.colour}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Quantity:</dt>
              <dd className="text-ink-2">{item.quantity}</dd>
            </div>
          </dl>
        </div>
        <Tag tone="gold">Unit: inches</Tag>
      </header>
      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group} className="min-w-0">
            <table className="w-full border-collapse text-sm tabular-nums">
              <caption className="nav-caps mb-2 text-left text-ink">{GROUP_LABELS[group]} measurements</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Measurement</th>
                  <th scope="col">Value (inches)</th>
                </tr>
              </thead>
              <tbody>
                {fieldsFor(group).map(({ key, label }) => (
                  <tr key={key} className="border-b border-line last:border-b-0">
                    <th scope="row" className="py-1.5 pr-3 text-left text-xs font-semibold tracking-[0.06em] text-ink-2 uppercase">
                      {label}
                    </th>
                    <td className="py-1.5 text-right font-semibold text-ink">
                      {(m[group] as Record<string, number>)[key]} <span className="text-xs font-normal text-muted">in</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </article>
  );
}

function OrderView({ orderId }: { orderId: string }) {
  const [state, reload] = useAsync(() => adminOrderService.getOrder(orderId), [orderId]);

  if (state.status === "loading") return <LoadingBlock label="Loading order" />;
  if (state.status === "error") {
    return (
      <Notice tone="error" title="We couldn't load this order">
        <Button variant="outline" size="sm" className="mt-3" onClick={reload}>
          Try again
        </Button>
      </Notice>
    );
  }
  const order = state.data;
  if (!order) return <EmptyState icon="box" title="Order not found" body={`There is no order ${orderId}.`} action={<ButtonLink to="/admin/orders">All orders</ButtonLink>} />;

  const customItems = order.items.filter((i) => i.measurements);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <ButtonLink to="/admin/orders" variant="ghost" size="sm">
          <Icon name="arrowLeft" size={15} /> All orders
        </ButtonLink>
        <div className="flex gap-2">
          {customItems.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              Print measurements
            </Button>
          )}
          <AdminSignOut />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Panel title={`Items (${order.items.length})`} className="lg:col-span-7">
          <ul className="-mt-4 divide-y divide-line">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="text-[0.8125rem] font-semibold tracking-[0.06em] uppercase">{i.label}</p>
                  <p className="mt-1 text-xs text-muted">
                    <span className="font-mono">{i.productId}</span> · {i.colour} · {formatLineSize(i.size)} · Qty {i.quantity}
                  </p>
                  {i.measurements && (
                    <a href={`#measurements-${i.id}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gold-ink underline underline-offset-4">
                      <Icon name="ruler" size={13} /> See measurements
                    </a>
                  )}
                </div>
                <div className="shrink-0 text-right text-sm">
                  <Price amount={i.lineTotal} className="font-semibold" />
                  <p className="text-xs text-muted">
                    <Price amount={i.unitPrice} /> each
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-line pt-4">
            <Totals {...order.totals} shippingLabel={order.shippingMethod.label} />
          </div>
        </Panel>
        <div className="space-y-6 lg:col-span-5">
          <Panel title="Customer & shipping">
            <AddressBlock address={order.shippingAddress} email={order.contact.email} phone={order.contact.phone} />
            <p className="mt-3 text-xs text-muted">{order.ownerEmail ? `Account: ${order.ownerEmail}` : "Guest checkout"}</p>
          </Panel>
          <Panel title="Delivery & payment">
            <p className="mb-2 text-xs text-muted">Placed {formatDate(order.createdAt, true)}</p>
            <p className="text-sm font-semibold">{order.shippingMethod.label}</p>
            <p className="mt-1 text-sm text-ink-2">Delivery charge: {order.totals.shipping === null ? "to be confirmed" : <Price amount={order.totals.shipping} />}</p>
            <div className="mt-4 border-t border-line pt-4">
              <PaymentDetails payment={order.payment} total={order.totals.total} />
            </div>
          </Panel>
        </div>
      </div>

      {customItems.length > 0 && (
        <section aria-labelledby="custom-measurements-title" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
            <h2 id="custom-measurements-title" className="heading-caps !text-base">
              Custom Size Measurements
            </h2>
            <p className="text-xs text-muted">
              {customItems.length} made-to-measure {customItems.length === 1 ? "item" : "items"} · all values in inches, as entered by the customer
            </p>
          </div>
          {customItems.map((item) => (
            <MeasurementCard key={item.id} order={order} item={item} />
          ))}
        </section>
      )}
    </div>
  );
}

export default function AdminOrderDetails() {
  const { orderId = "" } = useParams();
  return (
    <>
      <AdminMeta />
      <PageHeader docTitle={`Order ${orderId} — Admin`} eyebrow="LAYAAN back office" title={`Order ${orderId}`} crumbs={[{ label: "Admin" }, { label: "Orders", to: "/admin/orders" }, { label: orderId }]} />
      <div className="container-x mx-auto max-w-6xl pb-20">
        <AdminGate>
          <OrderView orderId={orderId} />
        </AdminGate>
      </div>
    </>
  );
}

import { Link } from "react-router";
import { AdminGate, AdminMeta, AdminSignOut } from "@/components/admin/AdminGate";
import { LoadingBlock, Notice, Price } from "@/components/commerce/controls";
import { formatDate, itemCount, paymentMethodLabel } from "@/components/commerce/OrderParts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, Tag } from "@/components/ui/misc";
import { useAsync } from "@/hooks/useAsync";
import { adminOrderService } from "@/services";

function OrderList() {
  const [state, reload] = useAsync(() => adminOrderService.listOrders(), []);

  if (state.status === "loading") return <LoadingBlock label="Loading orders" />;
  if (state.status === "error") {
    return (
      <Notice tone="error" title="We couldn't load orders">
        <Button variant="outline" size="sm" className="mt-3" onClick={reload}>
          Try again
        </Button>
      </Notice>
    );
  }
  if (state.data.length === 0) return <EmptyState icon="box" title="No orders yet" body="Orders placed on the storefront appear here." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="nav-caps text-muted">{state.data.length} orders</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={reload}>
            Refresh
          </Button>
          <AdminSignOut />
        </div>
      </div>
      <ul className="divide-y divide-line border border-line bg-surface">
        {state.data.map((order) => {
          const custom = order.items.filter((i) => i.measurements).length;
          return (
            <li key={order.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0 space-y-1">
                <Link to={`/admin/orders/${order.id}`} className="font-mono text-sm font-semibold tracking-[0.08em] hover:text-gold-ink">
                  {order.id}
                </Link>
                <p className="text-xs text-muted">
                  {formatDate(order.createdAt, true)} · {order.shippingAddress.firstName} {order.shippingAddress.lastName} · {order.contact.email}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                {custom > 0 && (
                  <Tag tone="gold">
                    <Icon name="ruler" size={12} className="mr-1 inline" />
                    {custom} custom {custom === 1 ? "item" : "items"}
                  </Tag>
                )}
                <Tag tone={order.payment.status === "awaiting-payment" ? "gold" : "neutral"}>
                  {paymentMethodLabel[order.payment.method] ?? order.payment.method}
                  {order.payment.status === "awaiting-payment" && " · unpaid"}
                </Tag>
                <span className="text-xs text-muted">{order.shippingMethod.label}</span>
                <span className="text-xs text-muted">{itemCount(order)} pcs</span>
                <Price amount={order.totals.total} className="text-sm font-semibold" />
                <Link to={`/admin/orders/${order.id}`} aria-label={`Open order ${order.id}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface-2">
                  <Icon name="chevronRight" size={16} />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function AdminOrders() {
  return (
    <>
      <AdminMeta />
      <PageHeader docTitle="Orders — Admin" eyebrow="LAYAAN back office" title="Orders" crumbs={[{ label: "Admin" }, { label: "Orders" }]} />
      <div className="container-x mx-auto max-w-5xl pb-20">
        <AdminGate>
          <OrderList />
        </AdminGate>
      </div>
    </>
  );
}

import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { LoadingBlock, Notice, Price } from "@/components/commerce/controls";
import { formatDate, itemCount, StatusBadge } from "@/components/commerce/OrderParts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import { EmptyState } from "@/components/ui/misc";
import { productById } from "@/data/products";
import { useAsync } from "@/hooks/useAsync";
import { useOrderViewer } from "@/hooks/useOrderViewer";
import { orderService, trackingService } from "@/services";
import { fadeUp, staggerParent } from "@/utils/motion";

export default function Orders() {
  const reduce = useReducedMotion();
  const viewer = useOrderViewer();
  const [state, reload] = useAsync(async () => {
    const orders = await orderService.listOrders(viewer);
    const tracking = await Promise.all(orders.map((o) => trackingService.getTracking(o)));
    return orders.map((order, i) => ({ order, tracking: tracking[i]! }));
  }, [viewer]);

  return (
    <>
      <PageHeader docTitle="Your orders" eyebrow="Your account" title="Your orders" intro="Orders placed in this preview are kept in this browser on this device." crumbs={[{ label: "Your orders" }]} />
      <div className="container-x">
        {state.status === "loading" && <LoadingBlock label="Loading your orders" />}
        {state.status === "error" && (
          <Notice tone="error" title="We couldn't load your orders">
            <Button variant="outline" size="sm" className="mt-3" onClick={reload}>
              Try again
            </Button>
          </Notice>
        )}
        {state.status === "success" && state.data.length === 0 && (
          <EmptyState
            icon="box"
            title="No orders yet"
            body="When you place an order it will appear here, with its status and tracking."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <ButtonLink to="/shop">Start shopping</ButtonLink>
                <ButtonLink to="/track-order" variant="outline">
                  Track an order
                </ButtonLink>
              </div>
            }
          />
        )}
        {state.status === "success" && state.data.length > 0 && (
          <motion.ul className="mx-auto max-w-4xl space-y-5" initial={reduce ? false : "hidden"} animate="show" variants={staggerParent(0.07)}>
            {state.data.map(({ order, tracking }) => (
              <motion.li key={order.id} variants={fadeUp} className="border border-line bg-surface">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    <p>
                      <span className="nav-caps mr-2 text-muted">Order</span>
                      <Link to={`/account/orders/${order.id}`} className="font-mono text-sm font-semibold tracking-[0.08em] hover:text-gold-ink">
                        {order.id}
                      </Link>
                    </p>
                    <p className="text-xs text-muted">
                      <span className="sr-only">Placed </span>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={tracking.status} />
                </div>
                <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 4).map((i) => (
                        <Img key={i.id} image={productById(i.productId)?.images.find((im) => im.id === i.imageId)} sizes="56px" className="aspect-[3/4] w-12 rounded-[2px] ring-2 ring-surface" decorative />
                      ))}
                    </div>
                    <div className="min-w-0 text-sm">
                      <p className="line-clamp-2 text-ink-2">{order.items.map((i) => i.label).join(", ")}</p>
                      <p className="mt-1 text-xs text-muted">
                        {itemCount(order)} {itemCount(order) === 1 ? "item" : "items"} · <Price amount={order.totals.total} className="font-semibold text-ink" />
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <ButtonLink to={`/account/orders/${order.id}`} variant="outline" size="sm">
                      View order
                    </ButtonLink>
                    {tracking.reference && (
                      <ButtonLink to={`/track-order?order=${order.id}`} variant="ghost" size="sm">
                        Track order
                      </ButtonLink>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </>
  );
}

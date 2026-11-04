import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { productById } from "@/data/products";
import { STATUS_FLOW } from "@/services";
import type { Money, Order, OrderItem, OrderStatus, PaymentMethodId, PaymentStatus, PaymentSummary, ShippingAddress, TrackingEvent } from "@/types/commerce";
import { ease } from "@/utils/motion";
import { Icon } from "../ui/Icon";
import { Img } from "../ui/Img";
import { Price } from "./controls";
import { formatLineSize, MeasurementSummary } from "./CustomSize";

export const statusLabel: Record<OrderStatus, string> = {
  processing: "Processing",
  confirmed: "Confirmed",
  shipped: "Shipped",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const formatDate = (iso: string, withTime = false) =>
  new Intl.DateTimeFormat("en-GB", withTime ? { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

export const itemCount = (order: Order) => order.items.reduce((s, i) => s + i.quantity, 0);

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.625rem] font-semibold tracking-[0.14em] uppercase",
        status === "delivered" ? "border-success/40 text-success" : status === "cancelled" ? "border-danger/40 text-danger" : "border-gold/50 text-gold-ink",
      )}
    >
      <span aria-hidden className={clsx("h-1.5 w-1.5 rounded-full bg-current", status !== "delivered" && status !== "cancelled" && "animate-pulse")} />
      {statusLabel[status]}
    </span>
  );
}

/**
 * Products subtotal / delivery / grand total rows. `shippingLabel` names the delivery method
 * (e.g. "Standard delivery"); delivery shows "To be confirmed" when no rate exists (older orders).
 */
export function Totals({ subtotal, shipping, total, shippingPending, shippingLabel }: { subtotal: Money; shipping: Money | null; total: Money; shippingPending?: string; shippingLabel?: string }) {
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-ink-2">Products subtotal</dt>
        <dd>
          <Price amount={subtotal} />
        </dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-ink-2">{shippingLabel ?? "Delivery"}</dt>
        <dd className={clsx(shipping === null && "text-right text-muted")}>{shipping === null ? (shippingPending ?? "To be confirmed") : <Price amount={shipping} />}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-semibold">
        <dt>Grand total{shipping === null && <span className="ml-1 text-xs font-normal text-muted">(excl. delivery)</span>}</dt>
        <dd>
          <Price amount={total} />
        </dd>
      </div>
    </dl>
  );
}

export const paymentMethodLabel: Record<PaymentMethodId, string> = {
  cod: "Cash on delivery",
  advance: "Advance payment",
  card: "Card",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  "pay-on-delivery": "Due on delivery",
  "awaiting-payment": "Awaiting payment confirmation",
  "not-charged": "Not charged (preview checkout)",
  authorised: "Authorised",
  paid: "Paid",
  refunded: "Refunded",
};

/** Payment method and status for order pages (customer and admin). */
export function PaymentDetails({ payment, total }: { payment: PaymentSummary; total: Money }) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={payment.method === "cod" ? "cash" : "card"} size={20} className="mt-0.5 shrink-0 text-gold-ink" />
      <div className="min-w-0 text-sm">
        <p className="font-semibold">{paymentMethodLabel[payment.method] ?? payment.method}</p>
        <p className="mt-0.5 text-ink-2">{paymentStatusLabel[payment.status] ?? payment.status}</p>
        {payment.status === "pay-on-delivery" && (
          <p className="mt-1 text-xs text-muted">
            <Price amount={total} /> payable in cash on delivery.
          </p>
        )}
        {payment.status === "awaiting-payment" && <p className="mt-1 text-xs text-muted">The order is processed once the advance payment is confirmed.</p>}
      </div>
    </div>
  );
}

function imageFor(item: OrderItem) {
  const product = productById(item.productId);
  return product?.images.find((i) => i.id === item.imageId) ?? product?.images[0];
}

export function OrderItemRow({ item, action }: { item: OrderItem; action?: ReactNode }) {
  const exists = !!productById(item.productId);
  const title = <span className="text-[0.8125rem] font-semibold tracking-[0.06em] uppercase">{item.label}</span>;
  return (
    <li className="flex gap-4 py-4">
      <Img image={imageFor(item)} sizes="72px" className="aspect-[3/4] w-16 shrink-0 rounded-[2px] sm:w-[4.5rem]" decorative />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          {exists ? (
            <Link to={`/products/${item.productId}`} className="hover:text-gold-ink">
              {title}
            </Link>
          ) : (
            title
          )}
          <Price amount={item.lineTotal} className="shrink-0 text-sm font-semibold" />
        </div>
        <p className="text-xs text-muted">
          {item.colour} · {formatLineSize(item.size)} · Qty {item.quantity}
        </p>
        <MeasurementSummary measurements={item.measurements} />
        <p className="text-xs text-muted">
          <Price amount={item.unitPrice} /> each
        </p>
        {action}
      </div>
    </li>
  );
}

export function AddressBlock({ address, email, phone }: { address: ShippingAddress; email?: string; phone?: string }) {
  return (
    <address className="text-sm leading-relaxed text-ink-2 not-italic">
      <span className="font-semibold text-ink">
        {address.firstName} {address.lastName}
      </span>
      <br />
      {address.line1}
      {address.line2 && (
        <>
          <br />
          {address.line2}
        </>
      )}
      <br />
      {[address.city, address.region, address.postalCode].filter(Boolean).join(", ")}
      <br />
      {address.country}
      {email && (
        <>
          <br />
          <span className="text-muted">{email}</span>
        </>
      )}
      {phone && (
        <>
          <br />
          <span className="text-muted">{phone}</span>
        </>
      )}
    </address>
  );
}

/** Titled bordered panel used across order pages. */
export function Panel({ title, children, className, action }: { title: string; children: ReactNode; className?: string; action?: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      className={clsx("border border-line bg-surface p-5 sm:p-6", className)}
      aria-label={title}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: ease.editorial }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="nav-caps">{title}</h2>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

/**
 * Visual tracking timeline: every stage of the flow, reached stages filled in gold with their
 * timestamp. Horizontal from `md`, vertical on small screens.
 */
export function TrackingTimeline({ status, events }: { status: OrderStatus; events: TrackingEvent[] }) {
  const reduce = useReducedMotion();
  const current = STATUS_FLOW.indexOf(status as (typeof STATUS_FLOW)[number]);
  const eventFor = (s: OrderStatus) => events.find((e) => e.status === s);
  const progress = current <= 0 ? 0 : current / (STATUS_FLOW.length - 1);

  return (
    <ol className="relative grid gap-0 md:grid-cols-5" aria-label="Order progress">
      {/* Track lines: vertical on mobile, horizontal on md+. */}
      <span aria-hidden className="absolute top-3 bottom-3 left-[0.6875rem] w-px bg-line md:top-[0.6875rem] md:right-[10%] md:bottom-auto md:left-[10%] md:h-px md:w-auto" />
      <motion.span
        aria-hidden
        className="absolute top-3 left-[0.6875rem] w-px origin-top bg-gold md:hidden"
        style={{ height: `calc((100% - 1.5rem) * ${progress})` }}
        initial={reduce ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1, ease: ease.editorial, delay: 0.2 }}
      />
      <motion.span
        aria-hidden
        className="absolute top-[0.6875rem] left-[10%] hidden h-px origin-left bg-gold md:block"
        style={{ width: `calc(80% * ${progress})` }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease: ease.editorial, delay: 0.2 }}
      />
      {STATUS_FLOW.map((s, i) => {
        const done = i <= current;
        const event = eventFor(s);
        return (
          <motion.li
            key={s}
            className="relative flex gap-4 pb-7 last:pb-0 md:flex-col md:items-center md:gap-3 md:pb-0 md:text-center"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ease.editorial, delay: 0.1 + i * 0.08 }}
            aria-current={i === current ? "step" : undefined}
          >
            <span
              className={clsx(
                "relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                done ? "border-gold bg-gold text-accent-contrast" : "border-line-strong bg-bg text-muted",
                i === current && "ring-4 ring-gold-soft",
              )}
            >
              {done ? <Icon name="check" size={13} strokeWidth={2} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className="min-w-0">
              <p className={clsx("text-xs font-semibold tracking-[0.12em] uppercase", done ? "text-ink" : "text-muted")}>
                {statusLabel[s]}
                <span className="sr-only">{done ? " — completed" : " — pending"}</span>
              </p>
              {event ? (
                <>
                  <p className="mt-1 text-xs text-muted">{formatDate(event.at, true)}</p>
                  <p className="mt-1 text-xs text-ink-2 md:mx-auto md:max-w-[12rem]">{event.description}</p>
                </>
              ) : (
                <p className="mt-1 text-xs text-muted">Pending</p>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

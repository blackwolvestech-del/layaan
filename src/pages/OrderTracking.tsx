import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { Field, fieldAria, LoadingBlock, Notice } from "@/components/commerce/controls";
import { formatDate, Panel, StatusBadge, statusLabel, TrackingTimeline } from "@/components/commerce/OrderParts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useOrderViewer } from "@/hooks/useOrderViewer";
import { orderService, trackingService } from "@/services";
import type { Order, TrackingInfo } from "@/types/commerce";
import { ease } from "@/utils/motion";

type Result = { status: "idle" } | { status: "loading" } | { status: "not-found" } | { status: "error" } | { status: "found"; order: Order; tracking: TrackingInfo };

export default function OrderTracking() {
  const [params, setParams] = useSearchParams();
  const fromOrder = params.get("order") ?? "";
  const [orderId, setOrderId] = useState(fromOrder);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ orderId?: string; email?: string }>({});
  const [result, setResult] = useState<Result>({ status: "idle" });

  const show = async (order: Order) => setResult({ status: "found", order, tracking: await trackingService.getTracking(order) });

  const viewer = useOrderViewer();
  // Linked from one of the shopper's own orders (?order=…): show it directly. Anyone else's order
  // needs the order number + email lookup below.
  useEffect(() => {
    if (!fromOrder) return;
    let live = true;
    setResult({ status: "loading" });
    orderService.getOrderForViewer(fromOrder, viewer).then(
      async (order) => {
        if (!live) return;
        if (order) await show(order);
        else setResult({ status: "idle" });
      },
      () => live && setResult({ status: "error" }),
    );
    return () => {
      live = false;
    };
  }, [fromOrder, viewer]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!orderId.trim()) next.orderId = "Enter your order number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = "Enter the email address used at checkout.";
    setErrors(next);
    if (next.orderId || next.email) return;
    setResult({ status: "loading" });
    try {
      const order = await trackingService.lookup(orderId, email);
      if (!order) return setResult({ status: "not-found" });
      await show(order);
      setParams({ order: order.id }, { replace: true });
    } catch {
      setResult({ status: "error" });
    }
  };

  return (
    <>
      <PageHeader docTitle="Track your order" eyebrow="Help" title="Track your order" intro="Enter your order number and the email used at checkout." crumbs={[{ label: "Track your order" }]} />
      <div className="container-x">
        <div className="mx-auto max-w-4xl">
          <form noValidate onSubmit={onSubmit} className="grid gap-5 border border-line bg-surface p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-start sm:p-6">
            <Field id="tr-order" label="Order number" error={errors.orderId}>
              <input {...fieldAria("tr-order", errors.orderId)} className="input font-mono uppercase" placeholder="LA-XXXXXX" value={orderId} onChange={(e) => setOrderId(e.target.value)} autoComplete="off" />
            </Field>
            <Field id="tr-email" label="Email" error={errors.email}>
              <input {...fieldAria("tr-email", errors.email)} className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Button type="submit" className="sm:mt-[1.4rem]" disabled={result.status === "loading"}>
              <Icon name="search" size={16} /> Track
            </Button>
          </form>

          <div className="mt-8" aria-live="polite">
            {result.status === "loading" && <LoadingBlock label="Looking up your order" rows={2} />}
            {result.status === "not-found" && (
              <Notice tone="error" title="No matching order">
                Check the order number (e.g. LYN-1001) and the email address or phone number used at checkout.
              </Notice>
            )}
            {result.status === "error" && <Notice tone="error" title="Something went wrong">Please try again in a moment.</Notice>}
            <AnimatePresence mode="wait">
              {result.status === "found" && (
                <motion.div key={result.order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: ease.editorial }} className="space-y-6">
                  <Panel title={`Order ${result.order.id}`} action={<StatusBadge status={result.tracking.status} />}>
                    <dl className="mb-8 grid gap-4 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-xs text-muted">Current status</dt>
                        <dd className="font-semibold">{statusLabel[result.tracking.status]}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Tracking reference</dt>
                        <dd className="font-mono">{result.tracking.reference ?? "Available once shipped"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Estimated delivery</dt>
                        <dd>{result.tracking.estimatedDelivery ?? "To be confirmed"}</dd>
                      </div>
                    </dl>
                    <TrackingTimeline status={result.tracking.status} events={result.tracking.events} />
                  </Panel>

                  <Panel title="Tracking history">
                    <ol className="space-y-4">
                      {result.tracking.events.map((e) => (
                        <li key={e.status} className="grid gap-1 text-sm sm:grid-cols-[12rem_1fr]">
                          <span className="text-xs text-muted tabular-nums">{formatDate(e.at, true)}</span>
                          <span>
                            <span className="font-semibold">{statusLabel[e.status]}</span> — <span className="text-ink-2">{e.description}</span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </Panel>
                  <div className="flex flex-wrap gap-3">
                    <ButtonLink to={`/account/orders/${result.order.id}`} variant="outline">
                      View order
                    </ButtonLink>
                    <Button variant="ghost" onClick={() => void show(result.order)}>
                      Refresh status
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

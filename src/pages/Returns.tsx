import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { Field, fieldAria, LoadingBlock, Notice, QuantityStepper } from "@/components/commerce/controls";
import { formatDate, OrderItemRow } from "@/components/commerce/OrderParts";
import { PolicyPlaceholder } from "@/components/commerce/PolicyParts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { EmptyState, Reveal } from "@/components/ui/misc";
import { returnReasons } from "@/data/returns";
import { useAsync } from "@/hooks/useAsync";
import { useOrderViewer } from "@/hooks/useOrderViewer";
import { orderService, returnedQuantities, returnService, trackingService } from "@/services";
import type { Order, ReturnReason, ReturnRequest } from "@/types/commerce";
import { ease } from "@/utils/motion";

const steps: { icon: IconName; title: string; body: string }[] = [
  { icon: "returns", title: "Request", body: "Choose the order, the items and a reason below, then submit your request." },
  { icon: "box", title: "Pack & send", body: "Return instructions and any labels are provided once your request is reviewed." },
  { icon: "check", title: "Refund or exchange", body: "Processed after the items are received and checked." },
];

function ReturnForm({ orders, initialOrderId, onDone }: { orders: { order: Order; returned: Map<string, number> }[]; initialOrderId: string; onDone: (r: ReturnRequest) => void }) {
  const [orderId, setOrderId] = useState(orders.some((o) => o.order.id === initialOrderId) ? initialOrderId : (orders[0]?.order.id ?? ""));
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [reason, setReason] = useState<ReturnReason | "">("");
  const [comments, setComments] = useState("");
  const [errors, setErrors] = useState<{ items?: string; reason?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const entry = orders.find((o) => o.order.id === orderId);
  const available = (itemId: string, qty: number) => qty - (entry?.returned.get(itemId) ?? 0);
  useEffect(() => setSelected({}), [orderId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    const items = Object.entries(selected)
      .filter(([, q]) => q > 0)
      .map(([orderItemId, quantity]) => ({ orderItemId, quantity }));
    if (items.length === 0) next.items = "Select at least one item to return.";
    if (!reason) next.reason = "Choose a reason for the return.";
    setErrors(next);
    if (next.items || next.reason || !reason) return;
    setSubmitting(true);
    setFailure(null);
    try {
      onDone(await returnService.createReturn({ orderId, items, reason, comments }));
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-8">
      {failure && (
        <Notice tone="error" title="Your return request couldn't be submitted">
          {failure}
        </Notice>
      )}
      <Field id="rt-order" label="Order">
        <select id="rt-order" className="input" value={orderId} onChange={(e) => setOrderId(e.target.value)} disabled={submitting}>
          {orders.map(({ order }) => (
            <option key={order.id} value={order.id}>
              {order.id} — {formatDate(order.createdAt)}
            </option>
          ))}
        </select>
      </Field>

      <fieldset aria-describedby={errors.items ? "rt-items-error" : undefined}>
        <legend className="mb-2 text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">Items to return</legend>
        <ul className="divide-y divide-line border-y border-line">
          {entry?.order.items.map((item) => {
            const max = available(item.id, item.quantity);
            const checked = (selected[item.id] ?? 0) > 0;
            return (
              <OrderItemRow
                key={item.id}
                item={item}
                action={
                  max <= 0 ? (
                    <p className="mt-2 text-xs text-muted">Already requested for return</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--gold)]"
                          checked={checked}
                          disabled={submitting}
                          onChange={(e) => {
                            setSelected((s) => ({ ...s, [item.id]: e.target.checked ? 1 : 0 }));
                            setErrors((x) => ({ ...x, items: undefined }));
                          }}
                        />
                        Return this item
                      </label>
                      {checked && max > 1 && <QuantityStepper size="sm" value={selected[item.id] ?? 1} max={max} onChange={(n) => setSelected((s) => ({ ...s, [item.id]: Math.max(1, Math.min(max, n)) }))} label={`Quantity to return of ${item.label}`} />}
                    </div>
                  )
                }
              />
            );
          })}
        </ul>
        {errors.items && (
          <p id="rt-items-error" role="alert" className="mt-2 text-xs text-danger">
            {errors.items}
          </p>
        )}
      </fieldset>

      <Field id="rt-reason" label="Reason" error={errors.reason}>
        <select
          {...fieldAria("rt-reason", errors.reason)}
          className="input"
          value={reason}
          disabled={submitting}
          onChange={(e) => {
            setReason(e.target.value as ReturnReason);
            setErrors((x) => ({ ...x, reason: undefined }));
          }}
        >
          <option value="" disabled>
            Select a reason
          </option>
          {returnReasons.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </Field>

      <Field id="rt-comments" label="Comments" optional hint="Anything that helps us handle your request.">
        <textarea id="rt-comments" aria-describedby="rt-comments-hint" className="input min-h-28 resize-y" maxLength={1000} value={comments} onChange={(e) => setComments(e.target.value)} disabled={submitting} />
      </Field>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting} aria-busy={submitting}>
        {submitting ? (
          <>
            <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-bg/30 border-t-bg" /> Submitting…
          </>
        ) : (
          "Submit return request"
        )}
      </Button>
    </form>
  );
}

export default function Returns() {
  const [params] = useSearchParams();
  const initialOrderId = params.get("order") ?? "";
  const [done, setDone] = useState<ReturnRequest | null>(null);
  const viewer = useOrderViewer();
  const [state, reload] = useAsync(async () => {
    const orders = await orderService.listOrders(viewer);
    const [tracking, returns] = await Promise.all([Promise.all(orders.map((o) => trackingService.getTracking(o))), returnService.listReturns()]);
    return orders
      .filter((_, i) => tracking[i]?.status === "delivered")
      .map((order) => ({ order, returned: returnedQuantities(returns.filter((r) => r.orderId === order.id)) }))
      .filter(({ order, returned }) => order.items.some((i) => i.quantity > (returned.get(i.id) ?? 0)));
  }, [viewer]);
  const eligible = useMemo(() => (state.status === "success" ? state.data : []), [state]);

  return (
    <>
      <PageHeader docTitle="Returns" eyebrow="Help" title="Returns & exchanges" intro="How returns work, and a form to request one for a delivered order." crumbs={[{ label: "Returns" }]} />
      <div className="container-x space-y-16">
        <section aria-labelledby="process-title">
          <h2 id="process-title" className="heading-caps mb-8 text-center">
            The return process
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08} className="border border-line bg-surface p-6">
                <span className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-line text-gold-ink">
                    <Icon name={s.icon} size={20} />
                  </span>
                  <span className="code-accent">step {String(i + 1).padStart(2, "0")}</span>
                </span>
                <h3 className="nav-caps mt-5">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-2">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <section id="request" aria-labelledby="request-title" className="scroll-mt-32 lg:col-span-7">
            <h2 id="request-title" className="heading-caps mb-6">
              Request a return
            </h2>
            <div className="border border-line bg-surface p-5 sm:p-6">
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.div key="done" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: ease.editorial }} className="flex flex-col items-center py-6 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-gold text-accent-contrast">
                      <Icon name="check" size={26} strokeWidth={1.8} />
                    </span>
                    <h3 className="heading-caps mt-5 !text-base">Return request received</h3>
                    <p className="mt-3 text-sm text-ink-2">
                      Reference <span className="font-mono font-semibold">{done.id}</span> for order <span className="font-mono">{done.orderId}</span>.
                    </p>
                    <p className="mt-2 max-w-sm text-xs text-muted">Your request has been sent to the atelier, who will contact you about collection.</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <ButtonLink to={`/account/orders/${done.orderId}`}>View order</ButtonLink>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDone(null);
                          reload();
                        }}
                      >
                        Request another return
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0 }}>
                    {state.status === "loading" && <LoadingBlock label="Loading your orders" rows={2} />}
                    {state.status === "error" && (
                      <Notice tone="error" title="We couldn't load your orders">
                        <Button variant="outline" size="sm" className="mt-3" onClick={reload}>
                          Try again
                        </Button>
                      </Notice>
                    )}
                    {state.status === "success" && eligible.length === 0 && (
                      <EmptyState
                        icon="returns"
                        title="No items eligible for return"
                        body={
                          <>
                            Returns can be requested for delivered orders in your account, or placed in this browser session. Check the status of an order in <Link to="/account/orders" className="underline underline-offset-2">your orders</Link>.
                          </>
                        }
                      />
                    )}
                    {state.status === "success" && eligible.length > 0 && <ReturnForm orders={eligible} initialOrderId={initialOrderId} onDone={setDone} />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <section aria-labelledby="policy-title" className="lg:col-span-5">
            <h2 id="policy-title" className="heading-caps mb-6">
              Return policy
            </h2>
            <div className="space-y-6 text-sm">
              {[
                { title: "Eligible items", body: "Which items can be returned or exchanged, and any exclusions (e.g. altered or final-sale pieces)." },
                { title: "Return window", body: "How many days after delivery a return can be requested." },
                { title: "Condition", body: "The condition items must be returned in (tags, packaging, unworn)." },
                { title: "Refunds & exchanges", body: "How refunds are issued, to which payment method, and how exchanges are handled." },
                { title: "Return costs", body: "Who pays for return shipping and how parcels should be sent." },
              ].map((p) => (
                <div key={p.title} className={clsx("border-b border-line pb-5")}>
                  <h3 className="nav-caps">{p.title}</h3>
                  <PolicyPlaceholder>{p.body}</PolicyPlaceholder>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

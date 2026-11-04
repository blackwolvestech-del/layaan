import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { Field, fieldAria, Notice, Price } from "@/components/commerce/controls";
import { formatLineSize, MeasurementSummary } from "@/components/commerce/CustomSize";
import { Totals } from "@/components/commerce/OrderParts";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { EmptyState, Tag } from "@/components/ui/misc";
import { formatMoney, paymentMethods, shippingMethodById, shippingMethods } from "@/data/commerce";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { resolveLines } from "@/hooks/useCart";
import { orderService } from "@/services";
import type { CartLine, PaymentOption } from "@/types/commerce";
import { CARD_FIELDS, emptyCheckout, fieldLabels, fieldOrder, formatCardNumber, formatExpiry, needsCard, validateCheckout, type CheckoutErrors, type CheckoutField, type CheckoutValues } from "@/utils/checkout";
import { ease } from "@/utils/motion";
import { AnimatedNumber } from "@/components/fx/AnimatedNumber";
import { SplitText } from "@/components/fx/SplitText";

/** Which fields make each step complete (drives the progress rail and step ticks). Card fields only count for an advance payment. */
const stepFields = (v: CheckoutValues): CheckoutField[][] => [["email", "phone"], ["firstName", "lastName", "line1", "city", "country"], ["shippingMethodId"], ["paymentMethod", ...(needsCard(v.paymentMethod) ? CARD_FIELDS : [])]];
const STEP_LABELS = ["Contact", "Address", "Delivery", "Payment"];

function Step({ n, title, done, children }: { n: number; title: string; done: boolean; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.fieldset
      className="border-t border-line pt-8 first:border-t-0 first:pt-0"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: ease.editorial }}
    >
      <legend className="float-left mb-6 flex w-full items-center gap-3">
        <span className={clsx("relative grid h-7 w-7 place-items-center overflow-hidden rounded-full border text-xs font-semibold tabular-nums transition-colors duration-500", done ? "border-gold bg-gold text-accent-contrast" : "border-line-strong")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={String(done)} initial={{ scale: 0.3, opacity: 0, rotate: -45 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.3, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
              {done ? <Icon name="check" size={14} strokeWidth={2} /> : n}
            </motion.span>
          </AnimatePresence>
          <span className="sr-only">{done ? " (complete)" : ""}</span>
        </span>
        <span className="heading-caps !text-base">{title}</span>
      </legend>
      <div className="clear-both">{children}</div>
    </motion.fieldset>
  );
}

/** Gold rail that fills as each checkout step becomes valid. */
function ProgressRail({ done }: { done: boolean[] }) {
  const reduce = useReducedMotion();
  const count = done.filter(Boolean).length;
  return (
    <div className="mx-auto mb-10 max-w-2xl sm:mb-14" aria-label={`Checkout progress: ${count} of ${done.length} steps complete`} role="img">
      <div className="relative h-px bg-line">
        <motion.span className="absolute inset-y-0 left-0 bg-gold" initial={false} animate={{ width: `${(count / done.length) * 100}%` }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }} />
        {!reduce && count > 0 && count < done.length && (
          <motion.span className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_12px_2px_rgb(201_164_92/0.7)]" initial={false} animate={{ left: `${(count / done.length) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
        )}
      </div>
      <ol className="mt-3 grid grid-cols-4 text-center">
        {STEP_LABELS.map((l, i) => (
          <li key={l} className={clsx("nav-caps !text-[0.625rem] transition-colors duration-500", done[i] ? "text-gold-ink" : "text-muted")}>
            {l}
          </li>
        ))}
      </ol>
    </div>
  );
}

function SummaryLines({ lines }: { lines: CartLine[] }) {
  return (
    <ul className="divide-y divide-line">
      {lines.map((l) => (
        <li key={l.key} className="flex items-center gap-4 py-3">
          <span className="relative shrink-0">
            <Img image={l.product.images[0]} sizes="56px" className="aspect-[3/4] w-14 rounded-[2px]" decorative />
            <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.625rem] font-bold text-bg tabular-nums" aria-hidden>
              {l.quantity}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold tracking-[0.06em] uppercase">{l.product.label}</span>
            <span className="block text-xs text-muted">
              {formatLineSize(l.size)} · Qty {l.quantity}
            </span>
            <MeasurementSummary measurements={l.measurements} />
          </div>
          <Price amount={l.lineTotal} className="text-sm" />
        </li>
      ))}
    </ul>
  );
}

/** Shown when a customer picks a payment method that is not live yet. Nothing is selected or charged. */
function ComingSoonModal({ option, onClose }: { option: PaymentOption | null; onClose: () => void }) {
  return (
    <Modal open={option !== null} onOpenChange={(open) => !open && onClose()} title="Advance Payment Coming Soon!">
      <div className="flex items-start gap-4">
        <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-soft text-gold-ink">
          <Icon name="info" size={22} />
        </span>
        <p className="text-sm leading-relaxed text-ink-2">We&rsquo;re currently working on this payment option. Advance payments will be available soon. For now, please proceed with Cash on Delivery.</p>
      </div>
      <Button type="button" size="md" className="mt-6 w-full" onClick={onClose}>
        Got it
      </Button>
    </Modal>
  );
}

function newAttemptKey() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Checkout() {
  // The bag lives in CartContext; lines are priced from the catalogue, as the order service does.
  const { items, clearCart } = useCart();
  const lines = useMemo(() => resolveLines(items.map((i) => ({ productId: i.productId, size: i.selectedSize, quantity: i.quantity, ...(i.measurements && { measurements: i.measurements }) }))), [items]);
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const navigate = useNavigate();
  const [values, setValues] = useState<CheckoutValues>(emptyCheckout);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placedId, setPlacedId] = useState<string | null>(null);
  const { isAuthenticated, customer } = useAuth();
  // One key per checkout visit: a retried or double-submitted attempt returns the same order.
  const attemptKey = useRef(newAttemptKey());
  const [failure, setFailure] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [comingSoon, setComingSoon] = useState<PaymentOption | null>(null);

  const method = shippingMethodById(values.shippingMethodId) ?? shippingMethods[0]!;
  const shipping = method.price;
  const total = subtotal + (shipping ?? 0);
  const liveErrors = validateCheckout(values);
  const stepDone = stepFields(values).map((fields) => fields.every((f) => !liveErrors[f]));
  const advance = needsCard(values.paymentMethod);

  const set =
    (field: CheckoutField, format?: (v: string) => string) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = format ? format(e.target.value) : e.target.value;
      const next = { ...values, [field]: value };
      setValues(next);
      // After the first submit attempt, re-validate as the customer corrects fields.
      if (submitted) setErrors(validateCheckout(next));
    };

  const input = (field: CheckoutField, props: { type?: string; autoComplete?: string; inputMode?: "numeric" | "tel" | "email"; placeholder?: string; format?: (v: string) => string; hint?: boolean } = {}) => (
    <input
      {...fieldAria(`co-${field}`, errors[field], props.hint)}
      name={field}
      type={props.type ?? "text"}
      autoComplete={props.autoComplete}
      inputMode={props.inputMode}
      placeholder={props.placeholder}
      value={values[field]}
      onChange={set(field, props.format)}
      className="input"
      disabled={placing}
    />
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFailure(null);
    const found = validateCheckout(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setPlacing(true);
    try {
      // Card fields are never sent or stored; only the chosen payment method is.
      const { cardName: _n, cardNumber: _c, expiry: _e, cvc: _v, shippingMethodId, paymentMethod, email, phone, ...address } = values;
      const order = await orderService.placeOrder({
        contact: { email: email.trim(), phone: phone.trim() },
        shippingAddress: Object.fromEntries(Object.entries(address).map(([k, v]) => [k, v.trim()])) as typeof address,
        shippingMethodId,
        paymentMethod,
        ownerEmail: isAuthenticated ? (customer?.email ?? null) : null,
        idempotencyKey: attemptKey.current,
        items: lines.map(({ productId, size, quantity, measurements }) => ({ productId, size, quantity, ...(measurements && { measurements }) })),
      });
      setPlacedId(order.id);
      navigate(`/order-confirmation/${order.id}`);
      clearCart();
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPlacing(false);
    }
  };

  if (lines.length === 0 && !placedId) {
    return (
      <div className="container-x py-10">
        <title>Checkout — LAYAAN Atelier</title>
        <EmptyState icon="bag" title="Your bag is empty" body="Add a look to your bag before checking out." action={<ButtonLink to="/shop">Continue shopping</ButtonLink>} />
      </div>
    );
  }

  const errorList = fieldOrder.filter((f) => errors[f]);
  const summary = (
    <>
      <SummaryLines lines={lines} />
      <div className="mt-4 border-t border-line pt-4">
        <Totals subtotal={subtotal} shipping={shipping} total={total} shippingLabel={method.label} />
      </div>
    </>
  );

  return (
    <div className="container-x pt-8 sm:pt-10">
      <title>Checkout — LAYAAN Atelier</title>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Shopping bag", to: "/cart" },
          { label: "Checkout" },
        ]}
      />
      <SplitText as="h1" trigger="mount" text="Checkout" delay={0.1} className="page-title mt-8 mb-8 text-center" />
      <ProgressRail done={stepDone} />

      {/* Mobile: collapsible summary above the form. */}
      <details className="group mb-8 border border-line bg-surface lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 [&::-webkit-details-marker]:hidden">
          <span className="nav-caps flex items-center gap-2">
            <Icon name="bag" size={16} /> Order summary ({count})
            <Icon name="chevronDown" size={14} className="transition-transform group-open:rotate-180" />
          </span>
          <Price amount={total} className="font-semibold" />
        </summary>
        <div className="border-t border-line px-4 pb-4">{summary}</div>
      </details>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <form noValidate onSubmit={onSubmit} className="lg:col-span-7" aria-describedby="checkout-note">
          <Notice className="mb-8">
            <span id="checkout-note">Preview checkout — no payment is taken and nothing is sent. Your order is saved in this browser.</span>
          </Notice>

          <AnimatePresence>
            {errorList.length > 0 && (
              <motion.div
                ref={summaryRef}
                tabIndex={-1}
                role="alert"
                aria-labelledby="error-summary-title"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: ease.editorial }}
                className="mb-8 border border-danger/40 bg-danger/5 p-4 outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
              >
                <p id="error-summary-title" className="text-sm font-semibold">
                  Please check {errorList.length === 1 ? "this field" : `these ${errorList.length} fields`}:
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {errorList.map((f) => (
                    <li key={f}>
                      <a href={`#co-${f}`} className="text-danger underline underline-offset-2">
                        {fieldLabels[f]}: {errors[f]}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          {failure && (
            <Notice tone="error" title="Your order couldn't be placed" className="mb-8">
              {failure}
            </Notice>
          )}

          <div className="space-y-10">
            <Step n={1} title="Contact" done={stepDone[0]!}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="co-email" label={fieldLabels.email} error={errors.email} hint="For your order confirmation." className="sm:col-span-2">
                  {input("email", { type: "email", autoComplete: "email", inputMode: "email", hint: true })}
                </Field>
                <Field id="co-phone" label={fieldLabels.phone} error={errors.phone} hint="In case we need to reach you about delivery." className="sm:col-span-2">
                  {input("phone", { type: "tel", autoComplete: "tel", inputMode: "tel", hint: true })}
                </Field>
              </div>
            </Step>

            <Step n={2} title="Shipping address" done={stepDone[1]!}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="co-firstName" label={fieldLabels.firstName} error={errors.firstName}>
                  {input("firstName", { autoComplete: "given-name" })}
                </Field>
                <Field id="co-lastName" label={fieldLabels.lastName} error={errors.lastName}>
                  {input("lastName", { autoComplete: "family-name" })}
                </Field>
                <Field id="co-line1" label={fieldLabels.line1} error={errors.line1} className="sm:col-span-2">
                  {input("line1", { autoComplete: "address-line1" })}
                </Field>
                <Field id="co-line2" label={fieldLabels.line2} optional className="sm:col-span-2">
                  {input("line2", { autoComplete: "address-line2" })}
                </Field>
                <Field id="co-city" label={fieldLabels.city} error={errors.city}>
                  {input("city", { autoComplete: "address-level2" })}
                </Field>
                <Field id="co-region" label={fieldLabels.region} optional>
                  {input("region", { autoComplete: "address-level1" })}
                </Field>
                <Field id="co-postalCode" label={fieldLabels.postalCode} optional>
                  {input("postalCode", { autoComplete: "postal-code" })}
                </Field>
                <Field id="co-country" label={fieldLabels.country} error={errors.country}>
                  {input("country", { autoComplete: "country-name" })}
                </Field>
              </div>
            </Step>

            <Step n={3} title="Delivery method" done={stepDone[2]!}>
              <div className="space-y-3">
                {shippingMethods.map((m) => (
                  <label key={m.id} className={clsx("flex cursor-pointer items-start gap-4 border p-4 transition-colors", values.shippingMethodId === m.id ? "border-ink bg-surface-2" : "border-line hover:border-line-strong")}>
                    <input type="radio" name="shippingMethodId" value={m.id} checked={values.shippingMethodId === m.id} onChange={set("shippingMethodId")} disabled={placing} className="mt-1 h-4 w-4 accent-[var(--gold)]" />
                    <span className="flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold">{m.label}</span>
                        <span className={clsx("text-sm tabular-nums", values.shippingMethodId === m.id ? "font-semibold text-ink" : "text-ink-2")}>{m.price === null ? "Rate to be confirmed" : <Price amount={m.price} />}</span>
                      </span>
                      <span className="mt-1 block text-xs text-muted">{m.estimate ?? m.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">
                See{" "}
                <Link to="/shipping" className="underline underline-offset-2 hover:text-ink">
                  shipping information
                </Link>
                .
              </p>
            </Step>

            <Step n={4} title="Payment" done={stepDone[3]!}>
              <div id="co-paymentMethod" className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((m) => {
                  const selected = values.paymentMethod === m.id;
                  const icon = <Icon name={m.id === "cod" ? "cash" : "card"} size={20} className={clsx("shrink-0 transition-colors", selected ? "text-gold-ink" : "text-muted")} />;
                  // A method that is not live yet stays visible but opens a "coming soon" note instead of being selected.
                  if (!m.available) {
                    return (
                      <button key={m.id} type="button" onClick={() => setComingSoon(m)} disabled={placing} aria-haspopup="dialog" className="group flex items-start gap-4 border border-dashed border-line-strong p-4 text-left transition-colors hover:border-gold hover:bg-surface-2/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                        <span aria-hidden className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-line-strong" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold">{m.label}</span>
                              <Tag tone="gold">Coming soon</Tag>
                            </span>
                            {icon}
                          </span>
                          <span className="mt-1 block text-xs text-muted">{m.description}</span>
                        </span>
                      </button>
                    );
                  }
                  return (
                    <label key={m.id} className={clsx("flex cursor-pointer items-start gap-4 border p-4 transition-colors", selected ? "border-ink bg-surface-2" : "border-line hover:border-line-strong")}>
                      <input type="radio" name="paymentMethod" value={m.id} checked={selected} onChange={set("paymentMethod")} disabled={placing} className="mt-1 h-4 w-4 accent-[var(--gold)]" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{m.label}</span>
                          {icon}
                        </span>
                        <span className="mt-1 block text-xs text-muted">{m.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.paymentMethod && <p className="mt-2 text-xs text-danger">{errors.paymentMethod}</p>}
              <ComingSoonModal option={comingSoon} onClose={() => setComingSoon(null)} />

              <AnimatePresence initial={false} mode="wait">
                {advance ? (
                  <motion.div key="advance" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: ease.editorial }} className="overflow-hidden">
                    <Notice className="mt-4 mb-4">
                      <span>
                        Your order is processed only after your advance payment of <Price amount={total} className="font-semibold text-ink" /> is confirmed. Until then it stays awaiting payment.
                      </span>
                    </Notice>
                    <div className="border border-line p-4 sm:p-5">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <span aria-hidden className="grid h-4 w-4 place-items-center rounded-full border-4 border-gold" /> Card
                        </span>
                        <span className="code-accent">payment provider: to be connected</span>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field id="co-cardName" label={fieldLabels.cardName} error={errors.cardName} className="sm:col-span-2">
                          {input("cardName", { autoComplete: "off" })}
                        </Field>
                        <Field id="co-cardNumber" label={fieldLabels.cardNumber} error={errors.cardNumber} hint="Preview only — try the test number 4242 4242 4242 4242." className="sm:col-span-2">
                          {input("cardNumber", { autoComplete: "off", inputMode: "numeric", placeholder: "1234 1234 1234 1234", format: formatCardNumber, hint: true })}
                        </Field>
                        <Field id="co-expiry" label={fieldLabels.expiry} error={errors.expiry}>
                          {input("expiry", { autoComplete: "off", inputMode: "numeric", placeholder: "MM/YY", format: formatExpiry })}
                        </Field>
                        <Field id="co-cvc" label={fieldLabels.cvc} error={errors.cvc}>
                          {input("cvc", { autoComplete: "off", inputMode: "numeric", placeholder: "123", format: (v) => v.replace(/\D/g, "").slice(0, 4) })}
                        </Field>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.p key="pay-on-delivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mt-4 flex items-center gap-2 text-sm text-ink-2">
                    <Icon name="cash" size={16} className="shrink-0 text-gold-ink" />
                    <span>
                      You will pay <Price amount={total} className="font-semibold text-ink" /> in cash when your order is delivered.
                    </span>
                  </motion.p>
                )}
              </AnimatePresence>
            </Step>
          </div>

          <div className="mt-10 border-t border-line pt-8">
            <Button type="submit" size="lg" className="w-full" disabled={placing} aria-busy={placing}>
              {placing ? (
                <>
                  <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-bg/30 border-t-bg" /> Placing order…
                </>
              ) : (
                <>
                  Place order · <AnimatedNumber value={total} format={(v) => formatMoney(Math.round(v))} />
                </>
              )}
            </Button>
            <p className="mt-4 text-center text-xs text-muted">
              By placing your order you agree to the{" "}
              <Link to="/terms" className="underline underline-offset-2 hover:text-ink">
                terms &amp; conditions
              </Link>
              .
            </p>
            <Link to="/cart" className="nav-caps mt-6 inline-flex min-h-11 items-center gap-2 hover:text-gold-ink">
              <Icon name="arrowLeft" size={14} /> Return to bag
            </Link>
          </div>
        </form>

        <aside aria-labelledby="co-summary" className="hidden lg:col-span-5 lg:block">
          <div className="border border-line bg-surface p-6 lg:sticky lg:top-28">
            <h2 id="co-summary" className="nav-caps mb-3">
              Order summary · {count} {count === 1 ? "item" : "items"}
            </h2>
            {summary}
          </div>
        </aside>
      </div>
    </div>
  );
}

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router";
import { Field, fieldAria, Notice } from "@/components/commerce/controls";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { products } from "@/data/products";
import type { CustomerMeasurements, MeasurementErrors, MeasurementGroup } from "@/types/measurements";
import { bodyFields, emptyMeasurements, trouserFields, validateMeasurements } from "@/utils/measurements";
import { ease } from "@/utils/motion";

export const customDressOptions = products.filter((product) => product.category === "longline-styles");

function MeasurementInput({ group, field, label, value, error, disabled, onChange }: {
  group: MeasurementGroup;
  field: string;
  label: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = `measurement-${group}-${field}`;
  return (
    <Field id={id} label={label} error={error}>
      <div className="relative">
        <input
          {...fieldAria(id, error)}
          className="input pr-12 tabular-nums"
          type="number"
          inputMode="decimal"
          min="0.01"
          max="120"
          step="0.01"
          required
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <span aria-hidden className="nav-caps pointer-events-none absolute inset-y-0 right-4 flex items-center text-gold-ink">in</span>
      </div>
    </Field>
  );
}

export default function Measurements() {
  const reduce = useReducedMotion();
  const [values, setValues] = useState<CustomerMeasurements>(emptyMeasurements);
  const [errors, setErrors] = useState<MeasurementErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const setMeasurement = (group: MeasurementGroup, field: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [group]: { ...values[group], [field]: event.target.value } };
    setValues(next);
    if (submitted) setErrors(validateMeasurements(next));
  };

  const setDress = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = { ...values, dress: event.target.value };
    setValues(next);
    if (submitted) setErrors(validateMeasurements(next));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateMeasurements(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      if (first === "dress") {
        formRef.current?.querySelector<HTMLElement>("#measurement-dress")?.focus();
        return;
      }
      const [group, field] = first.split(".");
      formRef.current?.querySelector<HTMLElement>(`#measurement-${group}-${field}`)?.focus();
      return;
    }
    setSending(true);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setSending(false);
    setComplete(true);
  };

  const selectedDress = customDressOptions.find((product) => product.id === values.dress);

  const reset = () => {
    setValues(emptyMeasurements);
    setErrors({});
    setSubmitted(false);
    setComplete(false);
  };

  return (
    <>
      <PageHeader docTitle="Custom Dress" eyebrow="Made for you" title="Custom Dress" intro="Enter your body measurements in inches to help us create the right fit for you." crumbs={[{ label: "Custom Dress" }]} />
      <div className="container-x grid min-w-0 grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-12 lg:gap-16">
        <aside className="min-w-0 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">How to measure</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-ink">A considered fit begins with accurate measurements.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-2">Measure your body directly with a soft measuring tape. Keep the tape comfortably snug without pulling it tight.</p>
            <div className="mt-8 border-y border-line py-5">
              <div className="flex items-center gap-3">
                <Icon name="ruler" className="text-gold-ink" />
                <p className="nav-caps">All measurements in inches</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">Use decimal values where needed, for example 16.5 or 17.25.</p>
            </div>
          </div>
        </aside>

        <section aria-labelledby="measurements-form-title" className="min-w-0 lg:col-span-8">
          <div className="min-w-0 max-w-full border border-line bg-surface p-5 sm:p-8 lg:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {complete ? (
                <motion.div key="complete" role="status" className="flex min-h-96 flex-col items-center justify-center py-10 text-center" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: ease.editorial }}>
                  <motion.span className="grid h-16 w-16 place-items-center rounded-full bg-gold text-accent-contrast" initial={reduce ? false : { scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 360, damping: 22 }}>
                    <Icon name="check" size={28} strokeWidth={1.8} />
                  </motion.span>
                  <h2 id="measurements-form-title" className="heading-caps mt-7">Measurements complete</h2>
                  <p className="tagline mt-3 max-w-md">Your measurements{selectedDress ? ` for ${selectedDress.label}` : ""} have been entered successfully.</p>
                  <p className="mt-4 max-w-md text-xs leading-relaxed text-muted">No customer-data service is connected yet, so this preview has not sent or permanently saved your measurements.</p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button variant="outline" onClick={reset}>Edit measurements</Button>
                    <ButtonLink to="/shop">Continue shopping</ButtonLink>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" ref={formRef} noValidate onSubmit={onSubmit} exit={{ opacity: 0 }}>
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
                    <div>
                      <p className="eyebrow">Custom sizing</p>
                      <h2 id="measurements-form-title" className="heading-caps mt-2 !text-lg">Your Measurements</h2>
                      <p className="nav-caps mt-2 text-gold-ink">CUSTOMISED DRESSES (3-4 WEEKS)</p>
                    </div>
                    <p className="text-xs text-muted">All fields are required</p>
                  </div>

                  {submitted && Object.keys(errors).length > 0 && (
                    <Notice tone="error" title="Please check the highlighted measurements." className="mt-6">
                      {Object.keys(errors).length} {Object.keys(errors).length === 1 ? "field needs" : "fields need"} attention.
                    </Notice>
                  )}

                  <div className="mt-8 max-w-xl">
                    <Field id="measurement-dress" label="Select dress" error={errors.dress}>
                      <select
                        {...fieldAria("measurement-dress", errors.dress)}
                        className="input min-w-0 max-w-full text-ellipsis"
                        value={values.dress}
                        onChange={setDress}
                        disabled={sending}
                        required
                      >
                        <option value="" disabled>Select a dress</option>
                        {customDressOptions.map((product) => <option key={product.id} value={product.id}>{product.label}</option>)}
                      </select>
                    </Field>
                  </div>

                  <fieldset className="mt-10 border-t border-line pt-8">
                    <legend className="nav-caps mb-5 flex w-full items-center gap-4 text-ink"><span>01</span><span className="h-px flex-1 bg-line" /><span>Body measurements</span></legend>
                    <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                      {bodyFields.map(({ key, label }) => (
                        <MeasurementInput key={key} group="body" field={key} label={label} value={values.body[key]} error={errors[`body.${key}`]} disabled={sending} onChange={setMeasurement("body", key)} />
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="mt-12 border-t border-line pt-8">
                    <legend className="nav-caps mb-5 flex w-full items-center gap-4 text-ink"><span>02</span><span className="h-px flex-1 bg-line" /><span>Trouser measurements</span></legend>
                    <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                      {trouserFields.map(({ key, label }) => (
                        <MeasurementInput key={key} group="trouser" field={key} label={label} value={values.trouser[key]} error={errors[`trouser.${key}`]} disabled={sending} onChange={setMeasurement("trouser", key)} />
                      ))}
                    </div>
                  </fieldset>

                  <div className="mt-10 flex flex-col gap-5 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-sm text-xs leading-relaxed text-muted">By continuing, you acknowledge that body measurements are sensitive personal information. See our <Link to="/privacy-policy" className="underline underline-offset-2 hover:text-ink">privacy policy</Link>.</p>
                    <Button type="submit" size="lg" disabled={sending} aria-busy={sending} className="shrink-0">
                      {sending ? <><span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-bg/30 border-t-bg" /> Checking…</> : <>Submit measurements <Icon name="arrowRight" size={16} /></>}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </>
  );
}

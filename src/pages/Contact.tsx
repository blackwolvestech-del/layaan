import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router";
import { Field, fieldAria, Notice } from "@/components/commerce/controls";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Reveal } from "@/components/ui/misc";
import { imageByFile } from "@/data/products";
import { contactSubjects, emptyContact, MESSAGE_MAX, validateContact, type ContactErrors, type ContactMessage } from "@/utils/contact";
import { ease } from "@/utils/motion";

// Contact details have not been supplied: each is a visible placeholder until approved.
const details: { icon: IconName; label: string; value: string }[] = [
  { icon: "mail", label: "Email", value: "layann.atelier@gmail.com" },
  { icon: "info", label: "Phone / WhatsApp", value: "+923098988883" },
//  { icon: "box", label: "Studio address", value: "To be confirmed" },
//  { icon: "check", label: "Hours", value: "To be confirmed" },
];

const helpLinks = [
  { to: "/faq", label: "FAQ" },
  { to: "/track-order", label: "Track an order" },
  { to: "/returns", label: "Returns" },
  { to: "/size-guide", label: "Size guide" },
];

export default function Contact() {
  const reduce = useReducedMotion();
  const [values, setValues] = useState<ContactMessage>(emptyContact);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (field: keyof ContactMessage) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (submitted) setErrors(validateContact(next));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateContact(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#ct-${first}`)?.focus();
      return;
    }
    // Frontend only: no API or email service is connected, so nothing is sent.
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    setSent(values.name.trim().split(/\s+/)[0] ?? "");
  };

  const reset = () => {
    setValues(emptyContact);
    setErrors({});
    setSubmitted(false);
    setSent(null);
  };

  return (
    <>
      <PageHeader docTitle="Contact us" eyebrow="Help" title="Contact us" intro="Questions about a look, an order or sizing — we're here to help." crumbs={[{ label: "Contact" }]} />
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-5">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[2px] max-lg:hidden" variant="blur">
            <Img image={imageByFile("DSC00252.jpg")} sizes="40vw" className="absolute inset-0" decorative />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <p className="tagline absolute right-6 bottom-6 left-6 !text-white/90">Refined tailoring, from everyday to occasion.</p>
          </Reveal>
          <div className="mt-0 lg:mt-10">
            <h2 className="nav-caps mb-5">Get in touch</h2>
            <dl className="divide-y divide-line border-y border-line">
              {details.map((d) => (
                <div key={d.label} className="flex items-center gap-4 py-4">
                  <Icon name={d.icon} size={18} className="shrink-0 text-gold-ink" />
                  <dt className="w-36 shrink-0 text-xs font-semibold tracking-[0.1em] text-ink-2 uppercase">{d.label}</dt>
                  <dd className="text-sm text-muted">{d.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <p className="nav-caps mb-3 text-muted">Quick help</p>
              <ul className="flex flex-wrap gap-2">
                {helpLinks.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="flex min-h-10 items-center rounded-full border border-line px-4 text-xs transition-colors hover:border-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <section aria-labelledby="form-title" className="lg:col-span-7">
          <div className="border border-line bg-surface p-5 sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {sent !== null ? (
                <motion.div key="sent" role="status" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: ease.editorial }} className="flex flex-col items-center py-12 text-center">
                  <motion.span className="grid h-16 w-16 place-items-center rounded-full bg-gold text-accent-contrast" initial={reduce ? false : { scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 20 }}>
                    <Icon name="check" size={28} strokeWidth={1.8} />
                  </motion.span>
                  <h2 id="form-title" className="heading-caps mt-6">
                    Thank you{sent ? `, ${sent}` : ""}
                  </h2>
                  <p className="tagline mt-3 max-w-md">Thanks for getting in touch.</p>
                  <p className="mt-4 max-w-md text-xs text-muted">Preview site: messages aren't sent yet — this form will be connected when the site launches.</p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button variant="outline" onClick={reset}>
                      Send another message
                    </Button>
                    <ButtonLink to="/shop">Continue shopping</ButtonLink>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" ref={formRef} noValidate onSubmit={onSubmit} exit={{ opacity: 0, transition: { duration: 0.2 } }} className="space-y-6">
                  <div>
                    <h2 id="form-title" className="heading-caps !text-lg">
                      Send a message
                    </h2>
                    <p className="mt-2 text-sm text-muted">Fields marked optional can be left blank.</p>
                  </div>
                  {submitted && Object.keys(errors).length > 0 && (
                    <Notice tone="error" title="Please check the highlighted fields.">
                      {Object.keys(errors).length} {Object.keys(errors).length === 1 ? "field needs" : "fields need"} attention.
                    </Notice>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="ct-name" label="Name" error={errors.name}>
                      <input {...fieldAria("ct-name", errors.name)} className="input" autoComplete="name" value={values.name} onChange={set("name")} disabled={sending} />
                    </Field>
                    <Field id="ct-email" label="Email" error={errors.email}>
                      <input {...fieldAria("ct-email", errors.email)} className="input" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set("email")} disabled={sending} />
                    </Field>
                    <Field id="ct-phone" label="Phone" optional error={errors.phone}>
                      <input {...fieldAria("ct-phone", errors.phone)} className="input" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} disabled={sending} />
                    </Field>
                    <Field id="ct-subject" label="Subject" error={errors.subject}>
                      <select {...fieldAria("ct-subject", errors.subject)} className="input" value={values.subject} onChange={set("subject")} disabled={sending}>
                        <option value="" disabled>
                          Choose a subject
                        </option>
                        {contactSubjects.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <AnimatePresence initial={false}>
                      {(values.subject === "An order" || values.subject === "Returns & exchanges") && (
                        <motion.div key="order" className="overflow-hidden sm:col-span-2" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: ease.editorial }}>
                          <Field id="ct-orderNumber" label="Order number" optional>
                            <input id="ct-orderNumber" className="input font-mono uppercase" placeholder="LA-XXXXXX" value={values.orderNumber} onChange={set("orderNumber")} disabled={sending} />
                          </Field>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Field id="ct-message" label="Message" error={errors.message} className="sm:col-span-2">
                      <textarea {...fieldAria("ct-message", errors.message)} className="input min-h-40 resize-y" maxLength={MESSAGE_MAX + 200} value={values.message} onChange={set("message")} disabled={sending} />
                      <p className="mt-1 text-right text-xs text-muted tabular-nums" aria-live="polite">
                        {values.message.length} / {MESSAGE_MAX}
                      </p>
                    </Field>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted">
                      See our{" "}
                      <Link to="/privacy-policy" className="underline underline-offset-2 hover:text-ink">
                        privacy policy
                      </Link>
                      .
                    </p>
                    <Button type="submit" size="lg" disabled={sending} aria-busy={sending}>
                      {sending ? (
                        <>
                          <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-bg/30 border-t-bg" /> Sending…
                        </>
                      ) : (
                        <>
                          Send message <Icon name="arrowRight" size={16} />
                        </>
                      )}
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

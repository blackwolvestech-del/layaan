import { Accordion } from "radix-ui";
import { HelpLinks, PolicyLayout, PolicyPlaceholder } from "@/components/commerce/PolicyParts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { shippingMethods } from "@/data/commerce";

// Delivery areas, rates, times and carriers have not been supplied. Every business-specific
// statement below is a clearly marked placeholder for approved copy.
const faqs = [
  { q: "Where do you deliver?", a: "Delivery destinations to be confirmed by LAYAAN Atelier." },
  { q: "How much does delivery cost?", a: "Shipping rates to be confirmed. Any shipping charge is shown at checkout before you place an order." },
  { q: "How long will my order take?", a: "Processing and delivery times to be confirmed." },
  { q: "How do I track my order?", a: "Once your order ships, a tracking reference appears on your order page and on the Track an order page." },
  { q: "Can I change my delivery address after ordering?", a: "Address change process to be confirmed." },
  { q: "Are duties or taxes charged on international orders?", a: "Duties and tax information to be confirmed." },
];

const process = [
  ["Processing", "Your order is received and prepared."],
  ["Confirmed", "The atelier confirms your order."],
  ["Shipped", "The parcel is handed to the delivery partner and a tracking reference is added."],
  ["Out for delivery", "The parcel is on its way to your address."],
  ["Delivered", "Your order has arrived. Returns can be requested from your order."],
] as const;

export default function Shipping() {
  return (
    <>
      <PageHeader docTitle="Shipping & delivery" eyebrow="Help" title="Shipping & delivery" intro="How orders are prepared, shipped and delivered." crumbs={[{ label: "Shipping & delivery" }]} />
      <PolicyLayout
        aside={<HelpLinks />}
        sections={[
          {
            id: "overview",
            title: "Shipping information",
            body: (
              <>
                <p>Every order is prepared by the atelier and handed to a delivery partner. You can follow its progress from your order page or the Track an order page.</p>
                <PolicyPlaceholder>Delivery destinations, carriers and packaging details.</PolicyPlaceholder>
              </>
            ),
          },
          {
            id: "process",
            title: "Delivery process",
            body: (
              <ol className="my-4 grid gap-3 sm:grid-cols-2">
                {process.map(([t, d], i) => (
                  <li key={t} className="flex gap-3 border border-line p-4">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold text-xs font-semibold text-gold-ink">{i + 1}</span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{t}</span>
                      <span className="block text-sm">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            ),
          },
          {
            id: "methods",
            title: "Shipping methods",
            body: (
              <>
                <ul className="!list-none !pl-0">
                  {shippingMethods.map((m) => (
                    <li key={m.id} className="flex items-start gap-3 border-b border-line py-3">
                      <Icon name="truck" size={20} className="mt-1 shrink-0 text-gold-ink" />
                      <span>
                        <span className="block font-semibold text-ink">{m.label}</span>
                        <span className="block text-sm">{m.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <PolicyPlaceholder>Rates, eligibility and any free-delivery threshold for each method.</PolicyPlaceholder>
              </>
            ),
          },
          {
            id: "expectations",
            title: "Delivery expectations",
            body: (
              <>
                <p>Estimated delivery is shown on your order once it can be confirmed.</p>
                <PolicyPlaceholder>Processing times, delivery windows by destination, and what happens if a delivery is missed.</PolicyPlaceholder>
              </>
            ),
          },
          {
            id: "faq",
            title: "Frequently asked questions",
            body: (
              <Accordion.Root type="single" collapsible className="mt-4 border-t border-line">
                {faqs.map((f, i) => (
                  <Accordion.Item key={f.q} value={`q${i}`} className="border-b border-line">
                    <Accordion.Header>
                      <Accordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 text-left text-sm font-semibold text-ink">
                        {f.q}
                        <Icon name="plus" size={16} className="shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-45" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="accordion-content overflow-hidden">
                      <p className="pb-5 text-sm text-ink-2">{f.a}</p>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            ),
          },
        ]}
      />
    </>
  );
}

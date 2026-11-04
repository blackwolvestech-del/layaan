import { Accordion } from "radix-ui";
import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, Reveal } from "@/components/ui/misc";
import { faqAnswerText, faqCategories, type FaqItem } from "@/data/faq";

function Answer({ item }: { item: FaqItem }) {
  return (
    <div className="space-y-3">
      {item.answer.map((block, index) => {
        if (block.type === "paragraph") return <p key={index}>{block.text}</p>;
        if (block.type === "list") return <ul key={index} className="list-disc space-y-1.5 pl-5">{block.items.map((value) => <li key={value}>{value}</li>)}</ul>;
        return <div key={index} className="space-y-1">{block.items.map((value) => <p key={value}>{value}</p>)}</div>;
      })}
    </div>
  );
}

export default function FAQ() {
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());
  const categories = useMemo(
    () => (q ? faqCategories.map((c) => ({ ...c, items: c.items.filter((i) => `${i.q} ${faqAnswerText(i)}`.toLowerCase().includes(q)) })).filter((c) => c.items.length > 0) : faqCategories),
    [q],
  );
  const total = categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <>
      <PageHeader docTitle="FAQ" eyebrow="Help" title="Frequently asked questions" intro={<>Welcome to LAYAAN.<br />We believe luxury lies in the details—from the silhouette you choose to the way your piece arrives at your door. Below you'll find answers to some of our most frequently asked questions.</>} crumbs={[{ label: "FAQ" }]} />
      <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-14">
        <aside className="lg:col-span-3">
          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="flex items-center gap-2 border-b border-ink/60 pb-2">
              <Icon name="search" size={18} className="text-muted" />
              <label htmlFor="faq-search" className="sr-only">
                Search questions
              </label>
              <input id="faq-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions" className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted" autoComplete="off" />
            </div>
            <p className="sr-only" aria-live="polite">
              {q ? `${total} matching questions` : ""}
            </p>
            <nav aria-label="FAQ categories">
              <ul className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
                {categories.map((c) => (
                  <li key={c.id} className="shrink-0">
                    <a href={`#faq-${c.id}`} className="flex min-h-10 items-center justify-between gap-3 rounded-full border border-line px-4 text-xs font-semibold tracking-[0.12em] whitespace-nowrap uppercase transition-colors hover:border-ink lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:hover:text-gold-ink">
                      {c.title}
                      <span className="code-accent hidden lg:inline">{String(c.items.length).padStart(2, "0")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="hidden border border-line p-5 lg:block">
              <p className="nav-caps">Still need help?</p>
              <p className="mt-2 text-sm text-ink-2">Send us a message and we'll get back to you.</p>
              <Link to="/contact" className="nav-caps mt-4 inline-flex min-h-10 items-center gap-2 text-gold-ink">
                Contact us <Icon name="arrowRight" size={13} />
              </Link>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9">
          {categories.length === 0 && <EmptyState title="No matching questions" body={<>Nothing matches “{query}”. Try another word or contact us.</>} action={<ButtonLink to="/contact" variant="outline">Contact us</ButtonLink>} />}
          <div className="space-y-14">
            {categories.map((c) => (
              <Reveal as="section" key={c.id} className="scroll-mt-32">
                <h2 id={`faq-${c.id}`} className="heading-caps mb-4 scroll-mt-32 !text-lg">
                  {c.title}
                </h2>
                {/* Radix Accordion: Enter/Space toggle, ↑/↓/Home/End move between questions. */}
                <Accordion.Root type="multiple" defaultValue={q ? c.items.map((_, i) => `${c.id}-${i}`) : undefined} key={q ? `q-${q}` : "all"} className="border-t border-line">
                  {c.items.map((item, i) => (
                    <Accordion.Item key={item.q} value={`${c.id}-${i}`} className="border-b border-line">
                      <Accordion.Header>
                        <Accordion.Trigger className="group flex min-h-16 w-full items-center justify-between gap-6 py-4 text-left">
                          <span className="text-[0.9375rem] font-semibold transition-colors group-hover:text-gold-ink">{item.q}</span>
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line transition-[transform,background-color,color] duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:border-ink group-data-[state=open]:bg-ink group-data-[state=open]:text-bg">
                            <Icon name="plus" size={15} />
                          </span>
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content className="accordion-content overflow-hidden">
                        <div className="max-w-2xl pr-6 pb-6 text-sm leading-relaxed text-ink-2 sm:pr-12">
                          <Answer item={item} />
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 flex flex-col items-center gap-4 border border-line bg-surface-2 px-6 py-10 text-center lg:hidden">
            <p className="heading-caps !text-base">Still need help?</p>
            <ButtonLink to="/contact">Contact us</ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}

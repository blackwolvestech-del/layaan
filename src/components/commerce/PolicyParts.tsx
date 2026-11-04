import type { ReactNode } from "react";
import { Link } from "react-router";
import { Reveal } from "../ui/misc";

/**
 * Marks where approved business or legal copy must be inserted. Rendered visibly so nobody
 * mistakes placeholder text for real policy.
 */
export function PolicyPlaceholder({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 border-l-2 border-warning/70 bg-surface-2 px-4 py-3 text-sm">
      <p className="code-accent mb-1 !text-warning">placeholder — awaiting approved copy</p>
      <div className="text-ink-2">{children}</div>
    </div>
  );
}

export interface PolicySection {
  id: string;
  title: string;
  body: ReactNode;
}

/** Long-form policy layout: sticky contents list beside numbered sections. */
export function PolicyLayout({ sections, aside }: { sections: PolicySection[]; aside?: ReactNode }) {
  return (
    <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-14">
      <nav aria-label="On this page" className="lg:col-span-3">
        <div className="border border-line p-5 lg:sticky lg:top-28">
          <p className="nav-caps mb-4 text-muted">On this page</p>
          <ol className="space-y-2 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="link-underline text-ink-2 hover:text-ink">
                  <span className="code-accent mr-2">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
          {aside}
        </div>
      </nav>
      <div className="prose-layaan max-w-3xl lg:col-span-9">
        {sections.map((s, i) => (
          <Reveal as="section" key={s.id} className="scroll-mt-32 border-b border-line pb-8 last:border-b-0">
            <h2 id={s.id} className="flex items-baseline gap-3">
              <span className="code-accent">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </h2>
            {s.body}
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function HelpLinks() {
  const links = [
    { to: "/shipping", label: "Shipping" },
    { to: "/returns", label: "Returns" },
    { to: "/size-guide", label: "Size guide" },
    { to: "/track-order", label: "Track an order" },
    { to: "/terms", label: "Terms & conditions" },
    { to: "/contact", label: "Contact" },
  ];
  return (
    <ul className="mt-6 space-y-2 border-t border-line pt-5 text-xs">
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to} className="text-muted underline-offset-4 hover:text-ink hover:underline">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

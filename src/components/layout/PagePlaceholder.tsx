import type { ReactNode } from "react";
import { Link } from "react-router";
import { Icon } from "../ui/Icon";

interface PagePlaceholderProps {
  title: string;
  eyebrow?: string;
  /** Optional context line, e.g. the current slug or order id from the route. */
  detail?: ReactNode;
}

/** Shared scaffold for pages that are still to be built. Inherits the site theme and layout. */
export function PagePlaceholder({ title, eyebrow = "LAYAAN Atelier", detail }: PagePlaceholderProps) {
  return (
    <section aria-labelledby="page-title" className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center sm:py-24">
      <title>{`${title} — LAYAAN Atelier`}</title>
      <p className="nav-caps mb-4 text-muted">{eyebrow}</p>
      <h1 id="page-title" className="page-title text-balance">
        {title}
      </h1>
      {detail && <p className="code-accent mt-4">{detail}</p>}
      <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-2">
        This section will be available soon. In the meantime, explore our collection.
      </p>
      <Link to="/" className="mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-ink hover:text-gold-ink transition-colors">
        <Icon name="arrowLeft" size={14} /> Back to homepage
      </Link>
    </section>
  );
}


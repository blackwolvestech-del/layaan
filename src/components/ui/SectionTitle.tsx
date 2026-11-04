import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { SplitText } from "../fx/SplitText";
import { Icon } from "./Icon";
import { Reveal } from "./misc";

/** Retail-style centred heading: uppercase title, italic tagline, optional "view all" link. */
export function SectionTitle({ id, title, tagline, viewAll, align = "center", children }: { id?: string; title: string; tagline?: string; viewAll?: string; align?: "center" | "left"; children?: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <Reveal className={align === "center" ? "mb-10 flex flex-col items-center text-center sm:mb-12" : "mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between"}>
      <div>
        <SplitText as="h2" id={id} text={title} stagger={0.022} className="heading-caps" />
        {tagline && <p className="tagline mt-2">{tagline}</p>}
        {/* Gold rule drawn out from the centre (or the left) once the title is in view. */}
        <motion.span
          aria-hidden
          className={align === "center" ? "mx-auto mt-4 block h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" : "mt-4 block h-px w-16 origin-left bg-gold"}
          initial={reduce ? false : { scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, amount: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        />
      </div>
      <div className={align === "center" ? "mt-5 flex items-center gap-4" : "flex items-center gap-4"}>
        {viewAll && (
          <Link to={viewAll} className="nav-caps group inline-flex min-h-10 items-center gap-2 border-b border-ink/40 pb-0.5 transition-colors hover:border-gold hover:text-gold-ink">
            View all <Icon name="arrowRight" size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        )}
        {children}
      </div>
    </Reveal>
  );
}

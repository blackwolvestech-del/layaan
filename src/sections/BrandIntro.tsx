import { useReducedMotion } from "motion/react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/misc";
import { ScrollRevealText } from "@/components/fx/ScrollRevealText";
import { SplitText } from "@/components/fx/SplitText";
import { copy } from "@/data/copy";

const SilkCanvas = lazy(() => import("@/components/media/SilkCanvas"));

/** Brand introduction. "teaser" on the homepage links to /about; "full" is the About page body. */
export function BrandIntro({ variant = "teaser" }: { variant?: "teaser" | "full" }) {
  const Heading = "h2";
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const c = copy.intro;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} aria-labelledby="intro-title" className="relative isolate overflow-hidden border-y border-line">
      {/* Static gradient fallback; the WebGL layer (lazy, paused offscreen) is decorative only. */}
      <div aria-hidden className="field-gradient absolute inset-0 -z-20" />
      {!reduce && visible && (
        <Suspense fallback={null}>
          <SilkCanvas active={visible} className="absolute inset-0 -z-10 opacity-70" />
        </Suspense>
      )}
      <div className="container-x grid gap-10 py-24 sm:py-32 lg:grid-cols-12">
        <p className="eyebrow lg:col-span-3">{c.eyebrow}</p>
        <div className="lg:col-span-8">
          {variant === "teaser" ? (
            <>
              <h2 id="intro-title" className="text-h1 text-balance">
                <SplitText text={c.title} stagger={0.02} />
              </h2>
              <ScrollRevealText text={c.body} className="mt-8 max-w-3xl font-display text-[clamp(1.25rem,1rem+1vw,1.875rem)] leading-snug text-ink" />
            </>
          ) : (
            <>
              <Reveal variant="blur">
                <Heading id="intro-title" className="text-h1 text-balance">
                  {c.title}
                </Heading>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2">{c.body}</p>
              </Reveal>
            </>
          )}
          {variant === "full" && (
          <ul className="mt-12 grid gap-6 sm:grid-cols-3">
            {c.pillars.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.08} className="border-t border-gold/60 pt-4">
                <p className="code-accent">0{i + 1}</p>
                <h3 className="mt-2 font-display text-xl">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
              </Reveal>
            ))}
          </ul>
          )}
          <div className="mt-12">
            {variant === "teaser" ? (
              <ButtonLink to="/about" variant="outline">
                About LAYAAN Atelier
              </ButtonLink>
            ) : (
              <ButtonLink to="/shop" variant="outline">
                Shop the collection
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

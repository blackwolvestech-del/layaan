import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { useUi } from "@/context/UiContext";
import { productById } from "@/data/products";
import type { Product } from "@/types/product";


const LOOKS = ["ivory-pinstripe-suit", "navy-wrap-trouser-suit", "rust-jacket-wide-leg-trousers"];

/** Editorial split: a large look image beside its details, animated in with GSAP. */
export function ShopTheLook() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const looks = LOOKS.map((id) => productById(id)).filter((p): p is Product => !!p);
  const { openQuickView } = useUi();
  const look = looks[0]!; // Just show the first look (no slider)
  
  const details = look.images.filter((img) => img.view === "detail" || img.view === "portrait" || img.view === "seated").slice(0, 3);

  const reduce = useReducedMotion();

  // GSAP is loaded on demand (as in the lookbook) so it stays out of the main bundle.
  useEffect(() => {
    if (reduce || !sectionRef.current || !imageWrapperRef.current || !contentRef.current) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !sectionRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
      gsap.fromTo(
        imageWrapperRef.current,
        { opacity: 0, clipPath: "inset(10% 0 0 0)" },
        {
          opacity: 1,
          clipPath: "inset(0% 0 0 0)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        }
      );
      
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        }
      );
      }, sectionRef);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduce]);

  return (
    <section ref={sectionRef} aria-labelledby="stl-title" className="bg-cream py-16 sm:py-24 lg:py-0 lg:h-[100svh] lg:min-h-[45rem] lg:flex lg:items-center overflow-hidden">
      <div className="container-x w-full grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div ref={imageWrapperRef} className="relative mx-auto w-full max-w-[28rem] lg:max-w-[32rem] max-h-[75vh] aspect-[4/5] overflow-hidden rounded-sm shadow-xl">
          <Img image={look.images[0]} sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-cover" />
          <span className="code-accent absolute top-4 left-4 z-10 rounded-[2px] bg-black/40 px-2 py-1 !text-white/85 backdrop-blur-sm">shop_the_look</span>
        </div>

        <div ref={contentRef} className="lg:pl-8">
          <p className="nav-caps text-muted tracking-widest">Shop the look</p>
          <h2 id="stl-title" className="text-h1 mt-4 text-balance font-display">
            {look.label}
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-ink-2 text-lg">{look.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {look.includedPieces.map((piece) => (
              <li key={piece} className="nav-caps rounded-full border border-line-strong px-4 py-2 !text-[0.625rem] bg-white/50">
                {piece}
              </li>
            ))}
          </ul>
          {details.length > 0 && (
            <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
              {details.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => openQuickView(look.id)}
                  className="group relative aspect-[3/4] overflow-hidden rounded-sm ring-1 ring-line-strong transition-all duration-500 ease-[var(--ease-editorial)] hover:ring-2 hover:ring-gold hover:shadow-lg hover:-translate-y-1"
                  aria-label={`Quick view: ${look.label}`}
                >
                  <Img image={d} sizes="140px" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-110" decorative />
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-black opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md scale-90 group-hover:scale-100">
                      <Icon name="plus" size={12} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <ButtonLink to={`/products/${look.id}`} className="!px-8 !py-4 shadow-sm hover:shadow-md transition-shadow">
              View the look <Icon name="arrowRight" size={14} />
            </ButtonLink>
            <button type="button" onClick={() => openQuickView(look.id)} className="nav-caps min-h-12 border-b border-ink/40 px-2 hover:border-gold hover:text-gold-ink transition-colors">
              Quick view
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

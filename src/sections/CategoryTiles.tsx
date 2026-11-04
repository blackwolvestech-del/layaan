import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { TiltCard } from "@/components/fx/TiltCard";
import { Img } from "@/components/ui/Img";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { categories, imageByFile, products } from "@/data/products";
import { fadeUp, revealViewport, staggerParent } from "@/utils/motion";

// Cover photograph for each tile (local originals, see scripts/assets/catalog.mjs).
const COVERS: Record<string, string> = {
  "suits-co-ords": "DSC00449.jpg",
  "tops-blouses": "DSC09823.jpg",
  "longline-styles": "DSC00493.jpg",
  all: "DSC00020.jpg",
};

/** "Shop by category" row of tall tiles with a curtain reveal on scroll. */
export function CategoryTiles() {
  const reduce = useReducedMotion();
  const tiles = [
    ...categories.map((c) => ({ id: c.id, label: c.name, to: `/shop?category=${c.id}`, count: products.filter((p) => p.category === c.id).length })),
    { id: "all", label: "Shop all", to: "/shop", count: products.length },
  ];
  return (
    <section aria-labelledby="categories-title" className="container-x py-14 sm:py-20">
      <SectionTitle id="categories-title" title="Shop by category" tagline="find your silhouette" />
      <motion.ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" initial={reduce ? false : "hidden"} whileInView="show" viewport={revealViewport} variants={staggerParent(0.1)}>
        {tiles.map((t) => (
          <motion.li key={t.id} variants={fadeUp}>
            <Link to={t.to} className="group block" data-cursor="Explore">
              <TiltCard>
              <motion.span
                className="relative block aspect-[3/4] overflow-hidden rounded-[2px] bg-surface-2 ring-1 ring-line/40 transition-all duration-700 ease-[var(--ease-editorial)] group-hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.16)] group-hover:ring-line-strong"
                initial={reduce ? false : { clipPath: "inset(12% 0 0 0)" }}
                whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Img image={imageByFile(COVERS[t.id]!)} sizes="(min-width: 1024px) 25vw, 50vw" className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105" decorative />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 transition-opacity duration-500 ease-[var(--ease-editorial)] group-hover:opacity-100" />
              </motion.span>
              </TiltCard>
              <span className="mt-4 flex items-baseline justify-between gap-3">
                <span className="nav-caps relative transition-colors duration-300 group-hover:text-gold-ink">
                  {t.label}
                  <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:scale-x-100" />
                </span>
                <span className="code-accent">{String(t.count).padStart(2, "0")}</span>
              </span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

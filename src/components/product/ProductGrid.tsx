import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Product } from "@/types/product";
import { ease, staggerParent } from "@/utils/motion";
import { ProductCard } from "./ProductCard";

/** Every 7th look is shown large in showcase grids (large screens), for an editorial rhythm. */
const isFeature = (i: number, total: number) => total >= 6 && i % 7 === 0;

/**
 * Product grid used by the shop, collection, search, wishlist and product pages.
 * @param showcase cards rise out of a curtain as they scroll into view, with some looks shown large.
 */
export function ProductGrid({ products, className = "lg:grid-cols-3 xl:grid-cols-4", showcase = false }: { products: Product[]; className?: string; showcase?: boolean }) {
  const reduce = useReducedMotion();
  if (showcase) {
    return (
      <div className={clsx("grid grid-flow-row-dense grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5", className)}>
        <AnimatePresence mode="popLayout" initial={false}>
          {products.map((p, i) => {
            const feature = isFeature(i, products.length);
            return (
              <motion.div
                key={p.id}
                layout={!reduce}
                className={clsx(feature && "lg:col-span-2 lg:row-span-2")}
                initial={reduce ? false : { opacity: 0, y: 70, clipPath: "inset(22% 0% 0% 0%)" }}
                whileInView={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 1, ease: ease.editorial, delay: (i % 4) * 0.08 }}
              >
                <ProductCard product={p} animate={false} sizes={feature ? "(min-width: 1024px) 50vw, 50vw" : undefined} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }
  return (
    <motion.div className={`grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 ${className}`} initial={reduce ? false : "hidden"} animate="show" variants={staggerParent(0.05)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

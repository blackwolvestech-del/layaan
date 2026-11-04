import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { placements } from "@/data/assets";
import { collections, imageByFile, products } from "@/data/products";
import { fadeUp, revealViewport, staggerParent } from "@/utils/motion";

interface FeaturedCollectionsProps {
  title?: string;
  tagline?: string;
  /** The /collections page supplies its own page header, so it hides this one. */
  showHeading?: boolean;
}

/** Collection cards linking to each collection page (homepage and /collections). */
export function FeaturedCollections({ title = "Shop by collection", tagline = "dressing by intention", showHeading = true }: FeaturedCollectionsProps) {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby={showHeading ? "collections-title" : undefined} aria-label={showHeading ? undefined : "Collections"} className={showHeading ? "container-x py-14 sm:py-20" : "container-x pb-10"}>
      {showHeading && <SectionTitle id="collections-title" title={title} tagline={tagline} viewAll="/collections" />}
      <motion.ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" initial={reduce ? false : "hidden"} whileInView="show" viewport={revealViewport} variants={staggerParent(0.1)}>
        {collections.map((c, i) => {
          const count = products.filter((p) => p.collections.includes(c.id)).length;
          return (
            <motion.li key={c.id} variants={fadeUp}>
              <Link to={`/collections/${c.id}`} className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[2px] ring-1 ring-white/10 transition-all duration-700 ease-[var(--ease-editorial)] group-hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.3)]" aria-label={`${c.name} — ${count} looks`}>
                <Img image={imageByFile(placements.collectionCovers[c.id])} sizes="(min-width: 1024px) 25vw, 50vw" className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105" decorative />
                {/* Tint transition: the warm veil lifts on hover so garment colour reads true. */}
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-opacity duration-500 group-hover:opacity-60" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white sm:p-5">
                  <span>
                    <span className="code-accent block !text-white/75">
                      {String(i + 1).padStart(2, "0")} · {count} looks
                    </span>
                    <span className="nav-caps mt-2 block !text-[0.8125rem] sm:!text-sm transition-colors duration-300 group-hover:text-gold">{c.name}</span>
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/50 transition-all duration-400 ease-[var(--ease-editorial)] group-hover:scale-110 group-hover:bg-white group-hover:text-black shadow-md">
                    <Icon name="arrowRight" size={14} />
                  </span>
                </span>
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}

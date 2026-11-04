import { CatalogueBrowser } from "@/components/catalogue/CatalogueBrowser";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { categories, collections, products } from "@/data/products";
import { ShopHero } from "@/sections/ShopHero";

const bandWords = [...categories.map((c) => c.name), ...collections.map((c) => c.name)];

export default function Shop() {
  return (
    <>
      <title>Shop — LAYAAN Atelier</title>
      <ShopHero count={products.length} />
      <VelocityMarquee items={bandWords} baseVelocity={-1.4} className="overflow-hidden border-b border-line py-4 font-display text-[clamp(1.75rem,1.2rem+2.5vw,3.25rem)] leading-none text-ink" />
      <div id="collection" className="container-x scroll-mt-28 pt-10 pb-10">
        <CatalogueBrowser showcase />
      </div>
    </>
  );
}

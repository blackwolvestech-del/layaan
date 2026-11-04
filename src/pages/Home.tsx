import { Preloader } from "@/components/fx/Preloader";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { ProductRail } from "@/components/product/ProductRail";
import { homeRails } from "@/data/copy";
import { products } from "@/data/products";
import { AtelierRing } from "@/sections/AtelierRing";
import { BrandIntro } from "@/sections/BrandIntro";
import { CategoryTiles } from "@/sections/CategoryTiles";
import { FeaturedCollections } from "@/sections/FeaturedCollections";
import { Hero } from "@/sections/Hero";
import { ImageTrail } from "@/sections/ImageTrail";
import { HorizontalLookbook } from "@/sections/Lookbook";
import { ReelBanner } from "@/sections/ReelBanner";
import { ShopTheLook } from "@/sections/ShopTheLook";
import { StackedLooks } from "@/sections/StackedLooks";
import { ZoomReveal } from "@/sections/ZoomReveal";

const rail = (i: number) => {
  const r = homeRails[i]!;
  return <ProductRail key={r.id} id={r.id} title={r.title} tagline={r.tagline} viewAll={r.to} products={products.filter((p) => p.collections.includes(r.collection))} />;
};

/** Words for the scroll-driven type band (positioning only — no offers or claims). */
const bandWords = ["Refined tailoring", "Statement sleeves", "Coordinated sets", "Everyday to occasion", "LAYAAN Atelier"];

/** Landing page, laid out like a modern fashion storefront: hero, categories, edits, looks. */
export default function Home() {
  return (
    <>
      <title>LAYAAN Atelier — Contemporary Western Womenswear</title>
      <Preloader />
      <Hero />
      <VelocityMarquee items={bandWords} className="overflow-hidden border-b border-line py-6 font-display text-[clamp(2.5rem,1.6rem+5vw,6.5rem)] leading-none text-ink sm:py-8" />
      <CategoryTiles />
      <ZoomReveal />
      {rail(0)}
      <ShopTheLook />
      <AtelierRing />
      {rail(1)}
      <StackedLooks />
      <ReelBanner />
      {rail(2)}
      <HorizontalLookbook />
      <FeaturedCollections title="Shop by collection" />
      <ImageTrail />
      <VelocityMarquee items={[...bandWords].reverse()} baseVelocity={1.6} className="overflow-hidden border-t border-line py-6 font-display text-[clamp(2rem,1.4rem+3.5vw,4.5rem)] leading-none text-ink sm:py-8" />
      <BrandIntro />
    </>
  );
}

import { ReelPlayer } from "@/components/media/ReelPlayer";
import { Img } from "@/components/ui/Img";
import { Reveal, SectionHeading } from "@/components/ui/misc";
import { useUi } from "@/context/UiContext";
import { placements } from "@/data/assets";
import { imageByFile } from "@/data/products";
import type { ProductImage } from "@/types/product";

export function CampaignGallery() {
  const { openLightbox } = useUi();
  const imgs = placements.gallery.map((f) => imageByFile(f)).filter((i): i is ProductImage => !!i);
  const open = (i: number) => openLightbox({ images: imgs, index: i, title: "Campaign gallery" });
  // Skip any placement whose photograph is missing from the catalogue instead of crashing.
  const tile = (i: number, aspect: string) => {
    const img = imgs[i];
    if (!img) return null;
    return (
      <Reveal key={img.id} className="mb-3 break-inside-avoid overflow-hidden rounded-[2px] sm:mb-4">
        <button type="button" className="group block w-full" onClick={() => open(i)} aria-label={`Enlarge: ${img.alt}`}>
          <Img image={img} sizes="(min-width: 768px) 33vw, 50vw" className={`${aspect} transition-transform duration-1000 group-hover:scale-[1.03]`} decorative />
        </button>
      </Reveal>
    );
  };
  return (
    <section aria-labelledby="gallery-title" className="container-x py-20 sm:py-28">
      <SectionHeading id="gallery-title" eyebrow="the campaign, in stills and motion" title="Campaign gallery" />
      <div className="columns-2 gap-3 sm:gap-4 md:columns-3">
        {tile(0, "aspect-[3/4]")}
        <Reveal className="mb-3 break-inside-avoid overflow-hidden rounded-[2px] sm:mb-4">
          <ReelPlayer className="aspect-[9/16]" />
        </Reveal>
        <Reveal className="mb-3 break-inside-avoid bg-cream p-6 sm:mb-4 sm:p-8">
          <p className="code-accent mb-6">// campaign_notes</p>
          <p className="font-display text-2xl leading-snug">Colour worn with conviction — teal, crimson, emerald and ivory.</p>
        </Reveal>
        {tile(1, "aspect-[3/4]")}
        {tile(2, "aspect-[4/5]")}
        {tile(3, "aspect-[3/4]")}
        {tile(4, "aspect-[4/5]")}
        {tile(5, "aspect-[3/4]")}
        {tile(6, "aspect-[4/5]")}
      </div>
    </section>
  );
}

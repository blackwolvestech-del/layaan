import { PageHeader } from "@/components/layout/PageHeader";
import { Img } from "@/components/ui/Img";
import { Reveal } from "@/components/ui/misc";
import { useUi } from "@/context/UiContext";
import { products } from "@/data/products";
import { CampaignGallery } from "@/sections/CampaignGallery";
import { HorizontalLookbook } from "@/sections/Lookbook";

/** Every look as a photo series (opens in the lightbox), plus the look strip and campaign gallery. */
export default function Lookbook() {
  const { openLightbox } = useUi();
  return (
    <>
      <PageHeader docTitle="Lookbook" eyebrow="Editorial" title="Lookbook" intro={`${products.length} looks, photographed in full — open any look to browse every image.`} crumbs={[{ label: "Lookbook" }]} />
      <section aria-label="All looks" className="container-x pb-20">
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 4) * 0.05}>
              <button type="button" onClick={() => openLightbox({ images: p.images, index: 0, title: p.label })} className="group block w-full text-left" aria-label={`Open ${p.label}: ${p.images.length} photographs`}>
                <span className="relative block aspect-[3/4] overflow-hidden rounded-[2px]">
                  <Img image={p.images[0]} sizes="(min-width: 1024px) 25vw, 50vw" className="absolute inset-0 transition-transform duration-1000 group-hover:scale-[1.03]" decorative />
                  <span className="code-accent absolute top-3 left-3 rounded-[2px] bg-black/40 px-2 py-1 !text-white/85">LOOK_{String(i + 1).padStart(2, "0")}</span>
                </span>
                <span className="mt-3 block text-[0.8125rem] font-semibold tracking-[0.06em] uppercase transition-colors group-hover:text-gold-ink">{p.label}</span>
                <span className="mt-1 block text-xs text-muted">{p.images.length} photographs</span>
              </button>
            </Reveal>
          ))}
        </ul>
      </section>
      <HorizontalLookbook showPageLink={false} />
      <CampaignGallery />
    </>
  );
}

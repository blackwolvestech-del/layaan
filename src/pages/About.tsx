import { PageHeader } from "@/components/layout/PageHeader";
import { Img } from "@/components/ui/Img";
import { PendingNote } from "@/components/ui/misc";
import { imageByFile } from "@/data/products";
import { BrandIntro } from "@/sections/BrandIntro";

// Uses the approved positioning only (data/copy.ts). The brand story is deliberately not invented.
export default function About() {
  return (
    <>
      <PageHeader docTitle="About" eyebrow="The atelier" title="About LAYAAN Atelier" intro="contemporary Western womenswear, from everyday to occasion" crumbs={[{ label: "About" }]} />
      <BrandIntro variant="full" />
      <section className="container-x grid gap-8 py-20 lg:grid-cols-2 lg:items-center">
        <Img image={imageByFile("DSC00025.jpg")} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/5] rounded-[2px]" />
        <div>
          <h2 className="heading-caps">Our story</h2>
          <p className="tagline mt-2">more to come</p>
          <p className="mt-6 max-w-md leading-relaxed text-ink-2">The story behind LAYAAN Atelier — the people, the studio and how each collection comes together — will be shared here.</p>
          <PendingNote className="mt-6">Brand story awaiting approved copy</PendingNote>
        </div>
      </section>
    </>
  );
}

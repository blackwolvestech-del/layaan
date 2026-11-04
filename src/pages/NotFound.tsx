import { SplitText } from "@/components/fx/SplitText";
import { GoldOrbs } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";

// TODO: Optionally add suggested links (popular collections, search) once those pages are built.
export default function NotFound() {
  return (
    <section aria-labelledby="page-title" className="relative isolate overflow-hidden">
      <title>Page not found — LAYAAN Atelier</title>
      <div aria-hidden className="field-gradient absolute inset-0 -z-20 opacity-60" />
      <GoldOrbs />
      <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-16 text-center sm:py-24">
        <div aria-hidden>
          <SplitText text="404" trigger="mount" stagger={0.12} className="text-stroke-gold block font-display text-[clamp(7rem,4rem+16vw,16rem)] leading-none" />
        </div>
        <h1 id="page-title" className="page-title mt-2">
          Page not found
        </h1>
        <p className="tagline mt-4 max-w-md">The page you're looking for doesn't exist or may have moved.</p>
        <ButtonLink to="/" className="mt-8">
          Back to the homepage
        </ButtonLink>
      </div>
    </section>
  );
}

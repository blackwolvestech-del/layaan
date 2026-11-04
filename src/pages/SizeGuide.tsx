import { SizeGuideContent } from "@/components/commerce/SizeGuide";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";

export default function SizeGuide() {
  return (
    <>
      <PageHeader docTitle="Size guide" eyebrow="Help" title="Size guide" crumbs={[{ label: "Size guide" }]} />
      <div className="container-x">
        <div className="mx-auto max-w-3xl border border-line bg-surface p-5 sm:p-8">
          <SizeGuideContent />
        </div>
        <div className="mt-10 flex justify-center">
          <ButtonLink to="/shop" variant="outline">
            Shop the collection
          </ButtonLink>
        </div>
      </div>
    </>
  );
}

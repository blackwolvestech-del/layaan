import { PageHeader } from "@/components/layout/PageHeader";
import { collections } from "@/data/products";
import { FeaturedCollections } from "@/sections/FeaturedCollections";

export default function Collections() {
  return (
    <>
      <PageHeader docTitle="Collections" eyebrow={`${collections.length} collections`} title="Collections" intro="dressing by intention — tailoring, sleeves, occasion and everyday" crumbs={[{ label: "Collections" }]} />
      <FeaturedCollections showHeading={false} />
    </>
  );
}

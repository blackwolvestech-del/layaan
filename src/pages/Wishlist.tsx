import { PageHeader } from "@/components/layout/PageHeader";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/misc";
import { products } from "@/data/products";
import { useWishlist } from "@/hooks/useWishlist";

const validIds = new Set(products.map((p) => p.id));

export default function Wishlist() {
  const { ids, clear } = useWishlist(validIds);
  const saved = ids.map((id) => products.find((p) => p.id === id)).filter((p) => !!p);
  return (
    <>
      <PageHeader docTitle="Wishlist" eyebrow="Saved looks" title="Wishlist" intro="Your wishlist is saved in this browser on this device only — nothing is sent anywhere." crumbs={[{ label: "Wishlist" }]}>
        {saved.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear all
          </Button>
        )}
      </PageHeader>
      <div className="container-x pb-10">
        {saved.length === 0 ? (
          <EmptyState icon="heart" title="Nothing saved yet" body="Tap the heart on any look to keep it here." action={<ButtonLink to="/shop">Browse the collection</ButtonLink>} />
        ) : (
          <ProductGrid products={saved} />
        )}
      </div>
    </>
  );
}

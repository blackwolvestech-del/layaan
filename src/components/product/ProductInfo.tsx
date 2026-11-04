import { Link } from "react-router";
import { collections } from "@/data/products";
import type { Product } from "@/types/product";
import { Tag } from "../ui/misc";

/** Descriptive product information shared by the quick view and the product page. */
export function ProductInfo({ product, onNavigate }: { product: Product; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {product.collections.map((c) => (
          <Link key={c} to={`/collections/${c}`} onClick={onNavigate}>
            <Tag tone="gold">{collections.find((x) => x.id === c)?.name}</Tag>
          </Link>
        ))}
      </div>
      <p className="leading-relaxed text-ink-2">{product.description}</p>

      <div>
        <p className="eyebrow mb-2">Pieces included</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
          {product.includedPieces.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        {product.stylingProps.length > 0 && (
          <p className="mt-3 text-xs text-muted">
            Styling notes: {product.stylingProps.join(", ").toLowerCase()}.
          </p>
        )}
      </div>
    </div>
  );
}

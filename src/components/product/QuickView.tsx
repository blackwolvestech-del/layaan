import { Link } from "react-router";
import { categories, productById } from "@/data/products";
import { useUi } from "@/context/UiContext";
import { PurchasePanel } from "../commerce/PurchasePanel";
import { buttonClass } from "../ui/Button";
import { Modal } from "../ui/Drawer";
import { Icon } from "../ui/Icon";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";

export function QuickView() {
  const { quickViewId, closeQuickView } = useUi();
  const product = quickViewId ? productById(quickViewId) : undefined;
  const category = categories.find((c) => c.id === product?.category)?.name;

  return (
    <Modal open={!!product} onOpenChange={(o) => !o && closeQuickView()} title={product?.label ?? ""} description={product ? `${product.colour} · ${category}` : undefined} className="!max-w-4xl !p-4 sm:!p-6">
      {product && (
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <ProductGallery images={product.images} title={product.label} sizes="(min-width: 768px) 400px, 90vw" />
          <div className="flex flex-col gap-6">
            <PurchasePanel product={product} />
            <div className="border-t border-line pt-6">
              <ProductInfo product={product} onNavigate={closeQuickView} />
            </div>
            <Link to={`/products/${product.id}`} onClick={closeQuickView} className={buttonClass("outline", "md", "self-start")}>
              View full details <Icon name="arrowRight" size={14} />
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}

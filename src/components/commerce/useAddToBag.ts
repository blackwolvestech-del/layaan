import { useCallback } from "react";
import { useUi } from "@/context/UiContext";
import { useCart } from "@/context/CartContext";
import { MINOR_UNITS, offerFor } from "@/data/commerce";
import type { LineSize } from "@/types/commerce";
import type { CustomMeasurements } from "@/types/measurements";
import type { Product } from "@/types/product";
import { CUSTOM_SIZE } from "@/utils/measurements";

/** Adds to the bag and confirms with a toast that can open the bag drawer. */
export function useAddToBag() {
  const { toast, openOverlay } = useUi();
  const { addItem } = useCart();
  return useCallback(
    (product: Product, size: LineSize, quantity = 1, measurements?: CustomMeasurements) => {
      const offer = offerFor(product.id);
      const image = product.images[0];
      if (!offer || !image) return;
      // CartContext stores whole currency units; offers are in minor units.
      addItem({ productId: product.id, productSlug: product.id, productLabel: product.label, colour: product.colour, productImage: image, selectedSize: size, ...(measurements && { measurements }), quantity, price: offer.price / MINOR_UNITS });
      const fit = size === CUSTOM_SIZE ? "made to your measurements" : `size ${size}`;
      toast(`Added to your bag — ${product.label}, ${fit}${quantity > 1 ? ` × ${quantity}` : ""}`, { label: "View bag", onClick: () => openOverlay("cart") });
    },
    [toast, openOverlay, addItem],
  );
}

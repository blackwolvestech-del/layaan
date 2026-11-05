import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { useCatalogVersion } from "@/data/catalogStore";
import { customLeadTime, maxQuantityFor, offerFor, stockFor } from "@/data/commerce";
import type { SizeId } from "@/types/commerce";
import type { MeasurementErrors, MeasurementGroup } from "@/types/measurements";
import type { Product } from "@/types/product";
import { useMeasurementDraft } from "@/hooks/useMeasurementDraft";
import { CUSTOM_SIZE, toCustomMeasurements, validateCustomMeasurements } from "@/utils/measurements";
import { GoldBurst } from "../fx/GoldBurst";
import { WishlistButton } from "../product/ProductCard";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Price, QuantityStepper, SizeSelector } from "./controls";
import { CustomSizeSelector, measurementInputId } from "./CustomSize";
import { SizeGuideButton } from "./SizeGuide";
import { useAddToBag } from "./useAddToBag";

/** Price, size, quantity, add to bag and wishlist — shared by the product page and quick view. */
export function PurchasePanel({ product, onAdded }: { product: Product; onAdded?: () => void }) {
  useCatalogVersion();
  const offer = offerFor(product.id);
  const addToBag = useAddToBag();
  const [size, setSize] = useState<SizeId | null>(null);
  // Made-to-measure products (no size chart) take the customer's own measurements instead of a size.
  const profile = product.measurementProfile;
  // Entries are kept per product for this visit, so they survive quick view, navigation and reloads.
  const [{ custom, draft }, updateDraft] = useMeasurementDraft(product.id);
  const [fieldErrors, setFieldErrors] = useState<MeasurementErrors>({});
  const [checked, setChecked] = useState(false);
  const idPrefix = `custom-size-${useId().replace(/[^\w-]/g, "")}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string>();
  const [added, setAdded] = useState(false);
  const [burst, setBurst] = useState(0);
  const timer = useRef<number>(undefined);

  useEffect(() => {
    setSize(null);
    setQty(1);
    setError(undefined);
    setFieldErrors({});
    setChecked(false);
  }, [product.id]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!offer) return <p className="text-sm text-muted">This look isn't available to order yet.</p>;

  const sizeAvailable = (s: string) => {
    const stock = stockFor(product.id, s);
    return stock === null || stock > 0;
  };
  // Standard sizes: the selected size's stock caps the quantity; made to measure is not stock-limited.
  const maxQty = profile ? maxQuantityFor(product.id, CUSTOM_SIZE) : size ? maxQuantityFor(product.id, size) : undefined;
  const selectedStock = size ? stockFor(product.id, size) : null;
  const soldOut = !offer.available;

  const setMeasurement = (group: MeasurementGroup, field: string, value: string) => {
    const next = { ...draft, [group]: { ...draft[group], [field]: value } };
    updateDraft((prev) => ({ ...prev, draft: next }));
    // After the first add attempt, re-validate as the customer corrects fields.
    if (checked && profile) setFieldErrors(validateCustomMeasurements(profile, next));
  };

  const confirmAdded = () => {
    setAdded(true);
    setBurst((b) => b + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1800);
    onAdded?.();
  };

  const submit = () => {
    if (profile) {
      if (!custom) {
        setError("Please choose Customize your size and enter your measurements.");
        return;
      }
      setChecked(true);
      const found = validateCustomMeasurements(profile, draft);
      setFieldErrors(found);
      const first = Object.keys(found)[0];
      if (first) {
        const [group, field] = first.split(".") as [MeasurementGroup, string];
        panelRef.current?.querySelector<HTMLElement>(`[id="${measurementInputId(idPrefix, group, field)}"]`)?.focus();
        return;
      }
      addToBag(product, CUSTOM_SIZE, qty, toCustomMeasurements(profile, draft));
      confirmAdded();
      return;
    }
    if (!size) {
      setError("Please select a size.");
      return;
    }
    if (!sizeAvailable(size)) {
      setError("This size is sold out. Please choose another size.");
      return;
    }
    addToBag(product, size, Math.min(qty, maxQuantityFor(product.id, size)));
    confirmAdded();
  };

  return (
    <div ref={panelRef} className="flex flex-col gap-6">
      <p className="text-xl font-semibold tracking-[0.04em]">
        <Price amount={offer.price} />
        {offer.compareAt && (
          <span className="ml-3 text-base font-normal text-muted line-through">
            <span className="sr-only">Was </span>
            <Price amount={offer.compareAt} />
          </span>
        )}
      </p>
      {soldOut && (
        <p role="status" className="-mt-3 text-sm font-semibold text-danger">
          Sold out — this look is currently unavailable.
        </p>
      )}
      {profile && !soldOut && <p className="-mt-3 text-xs text-muted">Made to your measurements — delivered in {customLeadTime()}.</p>}

      {profile ? (
        <CustomSizeSelector
          profile={profile}
          idPrefix={idPrefix}
          selected={custom}
          onSelect={() => {
            updateDraft((prev) => ({ ...prev, custom: true }));
            setError(undefined);
          }}
          draft={draft}
          onChange={setMeasurement}
          errors={fieldErrors}
          optionError={error}
        />
      ) : (
        <SizeSelector
          sizes={offer.sizes}
          value={size}
          onChange={(s) => {
            setSize(s);
            setError(undefined);
          }}
          error={error}
          legendAction={<SizeGuideButton chart={product.sizeChart} />}
          isAvailable={sizeAvailable}
        />
      )}
      {!profile && size && selectedStock !== null && selectedStock > 0 && selectedStock <= 3 && (
        <p role="status" className="-mt-3 text-xs font-semibold text-gold-ink">
          Only {selectedStock} left in size {size}
        </p>
      )}

      <div className="flex flex-col items-stretch gap-3 xs:flex-row">
        <QuantityStepper value={qty} onChange={(n) => setQty(Math.max(1, maxQty ? Math.min(n, maxQty) : n))} {...(maxQty ? { max: Math.max(1, maxQty) } : {})} />
        <div className="relative flex min-w-0 flex-1">
        <Button onClick={submit} className="w-full" aria-live="polite" disabled={soldOut}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={String(added)} className="flex items-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {added ? (
                <>
                  <Icon name="check" size={16} /> Added to bag
                </>
              ) : (
                <>
                  <Icon name="bag" size={16} /> Add to bag
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </Button>
        {burst > 0 && <GoldBurst key={burst} />}
        </div>
      </div>
      <WishlistButton product={product} variant="inline" className="self-start" />
    </div>
  );
}

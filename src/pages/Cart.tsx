import { Link } from "react-router";
import { useCart } from "@/context/CartContext";
import { MeasurementSummary } from "@/components/commerce/CustomSize";
import { CUSTOM_SIZE } from "@/utils/measurements";
import { AnimatedNumber } from "@/components/fx/AnimatedNumber";
import { Magnetic } from "@/components/fx/Magnetic";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { EmptyState, Reveal } from "@/components/ui/misc";
import { formatPrice } from "@/utils/currency";

export default function Cart() {
  const { items, itemCount, subtotal, shipping, total, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <div>
      <PageHeader
        title="Shopping Bag"
        eyebrow="Review Your Selection"
        intro="Carefully tailored pieces selected for your wardrobe. Orders include complimentary signature luxury packaging and white-glove courier delivery."
        docTitle="Shopping Bag"
        crumbs={[{ label: "Shopping Bag" }]}
      />

      <div className="container-x pb-20 sm:pb-28">
        {items.length === 0 ? (
          <EmptyState
            icon="bag"
            title="Your Shopping Bag is Empty"
            body="Explore our latest collection of contemporary tailoring, statement sleeves, and occasion wear to find your next statement piece."
            action={
              <ButtonLink to="/shop" variant="primary" className="w-full sm:w-auto">
                Explore the Collection
              </ButtonLink>
            }
          />
        ) : (
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Bag Line Items (8 cols) */}
            <div className="space-y-6 lg:col-span-8">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <p className="eyebrow !text-[0.6875rem]">Items ({itemCount})</p>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-muted hover:text-danger hover:underline"
                >
                  Empty Bag
                </button>
              </div>

              <div className="divide-y divide-line">
                {items.map((item) => (
                  <Reveal key={item.id} className="grid grid-cols-[5.25rem_minmax(0,1fr)] gap-x-4 gap-y-5 py-6 first:pt-2 last:pb-0 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-x-5">
                    <Link to={`/products/${item.productSlug}`} className="h-28 w-[5.25rem] shrink-0 overflow-hidden rounded-[2px] bg-surface-2 sm:h-36 sm:w-28">
                        <Img image={item.productImage} sizes="120px" fit="cover" className="h-full w-full" decorative />
                    </Link>

                    <div className="min-w-0 space-y-1.5">
                        <Link to={`/products/${item.productSlug}`} className="block break-words font-display text-base leading-snug text-ink hover:underline sm:text-xl">
                          {item.productLabel}
                        </Link>
                        <p className="text-xs text-muted">Colour: {item.colour}</p>
                        <p className="text-xs text-muted">
                          Selected Size: <strong className="font-semibold text-ink">{item.selectedSize === CUSTOM_SIZE ? "Made to measure" : item.selectedSize}</strong>
                        </p>
                        <MeasurementSummary measurements={item.measurements} />
                        <p className="font-mono text-sm font-semibold text-ink sm:text-base">
                          {formatPrice(item.price)}
                        </p>
                    </div>

                    <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end sm:justify-between">
                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded border border-line bg-surface">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="grid h-9 w-9 place-items-center text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-30"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Icon name="minus" size={14} />
                        </button>
                        <span className="min-w-8 text-center font-mono text-xs font-semibold text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="grid h-9 w-9 place-items-center text-muted hover:bg-surface-2 hover:text-ink"
                          aria-label="Increase quantity"
                        >
                          <Icon name="plus" size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-ink">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-danger hover:underline"
                        >
                          <Icon name="trash" size={13} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Shopping guarantees banner */}
              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-line pt-6 text-xs text-muted sm:grid-cols-3">
                <div className="flex items-center gap-2.5">
                  <Icon name="truck" size={18} className="text-gold-ink shrink-0" />
                  <span>Complimentary express delivery</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Icon name="package" size={18} className="text-gold-ink shrink-0" />
                  <span>Signature wax-sealed packaging</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Icon name="arrowLeft" size={18} className="text-gold-ink shrink-0" />
                  <span>14-day complimentary returns</span>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar (4 cols) */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 border border-line bg-surface p-6 sm:p-8">
                <h3 className="heading-caps border-b border-line pb-4 !text-base">Order Summary</h3>

                <div className="mt-6 space-y-3.5 text-xs text-ink-2">
                  <div className="flex justify-between">
                    <span className="text-muted">Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                    <AnimatedNumber value={subtotal} format={formatPrice} className="font-mono text-ink tabular-nums" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Estimated Shipping</span>
                    <span className="font-semibold text-success">
                      {shipping === 0 ? "Complimentary" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Presentation Packaging</span>
                    <span className="font-semibold text-gold-ink">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Taxes & Duties</span>
                    <span className="font-mono text-ink">Calculated at Checkout</span>
                  </div>

                  <div className="border-t border-line pt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-ink">Estimated Total</span>
                      <AnimatedNumber value={total} format={formatPrice} className="font-mono text-xl font-bold text-gold-ink tabular-nums" />
                    </div>
                    <p className="mt-1 text-[0.6875rem] text-muted">Excluding duties and regional sales taxes</p>
                  </div>
                </div>

                {/* Important: Navigation to existing checkout page */}
                <div className="mt-8 space-y-3">
                  <Magnetic className="block" strength={0.15}>
                    <ButtonLink to="/checkout" variant="primary" size="lg" className="w-full">
                      Proceed to Checkout
                    </ButtonLink>
                  </Magnetic>
                  <ButtonLink to="/shop" variant="outline" size="md" className="w-full">
                    Continue Shopping
                  </ButtonLink>
                </div>

                {/* Concierge Assistance Note */}
                <div className="mt-8 border-t border-line/80 pt-6 text-center text-xs text-muted">
                  <p className="font-medium text-ink">Require styling assistance?</p>
                  <p className="mt-1">
                    Connect with an atelier client advisor at{" "}
                    <a href="mailto:concierge@layaan-atelier.com" className="text-gold-ink underline underline-offset-2">
                      concierge@layaan-atelier.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

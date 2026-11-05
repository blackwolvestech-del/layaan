import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/types/account";
import { maxQuantityFor } from "@/data/commerce";
import { formatPrice } from "@/utils/currency";
import { ease } from "@/utils/motion";
import { Img } from "../ui/Img";
import { QuantityStepper } from "./controls";
import { formatLineSize, MeasurementSummary } from "./CustomSize";

/** One bag line with quantity controls and remove; used by the bag drawer. */
export function CartLineItem({ item, compact, onNavigate }: { item: CartItem; compact?: boolean; onNavigate?: () => void }) {
  const reduce = useReducedMotion();
  const { updateQuantity, removeItem, stockIssue } = useCart();
  const issue = stockIssue(item);
  const href = `/products/${item.productSlug}`;
  const fit = formatLineSize(item.selectedSize);
  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24, transition: { duration: 0.22, ease: ease.exit } }}
      transition={{ duration: 0.4, ease: ease.editorial }}
      className={clsx("flex gap-4", compact ? "py-5" : "py-6 sm:gap-6")}
    >
      <Link to={href} onClick={onNavigate} tabIndex={-1} aria-hidden className={clsx("shrink-0", compact ? "w-20" : "w-24 sm:w-32")}>
        <Img image={item.productImage} sizes={compact ? "80px" : "128px"} className="aspect-[3/4] rounded-[2px]" decorative />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={href} onClick={onNavigate} className="text-[0.8125rem] font-semibold tracking-[0.06em] uppercase hover:text-gold-ink">
              {item.productLabel}
            </Link>
            <p className="mt-1 text-xs text-muted">
              {item.colour} · {fit}
            </p>
            <MeasurementSummary measurements={item.measurements} className="mt-1" />
            {!compact && <p className="mt-1 text-xs text-muted">{formatPrice(item.price)} each</p>}
            {issue && (
              <p role="status" className="mt-1 text-xs font-semibold text-danger">
                {issue}
              </p>
            )}
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</span>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          {/* The cart context updates by delta; below 1 the line is removed. */}
          <QuantityStepper value={item.quantity} onChange={(n) => updateQuantity(item.id, n - item.quantity)} label={`Quantity for ${item.productLabel}, ${fit.toLowerCase()}`} size="sm" max={Math.max(item.quantity, maxQuantityFor(item.productId, item.selectedSize))} />
          <button type="button" onClick={() => removeItem(item.id)} className="min-h-10 text-xs text-muted underline underline-offset-4 hover:text-ink" aria-label={`Remove ${item.productLabel}, ${fit.toLowerCase()}, from bag`}>
            Remove
          </button>
        </div>
      </div>
    </motion.li>
  );
}

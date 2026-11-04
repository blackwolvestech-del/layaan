/**
 * Formats a monetary amount in Pakistani Rupee (PKR).
 * Example: formatPrice(48000) => "PKR 48,000"
 */
export function formatPrice(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString()}`;
}

/**
 * Currency code and symbol metadata for LAYAAN Atelier.
 */
export const CURRENCY = {
  code: "PKR",
  symbol: "Rs.",
  name: "Pakistani Rupee",
  freeShippingThreshold: 25000,
  standardShippingFee: 2500,
} as const;

// Shapes the UI depends on, filled from the shared Supabase catalogue (src/data/catalogStore.ts).
import type { MeasurementProfile } from "./measurements";

export type CategoryId = "suits-co-ords" | "tops-blouses" | "longline-styles";
export type CollectionId = "tailoring" | "statement-sleeves" | "occasion" | "everyday-to-evening";

export interface ProductImage {
  id: string;
  /** Path without width/format suffix, e.g. /images/products/<look>/<file>-<hash> */
  basePath: string;
  /** Direct URL for images uploaded through the CRM (no local derivatives). */
  src?: string | undefined;
  width: number;
  height: number;
  alt: string;
  placeholder: string;
  view: string | null;
  /** Object-position focal point in percent, used when an image is cropped. */
  focalX: number;
  focalY: number;
}

export interface SizeChartSection {
  title: string;
  columns: string[];
  rows: Array<{ label: string; values: string[] }>;
}

export interface ProductSizeChart {
  title: string;
  /** Preserved exactly from the source when it is supplied. */
  unit?: string;
  note?: string;
  sections: SizeChartSection[];
}

export interface Product {
  /** Stable identifier (also used for wishlist persistence). */
  id: string;
  /** Descriptive outfit label — not an official product name. */
  label: string;
  colour: string;
  category: CategoryId;
  collections: CollectionId[];
  description: string;
  includedPieces: string[];
  /** Items visible in styling whose inclusion is unconfirmed. */
  unconfirmedPieces: string[];
  /** Props used for styling only (bags, jewellery…) — never sold as part of the outfit. */
  stylingProps: string[];
  images: ProductImage[];
  /** Product-specific client measurements; null when no reliable chart was supplied. */
  sizeChart: ProductSizeChart | null;
  /**
   * Set when there is no size chart: the product is made to the customer's own measurements
   * (in inches) instead of a standard size. null for products sold in standard sizes.
   */
  measurementProfile: MeasurementProfile | null;
  /** Database id of the product (Supabase `products.id`). */
  dbId?: string;
  /** ISO timestamp the product was created in the CRM (for "newest" sorting). */
  createdAt?: string;
  featured?: boolean;
}

export interface Taxonomy<T extends string> {
  id: T;
  name: string;
}

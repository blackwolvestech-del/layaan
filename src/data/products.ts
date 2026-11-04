// Demo product data derived from the supplied LAYAAN photographs (see catalog.generated.json,
// produced by scripts/assets from the local originals). Shapes here are the contract the UI uses;
// after approval they can be filled from an API response instead of the local manifest.
//
// No prices, sizes, stock or reviews are included: none have been supplied by the brand.
import type { CategoryId, CollectionId, Product, ProductImage } from "@/types/product";
import type { SourceImage, SourceLook } from "@/types/catalog";
import { catalog } from "./catalog";
import { measurementProfileFor } from "@/utils/measurements";
import { sizeChartByProductId } from "./sizeCharts";

export type { CategoryId, CollectionId, Product, ProductImage, Taxonomy } from "@/types/product";

function focalFor(view: string | null): { focalX: number; focalY: number } {
  switch (view) {
    case "portrait":
      return { focalX: 50, focalY: 22 };
    case "detail":
      return { focalX: 50, focalY: 45 };
    case "seated":
      return { focalX: 50, focalY: 40 };
    default:
      return { focalX: 50, focalY: 28 };
  }
}

export function toProductImage(img: SourceImage): ProductImage {
  return {
    id: img.file.replace(/\.[a-z]+$/i, ""),
    basePath: img.basePath,
    width: img.width,
    height: img.height,
    alt: img.alt,
    placeholder: img.placeholder,
    view: img.view,
    ...focalFor(img.view),
  };
}

const REMOVED_PRODUCT_IDS = new Set(["sage-satin-jacket-skirt-set"]);

/** Most photographs shown per product. */
export const MAX_PRODUCT_IMAGES = 5;

/**
 * The photographs shown for each product, in order (the first is the card/cover image). Picked by
 * eye so no two frames of a look repeat the same pose; looks not listed use their first images.
 */
const GALLERY_FILES: Readonly<Record<string, string[]>> = {
  "magenta-satin-button-jacket": ["DSC09821.jpg", "DSC09835.jpg", "DSC09847.jpg", "DSC09838(1).jpg", "DSC09837.jpg"],
  "crimson-belted-satin-co-ord": ["DSC09865(1).jpg", "DSC09875.jpg", "DSC09899.jpg", "DSC09925.jpg", "DSC09888.jpg"],
  "teal-statement-sleeve-suit": ["DSC09946.jpg", "DSC09955.jpg", "DSC09959.jpg", "DSC09980.jpg", "DSC09994.jpg"],
  "ivory-pinstripe-suit": ["DSC00252.jpg", "DSC00245.jpg", "DSC00259.jpg", "DSC00297.jpg", "DSC00275.jpg"],
  "rust-jacket-wide-leg-trousers": ["DSC00354.jpg", "DSC00349.jpg", "DSC00362.jpg", "DSC00368.jpg", "DSC00378.jpg"],
  "beige-layered-trouser-set": ["DSC00442.jpg", "DSC00429.jpg", "DSC00404.jpg", "DSC00400.jpg", "DSC00409.jpg"],
  "navy-wrap-trouser-suit": ["DSC00449.jpg", "DSC00453.jpg", "DSC00471.jpg", "DSC00455.jpg", "DSC00461.jpg"],
  "cream-cape-sleeve-longline-layer": ["DSC00493.jpg", "DSC00500.jpg", "DSC00519.jpg", "DSC00531.jpg", "DSC00548.jpg"],
  "black-ivory-lace-trim-set": ["DSC00653.jpg", "DSC00640.jpg", "DSC00657.jpg", "DSC00661.jpg", "DSC00662.jpg"],
  "emerald-tie-neck-maxi": ["DSC00707.jpg", "DSC00667.jpg", "DSC00665.jpg", "DSC00672.jpg", "DSC00703.jpg"],
};

function galleryFor(look: SourceLook): SourceImage[] {
  const picked = GALLERY_FILES[look.key]?.map((file) => look.images.find((i) => i.file === file)).filter((i): i is SourceImage => !!i);
  const images = picked?.length ? picked : look.images;
  // Never show the same photograph twice.
  return images.filter((img, i) => images.findIndex((o) => o.file === img.file) === i).slice(0, MAX_PRODUCT_IMAGES);
}

export const products: Product[] = catalog.looks.filter((l) => !REMOVED_PRODUCT_IDS.has(l.key)).map((l) => {
  const sizeChart = sizeChartByProductId[l.key] ?? null;
  return {
    id: l.key,
    label: l.workingName,
    colour: l.colour,
    category: l.category as CategoryId,
    collections: l.collections as CollectionId[],
    description: l.visual,
    includedPieces: l.pieces,
    unconfirmedPieces: l.unconfirmedPieces,
    stylingProps: l.stylingProps,
    images: galleryFor(l).map(toProductImage),
    sizeChart,
    // Every product without a chart is made to measure, sized from the pieces it includes.
    measurementProfile: sizeChart ? null : measurementProfileFor(l.pieces),
  };
});

export const categories = catalog.categories.map((c) => ({ id: c.key as CategoryId, name: c.name }));
export const collections = catalog.collections.map((c) => ({ id: c.key as CollectionId, name: c.name }));

export const productById = (id: string) => products.find((p) => p.id === id);

/** A second photograph of the same outfit, for hover states. Prefers another full-length view. */
export function hoverImage(p: Product): ProductImage | undefined {
  return p.images.slice(1).find((i) => i.view === "full" || i.view === "side" || i.view === "three-quarter") ?? p.images[1];
}

/** Finds an image by original filename across products and editorial shots. */
export function imageByFile(file: string): ProductImage | undefined {
  const src = [...catalog.looks.flatMap((l) => l.images), ...catalog.editorial].find((i) => i.file === file);
  return src ? toProductImage(src) : undefined;
}

/** The product a photograph belongs to, including photographs not shown in its gallery. */
export function productForFile(file: string): Product | undefined {
  const look = catalog.looks.find((l) => l.images.some((i) => i.file === file));
  return look ? productById(look.key) : undefined;
}

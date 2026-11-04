// Central, typed map of which local photographs appear in shared placements.
// Hero slides live in data/copy.ts; category tile covers in sections/CategoryTiles.tsx.
// Every entry is an original filename from assets/source/photos (see scripts/assets/catalog.mjs).
import { catalog } from "./catalog";
import type { CollectionId } from "@/types/product";

export const brandAssets = {
  logoWebp: "/images/brand/logo-gold.webp",
  logoPng: "/images/brand/logo-gold.png",
  logoAspect: catalog.logoAspect,
  favicon: "/images/brand/favicon-64.png",
} as const;

export const reel = catalog.reel;

export const placements = {
  collectionCovers: {
    tailoring: "DSC00252.jpg",
    "statement-sleeves": "DSC09874.jpg",
    occasion: "DSC00707.jpg",
    "everyday-to-evening": "DSC00602.jpg",
  } satisfies Record<CollectionId, string>,
  lookbook: ["DSC00519.jpg", "DSC00707.jpg", "DSC00354.jpg", "DSC00449.jpg", "DSC09821.jpg", "DSC00098.jpg", "DSC00442.jpg"],
  gallery: ["DSC00025.jpg", "DSC00089.jpg", "DSC09994.jpg", "DSC00672.jpg", "DSC00599.jpg", "DSC00045.jpg", "DSC00285.jpg"],
} as const;

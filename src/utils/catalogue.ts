// Local, in-memory catalogue search and filtering (no network requests).
import type { CategoryId, CollectionId, Product } from "@/data/products";

export interface CatalogueFilter {
  q: string;
  category: CategoryId | "all";
  collection: CollectionId | "all";
  colours: string[];
}

export const emptyFilter: CatalogueFilter = { q: "", category: "all", collection: "all", colours: [] };

function haystack(p: Product, names: Record<string, string>): string {
  return [p.label, p.colour, names[p.category], ...p.collections.map((c) => names[c]), p.description, ...p.includedPieces].join(" ").toLowerCase();
}

/** Every search term must match; simple plurals ("blazers", "trousers") match their singular. */
export function matchesQuery(p: Product, q: string, names: Record<string, string> = {}): boolean {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = haystack(p, names);
  return terms.every((t) => hay.includes(t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t));
}

export function filterProducts(all: Product[], f: CatalogueFilter, names: Record<string, string> = {}): Product[] {
  return all.filter(
    (p) =>
      (f.category === "all" || p.category === f.category) &&
      (f.collection === "all" || p.collections.includes(f.collection)) &&
      (!f.colours.length || f.colours.includes(p.colour)) &&
      matchesQuery(p, f.q, names),
  );
}

export function colourOptions(all: Product[]): { value: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of all) map.set(p.colour, (map.get(p.colour) ?? 0) + 1);
  return [...map.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value));
}

export function isFiltered(f: CatalogueFilter): boolean {
  return !!f.q.trim() || f.category !== "all" || f.collection !== "all" || f.colours.length > 0;
}

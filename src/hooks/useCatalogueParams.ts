import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { categories, collections } from "@/data/products";
import type { CategoryId, CollectionId } from "@/types/product";
import { emptyFilter, type CatalogueFilter } from "@/utils/catalogue";

const categoryIds = new Set<string>(categories.map((c) => c.id));
const collectionIds = new Set<string>(collections.map((c) => c.id));

/**
 * Catalogue filters stored in the URL (?q=&category=&collection=&colour=), so filtered views
 * are shareable and work with the browser's back/forward buttons.
 */
export function useCatalogueParams(): [CatalogueFilter, (next: CatalogueFilter, opts?: { replace?: boolean }) => void] {
  const [params, setParams] = useSearchParams();

  const filter = useMemo<CatalogueFilter>(() => {
    const category = params.get("category") ?? "";
    const collection = params.get("collection") ?? "";
    return {
      q: params.get("q") ?? "",
      category: categoryIds.has(category) ? (category as CategoryId) : "all",
      collection: collectionIds.has(collection) ? (collection as CollectionId) : "all",
      colours: params.getAll("colour"),
    };
  }, [params]);

  const setFilter = useCallback(
    (next: CatalogueFilter, opts?: { replace?: boolean }) => {
      const p = new URLSearchParams();
      if (next.q.trim()) p.set("q", next.q);
      if (next.category !== "all") p.set("category", next.category);
      if (next.collection !== "all") p.set("collection", next.collection);
      next.colours.forEach((c) => p.append("colour", c));
      setParams(p, { replace: opts?.replace, preventScrollReset: true });
    },
    [setParams],
  );

  return [filter, setFilter];
}

export { emptyFilter };

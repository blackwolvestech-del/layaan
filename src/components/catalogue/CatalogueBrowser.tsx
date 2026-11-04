import clsx from "clsx";
import { motion } from "motion/react";
import { useDeferredValue, useMemo, type ReactNode } from "react";
import { categories, collections, products as allProducts } from "@/data/products";
import { emptyFilter, useCatalogueParams } from "@/hooks/useCatalogueParams";
import type { CategoryId, CollectionId, Product } from "@/types/product";
import { colourOptions, filterProducts, isFiltered } from "@/utils/catalogue";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/misc";

const names = Object.fromEntries([...categories, ...collections].map((t) => [t.id, t.name]));

/** @param group single-choice groups share an animated highlight that slides between chips. */
function Chip({ active, onClick, children, count, group }: { active: boolean; onClick: () => void; children: ReactNode; count?: number; group?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        "relative min-h-10 rounded-full border px-4 text-xs font-semibold tracking-wide transition-colors",
        active ? clsx("border-ink text-bg", !group && "bg-ink") : "border-line-strong text-ink hover:border-ink",
      )}
    >
      {active && group && <motion.span layoutId={`chip-${group}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
      <span className="relative">
        {children}
        {count !== undefined && <span className={clsx("ml-1.5 font-mono text-[0.625rem]", active ? "text-bg/70" : "text-muted")}>{count}</span>}
      </span>
    </button>
  );
}

interface CatalogueBrowserProps {
  /** Restricts the browser to one collection (collection pages). */
  lockedCollection?: CollectionId;
  /** Autofocus the search box (search page). */
  autoFocusSearch?: boolean;
  /** Editorial scroll-reveal grid (shop page). */
  showcase?: boolean;
}

/** Search + filter + grid. All state lives in the URL query string. */
export function CatalogueBrowser({ lockedCollection, autoFocusSearch, showcase }: CatalogueBrowserProps) {
  const [filter, setFilter] = useCatalogueParams();
  const q = useDeferredValue(filter.q);
  const scope = useMemo<Product[]>(() => (lockedCollection ? allProducts.filter((p) => p.collections.includes(lockedCollection)) : allProducts), [lockedCollection]);
  const effective = { ...filter, q, collection: lockedCollection ?? filter.collection };
  const results = useMemo(() => filterProducts(scope, effective, names), [scope, effective.q, effective.category, effective.collection, effective.colours.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  const colours = useMemo(() => colourOptions(scope), [scope]);
  const count = (pred: (p: Product) => boolean) => scope.filter(pred).length;
  const update = (patch: Partial<typeof filter>, replace = false) => setFilter({ ...filter, ...patch }, { replace });

  return (
    <div>
      <div className="mb-8 grid gap-5 border-y border-line py-5 lg:grid-cols-[minmax(16rem,22rem)_1fr] lg:items-start lg:gap-8">
        <div className="relative">
          <label htmlFor="catalogue-q" className="sr-only">
            Search the pieces
          </label>
          <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
          <input
            id="catalogue-q"
            type="search"
            value={filter.q}
            onChange={(e) => update({ q: e.target.value }, true)}
            placeholder="Search by colour, piece or style"
            className="input !pl-10"
            autoComplete="off"
            autoFocus={autoFocusSearch}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
            <Chip group="category" active={filter.category === "all"} onClick={() => update({ category: "all" })}>
              All
            </Chip>
            {categories.map((c) => {
              const n = count((p) => p.category === c.id);
              return n ? (
                <Chip key={c.id} group="category" active={filter.category === c.id} count={n} onClick={() => update({ category: filter.category === c.id ? "all" : (c.id as CategoryId) })}>
                  {c.name}
                </Chip>
              ) : null;
            })}
          </div>
          {!lockedCollection && (
            <div role="group" aria-label="Collection" className="flex flex-wrap gap-2">
              {collections.map((c) => (
                <Chip key={c.id} group="collection" active={filter.collection === c.id} count={count((p) => p.collections.includes(c.id))} onClick={() => update({ collection: filter.collection === c.id ? "all" : (c.id as CollectionId) })}>
                  {c.name}
                </Chip>
              ))}
            </div>
          )}
          <details className="group" open={filter.colours.length > 0}>
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase">
              Colour {filter.colours.length > 0 && <span className="rounded-full bg-gold px-1.5 text-[0.625rem] text-accent-contrast">{filter.colours.length}</span>}
              <Icon name="chevronDown" size={14} className="transition-transform group-open:rotate-180" />
            </summary>
            <div role="group" aria-label="Colour" className="flex flex-wrap gap-2 pt-2">
              {colours.map((c) => {
                const on = filter.colours.includes(c.value);
                return (
                  <Chip key={c.value} active={on} count={c.count} onClick={() => update({ colours: on ? filter.colours.filter((x) => x !== c.value) : [...filter.colours, c.value] })}>
                    {c.value}
                  </Chip>
                );
              })}
            </div>
          </details>
        </div>
      </div>

      <div className="mb-6 flex min-h-10 items-center justify-between gap-4">
        <p className="text-sm text-muted" aria-live="polite">
          Showing {results.length} of {scope.length} looks
        </p>
        {isFiltered({ ...filter, collection: "all" }) || (!lockedCollection && filter.collection !== "all") ? (
          <Button variant="ghost" size="sm" onClick={() => setFilter(emptyFilter)}>
            <Icon name="close" size={14} /> Reset
          </Button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="No looks match"
          body="Try another word or remove a filter."
          action={
            <Button variant="outline" onClick={() => setFilter(emptyFilter)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <ProductGrid products={results} showcase={showcase} />
      )}
    </div>
  );
}

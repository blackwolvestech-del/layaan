// Wishlist saved on the current device only (localStorage). No account or server involved.
import { useCallback, useSyncExternalStore } from "react";

export const WISHLIST_KEY = "layaan-demo-wishlist";
const listeners = new Set<() => void>();
let memory: string[] = [];
let cachedRaw: string | null | undefined;
let cachedIds: string[] = [];

function read(): string[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(WISHLIST_KEY);
  } catch {
    return memory; // storage blocked: keep in memory for this visit
  }
  if (raw === cachedRaw) return cachedIds;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedIds = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string").slice(0, 100) : [];
  } catch {
    cachedIds = [];
  }
  return cachedIds;
}

function write(ids: string[]) {
  memory = ids;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  } catch {
    /* fall back to memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === WISHLIST_KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleWishlistId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids];
}

/** @param validIds ids that still exist, so stale entries are ignored. */
export function useWishlist(validIds?: Set<string>) {
  const stored = useSyncExternalStore(subscribe, read, () => []);
  const ids = validIds ? stored.filter((id) => validIds.has(id)) : stored;
  const toggle = useCallback((id: string) => {
    const next = toggleWishlistId(read(), id);
    write(next);
    return next.includes(id);
  }, []);
  const clear = useCallback(() => write([]), []);
  return { ids, has: (id: string) => ids.includes(id), toggle, clear };
}

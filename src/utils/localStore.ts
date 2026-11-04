// Small persisted store on localStorage, shared across components (useSyncExternalStore) and
// across tabs (storage events). Falls back to memory when storage is blocked.
import { useSyncExternalStore } from "react";

export interface LocalStore<T> {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (cb: () => void) => () => void;
  use: () => T;
  key: string;
}

/**
 * @param parse validates untrusted stored JSON and returns a safe value (or the fallback).
 * @param area "session" keeps the value for this browser tab's visit only (sessionStorage).
 */
export function createLocalStore<T>(key: string, parse: (raw: unknown) => T, fallback: T, area: "local" | "session" = "local"): LocalStore<T> {
  const storage = () => (area === "session" ? sessionStorage : localStorage);
  const listeners = new Set<() => void>();
  let memory = fallback;
  let cachedRaw: string | null | undefined;
  let cached = fallback;

  const get = (): T => {
    let raw: string | null;
    try {
      raw = storage().getItem(key);
    } catch {
      return memory;
    }
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    try {
      cached = raw ? parse(JSON.parse(raw)) : fallback;
    } catch {
      cached = fallback;
    }
    return cached;
  };

  const set: LocalStore<T>["set"] = (next) => {
    const value = typeof next === "function" ? (next as (prev: T) => T)(get()) : next;
    memory = value;
    try {
      storage().setItem(key, JSON.stringify(value));
    } catch {
      /* storage blocked or full: keep in memory for this visit */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => (e.key === key || e.key === null) && cb();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  };

  const use = () => useSyncExternalStore(subscribe, get, () => fallback);

  return { get, set, subscribe, use, key };
}

export const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

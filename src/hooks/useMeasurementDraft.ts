// Measurements a customer is still entering, per product, so they survive moving between the
// product page and quick view, other pages and reloads. Kept for this visit only (sessionStorage),
// since body measurements are personal; once added to the bag they are stored with the bag line.
import { useCallback } from "react";
import { createLocalStore, isRecord } from "@/utils/localStore";
import { emptyCustomDraft, type CustomMeasurementDraft } from "@/utils/measurements";

export interface MeasurementDraftEntry {
  /** Whether "Customize your size" is chosen. */
  custom: boolean;
  draft: CustomMeasurementDraft;
}

export const MEASUREMENT_DRAFTS_KEY = "layaan-demo-measurement-drafts";
const emptyEntry: MeasurementDraftEntry = { custom: false, draft: emptyCustomDraft };

function parseGroup<T extends object>(template: T, raw: unknown): T {
  const source = isRecord(raw) ? raw : {};
  return Object.fromEntries(Object.keys(template).map((k) => [k, typeof source[k] === "string" ? (source[k] as string).slice(0, 12) : ""])) as T;
}

export function parseDrafts(raw: unknown): Record<string, MeasurementDraftEntry> {
  if (!isRecord(raw)) return {};
  const out: Record<string, MeasurementDraftEntry> = {};
  for (const [id, entry] of Object.entries(raw).slice(0, 50)) {
    if (!isRecord(entry)) continue;
    const draft = isRecord(entry.draft) ? entry.draft : {};
    out[id] = { custom: entry.custom === true, draft: { body: parseGroup(emptyCustomDraft.body, draft.body), trouser: parseGroup(emptyCustomDraft.trouser, draft.trouser) } };
  }
  return out;
}

export const measurementDraftStore = createLocalStore<Record<string, MeasurementDraftEntry>>(MEASUREMENT_DRAFTS_KEY, parseDrafts, {}, "session");

export function useMeasurementDraft(productId: string) {
  const entry = measurementDraftStore.use()[productId] ?? emptyEntry;
  const update = useCallback(
    (fn: (prev: MeasurementDraftEntry) => MeasurementDraftEntry) => measurementDraftStore.set((all) => ({ ...all, [productId]: fn(all[productId] ?? emptyEntry) })),
    [productId],
  );
  return [entry, update] as const;
}

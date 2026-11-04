import type { BodyMeasurements, CustomMeasurements, CustomerMeasurements, MeasurementErrors, MeasurementGroup, MeasurementProfile, TrouserMeasurements } from "@/types/measurements";

/** Each field's label and a typical value in inches, used as the input placeholder. */
export const bodyFields: ReadonlyArray<{ key: keyof BodyMeasurements; label: string; example: string }> = [
  { key: "shoulder", label: "Shoulder", example: "15" },
  { key: "bust", label: "Bust", example: "36" },
  { key: "waist", label: "Waist", example: "30" },
  { key: "hips", label: "Hips", example: "38" },
  { key: "length", label: "Length", example: "42" },
  { key: "armhole", label: "Armhole", example: "17" },
  { key: "biceps", label: "Biceps", example: "11" },
  { key: "elbow", label: "Elbow", example: "10" },
  { key: "sleevesLength", label: "Sleeve length", example: "22" },
  { key: "wrist", label: "Wrist", example: "6.5" },
];

export const trouserFields: ReadonlyArray<{ key: keyof TrouserMeasurements; label: string; example: string }> = [
  { key: "naturalWaist", label: "Natural waist", example: "30" },
  { key: "hip", label: "Hip", example: "40" },
  { key: "thigh", label: "Thigh", example: "22" },
  { key: "knee", label: "Knee", example: "15" },
  { key: "frontRise", label: "Front rise", example: "11" },
  { key: "backRise", label: "Back rise", example: "15" },
  { key: "inseam", label: "Inseam", example: "29" },
  { key: "trouserLength", label: "Trouser length", example: "40" },
];

export const fieldsFor = (group: MeasurementGroup) => (group === "body" ? bodyFields : trouserFields);

export const emptyMeasurements: CustomerMeasurements = {
  dress: "",
  body: {
    shoulder: "",
    bust: "",
    waist: "",
    hips: "",
    length: "",
    armhole: "",
    biceps: "",
    elbow: "",
    sleevesLength: "",
    wrist: "",
  },
  trouser: {
    naturalWaist: "",
    hip: "",
    thigh: "",
    knee: "",
    frontRise: "",
    backRise: "",
    inseam: "",
    trouserLength: "",
  },
};

/** Largest plausible measurement, in inches. */
export const MAX_MEASUREMENT = 120;

function measurementError(raw: string): string | undefined {
  if (!raw.trim()) return "Enter this measurement.";
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return "Enter a number greater than 0.";
  if (value > MAX_MEASUREMENT) return `Enter a measurement of ${MAX_MEASUREMENT} in or less.`;
  return undefined;
}

export function validateMeasurements(values: CustomerMeasurements): MeasurementErrors {
  const errors: MeasurementErrors = {};
  if (!values.dress) errors.dress = "Select a dress.";
  for (const group of ["body", "trouser"] as const) {
    const measurements = Object.entries(values[group]) as Array<[string, string]>;
    for (const [field, raw] of measurements) {
      const error = measurementError(raw);
      if (error) errors[`${group}.${field}` as keyof MeasurementErrors] = error;
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------------------------
// Made-to-measure products (no supplied size chart): the customer enters their own measurements.
// ---------------------------------------------------------------------------------------------

/** Size recorded on a bag line or order item when the customer entered their own measurements. */
export const CUSTOM_SIZE = "Custom";

const TROUSER_PIECE = /\b(trousers?|pants?|palazzos?|shalwar|culottes?)\b/i;

/**
 * Measurement sections a product needs, from its included pieces: trousers only, an upper-body
 * garment (dress, shirt, coat…), or both for a two-piece suit.
 */
export function measurementProfileFor(pieces: readonly string[]): MeasurementProfile {
  const trousers = pieces.some((p) => TROUSER_PIECE.test(p));
  const upper = pieces.some((p) => !TROUSER_PIECE.test(p)) || pieces.length === 0;
  if (trousers && upper) return "two-piece";
  return trousers ? "trouser" : "upper";
}

export const groupsFor = (profile: MeasurementProfile): MeasurementGroup[] => (profile === "two-piece" ? ["body", "trouser"] : profile === "trouser" ? ["trouser"] : ["body"]);

/** What the custom size form edits: the raw text of every field (only the profile's groups are used). */
export type CustomMeasurementDraft = Pick<CustomerMeasurements, "body" | "trouser">;
export const emptyCustomDraft: CustomMeasurementDraft = { body: emptyMeasurements.body, trouser: emptyMeasurements.trouser };

/** Errors keyed `${group}.${field}`, in form order. Only the profile's sections are required. */
export function validateCustomMeasurements(profile: MeasurementProfile, draft: CustomMeasurementDraft): MeasurementErrors {
  const errors: MeasurementErrors = {};
  for (const group of groupsFor(profile)) {
    for (const { key } of fieldsFor(group)) {
      const error = measurementError((draft[group] as unknown as Record<string, string>)[key] ?? "");
      if (error) errors[`${group}.${key}`] = error;
    }
  }
  return errors;
}

/** Numeric measurements for a valid draft, limited to the profile's sections. */
export function toCustomMeasurements(profile: MeasurementProfile, draft: CustomMeasurementDraft): CustomMeasurements {
  const out: CustomMeasurements = {};
  for (const group of groupsFor(profile)) {
    const values = draft[group] as unknown as Record<string, string>;
    (out as Record<string, Record<string, number>>)[group] = Object.fromEntries(fieldsFor(group).map(({ key }) => [key, Number(values[key])]));
  }
  return out;
}

/** True when stored measurements are complete and plausible for the profile (guards localStorage and orders). */
export function isValidCustomMeasurements(profile: MeasurementProfile, value: unknown): value is CustomMeasurements {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const groups = groupsFor(profile);
  if (Object.keys(record).some((k) => !groups.includes(k as MeasurementGroup))) return false;
  return groups.every((group) => {
    const section = record[group];
    if (typeof section !== "object" || section === null) return false;
    const fields = section as Record<string, unknown>;
    return fieldsFor(group).every(({ key }) => typeof fields[key] === "number" && (fields[key] as number) > 0 && (fields[key] as number) <= MAX_MEASUREMENT);
  });
}

/** Stable short id for a set of measurements, so different measurements become separate bag lines. */
export function measurementsKey(m: CustomMeasurements): string {
  const text = (["body", "trouser"] as const).map((g) => (m[g] ? fieldsFor(g).map(({ key }) => (m[g] as Record<string, number>)[key]).join(",") : "")).join("|");
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

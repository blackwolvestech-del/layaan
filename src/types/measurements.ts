export interface BodyMeasurements {
  shoulder: string;
  bust: string;
  waist: string;
  hips: string;
  length: string;
  armhole: string;
  biceps: string;
  elbow: string;
  sleevesLength: string;
  wrist: string;
}

export interface TrouserMeasurements {
  naturalWaist: string;
  hip: string;
  thigh: string;
  knee: string;
  frontRise: string;
  backRise: string;
  inseam: string;
  trouserLength: string;
}

export interface CustomerMeasurements {
  dress: string;
  body: BodyMeasurements;
  trouser: TrouserMeasurements;
}

export type MeasurementGroup = "body" | "trouser";
export type MeasurementErrors = Partial<Record<"dress" | `${MeasurementGroup}.${string}`, string>>;

/**
 * Which measurement sections a made-to-measure product needs. Products with a supplied size chart
 * have no profile and keep the standard size run.
 */
export type MeasurementProfile = "upper" | "trouser" | "two-piece";

/** Measurements a customer entered for one bag line, in inches. Only the product's sections are present. */
export interface CustomMeasurements {
  body?: Record<keyof BodyMeasurements, number>;
  trouser?: Record<keyof TrouserMeasurements, number>;
}

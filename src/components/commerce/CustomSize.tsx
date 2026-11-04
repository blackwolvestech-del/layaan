import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import type { CustomMeasurements, MeasurementErrors, MeasurementGroup, MeasurementProfile } from "@/types/measurements";
import { CUSTOM_SIZE, fieldsFor, groupsFor, MAX_MEASUREMENT, type CustomMeasurementDraft } from "@/utils/measurements";
import { ease } from "@/utils/motion";
import { Icon } from "../ui/Icon";
import { Field, fieldAria } from "./controls";

export const GROUP_LABELS: Record<MeasurementGroup, string> = { body: "Upper body", trouser: "Trouser" };

/** "Size M", or "Made to measure" for a custom-sized line. */
export const formatLineSize = (size: string) => (size === CUSTOM_SIZE ? "Made to measure" : `Size ${size}`);

/** Id of a measurement input, so the purchase panel can focus the first invalid field. */
export const measurementInputId = (prefix: string, group: MeasurementGroup, field: string) => `${prefix}-${group}-${field}`;

/**
 * Replaces the standard size run for products without a size chart: choosing "Customize your size"
 * reveals the measurement fields for the product's garment type (upper body, trouser, or both).
 */
export function CustomSizeSelector({
  profile,
  idPrefix,
  selected,
  onSelect,
  draft,
  onChange,
  errors,
  optionError,
}: {
  profile: MeasurementProfile;
  idPrefix: string;
  selected: boolean;
  onSelect: () => void;
  draft: CustomMeasurementDraft;
  onChange: (group: MeasurementGroup, field: string, value: string) => void;
  errors: MeasurementErrors;
  optionError?: string | undefined;
}) {
  const reduce = useReducedMotion();
  const auto = useId();
  const errorId = `${auto}-error`;
  const groups = groupsFor(profile);
  const errorCount = Object.keys(errors).length;

  return (
    <div>
      <fieldset aria-describedby={optionError ? errorId : undefined}>
        <legend className="nav-caps mb-3 flex min-h-8 items-center">
          Size{selected && <span className="ml-2 tracking-normal text-muted normal-case">— made to measure</span>}
        </legend>
        <label className="relative block">
          <input type="radio" name={auto} value={CUSTOM_SIZE} checked={selected} onChange={onSelect} className="peer sr-only" aria-invalid={optionError ? true : undefined} />
          <span
            className={clsx(
              "flex min-h-12 cursor-pointer items-center gap-3 rounded-[2px] border px-4 py-3 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]",
              selected ? "border-ink bg-ink text-bg" : optionError ? "border-danger text-ink hover:border-ink" : "border-line-strong text-ink hover:border-ink",
            )}
          >
            <Icon name="ruler" size={18} className={clsx("shrink-0", selected ? "text-gold-soft" : "text-gold-ink")} />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold tracking-[0.1em] uppercase">Customize your size</span>
              <span className={clsx("mt-0.5 block text-xs", selected ? "text-bg/75" : "text-muted")}>Made to your own measurements, in inches</span>
            </span>
            <Icon name={selected ? "check" : "chevronDown"} size={16} className="shrink-0" />
          </span>
        </label>
        {optionError && (
          <p id={errorId} role="alert" className="mt-2 text-xs text-danger">
            {optionError}
          </p>
        )}
      </fieldset>

      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            key="fields"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: ease.editorial }}
            className="overflow-hidden"
          >
            <div className="mt-4 border border-line bg-surface p-4 sm:p-5">
              <div className="flex items-start gap-3 border-b border-line pb-4">
                <Icon name="info" size={16} className="mt-0.5 shrink-0 text-gold-ink" />
                <p className="text-xs leading-relaxed text-ink-2">
                  Measure your body with a soft tape, snug but not tight. Enter every measurement in <strong className="font-semibold text-ink">inches</strong> — decimals such as 16.5 are fine.
                </p>
              </div>

              {errorCount > 0 && (
                <p role="alert" className="mt-4 flex items-center gap-1.5 text-xs text-danger">
                  <Icon name="info" size={13} /> {errorCount} {errorCount === 1 ? "measurement needs" : "measurements need"} attention.
                </p>
              )}

              {groups.map((group, index) => (
                <fieldset key={group} className={clsx(index === 0 ? "mt-5" : "mt-7 border-t border-line pt-6")}>
                  <legend className="nav-caps mb-4 flex w-full items-center gap-3 text-ink">
                    {groups.length > 1 && <span className="text-gold-ink">0{index + 1}</span>}
                    <span>{GROUP_LABELS[group]} measurements</span>
                    <span aria-hidden className="h-px flex-1 bg-line" />
                  </legend>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4">
                    {fieldsFor(group).map(({ key, label, example }) => {
                      const id = measurementInputId(idPrefix, group, key);
                      const error = errors[`${group}.${key}`];
                      return (
                        <Field key={key} id={id} label={label} error={error} className="min-w-0">
                          <div className="relative">
                            <input
                              {...fieldAria(id, error)}
                              className="input pr-10 tabular-nums"
                              type="number"
                              inputMode="decimal"
                              min="0.01"
                              max={MAX_MEASUREMENT}
                              step="0.01"
                              required
                              placeholder={`e.g. ${example}`}
                              value={(draft[group] as unknown as Record<string, string>)[key]}
                              onChange={(e) => onChange(group, key, e.target.value)}
                            />
                            <span aria-hidden className="nav-caps pointer-events-none absolute inset-y-0 right-3 flex items-center text-gold-ink">
                              in
                            </span>
                          </div>
                        </Field>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Collapsible list of the measurements saved with a bag line or order item. */
export function MeasurementSummary({ measurements, className }: { measurements: CustomMeasurements | undefined; className?: string }) {
  if (!measurements) return null;
  const groups = (["body", "trouser"] as const).filter((g) => measurements[g]);
  return (
    <details className={clsx("group", className)}>
      <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.12em] text-gold-ink uppercase [&::-webkit-details-marker]:hidden">
        <Icon name="ruler" size={14} /> Your measurements
        <Icon name="chevronDown" size={13} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-2 space-y-3 border-l border-gold/40 pl-3">
        {groups.map((group) => (
          <div key={group}>
            {groups.length > 1 && <p className="nav-caps !text-[0.625rem] text-ink">{GROUP_LABELS[group]}</p>}
            <dl className="mt-1 grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-4 gap-y-0.5 text-xs">
              {fieldsFor(group).map(({ key, label }) => (
                <div key={key} className="flex justify-between gap-2">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-ink tabular-nums">{(measurements[group] as Record<string, number>)[key]} in</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </details>
  );
}

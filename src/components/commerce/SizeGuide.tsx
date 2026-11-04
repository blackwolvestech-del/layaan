import clsx from "clsx";
import { useState } from "react";
import type { ProductSizeChart } from "@/types/product";
import { Modal } from "../ui/Drawer";
import { Icon } from "../ui/Icon";

export const SIZE_GUIDE_MESSAGE = "Select a product to view its size guide.";
export const SIZE_GUIDE_UNAVAILABLE = "Size guide unavailable for this product.";

export function SizeGuideTable({ chart }: { chart: ProductSizeChart | null }) {
  if (!chart) return <p className="text-sm text-muted">{SIZE_GUIDE_UNAVAILABLE}</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="nav-caps text-ink">{chart.title}</h3>
        {chart.unit && <p className="code-accent uppercase">Measurements in {chart.unit}</p>}
      </div>
      {chart.note && <p className="text-sm leading-relaxed text-ink-2">{chart.note}</p>}
      <div className="space-y-6">
        {chart.sections.map((section) => {
          const headingId = `size-chart-${chart.title}-${section.title}`.replace(/\s+/g, "-").toLowerCase();
          return (
            <section key={section.title} aria-labelledby={headingId}>
              <h4 id={headingId} className="mb-2 font-display text-lg text-ink">{section.title}</h4>
              <div className="max-w-full overflow-x-auto overscroll-x-contain border border-line" tabIndex={0} role="region" aria-label={`${section.title} size chart`}>
                <table className="w-full min-w-[32rem] border-collapse text-sm tabular-nums text-ink-2">
                  <caption className="sr-only">{chart.title}: {section.title} size chart{chart.unit ? ` in ${chart.unit}` : ""}</caption>
                  <thead>
                    <tr className="bg-surface-2">
                      <th scope="col" className="border-r border-b border-line px-3 py-3 text-left text-[0.6875rem] font-semibold tracking-[0.14em] text-gold-ink uppercase">Measurement</th>
                      {section.columns.map((column) => (
                        <th key={column} scope="col" className="border-b border-line px-3 py-3 text-center text-[0.6875rem] font-semibold tracking-[0.14em] text-ink uppercase">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, rowIndex) => (
                      <tr key={row.label} className={rowIndex < section.rows.length - 1 ? "border-b border-line" : undefined}>
                        <th scope="row" className="border-r border-line px-3 py-3 text-left text-xs font-semibold tracking-[0.08em] text-ink uppercase">{row.label}</th>
                        {row.values.map((value, index) => <td key={`${row.label}-${section.columns[index]}`} className="px-3 py-3 text-center">{value}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** Size guide content shared by the standalone page and product-page dialog. */
export function SizeGuideContent({ chart }: { chart?: ProductSizeChart | null }) {
  if (chart === undefined) {
    return (
      <div className="flex items-start gap-4">
        <Icon name="ruler" size={22} className="mt-0.5 shrink-0 text-gold-ink" />
        <p className="text-[0.9375rem] leading-relaxed text-pretty text-ink-2 sm:text-base">{SIZE_GUIDE_MESSAGE}</p>
      </div>
    );
  }
  return <SizeGuideTable chart={chart} />;
}

export function SizeGuideButton({ chart, className }: { chart: ProductSizeChart | null; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={clsx("inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-ink-2 uppercase underline underline-offset-4 hover:text-gold-ink", className)}>
        <Icon name="ruler" size={15} /> Size guide
      </button>
      <Modal open={open} onOpenChange={setOpen} title="Size guide" className="!max-w-4xl">
        <SizeGuideContent chart={chart} />
      </Modal>
    </>
  );
}

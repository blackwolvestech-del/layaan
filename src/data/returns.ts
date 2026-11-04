// Return request options. The reasons are form choices only; the return policy itself (window,
// condition, refunds, costs) has not been supplied and is shown as "to be confirmed".
import type { ReturnReason } from "@/types/commerce";

export const returnReasons: { id: ReturnReason; label: string }[] = [
  { id: "size-too-small", label: "Too small" },
  { id: "size-too-large", label: "Too large" },
  { id: "not-as-expected", label: "Not as expected" },
  { id: "damaged", label: "Arrived damaged or faulty" },
  { id: "changed-mind", label: "Changed my mind" },
  { id: "other", label: "Other" },
];

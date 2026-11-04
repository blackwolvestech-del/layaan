import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { receiptStore } from "@/services";
import type { OrderViewer } from "@/types/commerce";

/** The current shopper, for order access checks: the signed-in account plus this session's receipts. */
export function useOrderViewer(): OrderViewer {
  const { isAuthenticated, customer } = useAuth();
  const receipts = receiptStore.use();
  const email = isAuthenticated ? (customer?.email ?? null) : null;
  return useMemo(() => ({ email, receipts }), [email, receipts]);
}

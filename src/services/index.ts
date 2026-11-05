// The storefront imports services from here only. Orders, tracking and returns are backed by the
// shared Supabase database (./supabase.ts); the browser-only implementations in ./local.ts remain
// for tests and as pure helpers.
import { localAdminAuthService, localAdminOrderService } from "./local";
import { supabaseOrderService, supabaseReturnService, supabaseTrackingService } from "./supabase";
import type { AdminOrderService, OrderService, ReturnService, TrackingService } from "./types";

export const orderService: OrderService = supabaseOrderService;
export const trackingService: TrackingService = supabaseTrackingService;
export const returnService: ReturnService = supabaseReturnService;
/** Back office: orders are managed in the LAYAAN CRM (see AdminGate). */
export const adminOrderService: AdminOrderService = localAdminOrderService;
export const adminAuthService = localAdminAuthService;

export { canViewOrder, returnedQuantities, STATUS_FLOW } from "./local";
export { receiptStore } from "./supabase";
export { CommerceError, NotAuthorisedError } from "./types";
export type { ReturnInput } from "./types";

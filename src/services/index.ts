// The storefront imports services from here only. To connect a backend, implement the
// interfaces in ./types.ts with API calls and export those implementations instead.
import { localAdminAuthService, localAdminOrderService, localOrderService, localReturnService, localTrackingService } from "./local";
import type { AdminOrderService, OrderService, ReturnService, TrackingService } from "./types";

export const orderService: OrderService = localOrderService;
export const trackingService: TrackingService = localTrackingService;
export const returnService: ReturnService = localReturnService;
export const adminOrderService: AdminOrderService = localAdminOrderService;
export const adminAuthService = localAdminAuthService;

export { canViewOrder, receiptStore, returnedQuantities, STATUS_FLOW } from "./local";
export { CommerceError, NotAuthorisedError } from "./types";
export type { ReturnInput } from "./types";

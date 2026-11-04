// Service contracts used by the storefront. The current implementations (./local.ts) keep
// everything in this browser; a backend integration only needs to provide the same interfaces
// and be exported from ./index.ts — no page or component changes required.
import type { CheckoutDraft, Order, OrderViewer, ReturnReason, ReturnRequest, ReturnRequestItem, TrackingInfo } from "@/types/commerce";

export interface OrderService {
  /**
   * Validates the draft against the catalogue, prices it server-side (here: locally) and creates the
   * order. Resolves only once the order, including any custom measurements, has been saved.
   */
  placeOrder(draft: CheckoutDraft): Promise<Order>;
  /** All orders, or with a viewer only the orders that viewer may see. */
  listOrders(viewer?: OrderViewer): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  /** The order if the viewer may see it; null when it is missing or belongs to someone else. */
  getOrderForViewer(id: string, viewer: OrderViewer): Promise<Order | null>;
}

/** Back-office access to every order. Each call fails unless an administrator is signed in. */
export interface AdminOrderService {
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
}

/** Administrator sign-in for the back office. */
export interface AdminAuthService {
  /** False when no admin access has been configured for this deployment. */
  isConfigured(): boolean;
  isSignedIn(): boolean;
  signIn(accessCode: string): Promise<boolean>;
  signOut(): void;
}

export interface TrackingService {
  /** Current status and timeline for an order (a shipping/carrier API in production). */
  getTracking(order: Order): Promise<TrackingInfo>;
  /** Guest lookup: the order number must match the email used at checkout. */
  lookup(orderId: string, email: string): Promise<Order | null>;
}

export interface ReturnInput {
  orderId: string;
  items: ReturnRequestItem[];
  reason: ReturnReason;
  comments: string;
}

export interface ReturnService {
  listReturns(orderId?: string): Promise<ReturnRequest[]>;
  createReturn(input: ReturnInput): Promise<ReturnRequest>;
}

/** The caller is not allowed to perform the action (e.g. back office without an admin session). */
export class NotAuthorisedError extends Error {
  override name = "NotAuthorisedError";
}

/** Expected, user-presentable failure (validation, not found…). */
export class CommerceError extends Error {
  override name = "CommerceError";
}

import type { LineSize } from "./commerce";
import type { CustomMeasurements } from "./measurements";
import type { ProductImage } from "./product";

export interface CustomerPreferences {
  emailNewsletter: boolean;
  orderUpdates: boolean;
  exclusiveEvents: boolean;
  preferredLanguage: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberTier: "Client" | "Privilege" | "Atelier VIP";
  joinedDate: string;
  avatarInitials: string;
  preferences: CustomerPreferences;
}

export interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export type OrderStatus = "Processing" | "In Transit" | "Delivered" | "Returned" | "Cancelled";

export interface OrderTimelineEvent {
  status: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  completed: boolean;
}

export interface OrderItem {
  productId: string;
  productSlug: string;
  productLabel: string;
  colour: string;
  productImage: ProductImage;
  selectedSize: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: {
    type: string;
    last4: string;
    expiry?: string;
  };
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  timeline: OrderTimelineEvent[];
}

export interface ProductReview {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productLabel: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  createdAt: string;
  customerName: string;
  verifiedPurchase: boolean;
}

export interface CartItem {
  id: string; // unique `${productId}-${size}`, plus a measurements key for custom sizes
  productId: string;
  productSlug: string;
  productLabel: string;
  colour: string;
  productImage: ProductImage;
  selectedSize: LineSize;
  /** The customer's own measurements (inches), present only when selectedSize is "Custom". */
  measurements?: CustomMeasurements;
  quantity: number;
  price: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  customer: Customer | null;
  pendingVerificationEmail: string | null;
}

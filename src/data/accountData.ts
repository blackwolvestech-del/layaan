import { products } from "@/data/products";
import type { Product } from "@/types/product";
import type { Address, CartItem, Customer, Order, ProductReview } from "@/types/account";

// Helper to look up product
const getProduct = (id: string): Product => products.find((p) => p.id === id) || products[0]!;

export const defaultCustomer: Customer = {
  id: "cust_demo_01",
  firstName: "Amina",
  lastName: "Al-Mansoor",
  email: "amina.almansoor@example.com",
  phone: "+92 300 8492019",
  memberTier: "Privilege",
  joinedDate: "October 2025",
  avatarInitials: "AA",
  preferences: {
    emailNewsletter: true,
    orderUpdates: true,
    exclusiveEvents: true,
    preferredLanguage: "English",
  },
};

export const defaultAddresses: Address[] = [
  {
    id: "addr_01",
    fullName: "Amina Al-Mansoor",
    addressLine1: "House 18, Street 5",
    addressLine2: "Sector F-7/3",
    city: "Islamabad",
    stateProvince: "Islamabad Capital Territory",
    postalCode: "44000",
    country: "Pakistan",
    phone: "+92 300 8492019",
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
  {
    id: "addr_02",
    fullName: "Amina Al-Mansoor",
    addressLine1: "Plot 42, Main Boulevard",
    addressLine2: "Phase 6, DHA",
    city: "Lahore",
    stateProvince: "Punjab",
    postalCode: "54792",
    country: "Pakistan",
    phone: "+92 321 9876543",
    isDefaultShipping: false,
    isDefaultBilling: false,
  },
];

export function buildDefaultOrders(): Order[] {
  const pTeal = getProduct("teal-statement-sleeve-suit");
  const pIvory = getProduct("ivory-longline-coat-gold-fastenings");
  const pEmerald = getProduct("emerald-tie-neck-maxi");
  const pMagenta = getProduct("magenta-satin-button-jacket");

  return [
    {
      id: "ord_01",
      orderNumber: "LYN-82914",
      orderDate: "14 February 2026",
      status: "Delivered",
      items: [
        {
          productId: pTeal.id,
          productSlug: pTeal.id,
          productLabel: pTeal.label,
          colour: pTeal.colour,
          productImage: pTeal.images[0]!,
          selectedSize: "M",
          quantity: 1,
          price: 48000,
        },
        {
          productId: pIvory.id,
          productSlug: pIvory.id,
          productLabel: pIvory.label,
          colour: pIvory.colour,
          productImage: pIvory.images[0]!,
          selectedSize: "S",
          quantity: 1,
          price: 62000,
        },
      ],
      subtotal: 110000,
      shippingCost: 0,
      tax: 0,
      total: 110000,
      shippingAddress: defaultAddresses[0]!,
      paymentMethod: {
        type: "Card",
        last4: "4092",
        expiry: "09/28",
      },
      trackingNumber: "TCS-8392-109283-PK",
      carrier: "TCS Express Luxury",
      estimatedDelivery: "18 February 2026",
      timeline: [
        {
          status: "Order Confirmed",
          description: "Order received and confirmed by the atelier.",
          date: "14 Feb 2026",
          time: "10:14 AM",
          completed: true,
        },
        {
          status: "Tailoring & Ribbon Seal",
          description: "Garment inspected, pressed, and sealed with signature butter paper.",
          date: "15 Feb 2026",
          time: "02:30 PM",
          location: "Lahore Atelier",
          completed: true,
        },
        {
          status: "Dispatched",
          description: "Handed over to TCS Express Luxury Courier.",
          date: "16 Feb 2026",
          time: "05:45 PM",
          location: "Lahore Central Gateway",
          completed: true,
        },
        {
          status: "Out for Delivery",
          description: "With courier for white-glove doorstep delivery.",
          date: "18 Feb 2026",
          time: "09:12 AM",
          location: "Islamabad Sector F Hub",
          completed: true,
        },
        {
          status: "Delivered",
          description: "Delivered and signed for by A. Al-Mansoor.",
          date: "18 Feb 2026",
          time: "11:38 AM",
          location: "Sector F-7/3, Islamabad",
          completed: true,
        },
      ],
    },
    {
      id: "ord_02",
      orderNumber: "LYN-91402",
      orderDate: "24 March 2026",
      status: "In Transit",
      items: [
        {
          productId: pEmerald.id,
          productSlug: pEmerald.id,
          productLabel: pEmerald.label,
          colour: pEmerald.colour,
          productImage: pEmerald.images[0]!,
          selectedSize: "M",
          quantity: 1,
          price: 54000,
        },
      ],
      subtotal: 54000,
      shippingCost: 0,
      tax: 0,
      total: 54000,
      shippingAddress: defaultAddresses[0]!,
      paymentMethod: {
        type: "Apple Pay",
        last4: "8821",
      },
      trackingNumber: "TCS-9941-208311-PK",
      carrier: "TCS Priority Express",
      estimatedDelivery: "30 March 2026",
      timeline: [
        {
          status: "Order Confirmed",
          description: "Order registered and payment verified.",
          date: "24 Mar 2026",
          time: "03:22 PM",
          completed: true,
        },
        {
          status: "Atelier Preparation",
          description: "Garment tailored, checked, and placed in presentation box.",
          date: "25 Mar 2026",
          time: "11:00 AM",
          location: "Lahore Atelier",
          completed: true,
        },
        {
          status: "In Transit",
          description: "Dispatched from primary distribution center.",
          date: "26 Mar 2026",
          time: "04:15 PM",
          location: "Lahore Cargo Hub",
          completed: true,
        },
        {
          status: "Out for Delivery",
          description: "Scheduled for priority morning delivery.",
          date: "30 Mar 2026",
          time: "Estimated",
          completed: false,
        },
        {
          status: "Delivered",
          description: "Signature required upon receipt.",
          date: "30 Mar 2026",
          time: "Pending",
          completed: false,
        },
      ],
    },
    {
      id: "ord_03",
      orderNumber: "LYN-93881",
      orderDate: "27 September 2026",
      status: "Processing",
      items: [
        {
          productId: pMagenta.id,
          productSlug: pMagenta.id,
          productLabel: pMagenta.label,
          colour: pMagenta.colour,
          productImage: pMagenta.images[0]!,
          selectedSize: "S",
          quantity: 1,
          price: 38000,
        },
      ],
      subtotal: 38000,
      shippingCost: 0,
      tax: 0,
      total: 38000,
      shippingAddress: defaultAddresses[0]!,
      paymentMethod: {
        type: "Card",
        last4: "4092",
      },
      trackingNumber: "LYN-PENDING-93881",
      carrier: "TCS Express Luxury",
      estimatedDelivery: "3 October 2026",
      timeline: [
        {
          status: "Order Placed",
          description: "Order successfully submitted via client portal.",
          date: "27 Sep 2026",
          time: "08:45 PM",
          completed: true,
        },
        {
          status: "Atelier Queued",
          description: "Allocated to master tailoring team for cutting & assembly.",
          date: "28 Sep 2026",
          time: "09:30 AM",
          completed: true,
        },
        {
          status: "Quality Inspection",
          description: "Pending finishing touches and security ribbon application.",
          date: "Pending",
          time: "--",
          completed: false,
        },
        {
          status: "Dispatched",
          description: "Tracking link will be generated once collected.",
          date: "Pending",
          time: "--",
          completed: false,
        },
      ],
    },
  ];
}

export function buildDefaultCartItems(): CartItem[] {
  return [];
}

export const defaultReviews: ProductReview[] = [
  {
    id: "rev_01",
    orderId: "ord_01",
    orderNumber: "LYN-82914",
    productId: "teal-statement-sleeve-suit",
    productLabel: "Teal Statement-Sleeve Trouser Suit",
    rating: 5,
    title: "Sculptural silhouette with magnificent drape",
    comment:
      "The satin has a substantial, luxurious weight that moves with remarkable grace. The puff shoulders give a formidable, regal presence without feeling stiff. Beautifully lined and finished.",
    createdAt: "20 February 2026",
    customerName: "Amina Al-Mansoor",
    verifiedPurchase: true,
  },
];

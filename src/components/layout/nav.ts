import { categories, collections } from "@/data/products";

export interface NavLinkItem {
  to: string;
  label: string;
}

/** Centred primary navigation (desktop row, mobile drawer). */
export const primaryNav: (NavLinkItem & { mega?: boolean })[] = [
  { to: "/shop", label: "Shop all" },
  { to: "/collections", label: "Collections", mega: true },
  { to: "/lookbook", label: "Lookbook" },
  { to: "/about", label: "About" },
];

export const categoryNav: NavLinkItem[] = categories.map((c) => ({ to: `/shop?category=${c.id}`, label: c.name }));
export const collectionNav: NavLinkItem[] = collections.map((c) => ({ to: `/collections/${c.id}`, label: c.name }));

export const helpNav: NavLinkItem[] = [
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
  { to: "/size-guide", label: "Size guide" },
  { to: "/measurements", label: "Custom Dress" },
  { to: "/shipping", label: "Shipping & delivery" },
  { to: "/returns", label: "Returns & exchanges" },
  { to: "/track-order", label: "Track an order" },
  { to: "/account/orders", label: "Your orders" },
];

export const legalNav: NavLinkItem[] = [
  { to: "/privacy-policy", label: "Privacy policy" },
  { to: "/terms", label: "Terms & conditions" },
];

/** Ticker messages — positioning only, no offers or delivery promises. */
export const announcements = [
  "Contemporary Western womenswear",
  "Refined tailoring · Coordinated sets · Statement sleeves",
  "Explore the full lookbook",
];

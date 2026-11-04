import type { ComponentType } from "react";
import { createBrowserRouter, type RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";
import { RouteError } from "@/components/layout/RouteError";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Home from "@/pages/Home";



// Every page except the homepage is loaded on demand (route-level code splitting).
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default });

export const routes: RouteObject[] = [
  {
    path: "/",
    Component: SiteLayout,
    errorElement: <RouteError />,
    children: [
      { index: true, Component: Home },
      // Shop
      { path: "shop", lazy: page(() => import("@/pages/Shop")) },
      { path: "collections", lazy: page(() => import("@/pages/Collections")) },
      { path: "collections/:slug", lazy: page(() => import("@/pages/Collection")) },
      { path: "products/:slug", lazy: page(() => import("@/pages/ProductDetails")) },
      { path: "search", lazy: page(() => import("@/pages/SearchResults")) },
      { path: "wishlist", lazy: page(() => import("@/pages/Wishlist")) },
      { path: "lookbook", lazy: page(() => import("@/pages/Lookbook")) },
      // Checkout
      { path: "cart", lazy: page(() => import("@/pages/Cart")) },
      { path: "checkout", lazy: page(() => import("@/pages/Checkout")) },
      { path: "order-confirmation/:orderId", lazy: page(() => import("@/pages/OrderConfirmation")) },
      { path: "track-order", lazy: page(() => import("@/pages/OrderTracking")) },
      // Accounts
      { path: "login", lazy: page(() => import("@/pages/Login")) },
      { path: "register", lazy: page(() => import("@/pages/Register")) },
      { path: "forgot-password", lazy: page(() => import("@/pages/ForgotPassword")) },
      { path: "reset-password", lazy: page(() => import("@/pages/ResetPassword")) },
      { path: "verify-email", lazy: page(() => import("@/pages/VerifyEmail")) },
      { path: "account", lazy: page(() => import("@/pages/Account")) },
      { path: "account/orders", lazy: page(() => import("@/pages/Orders")) },
      { path: "account/orders/:orderId", lazy: page(() => import("@/pages/OrderDetails")) },
      { path: "account/addresses", lazy: page(() => import("@/pages/Addresses")) },
      { path: "account/settings", lazy: page(() => import("@/pages/AccountSettings")) },
      // Back office (administrators only)
      { path: "admin", lazy: page(() => import("@/pages/admin/AdminOrders")) },
      { path: "admin/orders", lazy: page(() => import("@/pages/admin/AdminOrders")) },
      { path: "admin/orders/:orderId", lazy: page(() => import("@/pages/admin/AdminOrderDetails")) },
      // Information
      { path: "about", lazy: page(() => import("@/pages/About")) },
      { path: "contact", lazy: page(() => import("@/pages/Contact")) },
      { path: "faq", lazy: page(() => import("@/pages/FAQ")) },
      { path: "size-guide", lazy: page(() => import("@/pages/SizeGuide")) },
      { path: "measurements", lazy: page(() => import("@/pages/Measurements")) },
      { path: "shipping", lazy: page(() => import("@/pages/Shipping")) },
      { path: "returns", lazy: page(() => import("@/pages/Returns")) },
      { path: "privacy-policy", lazy: page(() => import("@/pages/PrivacyPolicy")) },
      { path: "terms", lazy: page(() => import("@/pages/Terms")) },
      { path: "*", lazy: page(() => import("@/pages/NotFound")) },
    ],
  },
];

const router = createBrowserRouter(routes);

export function App() {
  return <RouterProvider router={router} />;
}

import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useAccountData } from "@/context/AccountDataContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { products } from "@/data/products";
import { formatLineSize } from "@/components/commerce/CustomSize";
import { AccountLayout } from "@/components/layout/AccountLayout";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Reveal } from "@/components/ui/misc";
import { formatPrice } from "@/utils/currency";

export default function Account() {
  const { customer, logout } = useAuth();
  const { orders, addresses } = useAccountData();
  const { items: cartItems, subtotal: cartSubtotal } = useCart();
  const { ids: wishlistIds } = useWishlist();

  const recentOrders = orders.slice(0, 2);
  const defaultAddress = addresses.find((a) => a.isDefaultShipping) || addresses[0];
  const savedLooks = wishlistIds.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 4);

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-success/10 text-success border-success/30";
      case "In Transit":
        return "bg-warning/10 text-warning border-warning/30";
      case "Processing":
        return "bg-gold/15 text-gold-ink border-gold/30";
      default:
        return "bg-surface-2 text-muted border-line";
    }
  };

  return (
    <AccountLayout
      title="Atelier Overview"
      eyebrow="My Account"
      tagline="Welcome back. Manage your bespoke orders, personal wardrobe, and delivery preferences."
      crumbs={[{ label: "Account" }]}
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left Column: Orders & Wardrobe (8 cols) */}
        <div className="space-y-8 lg:col-span-8">
          {/* Recent Orders Section */}
          <Reveal className="border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="eyebrow !text-[0.625rem]">Order History</p>
                <h3 className="heading-caps !text-base sm:!text-lg">Recent Orders</h3>
              </div>
              <Link to="/account/orders" className="link-underline text-xs font-semibold tracking-wider text-gold-ink uppercase">
                View All Orders ({orders.length}) →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-muted">
                <p className="text-sm">No recent orders found.</p>
                <ButtonLink to="/shop" variant="outline" size="sm" className="mt-4">
                  Explore the Collection
                </ButtonLink>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {recentOrders.map((order) => (
                  <div key={order.id} className="py-6 first:pt-4 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-ink">{order.orderNumber}</span>
                        <span className="text-muted">·</span>
                        <span className="text-muted">{order.orderDate}</span>
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-wider uppercase ${statusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <div className="flex -space-x-3 overflow-hidden">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="relative h-16 w-14 shrink-0 overflow-hidden rounded-[2px] border border-line bg-surface-2">
                            <Img image={item.productImage} sizes="60px" fit="cover" className="h-full w-full" decorative />
                          </div>
                        ))}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-ink">
                          {order.items.map((i) => i.productLabel).join(" · ")}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {order.items.length} {order.items.length === 1 ? "piece" : "pieces"} · Total: {formatPrice(order.total)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <ButtonLink to={`/account/orders/${order.orderNumber}`} variant="outline" size="sm">
                          View Order
                        </ButtonLink>
                        {order.status !== "Delivered" && (
                          <ButtonLink to={`/track-order?id=${order.orderNumber}`} variant="ghost" size="sm">
                            <Icon name="truck" size={14} /> Track
                          </ButtonLink>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Reveal>

          {/* Cart & Bag Summary Card */}
          <Reveal className="border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="eyebrow !text-[0.625rem]">Current Selection</p>
                <h3 className="heading-caps !text-base sm:!text-lg">Shopping Bag ({cartItems.length})</h3>
              </div>
              <Link to="/cart" className="link-underline text-xs font-semibold tracking-wider text-gold-ink uppercase">
                Open Bag →
              </Link>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-6 text-center text-muted">
                <p className="text-sm">Your shopping bag is currently empty.</p>
                <ButtonLink to="/shop" variant="outline" size="sm" className="mt-3">
                  Discover Outfits
                </ButtonLink>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 border border-line/70 bg-surface-2/40 p-3">
                      <div className="h-18 w-14 shrink-0 overflow-hidden rounded-[2px] bg-surface-2">
                        <Img image={item.productImage} sizes="60px" fit="cover" className="h-full w-full" decorative />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-ink">{item.productLabel}</p>
                        <p className="text-xs text-muted">{formatLineSize(item.selectedSize)} · Qty: {item.quantity}</p>
                        <p className="mt-1 font-mono text-xs font-medium text-ink">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-line/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-muted">
                    Subtotal: <span className="font-mono text-sm font-bold text-ink">{formatPrice(cartSubtotal)}</span> (Complimentary Courier Included)
                  </div>
                  <div className="flex gap-2">
                    <ButtonLink to="/cart" variant="outline" size="sm">
                      Edit Bag
                    </ButtonLink>
                    <ButtonLink to="/checkout" variant="primary" size="sm">
                      Proceed to Checkout
                    </ButtonLink>
                  </div>
                </div>
              </div>
            )}
          </Reveal>

          {/* Wishlist Summary Card */}
          <Reveal className="border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="eyebrow !text-[0.625rem]">Saved Looks</p>
                <h3 className="heading-caps !text-base sm:!text-lg">Wishlist ({wishlistIds.length})</h3>
              </div>
              <Link to="/wishlist" className="link-underline text-xs font-semibold tracking-wider text-gold-ink uppercase">
                View Full Wardrobe →
              </Link>
            </div>

            {savedLooks.length === 0 ? (
              <div className="py-6 text-center text-muted">
                <p className="text-sm">You haven't saved any looks yet.</p>
                <p className="tagline mt-1 text-xs">Tap the heart on any garment to collect your preferred silhouettes.</p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {savedLooks.map((look) => look && (
                  <Link key={look.id} to={`/products/${look.id}`} className="group block">
                    <div className="aspect-[3/4] overflow-hidden rounded-[2px] bg-surface-2">
                      <Img
                        image={look.images[0]}
                        sizes="160px"
                        fit="cover"
                        className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 line-clamp-1 text-xs font-medium text-ink group-hover:underline">{look.label}</p>
                    <p className="text-[0.6875rem] text-muted">{look.colour}</p>
                  </Link>
                ))}
              </div>
            )}
          </Reveal>
        </div>

        {/* Right Column: Customer Profile & Quick Actions (4 cols) */}
        <div className="space-y-8 lg:col-span-4">
          {/* Customer Summary Card */}
          <Reveal className="border border-line bg-surface p-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="heading-caps !text-sm">Client Profile</h3>
              <Link to="/account/settings" className="text-xs text-gold-ink hover:underline">
                Edit
              </Link>
            </div>

            <div className="mt-4 space-y-3 text-xs text-ink-2">
              <div>
                <p className="text-muted">Full Name</p>
                <p className="font-medium text-ink">{customer?.firstName} {customer?.lastName}</p>
              </div>
              <div>
                <p className="text-muted">Email Address</p>
                <p className="font-mono text-ink">{customer?.email}</p>
              </div>
              <div>
                <p className="text-muted">Phone Number</p>
                <p className="text-ink">{customer?.phone}</p>
              </div>
              <div>
                <p className="text-muted">Membership Tier</p>
                <p className="font-semibold text-gold-ink">{customer?.memberTier} Client</p>
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-4">
              <ButtonLink to="/account/settings" variant="outline" size="sm" className="w-full">
                <Icon name="lock" size={14} /> Security & Settings
              </ButtonLink>
            </div>
          </Reveal>

          {/* Primary Saved Address Card */}
          <Reveal className="border border-line bg-surface p-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="heading-caps !text-sm">Default Address</h3>
              <Link to="/account/addresses" className="text-xs text-gold-ink hover:underline">
                Manage
              </Link>
            </div>

            {defaultAddress ? (
              <div className="mt-4 space-y-1 text-xs text-ink-2">
                <p className="font-semibold text-ink">{defaultAddress.fullName}</p>
                <p>{defaultAddress.addressLine1}</p>
                {defaultAddress.addressLine2 && <p>{defaultAddress.addressLine2}</p>}
                <p>{defaultAddress.city}, {defaultAddress.stateProvince} {defaultAddress.postalCode}</p>
                <p>{defaultAddress.country}</p>
                <p className="mt-2 text-muted">{defaultAddress.phone}</p>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-[2px] bg-surface-2 px-2 py-0.5 text-[0.625rem] font-semibold text-muted uppercase">
                    Default Shipping
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-xs text-muted">
                <p>No default address saved yet.</p>
                <ButtonLink to="/account/addresses" variant="outline" size="sm" className="mt-3">
                  Add Address
                </ButtonLink>
              </div>
            )}
          </Reveal>

          {/* Concierge & Assistance */}
          <Reveal className="border border-line bg-surface-2/70 p-6 text-xs text-muted">
            <p className="eyebrow !text-[0.625rem]">Personal Concierge</p>
            <h4 className="mt-1 font-display text-base font-normal text-ink">Private Atelier Service</h4>
            <p className="mt-2 leading-relaxed">
              For bespoke adjustments, garment styling consultations, or private showroom viewings, contact your personal advisor.
            </p>
            <div className="mt-4 space-y-1 font-mono text-[0.6875rem] text-ink">
              <p>concierge@layaan-atelier.com</p>
              <p>+44 20 7946 0990 (Mon–Fri, 9am–6pm BST)</p>
            </div>
            <div className="mt-6 border-t border-line pt-4">
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 text-xs font-semibold tracking-wider text-danger uppercase hover:underline"
              >
                <Icon name="logout" size={14} /> Sign Out of Account
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </AccountLayout>
  );
}

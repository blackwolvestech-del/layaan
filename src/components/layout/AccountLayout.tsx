import { motion } from "motion/react";
import clsx from "clsx";
import { type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useAccountData } from "@/context/AccountDataContext";
import { useCart } from "@/context/CartContext";
import { AnimatedNumber } from "@/components/fx/AnimatedNumber";
import { useWishlist } from "@/hooks/useWishlist";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs, type Crumb } from "./PageHeader";
import { Reveal } from "@/components/ui/misc";

interface AccountNavTab {
  to: string;
  label: string;
  icon: IconName;
  badge?: number;
}

interface AccountLayoutProps {
  title: string;
  eyebrow?: string;
  tagline?: string;
  crumbs?: Crumb[];
  children: ReactNode;
}

export function AccountLayout({ title, eyebrow = "Client Services", tagline, crumbs, children }: AccountLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { customer, isAuthenticated, logout } = useAuth();
  const { orders } = useAccountData();
  const { itemCount } = useCart();
  const { ids: wishlistIds } = useWishlist();

  const activeOrdersCount = orders.filter((o) => o.status === "Processing" || o.status === "In Transit").length;

  const tabs: AccountNavTab[] = [
    { to: "/account", label: "Overview", icon: "user" },
    { to: "/account/orders", label: "Orders", icon: "package", badge: activeOrdersCount > 0 ? activeOrdersCount : undefined },
    { to: "/cart", label: "Shopping Bag", icon: "bag", badge: itemCount > 0 ? itemCount : undefined },
    { to: "/wishlist", label: "Saved Looks", icon: "heart", badge: wishlistIds.length > 0 ? wishlistIds.length : undefined },
    { to: "/account/addresses", label: "Addresses", icon: "mapPin" },
    { to: "/account/settings", label: "Account Settings", icon: "lock" },
    { to: "/returns", label: "Returns", icon: "truck" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return (
      <div className="container-x py-16 sm:py-24">
        <div className="mx-auto max-w-lg border border-line bg-surface p-8 text-center sm:p-12">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-cream text-gold-ink">
            <Icon name="user" size={28} />
          </div>
          <p className="eyebrow mb-3">Atelier Portal</p>
          <h1 className="page-title text-balance text-2xl sm:text-3xl">Sign In Required</h1>
          <p className="tagline mt-3 text-sm text-muted">
            Please sign in to access your personal order history, saved addresses, and tailored client services.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="primary" size="md" onClick={() => navigate("/login")}>
              Sign In to Account
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate("/register")}>
              Create an Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x pt-6 pb-20 sm:pt-8 sm:pb-28">
      {crumbs && <Breadcrumbs items={[{ label: "Home", to: "/" }, ...crumbs]} />}

      {/* Luxury Client Profile Banner */}
      <Reveal className="mt-8 border-b border-line pb-8 sm:mt-10 sm:pb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-gold/40 bg-surface-2 font-display text-2xl font-light tracking-wide text-gold-ink shadow-sm sm:h-20 sm:w-20 sm:text-3xl">
              {customer?.avatarInitials || "LA"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="page-title !text-xl sm:!text-2xl">
                  {customer ? `${customer.firstName} ${customer.lastName}` : "Client Portfolio"}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold-soft/20 px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-wider text-gold-ink uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {customer?.memberTier || "Privilege"} Member
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {customer?.email} · Member since {customer?.joinedDate || "2025"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted hover:text-ink">
              <Icon name="logout" size={16} /> Sign Out
            </Button>
          </div>
        </div>

        {/* Quick summary stats strip */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="border border-line bg-surface-2/60 p-4">
            <p className="eyebrow !text-[0.625rem]">Active Orders</p>
            <p className="font-display text-2xl text-ink sm:text-3xl"><AnimatedNumber value={activeOrdersCount} /></p>
          </div>
          <div className="border border-line bg-surface-2/60 p-4">
            <p className="eyebrow !text-[0.625rem]">Shopping Bag</p>
            <p className="font-display text-2xl text-ink sm:text-3xl"><AnimatedNumber value={itemCount} /> items</p>
          </div>
          <div className="border border-line bg-surface-2/60 p-4">
            <p className="eyebrow !text-[0.625rem]">Saved Looks</p>
            <p className="font-display text-2xl text-ink sm:text-3xl"><AnimatedNumber value={wishlistIds.length} /></p>
          </div>
          <div className="border border-line bg-surface-2/60 p-4">
            <p className="eyebrow !text-[0.625rem]">Complimentary Courier</p>
            <p className="font-sans text-sm font-semibold tracking-wider text-gold-ink uppercase sm:text-base">Active</p>
          </div>
        </div>
      </Reveal>

      {/* Responsive Account Navigation */}
      <nav aria-label="Account sections" className="scrollbar-none -mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max items-center gap-1.5 border-b border-line pb-px">
          {tabs.map((tab) => {
            const isActive = pathname === tab.to || (tab.to !== "/account" && pathname.startsWith(tab.to));
            return (
              <li key={tab.to}>
                <Link
                  to={tab.to}
                  className={clsx(
                    "nav-caps group relative flex min-h-12 items-center gap-2 border-b-2 px-4 text-xs transition-colors",
                    isActive
                      ? "border-transparent font-bold text-ink"
                      : "border-transparent text-muted hover:border-line hover:text-ink",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Gold underline slides between tabs. */}
                  {isActive && <motion.span layoutId="account-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <Icon name={tab.icon} size={16} className={isActive ? "text-gold-ink" : "text-muted"} />
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="grid h-4 min-w-[1rem] place-items-center rounded-full bg-gold px-1 text-[0.625rem] font-bold text-accent-contrast">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main Account Content Slot */}
      <div className="mt-10 sm:mt-12">
        <div className="mb-6 flex flex-col justify-between gap-2 border-b border-line pb-4 sm:flex-row sm:items-end">
          <div>
            {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
            <h2 className="heading-caps !text-lg sm:!text-xl">{title}</h2>
          </div>
          {tagline && <p className="tagline text-xs sm:text-sm">{tagline}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}

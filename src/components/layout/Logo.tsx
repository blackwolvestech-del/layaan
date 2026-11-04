import clsx from "clsx";
import { brandAssets } from "@/data/assets";
import { Link, useLocation } from "react-router";
import { scrollToTop } from "@/utils/scroll";

/**
 * The supplied logo artwork. The cream paper was keyed out at build time so the original gold
 * lettering sits on either theme without being redrawn in another typeface or recoloured.
 */
export function Logo({ className, height = 34 }: { className?: string; height?: number }) {
  const width = Math.round(height * brandAssets.logoAspect);
  const { pathname } = useLocation();
  return (
    <Link
      to="/"
      onClick={(e) => {
        if (pathname === "/") {
          e.preventDefault();
          scrollToTop();
        }
      }}
      className={clsx("inline-flex shrink-0 items-center", className)}
      aria-label="LAYAAN Atelier — home"
    >
      <picture>
        <source srcSet={brandAssets.logoWebp} type="image/webp" />
        <img src={brandAssets.logoPng} alt="LAYAAN Atelier" width={width} height={height} style={{ height, width: "auto" }} className="select-none" draggable={false} />
      </picture>
    </Link>
  );
}

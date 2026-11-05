import clsx from "clsx";
import { useState, type CSSProperties } from "react";
import { IMAGE_WIDTHS } from "@/data/catalog";

export interface ImgSource {
  basePath: string;
  /** Direct URL (images uploaded through the CRM); used instead of the local derivatives. */
  src?: string | undefined;
  width: number;
  height: number;
  alt: string;
  placeholder?: string | null;
  focalX?: number;
  focalY?: number;
}

const srcSet = (basePath: string, format: string) => IMAGE_WIDTHS.map((w) => `${basePath}-${w}.${format} ${w}w`).join(", ");

interface ImgProps {
  image: ImgSource | null | undefined;
  /** Rendered width description so the browser picks the right file. */
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** Hero / LCP image: eager with high fetch priority. Everything else is lazy. */
  priority?: boolean;
  fit?: "cover" | "contain";
  alt?: string;
  style?: CSSProperties;
  decorative?: boolean;
}

/**
 * Responsive AVIF/WebP image with a JPEG fallback, served from local optimised derivatives.
 * Garment colours are never filtered; crops use the image's focal point.
 */
export function Img({ image, sizes, className, imgClassName, priority, fit = "cover", alt, style, decorative }: ImgProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!image || failed) {
    return (
      <div className={clsx("grid place-items-center bg-surface-2 text-center", className)} style={style} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : "Image unavailable"}>
        <span className="eyebrow px-4 !text-muted">Image unavailable</span>
      </div>
    );
  }
  return (
    <div className={clsx("relative overflow-hidden", className)} style={{ backgroundColor: image.placeholder ?? undefined, ...style }}>
      <picture>
        {!image.src && <source type="image/avif" srcSet={srcSet(image.basePath, "avif")} sizes={sizes} />}
        {!image.src && <source type="image/webp" srcSet={srcSet(image.basePath, "webp")} sizes={sizes} />}
        <img
          src={image.src ?? `${image.basePath}-1200.jpg`}
          alt={decorative ? "" : (alt ?? image.alt)}
          width={image.width}
          height={image.height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          draggable={false}
          className={clsx("h-full w-full transition-opacity duration-500", fit === "cover" ? "object-cover" : "object-contain", priority || loaded ? "opacity-100" : "opacity-0", imgClassName)}
          style={{ objectPosition: `${image.focalX ?? 50}% ${image.focalY ?? 30}%` }}
        />
      </picture>
    </div>
  );
}

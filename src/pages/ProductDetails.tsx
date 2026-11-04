import { motion, useReducedMotion } from "motion/react";
import { Accordion } from "radix-ui";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { PurchasePanel } from "@/components/commerce/PurchasePanel";
import { SizeGuideTable } from "@/components/commerce/SizeGuide";
import { SplitText } from "@/components/fx/SplitText";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductInfo } from "@/components/product/ProductInfo";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/misc";
import { categories, productById, products } from "@/data/products";
import { DetailsStrip } from "@/sections/DetailsStrip";
import { ease, fadeUp, staggerParent } from "@/utils/motion";
import NotFound from "./NotFound";

function InfoSection({ value, title, children }: { value: string; title: string; children: ReactNode }) {
  return (
    <Accordion.Item value={value} className="border-b border-line">
      <Accordion.Header>
        <Accordion.Trigger className="group nav-caps flex min-h-14 w-full items-center justify-between gap-4 text-left">
          {title}
          <Icon name="plus" size={16} className="transition-transform duration-300 group-data-[state=open]:rotate-45" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="accordion-content overflow-hidden">
        <div className="pb-6">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

export default function ProductDetails() {
  const reduce = useReducedMotion();
  const { slug = "" } = useParams();
  const product = productById(slug);
  if (!product) return <NotFound />;
  const category = categories.find((c) => c.id === product.category);
  // Related looks: most shared collections first, then same category.
  const related = products
    .filter((p) => p.id !== product.id)
    .map((p) => ({ p, score: p.collections.filter((c) => product.collections.includes(c)).length * 2 + (p.category === product.category ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.p);

  return (
    <>
      <title>{`${product.label} — LAYAAN Atelier`}</title>
      <meta name="description" content={product.description} />
      <div className="container-x pt-4 sm:pt-8 lg:pt-10">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Shop", to: "/shop" },
            ...(category ? [{ label: category.name, to: `/shop?category=${category.id}` }] : []),
            { label: product.label },
          ]}
        />
        <div className="mt-4 grid gap-7 sm:mt-6 sm:gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Gallery unveils with a curtain wipe. */}
          <motion.div
            key={`g-${product.id}`}
            className="min-w-0 lg:col-span-7"
            initial={reduce ? false : { clipPath: "inset(0 0 100% 0)", opacity: 0.4 }}
            animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
            transition={{ duration: 1.1, ease: ease.editorial }}
          >
            <ProductGallery images={product.images} title={product.label} sizes="(min-width: 1024px) 50vw, 100vw" priority layout="side" hoverZoom />
          </motion.div>
          <div className="min-w-0 lg:col-span-5">
            <motion.div key={`i-${product.id}`} className="lg:sticky lg:top-28" initial={reduce ? false : "hidden"} animate="show" variants={staggerParent(0.08, 0.25)}>
              <motion.p variants={fadeUp} className="nav-caps flex items-center gap-3 text-muted">
                <span aria-hidden className="h-px w-8 bg-gold" /> {product.colour} · {category?.name}
              </motion.p>
              <SplitText
                key={product.id}
                as="h1"
                trigger="mount"
                text={product.label}
                delay={0.2}
                stagger={0.018}
                className="mt-3 break-words text-[clamp(1.375rem,1.05rem+1.2vw,2.125rem)] leading-tight font-bold tracking-[0.06em] text-balance uppercase [font-family:var(--font-sans)] sm:tracking-[0.08em]"
              />
              <motion.p variants={fadeUp} className="code-accent mt-3">
                {product.images.length} photographs
              </motion.p>
              <motion.div variants={fadeUp} className="mt-6 sm:mt-8">
                <PurchasePanel product={product} />
              </motion.div>
              <motion.div variants={fadeUp}>
              <Accordion.Root type="multiple" defaultValue={["details"]} className="mt-8 border-t border-line sm:mt-10">
                <InfoSection value="details" title="Description & details">
                  <ProductInfo product={product} />
                </InfoSection>
                <InfoSection value="fit" title="Size & fit">
                  {product.measurementProfile ? (
                    <div className="space-y-3 text-sm text-ink-2">
                      <p>This look is made to your own measurements. Choose “Customize your size” above and enter each measurement in inches.</p>
                      <p>Measure your body with a soft tape, keeping it snug but not tight. Your measurements are saved with this piece in your bag and order.</p>
                    </div>
                  ) : (
                    <div className="space-y-5 text-sm text-ink-2">
                      <p>Compare your measurements with the size guide before choosing a size.</p>
                      <SizeGuideTable chart={product.sizeChart} />
                    </div>
                  )}
                </InfoSection>
                <InfoSection value="delivery" title="Shipping & returns">
                  <div className="space-y-3 text-sm text-ink-2">
                    <p>Shipping options and rates are confirmed at checkout. Returns can be requested from your order once it has been delivered.</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      <Link to="/shipping" className="link-underline text-xs font-semibold tracking-[0.12em] uppercase">
                        Shipping information
                      </Link>
                      <Link to="/returns" className="link-underline text-xs font-semibold tracking-[0.12em] uppercase">
                        Returns
                      </Link>
                    </div>
                  </div>
                </InfoSection>
              </Accordion.Root>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      <VelocityMarquee items={[product.label, product.colour, category?.name ?? "", "LAYAAN Atelier"].filter(Boolean)} baseVelocity={-1.2} className="mt-14 overflow-hidden border-y border-line py-4 font-display text-[clamp(2rem,1.3rem+3.5vw,4.5rem)] leading-none text-ink sm:mt-20 sm:py-5 lg:mt-24" />
      <DetailsStrip product={product} />
      <section aria-labelledby="related-title" className="container-x mt-14 sm:mt-20 lg:mt-24">
        <SectionHeading id="related-title" eyebrow="you may also like" title="Related looks" />
        <ProductGrid products={related} showcase className="max-xs:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4" />
      </section>
    </>
  );
}

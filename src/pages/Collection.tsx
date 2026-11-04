import { useParams } from "react-router";
import { CatalogueBrowser } from "@/components/catalogue/CatalogueBrowser";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import { placements } from "@/data/assets";
import { collections, imageByFile, products } from "@/data/products";
import NotFound from "./NotFound";

export default function Collection() {
  const { slug } = useParams();
  const collection = collections.find((c) => c.id === slug);
  if (!collection) return <NotFound />;
  const count = products.filter((p) => p.collections.includes(collection.id)).length;
  const others = collections.filter((c) => c.id !== collection.id);
  return (
    <>
      <title>{`${collection.name} — LAYAAN Atelier`}</title>
      <div className="container-x pt-8 sm:pt-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Collections", to: "/collections" }, { label: collection.name }]} />
        <header className="relative mt-4 flex min-h-[12rem] items-end overflow-hidden rounded-[2px] sm:min-h-[15rem]">
          <Img image={imageByFile(placements.collectionCovers[collection.id])} sizes="100vw" priority className="absolute inset-0" decorative />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative p-5 text-white sm:p-8">
            <p className="code-accent block !text-white/75">{count} looks</p>
            <h1 className="font-display text-2xl sm:text-3xl mt-1 tracking-wide">{collection.name}</h1>
          </div>
        </header>
      </div>
      <div className="container-x pt-8 pb-10">
        <CatalogueBrowser lockedCollection={collection.id} />
        <nav aria-label="Other collections" className="mt-16 flex flex-wrap items-center gap-3 border-t border-line pt-8">
          <span className="nav-caps mr-2 text-muted">More collections</span>
          {others.map((c) => (
            <ButtonLink key={c.id} to={`/collections/${c.id}`} variant="outline" size="sm">
              {c.name}
            </ButtonLink>
          ))}
        </nav>
      </div>
    </>
  );
}

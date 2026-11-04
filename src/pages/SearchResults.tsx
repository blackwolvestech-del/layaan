import { useSearchParams } from "react-router";
import { CatalogueBrowser } from "@/components/catalogue/CatalogueBrowser";
import { PageHeader } from "@/components/layout/PageHeader";

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  return (
    <>
      <PageHeader docTitle={q ? `Search: ${q}` : "Search"} eyebrow="Search" title={q ? `Results for “${q}”` : "Search the collection"} crumbs={[{ label: "Search" }]} />
      <div className="container-x pb-10">
        <CatalogueBrowser autoFocusSearch={!q} />
      </div>
    </>
  );
}

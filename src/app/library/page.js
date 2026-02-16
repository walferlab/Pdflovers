import { CategoryStrip } from "@/components/home/category-strip";
import { PdfGrid } from "@/components/pdf/pdf-grid";
import { SearchBar } from "@/components/ui/search-bar";
import { pdfCategories, searchPdfs } from "@/lib/pdf-data";

export const metadata = {
  title: "Library",
  description: "Search and browse curated PDFs.",
};

export default async function LibraryPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : "";
  const results = searchPdfs(query);

  return (
    <div className="stack-lg">
      <section className="section-block reveal">
        <div className="section-heading">
          <p className="eyebrow">Library</p>
          <h1>Search every PDF in one place.</h1>
          <p>Use title, author, or category keywords to narrow results instantly.</p>
        </div>

        <SearchBar
          initialQuery={query}
          placeholder="Try: next.js, marketing blueprint, finance model..."
        />
      </section>

      <section className="section-block reveal">
        <div className="section-heading-inline">
          <h2>{results.length} results</h2>
          {query ? <p>Showing matches for: &quot;{query}&quot;</p> : <p>Showing all curated PDFs.</p>}
        </div>
        <PdfGrid
          items={results}
          emptyMessage="No PDF matched your search. Try a broader keyword."
        />
      </section>

      <section className="section-block reveal">
        <div className="section-heading">
          <p className="eyebrow">Quick filters</p>
          <h2>Jump by category</h2>
        </div>
        <CategoryStrip categories={pdfCategories} />
      </section>
    </div>
  );
}

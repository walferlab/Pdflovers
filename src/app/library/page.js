import { GoogleAdSlot } from "@/components/ads/google-ad-slot";
import { CategoryStrip } from "@/components/home/category-strip";
import { LibraryResults } from "@/components/library/library-results";
import { JsonLdScript } from "@/components/seo/json-ld";
import { SearchBar } from "@/components/ui/search-bar";
import { getPdfCategories, searchPdfLibrary } from "@/lib/pdfs/repository";
import {
  getAbsoluteUrl,
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getPageMetadata,
} from "@/lib/seo";

export const metadata = getPageMetadata({
  title: "Search PDF Books",
  description:
    "Search free PDF books download library by title, author, category, and tags. Discover curated PDF books and study notes quickly.",
  path: "/library",
  keywords: ["search PDF books", "find PDF by author", "book tags"],
});

export default async function LibraryPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : "";
  const [results, categories] = await Promise.all([
    searchPdfLibrary(query, { limit: 36 }),
    getPdfCategories(),
  ]);
  const libraryAdSlot = process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_LIBRARY;
  const listTitle = query ? `PDF search results for ${query}` : "PDF Books Library";
  const librarySchemas = [
    getCollectionPageSchema({
      title: listTitle,
      description:
        "Search free PDF books download library by title, author, category, and tags.",
      path: "/library",
      totalItems: results.length,
    }),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Library", path: "/library" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: listTitle,
      numberOfItems: results.length,
      itemListElement: results.slice(0, 20).map((pdf, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: pdf.title,
        url: getAbsoluteUrl(`/pdf/${pdf.id}`),
      })),
    },
  ];

  return (
    <div className="stack-lg">
      <JsonLdScript data={librarySchemas} id="library-schema" />
      <section className="section-block library-hero reveal">
        <div className="section-heading">
          <p className="eyebrow">Search</p>
          <h1>Search every PDF from one page.</h1>
          <p>Use title, author, category, or tag keywords to narrow results quickly.</p>
        </div>

        <SearchBar
          initialQuery={query}
          placeholder="Try: next.js, marketing blueprint, finance model..."
        />
        <p className="search-hint">
          Tip: Use simple keywords like &quot;design&quot;, &quot;career&quot;, or
          &quot;SQL&quot;.
        </p>
      </section>

      <section className="section-block reveal">
        <div className="section-heading-inline">
          <h2>{results.length} results</h2>
          {query ? <p>Showing matches for: &quot;{query}&quot;</p> : <p>Showing all curated PDFs.</p>}
        </div>
        <LibraryResults query={query} initialItems={results} />
      </section>

      <GoogleAdSlot slot={libraryAdSlot} className="reveal" />

      <section className="section-block reveal">
        <div className="section-heading">
          <p className="eyebrow">Quick filters</p>
          <h2>Jump by category</h2>
        </div>
        <CategoryStrip categories={categories} />
      </section>
    </div>
  );
}

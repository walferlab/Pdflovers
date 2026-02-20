import { CategoryStrip } from "@/components/home/category-strip";
import { GoogleAdSlot } from "@/components/ads/google-ad-slot";
import { HeroSection } from "@/components/home/hero-section";
import { PdfGrid } from "@/components/pdf/pdf-grid";
import { JsonLdScript } from "@/components/seo/json-ld";
import { getFeaturedPdfs, getNewestPdfs, getPdfCategories } from "@/lib/pdfs/repository";
import {
  getAbsoluteUrl,
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getPageMetadata,
} from "@/lib/seo";

export const metadata = getPageMetadata({
  title: "Free PDF Books Download Library",
  description:
    "Free PDF books download library for engineering, design, product, and career growth. Search and explore curated PDF books and notes.",
  path: "/",
  keywords: ["free PDF library", "best PDF books", "PDF notes"],
});

export default async function HomePage() {
  const [featured, newest, categories] = await Promise.all([
    getFeaturedPdfs(6),
    getNewestPdfs(3),
    getPdfCategories(),
  ]);
  const homeAdSlot = process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_HOME;
  const homeSchemas = [
    getCollectionPageSchema({
      title: "Free PDF Books Download Library",
      description:
        "Free PDF books download library for engineering, design, product, and career growth.",
      path: "/",
      totalItems: featured.length + newest.length,
    }),
    getBreadcrumbSchema([{ name: "Home", path: "/" }]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Featured PDF Books",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: featured.length,
      itemListElement: featured.map((pdf, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: pdf.title,
        url: getAbsoluteUrl(`/pdf/${pdf.publicId}`),
      })),
    },
  ];

  return (
    <div className="stack-xl">
      <JsonLdScript data={homeSchemas} id="home-schema" />
      <HeroSection />

      <section className="section-block reveal">
        <div className="section-heading">
          <p className="eyebrow">Browse by theme</p>
          <h2>Popular categories</h2>
        </div>
        <CategoryStrip categories={categories} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Featured</p>
          <h2>Recommended picks</h2>
        </div>
        <PdfGrid items={featured} />
      </section>

      <GoogleAdSlot slot={homeAdSlot} className="reveal" />

      <section className="section-block" id="newest">
        <div className="section-heading">
          <p className="eyebrow">Fresh drops</p>
          <h2>Recently published PDFs</h2>
        </div>
        <PdfGrid items={newest} />
      </section>
    </div>
  );
}

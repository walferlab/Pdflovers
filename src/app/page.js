import { CategoryStrip } from "@/components/home/category-strip";
import { HeroSection } from "@/components/home/hero-section";
import { PdfGrid } from "@/components/pdf/pdf-grid";
import { newestPdfs, pdfCategories, topPdfs } from "@/lib/pdf-data";

export default function HomePage() {
  const featured = topPdfs();
  const newest = newestPdfs(3);

  return (
    <div className="stack-xl">
      <HeroSection />

      <section className="section-block reveal">
        <div className="section-heading">
          <p className="eyebrow">Browse by theme</p>
          <h2>Popular categories</h2>
        </div>
        <CategoryStrip categories={pdfCategories} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Most downloaded</p>
          <h2>Featured picks this week</h2>
        </div>
        <PdfGrid items={featured} />
      </section>

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

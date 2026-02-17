import { JsonLdScript } from "@/components/seo/json-ld";
import { getBreadcrumbSchema, getPageMetadata, getWebPageSchema } from "@/lib/seo";

export const metadata = getPageMetadata({
  title: "About Us",
  description:
    "Learn about PDF Lovers, a free PDF books download library focused on quality search, clean navigation, and useful educational resources.",
  path: "/about-us",
  keywords: ["about PDF Lovers", "PDF library mission"],
});

export default function AboutUsPage() {
  const aboutSchemas = [
    getWebPageSchema({
      title: "About PDF Lovers",
      description:
        "Learn about PDF Lovers, a free PDF books download library with smart search and clean navigation.",
      path: "/about-us",
    }),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about-us" },
    ]),
  ];

  return (
    <div className="stack-lg">
      <JsonLdScript data={aboutSchemas} id="about-schema" />
      <section className="section-block policy-page reveal">
        <div className="section-heading">
          <p className="eyebrow">About</p>
          <h1>About PDF Lovers</h1>
          <p>
            PDF Lovers is a focused platform for discovering curated PDF books, notes, and
            educational guides.
          </p>
        </div>

        <div className="legal-stack">
          <section>
            <h2>What We Do</h2>
            <p>
              We organize a searchable free PDF books download library with topic filters, tags, and
              book detail pages for a faster reading workflow.
            </p>
          </section>
          <section>
            <h2>Our Focus</h2>
            <p>
              We prioritize clean search experience, relevant metadata, and useful resources in
              engineering, design, product, marketing, finance, and career growth.
            </p>
          </section>
          <section>
            <h2>How to Reach Us</h2>
            <p>
              Use the Contact Us page for support and business queries, or the Request PDF page to
              suggest a book for our library.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

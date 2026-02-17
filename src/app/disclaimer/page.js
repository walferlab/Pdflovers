import { JsonLdScript } from "@/components/seo/json-ld";
import { getBreadcrumbSchema, getPageMetadata, getWebPageSchema } from "@/lib/seo";

export const metadata = getPageMetadata({
  title: "Disclaimer",
  description:
    "Read the PDF Lovers disclaimer regarding informational use, third-party links, and content accuracy.",
  path: "/disclaimer",
  keywords: ["website disclaimer", "content disclaimer", "third-party links"],
});

export default function DisclaimerPage() {
  const disclaimerSchemas = [
    getWebPageSchema({
      title: "Disclaimer",
      description:
        "Read the PDF Lovers disclaimer regarding informational use, third-party links, and content accuracy.",
      path: "/disclaimer",
    }),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Disclaimer", path: "/disclaimer" },
    ]),
  ];

  return (
    <div className="stack-lg">
      <JsonLdScript data={disclaimerSchemas} id="disclaimer-schema" />
      <section className="section-block policy-page reveal">
        <div className="section-heading">
          <p className="eyebrow">Legal</p>
          <h1>Disclaimer</h1>
          <p>Last updated: February 16, 2026</p>
        </div>

        <div className="legal-stack">
          <section>
            <h2>General Information</h2>
            <p>
              Content provided on this website is for general informational purposes only and should
              not be treated as legal, financial, or medical advice.
            </p>
          </section>
          <section>
            <h2>Content Accuracy</h2>
            <p>
              We aim to keep information accurate, but we do not guarantee completeness or
              reliability of all listings and metadata.
            </p>
          </section>
          <section>
            <h2>Third-Party Services</h2>
            <p>
              External links, ads, and third-party services are governed by their own policies and
              terms.
            </p>
          </section>
          <section>
            <h2>Use at Your Own Risk</h2>
            <p>You use this website at your own discretion and risk.</p>
          </section>
        </div>
      </section>
    </div>
  );
}

import { JsonLdScript } from "@/components/seo/json-ld";
import { getBreadcrumbSchema, getPageMetadata, getWebPageSchema } from "@/lib/seo";

export const metadata = getPageMetadata({
  title: "Terms of Service",
  description:
    "Read the terms of service for using PDF Lovers, including acceptable use, content rules, and liability terms.",
  path: "/terms-of-service",
  keywords: ["terms of service", "user terms", "PDF platform rules"],
});

export default function TermsOfServicePage() {
  const termsSchemas = [
    getWebPageSchema({
      title: "Terms of Service",
      description:
        "Read the terms of service for using PDF Lovers, including acceptable use, content rules, and liability terms.",
      path: "/terms-of-service",
    }),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Terms of Service", path: "/terms-of-service" },
    ]),
  ];

  return (
    <div className="stack-lg">
      <JsonLdScript data={termsSchemas} id="terms-schema" />
      <section className="section-block policy-page reveal">
        <div className="section-heading">
          <p className="eyebrow">Legal</p>
          <h1>Terms of Service</h1>
          <p>Last updated: February 16, 2026</p>
        </div>

        <div className="legal-stack">
          <section>
            <h2>Acceptance of Terms</h2>
            <p>By using this website, you agree to comply with these terms and all applicable laws.</p>
          </section>
          <section>
            <h2>Platform Use</h2>
            <p>
              You agree not to misuse the website, attempt unauthorized access, or use automation to
              abuse search and download systems.
            </p>
          </section>
          <section>
            <h2>User Submissions</h2>
            <p>
              Information submitted through request or contact forms must be accurate and must not
              contain harmful or unlawful content.
            </p>
          </section>
          <section>
            <h2>Intellectual Property</h2>
            <p>
              All site branding, design, and platform content are protected by applicable
              intellectual property laws.
            </p>
          </section>
          <section>
            <h2>Limitation of Liability</h2>
            <p>
              The service is provided as-is, and we are not liable for indirect losses arising from
              use of this website.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

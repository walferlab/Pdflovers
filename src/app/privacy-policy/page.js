import { JsonLdScript } from "@/components/seo/json-ld";
import { getBreadcrumbSchema, getPageMetadata, getWebPageSchema } from "@/lib/seo";

export const metadata = getPageMetadata({
  title: "Privacy Policy",
  description:
    "Read the privacy policy for PDF Lovers, including data collection, cookies, analytics, and user rights.",
  path: "/privacy-policy",
  keywords: ["privacy policy", "data protection", "cookies policy"],
});

export default function PrivacyPolicyPage() {
  const privacySchemas = [
    getWebPageSchema({
      title: "Privacy Policy",
      description:
        "Read the privacy policy for PDF Lovers, including data collection, cookies, analytics, and user rights.",
      path: "/privacy-policy",
    }),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Privacy Policy", path: "/privacy-policy" },
    ]),
  ];

  return (
    <div className="stack-lg">
      <JsonLdScript data={privacySchemas} id="privacy-schema" />
      <section className="section-block policy-page reveal">
        <div className="section-heading">
          <p className="eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p>Last updated: February 16, 2026</p>
        </div>

        <div className="legal-stack">
          <section>
            <h2>Information We Collect</h2>
            <p>
              We may collect your name, email, requested PDF details, and technical usage data such
              as browser information and anonymized analytics events.
            </p>
          </section>
          <section>
            <h2>How We Use Information</h2>
            <p>
              We use information to improve search quality, respond to requests, maintain platform
              security, and improve our free PDF books download experience.
            </p>
          </section>
          <section>
            <h2>Cookies and Ads</h2>
            <p>
              We may use cookies for basic analytics and advertising delivery. Third-party ad
              providers may set cookies according to their own policies.
            </p>
          </section>
          <section>
            <h2>Data Protection</h2>
            <p>
              We use reasonable safeguards to protect user data, but no online service can
              guarantee absolute security.
            </p>
          </section>
          <section>
            <h2>Your Rights</h2>
            <p>
              You can contact us to request correction or deletion of personal information
              associated with your submissions.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

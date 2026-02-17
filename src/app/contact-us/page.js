import { ContactForm } from "@/components/forms/contact-form";
import { JsonLdScript } from "@/components/seo/json-ld";
import {
  getBreadcrumbSchema,
  getPageMetadata,
  getWebPageSchema,
  siteConfig,
} from "@/lib/seo";

export const metadata = getPageMetadata({
  title: "Contact Us",
  description:
    "Contact PDF Lovers for support, suggestions, business inquiries, and PDF listing requests.",
  path: "/contact-us",
  keywords: ["contact PDF library", "PDF support"],
});

export default function ContactUsPage() {
  const contactSchemas = [
    getWebPageSchema({
      title: "Contact Us",
      description: "Contact PDF Lovers for support, suggestions, and business inquiries.",
      path: "/contact-us",
    }),
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact PDF Lovers",
      url: `${siteConfig.url}/contact-us`,
      description: "Contact PDF Lovers for support and business inquiries.",
      mainEntity: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        email: siteConfig.contactEmail,
      },
    },
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Contact Us", path: "/contact-us" },
    ]),
  ];

  return (
    <div className="stack-lg">
      <JsonLdScript data={contactSchemas} id="contact-schema" />
      <section className="section-block request-section reveal">
        <div className="section-heading">
          <p className="eyebrow">Contact</p>
          <h1>Contact us</h1>
          <p>Send your query and our team will get back to you.</p>
        </div>
        <ContactForm />
      </section>
    </div>
  );
}

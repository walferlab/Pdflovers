import { RequestPdfForm } from "@/components/forms/request-pdf-form";
import { JsonLdScript } from "@/components/seo/json-ld";
import { getBreadcrumbSchema, getPageMetadata, getWebPageSchema } from "@/lib/seo";

export const metadata = getPageMetadata({
  title: "Request a PDF Book",
  description:
    "Request a PDF book by sharing your name, email, and required book details. We review every PDF request for our library.",
  path: "/request-pdf",
  keywords: ["request PDF", "submit book request"],
});

export default function RequestPdfPage() {
  const requestSchemas = [
    getWebPageSchema({
      title: "Request a PDF Book",
      description:
        "Request a PDF book by sharing your name, email, and required book details.",
      path: "/request-pdf",
    }),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Request PDF", path: "/request-pdf" },
    ]),
  ];

  return (
    <div className="stack-lg">
      <JsonLdScript data={requestSchemas} id="request-schema" />
      <section className="section-block request-section reveal">
        <div className="section-heading">
          <p className="eyebrow">Request</p>
          <h1>Can not find your PDF?</h1>
          <p>Share basic details and we will review your request.</p>
        </div>

        <RequestPdfForm />
      </section>
    </div>
  );
}

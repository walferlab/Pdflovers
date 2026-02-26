import Link from "next/link";
import { notFound } from "next/navigation";

import { GoogleAdSlot } from "@/components/ads/google-ad-slot";
import { CoverImage } from "@/components/pdf/cover-image";
import { DownloadAction } from "@/components/pdf/download-action";
import { ShareButton } from "@/components/pdf/share-button";
import { SummaryToggle } from "@/components/pdf/summary-toggle";
import { TagListToggle } from "@/components/pdf/tag-list-toggle";
import { JsonLdScript } from "@/components/seo/json-ld";
import { getFallbackCoverGradient } from "@/lib/covers";
import { formatDate } from "@/lib/format";
import { getPdfByPublicId, getRelatedPdfs } from "@/lib/pdfs/repository";
import {
  getBookSchema,
  getBreadcrumbSchema,
  getPageMetadata,
  getWebPageSchema,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const pdf = await getPdfByPublicId(resolvedParams.public_id);

  if (!pdf) {
    return {
      title: "PDF not found",
    };
  }

  return getPageMetadata({
    title: pdf.title,
    description: pdf.summary,
    path: `/pdf/${pdf.publicId}`,
    keywords: Array.isArray(pdf.tags) ? pdf.tags : [],
    imagePath: pdf.coverImage || "/logo.png",
    openGraphType: "book",
  });
}

export default async function PdfDetailPage({ params }) {
  const resolvedParams = await params;
  const pdf = await getPdfByPublicId(resolvedParams.public_id);
  const detailAdSlot = process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_DETAIL;
  const globalSmartLink = process.env.NEXT_PUBLIC_SMARTLINK_URL;
  const globalDownloadLink = process.env.NEXT_PUBLIC_DIRECT_DOWNLOAD_URL;

  if (!pdf) {
    notFound();
  }

  const metrics = [
    pdf.author ? { label: "Author", value: pdf.author } : null,
    typeof pdf.pages === "number" ? { label: "Pages", value: pdf.pages } : null,
    pdf.publishedAt ? { label: "Published", value: formatDate(pdf.publishedAt) } : null,
    typeof pdf.rating === "number" ? { label: "Rating", value: `${pdf.rating} / 5` } : null,
  ].filter(Boolean);

  const related = await getRelatedPdfs(pdf.publicId, pdf.category, 3);
  const detailSchemas = [
    getWebPageSchema({
      title: pdf.title,
      description: pdf.summary,
      path: `/pdf/${pdf.publicId}`,
    }),
    getBookSchema(pdf),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Library", path: "/library" },
      { name: pdf.title, path: `/pdf/${pdf.publicId}` },
    ]),
  ];

  const coverStyle = {
    background: getFallbackCoverGradient(pdf.publicId),
  };

  return (
    <div className="stack-lg">
      <JsonLdScript data={detailSchemas} id="pdf-detail-schema" />
      <section className="pdf-detail section-block reveal">
        <div className="pdf-cover detail-cover" style={coverStyle}>
          {pdf.coverImage ? (
            <CoverImage
              src={pdf.coverImage}
              alt={`${pdf.title} cover`}
              sizes="(max-width: 980px) 100vw, 280px"
            />
          ) : null}
          {pdf.category ? <p>{pdf.category}</p> : null}
        </div>

        <div className="detail-copy">
          <p className="eyebrow">PDF Details</p>
          <h1>{pdf.title}</h1>
          <SummaryToggle summary={pdf.summary} />
          <TagListToggle tags={pdf.tags} />

          {metrics.length ? (
            <dl className="detail-metrics">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="hero-actions">
            <DownloadAction
              title={pdf.title}
              pdfPublicId={pdf.publicId}
              smartLink={pdf.smartLink || globalSmartLink}
              downloadLink={pdf.downloadLink || globalDownloadLink}
            />
            <ShareButton title={pdf.title} />
            <Link className="button-ghost" href="/library">
              Back to library
            </Link>
          </div>
        </div>
      </section>

      <GoogleAdSlot slot={detailAdSlot} className="reveal" />

      {!!related.length && (
        <section className="section-block reveal">
          <div className="section-heading-inline">
            <h2>Related in {pdf.category}</h2>
            <p>Similar resources you can open next.</p>
          </div>
          <div className="related-list">
            {related.map((item) => (
              <Link key={item.publicId} className="related-item" href={`/pdf/${item.publicId}`}>
                <span>{item.title}</span>
                {item.author ? <small>{item.author}</small> : null}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

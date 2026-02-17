import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GoogleAdSlot } from "@/components/ads/google-ad-slot";
import { DownloadAction } from "@/components/pdf/download-action";
import { ShareButton } from "@/components/pdf/share-button";
import { JsonLdScript } from "@/components/seo/json-ld";
import { getFallbackCoverGradient } from "@/lib/covers";
import { formatDate } from "@/lib/format";
import { getPdfById, getRelatedPdfs } from "@/lib/pdfs/repository";
import {
  getBookSchema,
  getBreadcrumbSchema,
  getPageMetadata,
  getWebPageSchema,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const pdf = await getPdfById(resolvedParams.id);

  if (!pdf) {
    return {
      title: "PDF not found",
    };
  }

  return getPageMetadata({
    title: pdf.title,
    description: pdf.summary,
    path: `/pdf/${pdf.id}`,
    keywords: Array.isArray(pdf.tags) ? pdf.tags : [],
    imagePath: pdf.coverImage || "/logo.png",
    openGraphType: "book",
  });
}

export default async function PdfDetailPage({ params }) {
  const resolvedParams = await params;
  const pdf = await getPdfById(resolvedParams.id);
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

  const related = await getRelatedPdfs(pdf.id, pdf.category, 3);
  const detailSchemas = [
    getWebPageSchema({
      title: pdf.title,
      description: pdf.summary,
      path: `/pdf/${pdf.id}`,
    }),
    getBookSchema(pdf),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Library", path: "/library" },
      { name: pdf.title, path: `/pdf/${pdf.id}` },
    ]),
  ];

  const coverStyle = pdf.coverImage
    ? undefined
    : {
        background: getFallbackCoverGradient(pdf.id),
      };

  return (
    <div className="stack-lg">
      <JsonLdScript data={detailSchemas} id="pdf-detail-schema" />
      <section className="pdf-detail section-block reveal">
        <div className="pdf-cover detail-cover" style={coverStyle}>
          {pdf.coverImage ? (
            <Image
              className="pdf-cover-image"
              src={pdf.coverImage}
              alt={`${pdf.title} cover`}
              fill
              sizes="(max-width: 980px) 100vw, 280px"
            />
          ) : null}
          {pdf.category ? <p>{pdf.category}</p> : null}
        </div>

        <div className="detail-copy">
          <p className="eyebrow">PDF Details</p>
          <h1>{pdf.title}</h1>
          {pdf.summary ? <p>{pdf.summary}</p> : null}
          {Array.isArray(pdf.tags) && pdf.tags.length ? (
            <div className="tag-list">
              {pdf.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

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
              pdfId={pdf.id}
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
              <Link key={item.id} className="related-item" href={`/pdf/${item.id}`}>
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

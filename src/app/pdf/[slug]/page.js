import Link from "next/link";
import { notFound } from "next/navigation";

import { formatCompactNumber, formatDate } from "@/lib/format";
import { findPdfBySlug, pdfLibrary } from "@/lib/pdf-data";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const pdf = findPdfBySlug(resolvedParams.slug);

  if (!pdf) {
    return {
      title: "PDF not found",
    };
  }

  return {
    title: pdf.title,
    description: pdf.summary,
  };
}

export default async function PdfDetailPage({ params }) {
  const resolvedParams = await params;
  const pdf = findPdfBySlug(resolvedParams.slug);

  if (!pdf) {
    notFound();
  }

  const related = pdfLibrary
    .filter((item) => item.id !== pdf.id && item.category === pdf.category)
    .slice(0, 3);

  return (
    <div className="stack-lg">
      <section className="pdf-detail section-block reveal">
        <div
          className="pdf-cover detail-cover"
          style={{
            background: `linear-gradient(150deg, ${pdf.accentFrom}, ${pdf.accentTo})`,
          }}
        >
          <p>{pdf.category}</p>
        </div>

        <div className="detail-copy">
          <p className="eyebrow">PDF Detail</p>
          <h1>{pdf.title}</h1>
          <p>{pdf.summary}</p>

          <dl className="detail-metrics">
            <div>
              <dt>Author</dt>
              <dd>{pdf.author}</dd>
            </div>
            <div>
              <dt>Pages</dt>
              <dd>{pdf.pages}</dd>
            </div>
            <div>
              <dt>Downloads</dt>
              <dd>{formatCompactNumber(pdf.downloads)}</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>{formatDate(pdf.publishedAt)}</dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>{pdf.rating} / 5</dd>
            </div>
          </dl>

          <div className="hero-actions">
            <button className="button-solid" type="button" disabled>
              Download via tracked redirect (step 2)
            </button>
            <Link className="button-ghost" href="/library">
              Back to library
            </Link>
          </div>
        </div>
      </section>

      {!!related.length && (
        <section className="section-block reveal">
          <div className="section-heading-inline">
            <h2>Related in {pdf.category}</h2>
            <p>Similar resources you can open next.</p>
          </div>
          <div className="related-list">
            {related.map((item) => (
              <Link key={item.id} className="related-item" href={`/pdf/${item.slug}`}>
                <span>{item.title}</span>
                <small>{item.author}</small>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

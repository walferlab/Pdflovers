import Link from "next/link";

import { formatCompactNumber } from "@/lib/format";

export function PdfCard({ pdf }) {
  return (
    <article className="pdf-card reveal">
      <div
        className="pdf-cover"
        style={{
          background: `linear-gradient(150deg, ${pdf.accentFrom}, ${pdf.accentTo})`,
        }}
      >
        <p>{pdf.category}</p>
      </div>

      <div className="pdf-content">
        <div className="pdf-meta">
          <span>{pdf.pages} pages</span>
          <span>{formatCompactNumber(pdf.downloads)} downloads</span>
        </div>

        <h3>
          <Link href={`/pdf/${pdf.slug}`}>{pdf.title}</Link>
        </h3>

        <p className="pdf-author">By {pdf.author}</p>
        <p className="pdf-summary">{pdf.summary}</p>
      </div>
    </article>
  );
}

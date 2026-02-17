import Image from "next/image";
import Link from "next/link";

import { ShareButton } from "@/components/pdf/share-button";
import { getFallbackCoverGradient } from "@/lib/covers";

export function PdfCard({ pdf }) {
  const metaItems = [];

  if (typeof pdf.pages === "number") {
    metaItems.push(`${pdf.pages} pages`);
  }

  const coverStyle = pdf.coverImage
    ? undefined
    : {
        background: getFallbackCoverGradient(pdf.id),
      };

  return (
    <article className="pdf-card reveal">
      <div className="pdf-cover" style={coverStyle}>
        {pdf.coverImage ? (
          <Image
            className="pdf-cover-image"
            src={pdf.coverImage}
            alt={`${pdf.title} cover`}
            fill
            sizes="(max-width: 720px) 100vw, 240px"
          />
        ) : null}
        <p>{pdf.category}</p>
      </div>

      <div className="pdf-content">
        {metaItems.length ? (
          <div className="pdf-meta">
            {metaItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}

        <h3>
          <Link href={`/pdf/${pdf.id}`}>{pdf.title}</Link>
        </h3>

        {pdf.author ? <p className="pdf-author">By {pdf.author}</p> : null}
        {Array.isArray(pdf.tags) && pdf.tags.length ? (
          <div className="tag-list">
            {pdf.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="pdf-actions">
          <Link className="button-ghost button-small" href={`/pdf/${pdf.id}`}>
            Open
          </Link>
          <ShareButton
            title={pdf.title}
            path={`/pdf/${pdf.id}`}
            className="button-ghost button-small"
            label="Share"
          />
        </div>
      </div>
    </article>
  );
}

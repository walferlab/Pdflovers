import Link from "next/link";

import { CoverImage } from "@/components/pdf/cover-image";
import { ShareButton } from "@/components/pdf/share-button";
import { TagListToggle } from "@/components/pdf/tag-list-toggle";
import { getFallbackCoverGradient } from "@/lib/covers";

export function PdfCard({ pdf }) {
  const metaItems = [];

  if (typeof pdf.pages === "number") {
    metaItems.push(`${pdf.pages} pages`);
  }

  const coverStyle = {
    background: getFallbackCoverGradient(pdf.publicId),
  };

  return (
    <article className="pdf-card reveal">
      <div className="pdf-cover" style={coverStyle}>
        {pdf.coverImage ? (
          <CoverImage
            src={pdf.coverImage}
            alt={`${pdf.title} cover`}
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
          <Link href={`/pdf/${pdf.publicId}`}>{pdf.title}</Link>
        </h3>

        {pdf.author ? <p className="pdf-author">By {pdf.author}</p> : null}
        <TagListToggle tags={pdf.tags} />

        <div className="pdf-actions">
          <Link className="button-ghost button-small" href={`/pdf/${pdf.publicId}`}>
            Open
          </Link>
          <ShareButton
            title={pdf.title}
            path={`/pdf/${pdf.publicId}`}
            className="button-ghost button-small"
            label="Share"
          />
        </div>
      </div>
    </article>
  );
}

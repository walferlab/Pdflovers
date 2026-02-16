import { PdfCard } from "@/components/pdf/pdf-card";

export function PdfGrid({ items, emptyMessage = "No results found." }) {
  if (!items.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="pdf-grid">
      {items.map((pdf) => (
        <PdfCard key={pdf.id} pdf={pdf} />
      ))}
    </div>
  );
}

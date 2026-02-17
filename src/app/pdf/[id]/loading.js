export default function PdfDetailLoading() {
  return (
    <div className="stack-lg route-loading" aria-hidden="true">
      <section className="section-block pdf-detail">
        <div className="query-skeleton-card detail-cover" />
        <div className="detail-copy">
          <div className="loading-line loading-line-wide" />
          <div className="loading-line" />
          <div className="loading-line" />
        </div>
      </section>
    </div>
  );
}

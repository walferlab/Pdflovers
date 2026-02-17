export default function LibraryLoading() {
  return (
    <div className="stack-lg route-loading" aria-hidden="true">
      <section className="section-block">
        <div className="loading-line loading-line-wide" />
        <div className="loading-line" />
      </section>
      <section className="query-skeleton">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="query-skeleton-card" />
        ))}
      </section>
    </div>
  );
}

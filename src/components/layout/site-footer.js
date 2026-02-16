import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">PDF Lovers</p>
          <p className="footer-copy">
            Discover high-quality PDF resources for engineering, design, business, and growth.
          </p>
        </div>

        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/library">Library</Link>
        </div>
      </div>
      <p className="copyright">{year} PDF Lovers.</p>
    </footer>
  );
}

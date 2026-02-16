import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" href="/">
          <span className="brand-dot" aria-hidden="true" />
          PDF Lovers
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <Link className="button-outline" href="/library">
          Browse PDFs
        </Link>
      </div>
    </header>
  );
}

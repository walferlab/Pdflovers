import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Search" },
  { href: "/request-pdf", label: "Request PDF" },
  { href: "/contact-us", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" href="/">
          <Image
            className="brand-logo"
            src="/logo.png"
            alt="PDF Lovers logo"
            width={28}
            height={28}
            priority
          />
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
          Search Books
        </Link>
      </div>
    </header>
  );
}

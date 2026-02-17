import Link from "next/link";

import { SearchBar } from "@/components/ui/search-bar";

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-panel hero-copy reveal">
        <p className="eyebrow">PDF Library</p>
        <h1>Find useful books quickly.</h1>
        <p>
          Search by title, author, tags, or topic and open the right PDF in a few clicks.
        </p>

        <SearchBar placeholder="Try: growth analytics, design systems, clean architecture..." />

        <div className="hero-actions">
          <Link className="button-solid" href="/library">
            Search Library
          </Link>
          <Link className="button-ghost" href="/request-pdf">
            Request a PDF
          </Link>
        </div>
      </div>
    </section>
  );
}

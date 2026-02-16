import Link from "next/link";

import { SearchBar } from "@/components/ui/search-bar";

const stats = [
  { label: "Curated PDFs", value: "50K+" },
  { label: "Monthly Readers", value: "180K" },
  { label: "Instant Downloads", value: "99.9%" },
];

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-panel hero-copy reveal">
        <p className="eyebrow">PDF knowledge engine</p>
        <h1>Find the right PDF in seconds, not hours.</h1>
        <p>
          A focused reading platform for teams and learners. Search smart, preview quickly, and
          download with confidence.
        </p>

        <SearchBar placeholder="Try: growth analytics, design systems, clean architecture..." />

        <div className="hero-actions">
          <Link className="button-solid" href="/library">
            Explore Library
          </Link>
          <a className="button-ghost" href="#newest">
            See New Releases
          </a>
        </div>
      </div>

      <div className="hero-panel hero-stats reveal">
        <p className="hero-stats-title">Platform Snapshot</p>
        <div className="stat-grid">
          {stats.map((item) => (
            <div key={item.label} className="stat-card">
              <p>{item.value}</p>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

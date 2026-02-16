export const pdfCategories = [
  "Engineering",
  "Design",
  "Marketing",
  "Product",
  "Finance",
  "Data",
  "Career",
  "Health",
];

export const pdfLibrary = [
  {
    id: "pdf-001",
    slug: "clean-architecture-handbook",
    title: "Clean Architecture Handbook",
    author: "Nora Reid",
    category: "Engineering",
    pages: 312,
    downloads: 12943,
    rating: 4.8,
    summary:
      "A practical architecture guide for shipping maintainable web and API systems in teams.",
    accentFrom: "#ff8f4e",
    accentTo: "#ffc27a",
    publishedAt: "2025-09-03",
  },
  {
    id: "pdf-002",
    slug: "product-led-growth-playbook",
    title: "Product-Led Growth Playbook",
    author: "Maya Chen",
    category: "Product",
    pages: 226,
    downloads: 9322,
    rating: 4.7,
    summary:
      "Experiment frameworks, onboarding loops, and retention systems for SaaS product teams.",
    accentFrom: "#2e9d89",
    accentTo: "#8ae6c0",
    publishedAt: "2025-07-21",
  },
  {
    id: "pdf-003",
    slug: "figma-design-systems-field-guide",
    title: "Figma Design Systems Field Guide",
    author: "Alia Monroe",
    category: "Design",
    pages: 188,
    downloads: 11005,
    rating: 4.9,
    summary:
      "Token strategy, component governance, and documentation patterns for scaling product UI.",
    accentFrom: "#0f6ab6",
    accentTo: "#6eb1f0",
    publishedAt: "2025-10-12",
  },
  {
    id: "pdf-004",
    slug: "sql-for-growth-analytics",
    title: "SQL for Growth Analytics",
    author: "Rafael Gomez",
    category: "Data",
    pages: 274,
    downloads: 8244,
    rating: 4.6,
    summary:
      "From funnel analysis to cohort retention with practical query recipes and dashboards.",
    accentFrom: "#6f4cff",
    accentTo: "#af9bff",
    publishedAt: "2025-08-29",
  },
  {
    id: "pdf-005",
    slug: "performance-marketing-blueprint",
    title: "Performance Marketing Blueprint",
    author: "Julius Park",
    category: "Marketing",
    pages: 201,
    downloads: 7639,
    rating: 4.5,
    summary:
      "Acquisition strategy across paid channels with budgeting and creative testing systems.",
    accentFrom: "#ea4c5f",
    accentTo: "#ff9eaa",
    publishedAt: "2025-06-10",
  },
  {
    id: "pdf-006",
    slug: "startup-finance-operating-model",
    title: "Startup Finance Operating Model",
    author: "Adrian Holt",
    category: "Finance",
    pages: 246,
    downloads: 5927,
    rating: 4.4,
    summary:
      "Build budget models, cash runway plans, and reporting structures for early-stage teams.",
    accentFrom: "#30486e",
    accentTo: "#6d8cc0",
    publishedAt: "2025-05-13",
  },
  {
    id: "pdf-007",
    slug: "resume-and-interview-manual",
    title: "Resume and Interview Manual",
    author: "Keisha Boyd",
    category: "Career",
    pages: 154,
    downloads: 14570,
    rating: 4.9,
    summary:
      "A step-by-step hiring prep guide with examples, frameworks, and interview scorecards.",
    accentFrom: "#ad6300",
    accentTo: "#f0b566",
    publishedAt: "2025-11-19",
  },
  {
    id: "pdf-008",
    slug: "personal-health-habits-blueprint",
    title: "Personal Health Habits Blueprint",
    author: "Dr. Lena Ortiz",
    category: "Health",
    pages: 172,
    downloads: 7011,
    rating: 4.6,
    summary:
      "Evidence-backed routines for sleep, stress, movement, and nutrition for busy professionals.",
    accentFrom: "#15775b",
    accentTo: "#6ed1ac",
    publishedAt: "2025-04-02",
  },
  {
    id: "pdf-009",
    slug: "nextjs-scaling-handbook",
    title: "Next.js Scaling Handbook",
    author: "Iris Navarro",
    category: "Engineering",
    pages: 336,
    downloads: 9988,
    rating: 4.8,
    summary:
      "Architect frontend platforms with App Router, caching strategy, and observability patterns.",
    accentFrom: "#1d293f",
    accentTo: "#5672a3",
    publishedAt: "2025-12-08",
  },
];

export function topPdfs(limit = 6) {
  return [...pdfLibrary].sort((a, b) => b.downloads - a.downloads).slice(0, limit);
}

export function newestPdfs(limit = 6) {
  return [...pdfLibrary].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  ).slice(0, limit);
}

export function findPdfBySlug(slug) {
  return pdfLibrary.find((pdf) => pdf.slug === slug);
}

export function searchPdfs(query = "") {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return pdfLibrary;
  }

  return pdfLibrary.filter((pdf) => {
    const haystack = [pdf.title, pdf.author, pdf.category, pdf.summary]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

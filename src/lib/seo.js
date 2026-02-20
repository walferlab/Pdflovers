const fallbackSiteUrl = "https://pdflovers.app";

function normalizeSiteUrl(value) {
  if (!value) {
    return fallbackSiteUrl;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizePath(path = "/") {
  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function uniqueKeywords(keywords = []) {
  return [...new Set(keywords.filter(Boolean).map((item) => String(item).trim()))];
}

function compactObject(objectValue) {
  return Object.fromEntries(
    Object.entries(objectValue).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

export const siteConfig = {
  name: "PDF Lovers",
  shortName: "PDF Lovers",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  logoPath: "/logo.png",
  locale: "en_US",
  category: "Education",
  creator: "PDF Lovers",
  publisher: "PDF Lovers",
  twitterHandle: "@pdflovers",
  contactEmail: "support@pdflovers.app",
  superKeyword: "free PDF books download",
  defaultDescription:
    "Free PDF books download library for students, professionals, and readers. Search curated PDF books, notes, and guides by topic, author, and tags.",
  defaultKeywords: [
    "free PDF books download",
    "PDF books",
    "download PDF",
    "PDF library",
    "study material PDF",
    "ebook PDF download",
    "free books online",
    "engineering PDF books",
    "design PDF books",
    "career PDF guides",
  ],
};

export function getAbsoluteUrl(path = "/") {
  const safePath = normalizePath(path);
  return `${siteConfig.url}${safePath}`;
}

export function getPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  imagePath = siteConfig.logoPath,
  openGraphType = "website",
  noIndex = false,
} = {}) {
  const canonicalPath = normalizePath(path);
  const absoluteUrl = getAbsoluteUrl(canonicalPath);
  const imageUrl = getAbsoluteUrl(imagePath);
  const pageTitle = title || siteConfig.name;
  const pageDescription = description || siteConfig.defaultDescription;
  const pageKeywords = uniqueKeywords([
    siteConfig.superKeyword,
    ...siteConfig.defaultKeywords,
    ...keywords,
  ]);

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    category: siteConfig.category,
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    formatDetection: {
      email: false,
      telephone: false,
      address: false,
    },
    referrer: "origin-when-cross-origin",
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: openGraphType,
      url: absoluteUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      creator: siteConfig.twitterHandle,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            maxSnippet: -1,
            maxImagePreview: "large",
            maxVideoPreview: -1,
          },
        },
    other: {
      "revisit-after": "7 days",
    },
  };
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: getAbsoluteUrl(siteConfig.logoPath),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.contactEmail,
        availableLanguage: ["English"],
      },
    ],
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/library?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function getWebPageSchema({ title, description, path = "/" }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title || siteConfig.name,
    description: description || siteConfig.defaultDescription,
    url: getAbsoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function getCollectionPageSchema({ title, description, path = "/", totalItems = 0 }) {
  return compactObject({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title || siteConfig.name,
    description: description || siteConfig.defaultDescription,
    url: getAbsoluteUrl(path),
    mainEntity: totalItems
      ? {
          "@type": "ItemList",
          numberOfItems: totalItems,
        }
      : undefined,
  });
}

export function getBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.path),
    })),
  };
}

export function getBookSchema(pdf) {
  return compactObject({
    "@context": "https://schema.org",
    "@type": "Book",
    name: pdf.title,
    description: pdf.summary || siteConfig.defaultDescription,
    url: getAbsoluteUrl(`/pdf/${pdf.publicId}`),
    image: pdf.coverImage || getAbsoluteUrl(siteConfig.logoPath),
    inLanguage: "en",
    keywords: Array.isArray(pdf.tags) ? pdf.tags.join(", ") : undefined,
    datePublished: pdf.publishedAt || undefined,
    author: pdf.author
      ? {
          "@type": "Person",
          name: pdf.author,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  });
}

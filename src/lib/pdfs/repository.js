import { unstable_cache } from "next/cache";

import {
  createSupabaseAdminClient,
  createSupabaseBrowserCompatibleClient,
} from "@/lib/supabase/server";

const PDF_TABLE = "pdfs";
const MAX_RESULTS = 48;
const PDF_SELECT_COLUMNS =
  "id,public_id,title,author,category,tags,page_count,rating,summary,cover_image_url,published_at,smart_link,download_url,download_count";
const PDF_SELECT_COLUMNS_WITH_FEATURED = `${PDF_SELECT_COLUMNS},is_featured`;
const PDF_SITEMAP_SELECT_COLUMNS = "public_id,published_at";

function normalizeTags(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function mapPdfRecord(record) {
  const numericId = typeof record.id === "number" ? record.id : Number(record.id);
  const serialNumber = Number.isFinite(numericId) ? numericId : null;
  const publicId = String(record.public_id || record.publicId || "").trim();

  if (!publicId) {
    return null;
  }

  return {
    publicId,
    serialNumber,
    title: record.title,
    author: record.author || null,
    category: record.category || "General",
    tags: normalizeTags(record.tags),
    pages: typeof record.page_count === "number" ? record.page_count : record.pages ?? null,
    rating: typeof record.rating === "number" ? record.rating : null,
    summary: record.summary || null,
    coverImage: record.cover_image_url || record.cover_image || null,
    publishedAt: record.published_at || null,
    smartLink: record.smart_link || null,
    downloadLink: record.download_url || null,
    downloads:
      typeof record.download_count === "number"
        ? record.download_count
        : typeof record.downloads === "number"
          ? record.downloads
          : null,
  };
}

async function fetchPdfsWithBuilder(builder) {
  const admin = createSupabaseAdminClient() || createSupabaseBrowserCompatibleClient();

  if (!admin) {
    return null;
  }

  const { data, error } = await builder(admin);

  if (error) {
    console.error("Supabase PDF query failed", error);
    return null;
  }

  if (!Array.isArray(data)) {
    return null;
  }

  return data.map(mapPdfRecord).filter(Boolean);
}

async function fetchPdfRecordByPublicId(publicId) {
  const admin = createSupabaseAdminClient() || createSupabaseBrowserCompatibleClient();
  const normalizedPublicId = String(publicId || "").trim();

  if (!admin || !normalizedPublicId) {
    return null;
  }

  const { data: publicData, error: publicError } = await admin
    .from(PDF_TABLE)
    .select(PDF_SELECT_COLUMNS)
    .eq("public_id", normalizedPublicId)
    .maybeSingle();

  if (publicError) {
    console.error("Supabase PDF lookup failed", publicError);
    return null;
  }

  if (publicData) {
    return mapPdfRecord(publicData);
  }

  return null;
}

const getFeaturedPdfsCached = unstable_cache(
  async (limit) => {
    const supabaseResults = await fetchPdfsWithBuilder((admin) =>
      admin
        .from(PDF_TABLE)
        .select(PDF_SELECT_COLUMNS_WITH_FEATURED)
        .order("is_featured", { ascending: false })
        .order("download_count", { ascending: false, nullsFirst: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(limit),
    );

    if (supabaseResults && supabaseResults.length) {
      return supabaseResults;
    }

    return [];
  },
  ["pdf-featured"],
  {
    revalidate: 300,
    tags: ["pdfs", "pdfs-featured"],
  },
);

const getNewestPdfsCached = unstable_cache(
  async (limit) => {
    const supabaseResults = await fetchPdfsWithBuilder((admin) =>
      admin
        .from(PDF_TABLE)
        .select(PDF_SELECT_COLUMNS)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false, nullsFirst: false })
        .limit(limit),
    );

    if (supabaseResults && supabaseResults.length) {
      return supabaseResults;
    }

    return [];
  },
  ["pdf-newest"],
  {
    revalidate: 300,
    tags: ["pdfs", "pdfs-newest"],
  },
);

const searchPdfsCached = unstable_cache(
  async (query, limit) => {
    const normalizedLimit = Math.min(Math.max(Number(limit) || 24, 1), MAX_RESULTS);
    const normalizedQuery = String(query || "").trim();

    if (!normalizedQuery) {
      const supabaseResults = await fetchPdfsWithBuilder((admin) =>
        admin
          .from(PDF_TABLE)
          .select(PDF_SELECT_COLUMNS)
          .order("published_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false, nullsFirst: false })
          .limit(normalizedLimit),
      );

      if (supabaseResults) {
        return supabaseResults;
      }

      return [];
    }

    const supabaseResults = await fetchPdfsWithBuilder((admin) =>
      admin
        .from(PDF_TABLE)
        .select(PDF_SELECT_COLUMNS)
        .textSearch("search_document", normalizedQuery, {
          type: "websearch",
          config: "english",
        })
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(normalizedLimit),
    );

    if (supabaseResults) {
      return supabaseResults;
    }

    return [];
  },
  ["pdf-search"],
  {
    revalidate: 120,
    tags: ["pdfs", "pdfs-search"],
  },
);

const getPdfByPublicIdCached = unstable_cache(
  async (publicId) => {
    const normalizedPublicId = String(publicId || "").trim();

    if (!normalizedPublicId) {
      return null;
    }

    const supabaseRecord = await fetchPdfRecordByPublicId(normalizedPublicId);

    if (supabaseRecord) {
      return supabaseRecord;
    }

    return null;
  },
  ["pdf-by-public-id"],
  {
    revalidate: 300,
    tags: ["pdfs", "pdf-detail"],
  },
);

const getRelatedPdfsCached = unstable_cache(
  async (publicId, category, limit) => {
    const normalizedPublicId = String(publicId || "").trim();
    const normalizedLimit = Math.min(Math.max(Number(limit) || 3, 1), 12);

    if (!category) {
      return [];
    }

    const supabaseResults = await fetchPdfsWithBuilder((admin) =>
      admin
        .from(PDF_TABLE)
        .select(PDF_SELECT_COLUMNS)
        .eq("category", category)
        .neq("public_id", normalizedPublicId)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(normalizedLimit),
    );

    return supabaseResults || [];
  },
  ["pdf-related"],
  {
    revalidate: 300,
    tags: ["pdfs", "pdf-related"],
  },
);

const getAllPdfsForSitemapCached = unstable_cache(
  async () => {
    const supabaseResults = await fetchPdfsWithBuilder((admin) =>
      admin
        .from(PDF_TABLE)
        .select(PDF_SITEMAP_SELECT_COLUMNS)
        .order("id", { ascending: true }),
    );

    if (supabaseResults) {
      return supabaseResults.map((item) => ({
        publicId: item.publicId,
        publishedAt: item.publishedAt || null,
      }));
    }

    return [];
  },
  ["pdf-sitemap"],
  {
    revalidate: 1800,
    tags: ["pdfs", "sitemap"],
  },
);

const getPdfCategoriesCached = unstable_cache(
  async () => {
    const admin = createSupabaseAdminClient() || createSupabaseBrowserCompatibleClient();

    if (admin) {
      const { data, error } = await admin
        .from(PDF_TABLE)
        .select("category")
        .not("category", "is", null);

      if (!error && Array.isArray(data)) {
        return [...new Set(data.map((item) => item.category).filter(Boolean))].sort();
      }
    }

    return [];
  },
  ["pdf-categories"],
  {
    revalidate: 1800,
    tags: ["pdfs", "pdf-categories"],
  },
);

export async function getFeaturedPdfs(limit = 6) {
  return getFeaturedPdfsCached(limit);
}

export async function getNewestPdfs(limit = 6) {
  return getNewestPdfsCached(limit);
}

export async function searchPdfLibrary(query = "", { limit = 24 } = {}) {
  return searchPdfsCached(query, limit);
}

export async function getPdfByPublicId(publicId) {
  return getPdfByPublicIdCached(publicId);
}

export async function getRelatedPdfs(publicId, category, limit = 3) {
  return getRelatedPdfsCached(publicId, category, limit);
}

export async function getPdfCategories() {
  return getPdfCategoriesCached();
}

export async function getSitemapPdfEntries() {
  return getAllPdfsForSitemapCached();
}

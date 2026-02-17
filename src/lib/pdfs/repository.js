import { unstable_cache } from "next/cache";

import {
  newestPdfs,
  pdfCategories,
  pdfLibrary,
  searchPdfs,
  topPdfs,
} from "@/lib/pdf-data";
import {
  createSupabaseAdminClient,
  hasSupabaseServiceRoleEnv,
} from "@/lib/supabase/server";

const PDF_TABLE = "pdfs";
const MAX_RESULTS = 48;
const PDF_SELECT_COLUMNS =
  "id,public_id,title,author,category,tags,page_count,rating,summary,cover_image_url,published_at,smart_link,download_url,download_count";
const PDF_SELECT_COLUMNS_WITH_FEATURED = `${PDF_SELECT_COLUMNS},is_featured`;
const PDF_SITEMAP_SELECT_COLUMNS = "id,public_id,published_at";

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
  const dbId = Number.isFinite(numericId) ? numericId : null;
  const publicId = record.public_id || record.publicId || null;

  return {
    id: String(publicId || record.id),
    dbId,
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

function mapFallbackPdf(record) {
  return {
    ...record,
    id: String(record.id),
    dbId: null,
    tags: normalizeTags(record.tags),
    coverImage: record.coverImage || null,
    smartLink: record.smartLink || null,
    downloadLink: record.downloadLink || null,
  };
}

function getFallbackSearchResults(query, limit) {
  return searchPdfs(query)
    .map(mapFallbackPdf)
    .slice(0, limit);
}

async function fetchPdfsWithBuilder(builder) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return null;
  }

  const { data, error } = await builder(admin);

  if (error) {
    console.error("Supabase PDF query failed", error);
    return null;
  }

  return Array.isArray(data) ? data.map(mapPdfRecord) : null;
}

async function fetchPdfRecordById(id) {
  const admin = createSupabaseAdminClient();
  const normalizedId = String(id || "").trim();

  if (!admin || !normalizedId) {
    return null;
  }

  const { data: publicData, error: publicError } = await admin
    .from(PDF_TABLE)
    .select(PDF_SELECT_COLUMNS)
    .eq("public_id", normalizedId)
    .maybeSingle();

  if (publicError) {
    console.error("Supabase PDF lookup failed", publicError);
    return null;
  }

  if (publicData) {
    return mapPdfRecord(publicData);
  }

  if (!/^\d+$/.test(normalizedId)) {
    return null;
  }

  const { data: legacyData, error: legacyError } = await admin
    .from(PDF_TABLE)
    .select(PDF_SELECT_COLUMNS)
    .eq("id", Number(normalizedId))
    .maybeSingle();

  if (legacyError) {
    console.error("Supabase PDF lookup failed", legacyError);
    return null;
  }

  return legacyData ? mapPdfRecord(legacyData) : null;
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

    return topPdfs(limit).map(mapFallbackPdf);
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

    return newestPdfs(limit).map(mapFallbackPdf);
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

      return getFallbackSearchResults("", normalizedLimit);
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

    return getFallbackSearchResults(normalizedQuery, normalizedLimit);
  },
  ["pdf-search"],
  {
    revalidate: 120,
    tags: ["pdfs", "pdfs-search"],
  },
);

const getPdfByIdCached = unstable_cache(
  async (id) => {
    const normalizedId = String(id || "").trim();

    if (!normalizedId) {
      return null;
    }

    const supabaseRecord = await fetchPdfRecordById(normalizedId);

    if (supabaseRecord) {
      return supabaseRecord;
    }

    const fallbackRecord = pdfLibrary.find((item) => String(item.id) === normalizedId);
    return fallbackRecord ? mapFallbackPdf(fallbackRecord) : null;
  },
  ["pdf-by-id"],
  {
    revalidate: 300,
    tags: ["pdfs", "pdf-detail"],
  },
);

const getRelatedPdfsCached = unstable_cache(
  async (id, category, limit) => {
    const normalizedId = String(id || "").trim();
    const normalizedLimit = Math.min(Math.max(Number(limit) || 3, 1), 12);

    if (hasSupabaseServiceRoleEnv() && category) {
      const supabaseResults = await fetchPdfsWithBuilder((admin) =>
        admin
          .from(PDF_TABLE)
          .select(PDF_SELECT_COLUMNS)
          .eq("category", category)
          .neq("public_id", normalizedId)
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(normalizedLimit),
      );

      if (supabaseResults) {
        return supabaseResults;
      }
    }

    return pdfLibrary
      .filter((item) => String(item.id) !== normalizedId && item.category === category)
      .slice(0, normalizedLimit)
      .map(mapFallbackPdf);
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
        id: item.id,
        publishedAt: item.publishedAt || null,
      }));
    }

    return pdfLibrary.map((item) => ({
      id: item.id,
      publishedAt: item.publishedAt || null,
    }));
  },
  ["pdf-sitemap"],
  {
    revalidate: 1800,
    tags: ["pdfs", "sitemap"],
  },
);

const getPdfCategoriesCached = unstable_cache(
  async () => {
    if (hasSupabaseServiceRoleEnv()) {
      const admin = createSupabaseAdminClient();

      if (admin) {
        const { data, error } = await admin
          .from(PDF_TABLE)
          .select("category")
          .not("category", "is", null);

        if (!error && Array.isArray(data)) {
          const categories = [...new Set(data.map((item) => item.category).filter(Boolean))].sort();

          if (categories.length) {
            return categories;
          }
        }
      }
    }

    return pdfCategories;
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

export async function getPdfById(id) {
  return getPdfByIdCached(id);
}

export async function getRelatedPdfs(id, category, limit = 3) {
  return getRelatedPdfsCached(id, category, limit);
}

export async function getPdfCategories() {
  return getPdfCategoriesCached();
}

export async function getSitemapPdfEntries() {
  return getAllPdfsForSitemapCached();
}

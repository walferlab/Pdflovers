import { NextResponse } from "next/server";

import {
  getFeaturedPdfs,
  getNewestPdfs,
  searchPdfLibrary,
} from "@/lib/pdfs/repository";

export const revalidate = 120;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "search";
  const limit = Number(searchParams.get("limit") || 24);

  try {
    if (type === "featured") {
      const items = await getFeaturedPdfs(limit);
      return NextResponse.json(
        { items },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
          },
        },
      );
    }

    if (type === "newest") {
      const items = await getNewestPdfs(limit);
      return NextResponse.json(
        { items },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
          },
        },
      );
    }

    const items = await searchPdfLibrary(query, { limit });
    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("/api/pdfs failed", error);
    return NextResponse.json({ items: [], error: "Unable to load PDFs right now." }, { status: 500 });
  }
}

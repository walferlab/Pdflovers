import { NextResponse } from "next/server";

import { getPdfById } from "@/lib/pdfs/repository";

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const pdf = await getPdfById(resolvedParams.id);

  if (!pdf) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  return NextResponse.json(
    { item: pdf },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1200",
      },
    },
  );
}

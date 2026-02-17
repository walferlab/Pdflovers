import { NextResponse } from "next/server";

import { getPdfById } from "@/lib/pdfs/repository";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const CLICK_STAGE_SMART = "smart";
const CLICK_STAGE_DIRECT = "direct";

function resolveStage(rawStage) {
  return rawStage === CLICK_STAGE_SMART ? CLICK_STAGE_SMART : CLICK_STAGE_DIRECT;
}

function resolveSmartUrl(pdf) {
  return pdf.smartLink || null;
}

function resolveDirectUrl(pdf) {
  return pdf.downloadLink || null;
}

function sanitizeFilenamePart(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveDownloadFilename(pdf) {
  const fallbackBase = sanitizeFilenamePart(pdf?.title) || `pdf-${pdf?.id || "file"}`;
  return fallbackBase.toLowerCase().endsWith(".pdf") ? fallbackBase : `${fallbackBase}.pdf`;
}

function logDownloadEvent(admin, payload) {
  admin
    .from("download_events")
    .insert(payload)
    .then(({ error }) => {
      if (error) {
        console.error("Download tracking insert failed", error);
      }
    })
    .catch((error) => {
      console.error("Download tracking insert failed", error);
    });
}

function incrementDownloadCount(admin, pdf) {
  const baseCount = typeof pdf.downloads === "number" ? pdf.downloads : 0;

  admin
    .from("pdfs")
    .update({ download_count: baseCount + 1 })
    .eq("id", Number(pdf.id))
    .then(({ error }) => {
      if (error) {
        console.error("Failed to update download count", error);
      }
    })
    .catch((error) => {
      console.error("Failed to update download count", error);
    });
}

async function streamDirectPdf(request, pdf, directUrl) {
  const upstreamResponse = await fetch(directUrl, { redirect: "follow" });

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    return NextResponse.json({ error: "Unable to fetch PDF file." }, { status: 502 });
  }

  const contentType = upstreamResponse.headers.get("content-type") || "application/pdf";
  const contentLength = upstreamResponse.headers.get("content-length");
  const headers = new Headers();

  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", `attachment; filename="${resolveDownloadFilename(pdf)}"`);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("X-Content-Type-Options", "nosniff");

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  const requestId = request.headers.get("x-request-id");

  if (requestId) {
    headers.set("X-Request-Id", requestId);
  }

  return new Response(upstreamResponse.body, {
    status: 200,
    headers,
  });
}

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { searchParams } = new URL(request.url);
  const stage = resolveStage(searchParams.get("stage"));
  const pdf = await getPdfById(resolvedParams.id);

  if (!pdf) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  const admin = createSupabaseAdminClient();
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const ipAddress = forwardedFor.split(",")[0]?.trim() || null;
  const userAgent = request.headers.get("user-agent") || null;
  const referer = request.headers.get("referer") || null;

  if (admin) {
    logDownloadEvent(admin, {
      pdf_id: Number(pdf.id),
      click_stage: stage,
      referer,
      user_agent: userAgent,
      ip_address: ipAddress,
    });
  }

  if (stage === CLICK_STAGE_SMART) {
    const smartUrl = resolveSmartUrl(pdf);

    if (!smartUrl) {
      return NextResponse.json({ error: "Smartlink is not configured." }, { status: 404 });
    }

    return NextResponse.redirect(smartUrl, 307);
  }

  const directUrl = resolveDirectUrl(pdf);

  if (!directUrl) {
    return NextResponse.json({ error: "Direct download link is not configured." }, { status: 404 });
  }

  try {
    const response = await streamDirectPdf(request, pdf, directUrl);

    if (admin && response.ok) {
      incrementDownloadCount(admin, pdf);
    }

    return response;
  } catch (error) {
    console.error("Direct download proxy failed", error);
    return NextResponse.json({ error: "Unable to start download right now." }, { status: 502 });
  }
}

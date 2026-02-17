import { NextResponse } from "next/server";

import { getPdfById } from "@/lib/pdfs/repository";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const CLICK_STAGE_SMART = "smart";
const CLICK_STAGE_DIRECT = "direct";

function resolveStage(rawStage) {
  return rawStage === CLICK_STAGE_SMART ? CLICK_STAGE_SMART : CLICK_STAGE_DIRECT;
}

function resolveTargetUrl(pdf, stage) {
  if (stage === CLICK_STAGE_SMART) {
    return pdf.smartLink || pdf.downloadLink || null;
  }

  return pdf.downloadLink || pdf.smartLink || null;
}

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { searchParams } = new URL(request.url);
  const stage = resolveStage(searchParams.get("stage"));
  const pdf = await getPdfById(resolvedParams.id);

  if (!pdf) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  const targetUrl = resolveTargetUrl(pdf, stage);

  if (!targetUrl) {
    return NextResponse.json({ error: "Download link not configured." }, { status: 404 });
  }

  const admin = createSupabaseAdminClient();

  if (admin) {
    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const ipAddress = forwardedFor.split(",")[0]?.trim() || null;
    const userAgent = request.headers.get("user-agent") || null;
    const referer = request.headers.get("referer") || null;

    admin
      .from("download_events")
      .insert({
        pdf_id: Number(pdf.id),
        click_stage: stage,
        referer,
        user_agent: userAgent,
        ip_address: ipAddress,
      })
      .then(({ error }) => {
        if (error) {
          console.error("Download tracking insert failed", error);
        }
      })
      .catch((error) => {
        console.error("Download tracking insert failed", error);
      });

    if (stage === CLICK_STAGE_DIRECT) {
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
  }

  return NextResponse.redirect(targetUrl, 307);
}

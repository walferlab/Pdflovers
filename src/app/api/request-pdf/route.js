import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

function sanitize(value) {
  return String(value || "").trim();
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const name = sanitize(payload?.name);
    const email = sanitize(payload?.email);
    const details = sanitize(payload?.details);

    if (!name || !email || !details) {
      return NextResponse.json({ error: "Name, email, and details are required." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    if (admin) {
      const { error } = await admin.from("pdf_requests").insert({
        name,
        email,
        details,
      });

      if (error) {
        console.error("Failed to save PDF request", error);
        return NextResponse.json({ error: "Unable to submit request right now." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/request-pdf failed", error);
    return NextResponse.json({ error: "Unable to submit request right now." }, { status: 500 });
  }
}

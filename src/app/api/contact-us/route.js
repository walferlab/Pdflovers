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
    const message = sanitize(payload?.message);

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    if (admin) {
      const { error } = await admin.from("contact_messages").insert({
        name,
        email,
        message,
      });

      if (error) {
        console.error("Failed to save contact message", error);
        return NextResponse.json({ error: "Unable to send message right now." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/contact-us failed", error);
    return NextResponse.json({ error: "Unable to send message right now." }, { status: 500 });
  }
}

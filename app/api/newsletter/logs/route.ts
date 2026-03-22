import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();

    const { data: logs } = await supabase
        .from("newsletter_send_logs")
        .select("id, subject, sent_to_count, failed_count, status, genre_filter, created_at, completed_at")
        .order("created_at", { ascending: false })
        .limit(20);

    return NextResponse.json({ logs: logs ?? [] });
}

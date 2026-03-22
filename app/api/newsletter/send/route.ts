import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { subject, html, genre_filter = "all" } = await req.json();

        if (!subject?.trim() || !html?.trim()) {
            return NextResponse.json(
                { error: "Subject and content are required." },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Create a send log entry first
        const { data: logEntry, error: logErr } = await supabase
            .from("newsletter_send_logs")
            .insert({
                subject: subject.trim(),
                body_html: html,
                genre_filter,
                status: "pending",
                sent_by: "admin",
            })
            .select("id")
            .single();

        if (logErr || !logEntry) {
            console.error("Log insert error:", logErr);
            return NextResponse.json(
                { error: "Failed to create send log." },
                { status: 500 }
            );
        }

        // Trigger the Supabase Edge Function
        const edgeFnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-newsletter`;
        const edgeRes = await fetch(edgeFnUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-secret": process.env.NEWSLETTER_API_SECRET!,
            },
            body: JSON.stringify({
                subject: subject.trim(),
                html,
                genre_filter,
                log_id: logEntry.id,
            }),
        });

        const result = await edgeRes.json();

        if (!edgeRes.ok) {
            return NextResponse.json(
                { error: result.error || "Edge function failed." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            log_id: logEntry.id,
            ...result,
        });
    } catch (err) {
        console.error("Newsletter send route error:", err);
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}

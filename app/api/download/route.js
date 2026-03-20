// app/api/download/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url      = searchParams.get("url");
    const filename = searchParams.get("filename") ?? "book.pdf";

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!url) {
        return NextResponse.json({ error: "Missing url param" }, { status: 400 });
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch {
        return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    // Only allow http/https — block data URIs, file://, etc.
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: "Protocol not allowed" }, { status: 400 });
    }

    // ── Fetch PDF from origin server ──────────────────────────────────────────
    let upstream;
    try {
        upstream = await fetch(url, {
            headers: {
                // Some servers require a browser-like UA to serve the file
                "User-Agent":
                    "Mozilla/5.0 (compatible; PDFLovers/1.0; +https://pdflovers.app)",
                "Accept": "application/pdf,*/*",
            },
            // Follow redirects (default) — handles mirror chains
            redirect: "follow",
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to reach upstream", detail: err.message },
            { status: 502 }
        );
    }

    if (!upstream.ok) {
        return NextResponse.json(
            { error: `Upstream returned ${upstream.status}` },
            { status: 502 }
        );
    }

    // ── Detect content type ───────────────────────────────────────────────────
    const contentType =
        upstream.headers.get("content-type") ?? "application/octet-stream";

    // Sanitise filename: strip path separators and quotes
    const safeFilename = filename
        .replace(/[/\\'"]/g, "")
        .replace(/\s+/g, "_")
        .slice(0, 200);

    const finalName = safeFilename.endsWith(".pdf")
        ? safeFilename
        : `${safeFilename}.pdf`;

    // ── Stream back to client ─────────────────────────────────────────────────
    return new NextResponse(upstream.body, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            // `attachment` tells the browser to save the file, not open it
            "Content-Disposition": `attachment; filename="${finalName}"`,
            // Pass through size if available so the browser shows a progress bar
            ...(upstream.headers.get("content-length")
                ? { "Content-Length": upstream.headers.get("content-length") }
                : {}),
            // Allow range requests for large files
            "Accept-Ranges": "bytes",
        },
    });
}
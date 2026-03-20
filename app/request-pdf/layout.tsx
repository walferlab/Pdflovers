import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Request a PDF Book | PDF Lovers",
    description:
        "Request a PDF book for the PDF Lovers library and tell us which title, author, or edition you want us to find.",
    path: "/request-pdf",
    keywords: [
        "request a pdf",
        "book request form",
        "request free books",
        "find a missing book",
    ],
});

export default function RequestPdfLayout({ children }: { children: ReactNode }) {
    return children;
}

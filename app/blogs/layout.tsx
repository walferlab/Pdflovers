import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Book Blog, Reading Tips & Guides | PDF Lovers",
    description:
        "Read blog posts, reading guides, book discovery tips, and library updates from PDF Lovers.",
    path: "/blogs",
    keywords: [
        "book blog",
        "reading tips",
        "book guides",
        "reading recommendations",
    ],
});

export default function BlogsLayout({ children }: { children: ReactNode }) {
    return children;
}

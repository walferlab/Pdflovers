import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Free PDF Library | PDF Lovers",
    description:
        "Browse the full PDF Lovers library of free PDF books, open access titles, featured downloads, and category collections.",
    path: "/library",
    keywords: [
        "free pdf library",
        "book categories",
        "open access library",
        "browse free books",
    ],
});

export default function LibraryLayout({ children }: { children: ReactNode }) {
    return children;
}

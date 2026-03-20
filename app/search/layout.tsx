import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Search PDF Books, Authors & Topics | PDF Lovers",
    description:
        "Search free PDF books, authors, summaries, and topics across the PDF Lovers library and open web sources.",
    path: "/search",
    keywords: [
        "search pdf books",
        "find free pdf books",
        "search by author",
        "book topic search",
    ],
});

export default function SearchLayout({ children }: { children: ReactNode }) {
    return children;
}

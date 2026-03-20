import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Disclaimer | PDF Lovers",
    description:
        "Read the PDF Lovers disclaimer covering content sources, third-party links, advertising disclosures, and platform limitations.",
    path: "/disclaimer",
    keywords: ["pdf lovers disclaimer", "content disclaimer", "third-party links policy"],
});

export default function DisclaimerLayout({ children }: { children: ReactNode }) {
    return children;
}

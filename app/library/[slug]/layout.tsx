import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata, getLibrarySegmentMetadata } from "@/lib/seo";

type LayoutProps = {
    children: ReactNode;
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
    const { slug } = await params;
    return createPageMetadata(getLibrarySegmentMetadata(slug));
}

export default function LibrarySlugLayout({ children }: { children: ReactNode }) {
    return children;
}

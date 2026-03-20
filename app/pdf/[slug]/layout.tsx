import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPdfBySlug } from "@/lib/content";
import { createBookMetadata } from "@/lib/seo";

type LayoutProps = {
    children: ReactNode;
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
    const { slug } = await params;
    const book = await getPdfBySlug(slug);
    return createBookMetadata(book, slug);
}

export default function PdfLayout({ children }: { children: ReactNode }) {
    return children;
}

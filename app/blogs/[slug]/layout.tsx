import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getBlogBySlug } from "@/lib/content";
import { createBlogMetadata } from "@/lib/seo";

type LayoutProps = {
    children: ReactNode;
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);
    return createBlogMetadata(blog);
}

export default function BlogSlugLayout({ children }: { children: ReactNode }) {
    return children;
}

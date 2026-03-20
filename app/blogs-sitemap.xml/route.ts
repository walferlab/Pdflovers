import { getAllPublishedBlogs, getSitemapLastmod } from "@/lib/content";
import { buildUrlSetXml, createUrlEntry, createXmlResponse } from "@/lib/sitemaps";

export const revalidate = 3600;

function pickLatestDate(current: string | null, candidate: string | null) {
    if (!candidate) return current;
    if (!current) return candidate;
    return new Date(candidate).getTime() > new Date(current).getTime() ? candidate : current;
}

export async function GET() {
    const blogs = await getAllPublishedBlogs();
    const now = new Date().toISOString();
    const latestBlogDate = blogs.reduce(
        (latest, blog) => pickLatestDate(latest, getSitemapLastmod(blog)),
        null
    ) || now;

    return createXmlResponse(
        buildUrlSetXml([
            createUrlEntry("/blogs", { lastmod: latestBlogDate, changefreq: "daily", priority: 0.9 }),
            ...blogs.map((blog) =>
                createUrlEntry(`/blogs/${blog.slug}`, {
                    lastmod: getSitemapLastmod(blog) || latestBlogDate,
                    changefreq: "weekly",
                    priority: 0.8,
                })
            ),
        ])
    );
}

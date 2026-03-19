import type { MetadataRoute } from "next";
import { seoPageSlugs } from "@/lib/seo-pages";
import { seoBlogPosts } from "@/lib/seo-blog-posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticPages = ["/", "/animations", "/blog"];
  const seoPages = seoPageSlugs.map((slug) => `/${slug}`);
  const blogPages = seoBlogPosts.map((post) => `/blog/${post.slug}`);
  const pages = [...new Set([...staticPages, ...seoPages, ...blogPages])];

  return pages.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/blog/") ? "monthly" : "weekly",
    priority: path === "/" ? 1.0 : path.startsWith("/blog/") ? 0.6 : 0.8,
  }));
}

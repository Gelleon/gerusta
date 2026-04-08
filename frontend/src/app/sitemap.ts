import type { MetadataRoute } from "next";
import { seoPageSlugs } from "@/lib/seo-pages";
import { seoBlogPosts } from "@/lib/seo-blog-posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://gerusta.ru";
  const fallbackLastModified = new Date();

  const staticPages = [
    {
      path: "/",
      changeFrequency: "weekly" as const,
      priority: 1,
      lastModified: fallbackLastModified,
    },
    {
      path: "/animations",
      changeFrequency: "monthly" as const,
      priority: 0.7,
      lastModified: fallbackLastModified,
    },
    {
      path: "/blog",
      changeFrequency: "daily" as const,
      priority: 0.9,
      lastModified: fallbackLastModified,
    },
  ];

  const seoPages = seoPageSlugs.map((slug) => ({
    path: `/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    lastModified: fallbackLastModified,
  }));

  const blogPages = seoBlogPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: new Date(post.createdAt),
  }));

  const allPages = [...staticPages, ...seoPages, ...blogPages];
  const pagesByPath = new Map<string, (typeof allPages)[number]>();

  allPages.forEach((page) => {
    if (!pagesByPath.has(page.path)) {
      pagesByPath.set(page.path, page);
    }
  });

  return [...pagesByPath.values()].map((page) => ({
    url: `${base}${page.path}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}

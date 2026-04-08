import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://gerusta.ru";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/*", "/admin/*", "/login", "/dashboard/*"],
        crawlDelay: 5,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

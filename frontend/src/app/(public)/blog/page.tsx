import type { Metadata } from "next";
import Link from "next/link";
import { Search, Flame, TagIcon, Bot, Sparkles } from "lucide-react";
import { Wow3DCard } from "@/components/ui/3d/Wow3DCard";
import { Floating3DBackground } from "@/components/ui/3d/Floating3DBackground";
import { PerspectiveSection } from "@/components/ui/3d/PerspectiveSection";
import { PostList } from "@/components/blog/PostList";
import { seoBlogPosts } from "@/lib/seo-blog-posts";
import { serviceLinks } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "Блог",
  description:
    "Статьи о Telegram Web Apps, платежах, интеграциях, UX и best practices разработки ботов.",
  alternates: { canonical: "/blog" },
};

type ApiPost = {
  id?: string;
  slug?: string;
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  createdAt: string;
  tags: { name: string }[];
  views?: number;
};

type UiPost = {
  slug: string;
  routeSegment: string;
  title: string;
  description: string;
  featuredImage?: string;
  date: string;
  tags: string[];
};

async function fetchBlogPosts() {
  const apiUrl = (
    process.env.SERVER_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:3001"
  ).replace(/\/+$/, "");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${apiUrl}/blog/posts?take=100`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      return { posts: [], total: 0 };
    }
    return response.json();
  } catch {
    return { posts: [], total: 0 };
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params?.q || "").trim().toLowerCase();
  const { posts: apiPosts, total } = await fetchBlogPosts();
  
  const apiPostsArray = Array.isArray(apiPosts) ? apiPosts : [];
  
  const posts: UiPost[] = apiPostsArray.flatMap((p: ApiPost): UiPost[] => {
    const routeSegment = p.slug?.trim() || p.id?.trim() || "";
    if (!routeSegment) {
      return [];
    }
    return [
      {
        slug: routeSegment,
        routeSegment,
        title: p.title,
        description: p.excerpt || p.content.slice(0, 160),
        featuredImage: p.featuredImage,
        date: p.createdAt,
        tags: (p.tags || []).map((t) => t.name),
      },
    ];
  });
  const staticPosts: UiPost[] = seoBlogPosts.map((post) => ({
    slug: post.slug,
    routeSegment: post.slug,
    title: post.title,
    description: post.excerpt,
    date: post.createdAt,
    tags: post.tags,
  }));
  const postsBySlug = new Map<string, UiPost>();

  [...staticPosts, ...posts].forEach((post) => {
    if (!postsBySlug.has(post.slug)) {
      postsBySlug.set(post.slug, post);
    }
  });

  const mergedPosts = [...postsBySlug.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const filtered = mergedPosts.filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
  const popular = [...apiPostsArray, ...seoBlogPosts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map((p) => {
      const routeSegment = p.slug?.trim() || ("id" in p ? p.id?.trim() : "") || "";
      if (!routeSegment) {
        return null;
      }
      return {
        slug: routeSegment,
        title: p.title,
        date: p.createdAt,
      };
    })
    .filter((post): post is { slug: string; title: string; date: string } => Boolean(post));

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Gerusta Blog",
    blogPost: mergedPosts.slice(0, 10).map((p: UiPost) => ({
      "@type": "BlogPosting",
      headline: p.title,
      datePublished: p.date,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://gerusta.ru"}/blog/${p.slug}`,
    })),
  };

  return (
    <Floating3DBackground intensity={0.5} density={12}>
      <main className="min-h-screen py-24">
        <div className="container mx-auto px-6">
          <PerspectiveSection rotationIntensity={10} scaleIntensity={0.98}>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tg-blue/5 text-tg-blue text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3 h-3" />
                Наш блог
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 text-[#222222]">
                Блог <span className="text-tg-blue">Gerusta</span>
              </h1>
              <p className="text-lg text-[#707579] font-medium">
                Полезные статьи о разработке ботов, автоматизации бизнеса и интеграциях
              </p>
            </div>

            <form action="/blog" className="max-w-2xl mx-auto mb-12">
              <Wow3DCard maxTilt={5} scale={1.01} glareEnabled={false}>
                <div className="flex items-stretch bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    placeholder="Поиск по статьям..."
                    className="flex-1 px-5 py-4 outline-none text-[#222222]"
                  />
                  <button className="btn-tg px-6 py-4 rounded-none">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </Wow3DCard>
            </form>
          </PerspectiveSection>

          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            <PostList initialPosts={filtered.slice(0, 6)} initialTotal={Math.max(total || 0, filtered.length)} q={q} />

            <aside className="space-y-8">
              <Wow3DCard maxTilt={5} scale={1.02}>
                <div className="tg-card border border-slate-100 p-8">
                  <div className="flex items-center gap-2 mb-6 text-[#222222] font-black uppercase tracking-widest text-xs">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Популярные статьи
                  </div>
                  <div className="space-y-6">
                    {popular.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="group block"
                      >
                        <div className="text-sm font-black text-[#222222] group-hover:text-tg-blue transition-colors mb-1">
                          {p.title}
                        </div>
                        <div className="text-[11px] font-bold text-[#707579] uppercase tracking-wider">
                          {new Date(p.date).toLocaleDateString("ru-RU")}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Wow3DCard>

              <Wow3DCard maxTilt={5} scale={1.02}>
                <div className="tg-card border border-slate-100 p-8">
                  <div className="flex items-center gap-2 mb-6 text-[#222222] font-black uppercase tracking-widest text-xs">
                    <Bot className="w-4 h-4 text-tg-blue" />
                    Услуги
                  </div>
                  <div className="flex flex-col gap-3">
                    {serviceLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-sm font-black text-[#222222] hover:text-tg-blue transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </Wow3DCard>

              <Wow3DCard maxTilt={5} scale={1.02}>
                <div className="tg-card border border-slate-100 p-8">
                  <div className="flex items-center gap-2 mb-6 text-[#222222] font-black uppercase tracking-widest text-xs">
                    <TagIcon className="w-4 h-4 text-tg-blue" />
                    Темы блога
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(mergedPosts.flatMap((p) => p.tags))].map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?q=${encodeURIComponent(tag)}`}
                        className="px-3 py-1.5 text-[11px] rounded-lg bg-slate-50 border border-slate-200 font-black text-[#707579] uppercase tracking-wider hover:bg-tg-blue hover:text-white hover:border-tg-blue transition-all"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </Wow3DCard>

              <Wow3DCard maxTilt={15} scale={1.05}>
                <div className="rounded-[2rem] p-8 bg-gradient-to-br from-tg-blue to-[#24A1DE] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                    <Bot size={160} />
                  </div>
                  <div className="relative z-10">
                    <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-3">
                      Нужен бот?
                    </div>
                    <div className="text-xl font-black mb-6 leading-tight">
                      Создадим бота для вашего бизнеса за 7 дней
                    </div>
                    <Link href="/#process" className="bg-white text-tg-blue font-black px-6 py-3 rounded-xl inline-flex shadow-xl hover:scale-105 transition-transform">
                      Заказать проект
                    </Link>
                  </div>
                </div>
              </Wow3DCard>
            </aside>
          </div>

          <div className="mt-20 text-center">
            <Link href="/" className="btn-tg px-10 py-4 text-lg">
              На главную
            </Link>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />
      </main>
    </Floating3DBackground>
  );
}

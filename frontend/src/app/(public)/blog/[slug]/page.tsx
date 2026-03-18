import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Clock, Share2, Bot, Send, ImageIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { getImageUrl } from "@/lib/utils";

type ApiPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  createdAt: string;
  tags: { name: string }[];
  category?: { name: string };
};

async function getPost(slug: string): Promise<ApiPost | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
    const res = await fetch(`${API_URL}/blog/posts/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Статья не найдена",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(post.createdAt));

  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-tg-blue hover:gap-3 transition-all font-bold mb-12 group"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад в блог
          </Link>

          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full bg-tg-blue/10 text-tg-blue text-xs font-bold uppercase tracking-wider">
                {post.category?.name || "Статья"}
              </span>
              <div className="flex items-center gap-2 text-[#707579] text-sm font-medium">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </div>
              <div className="flex items-center gap-2 text-[#707579] text-sm font-medium">
                <Clock className="w-4 h-4" />
                {Math.ceil(post.content.length / 1000) + 2} мин
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight text-[#222222]">
              {post.title}
            </h1>

            {post.featuredImage && (
              <div className="mb-12 rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl">
                <img 
                  src={getImageUrl(post.featuredImage)} 
                  alt={post.title}
                  className="w-full aspect-[21/9] object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-end py-8 border-y border-[#EFEFEF]">
              <div className="flex items-center gap-3">
                <button className="p-3 rounded-xl bg-[#F4F4F5] hover:bg-[#E4E4E7] transition-colors text-[#222222]">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <article className="prose prose-lg prose-tg max-w-none mb-16 text-[#222222]">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-16">
            {post.tags.map((tag) => (
              <Link
                key={tag.name}
                href={`/blog?q=${tag.name.toLowerCase()}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4F4F5] hover:bg-tg-blue/10 hover:text-tg-blue transition-all text-sm font-bold text-[#707579]"
              >
                <Tag className="w-3.5 h-3.5" />
                {tag.name}
              </Link>
            ))}
          </div>

          {/* CTA Section */}
          <section className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-tg-blue to-[#0077FF] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
                  <Bot className="w-3 h-3" />
                  Нужна автоматизация?
                </div>
                <h2 className="text-3xl font-black mb-4">
                  Создадим похожее решение для вашего бизнеса
                </h2>
                <p className="text-white/80 font-medium text-lg max-w-xl">
                  Мы специализируемся на разработке сложных Telegram ботов и Web Apps.
                  Оставьте заявку и получите бесплатную консультацию.
                </p>
              </div>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-tg-blue font-black hover:scale-105 transition-all shadow-xl shadow-black/10 shrink-0"
              >
                Обсудить проект
                <Send className="w-5 h-5" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

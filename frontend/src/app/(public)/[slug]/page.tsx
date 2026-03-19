import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { relatedClusterLinks, seoPageSlugs, seoPagesBySlug } from "@/lib/seo-pages";

export function generateStaticParams() {
  return seoPageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = seoPagesBySlug[slug];

  if (!page) {
    return {
      title: "Страница не найдена",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function SeoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = seoPagesBySlug[slug];

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-6">
        <article className="max-w-5xl mx-auto">
          <div className="mb-8">
            <span className="inline-flex rounded-full bg-tg-blue/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-tg-blue">
              Telegram Bot Studio
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-[#222222] mb-6 leading-tight">
            {page.h1}
          </h1>
          <p className="text-lg md:text-xl text-[#707579] font-medium mb-12 leading-relaxed">
            {page.lead}
          </p>

          <section className="space-y-6 mb-14">
            {page.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-base md:text-lg text-[#222222] leading-8">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="mb-14 rounded-3xl border border-slate-200 bg-white p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-[#222222]">
              Что входит в услугу
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {page.includeItems.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-tg-blue shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base font-medium text-[#222222]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-[#222222]">Кейсы</h2>
            <div className="grid lg:grid-cols-3 gap-5">
              {page.cases.map((project) => (
                <div key={project.title} className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-black text-[#222222] mb-4">{project.title}</h3>
                  <p className="text-sm text-[#707579] mb-3">
                    <span className="font-black text-[#222222]">Задача:</span> {project.task}
                  </p>
                  <p className="text-sm text-[#707579] mb-3">
                    <span className="font-black text-[#222222]">Решение:</span> {project.solution}
                  </p>
                  <p className="text-sm text-[#707579]">
                    <span className="font-black text-[#222222]">Результат:</span> {project.result}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14 rounded-3xl border border-slate-200 bg-white p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-[#222222]">FAQ</h2>
            <div className="space-y-5">
              {page.faq.map((item) => (
                <div key={item.question} className="rounded-2xl bg-slate-50 p-5">
                  <h3 className="text-base md:text-lg font-black text-[#222222] mb-2">{item.question}</h3>
                  <p className="text-sm md:text-base text-[#707579] leading-7">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14 rounded-[2rem] bg-gradient-to-br from-tg-blue to-[#24A1DE] p-8 md:p-12 text-white">
            <h2 className="text-2xl md:text-4xl font-black mb-4">{page.ctaTitle}</h2>
            <p className="text-base md:text-lg font-medium text-white/90 mb-8 max-w-3xl">
              {page.ctaText}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-tg-blue hover:scale-[1.02] transition-transform"
              >
                Оставить заявку
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#cases"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/60 px-6 py-4 font-black text-white hover:bg-white/10 transition-colors"
              >
                Смотреть кейсы
              </Link>
            </div>
            <p className="mt-5 text-sm font-bold text-white/90">
              Бесплатная консультация, запуск за 3–7 дней, реализация под ключ.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-black mb-5 text-[#222222]">Полезные страницы</h2>
            <div className="flex flex-wrap gap-3">
              {relatedClusterLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-[#222222] hover:bg-tg-blue hover:text-white hover:border-tg-blue transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}

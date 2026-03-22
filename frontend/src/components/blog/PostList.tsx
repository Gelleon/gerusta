"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bot, Zap, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Wow3DCard } from "@/components/ui/3d/Wow3DCard";
import { getImageUrl } from "@/lib/utils";

type Post = {
  slug: string;
  routeSegment: string;
  title: string;
  description: string;
  featuredImage?: string;
  date: string;
  tags: string[];
};

type ApiTag = {
  name: string;
};

type ApiPost = {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  createdAt: string;
  tags?: ApiTag[];
};

type ApiPostsResponse = {
  posts?: ApiPost[];
  total?: number;
};

interface PostListProps {
  initialPosts: Post[];
  initialTotal: number;
  q: string;
}

export function PostList({ initialPosts, initialTotal, q }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [skip, setSkip] = useState(initialPosts.length);
  const [hasMore, setHasMore] = useState(initialPosts.length < initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Reset when search query changes
  useEffect(() => {
    if (q) {
      // Filter local posts if searching (simplified, normally we'd fetch from server)
      const filtered = initialPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
      setPosts(filtered);
      setHasMore(false); // Disable infinite scroll during search for now unless we implement server-side search pagination
    } else {
      setPosts(initialPosts);
      setSkip(initialPosts.length);
      setHasMore(initialPosts.length < initialTotal);
    }
  }, [q, initialPosts, initialTotal]);

  const fetchMorePosts = useCallback(async () => {
    if (isLoading || !hasMore || q) return;

    setIsLoading(true);
    try {
      const take = 6;
      const res = await fetch(`${API_URL}/blog/posts?skip=${skip}&take=${take}`);
      if (res.ok) {
        const data: ApiPostsResponse | ApiPost[] = await res.json();
        // The backend returns { posts: Post[], total: number }
        const apiPosts: ApiPost[] = Array.isArray((data as ApiPostsResponse).posts)
          ? (data as ApiPostsResponse).posts ?? []
          : (Array.isArray(data) ? data : []);
        
        const newPosts = apiPosts
          .map((p) => {
            const routeSegment = p.slug?.trim();
            if (!routeSegment) {
              return null;
            }
            return {
              slug: routeSegment,
              routeSegment,
              title: p.title,
              description: p.excerpt || p.content?.slice(0, 160) || '',
              featuredImage: p.featuredImage,
              date: p.createdAt,
              tags: (p.tags || []).map((t) => t.name),
            };
          })
          .filter((post): post is Post => Boolean(post));

        if (newPosts.length > 0) {
          setPosts((prev) => [...prev, ...newPosts]);
          setSkip((prev) => prev + newPosts.length);
          const totalCount: number = typeof (data as ApiPostsResponse).total === 'number'
            ? (data as ApiPostsResponse).total ?? 0
            : (Array.isArray(data) ? data.length : 0);
          setHasMore((prevHasMore) => prevHasMore && skip + newPosts.length < totalCount);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching more posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, hasMore, isLoading, q, skip]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !q) {
          fetchMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchMorePosts, hasMore, isLoading, q]);

  return (
    <div className="space-y-12">
      <AnimatePresence mode="popLayout">
        {posts.map((p, index) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index % 6 * 0.1 }}
          >
            <Wow3DCard maxTilt={10} scale={1.02} className="rounded-[2rem]">
              <article className="tg-card border border-slate-100 overflow-hidden h-full">
                <div className="h-64 bg-gradient-to-br from-tg-blue/5 to-[#24A1DE]/5 relative overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
                  {p.featuredImage ? (
                    <Image
                      src={getImageUrl(p.featuredImage)} 
                      width={1200}
                      height={686}
                      sizes="(max-width: 768px) 100vw, 1200px"
                      unoptimized
                      alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Bot size={120} className="rotate-12" />
                    </div>
                  )}
                  <div className="absolute top-6 left-6 bg-white px-4 py-1.5 rounded-full text-xs font-black text-[#222222] shadow-lg" style={{ transform: 'translateZ(30px)' }}>
                    {new Date(p.date).toLocaleDateString("ru-RU")}
                  </div>
                  <div className="absolute bottom-6 right-6" style={{ transform: 'translateZ(40px)' }}>
                    <div className="w-12 h-12 bg-tg-blue rounded-xl flex items-center justify-center text-white shadow-xl">
                      <Zap className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="p-10" style={{ transformStyle: 'preserve-3d' }}>
                  <h2 className="text-3xl font-black text-[#222222] mb-4 leading-tight" style={{ transform: 'translateZ(20px)' }}>
                    {p.title}
                  </h2>
                  <p className="text-[#707579] font-medium mb-6 text-lg" style={{ transform: 'translateZ(10px)' }}>
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-8" style={{ transform: 'translateZ(5px)' }}>
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold text-[#222222]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/blog/${p.routeSegment}`}
                    className="inline-flex items-center gap-3 text-tg-blue font-black uppercase tracking-widest text-sm hover:gap-4 transition-all"
                    style={{ transform: 'translateZ(15px)' }}
                  >
                    Читать статью <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </article>
            </Wow3DCard>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading Indicator */}
      <div ref={observerTarget} className="py-10 flex justify-center w-full h-20" role="status">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 text-tg-blue font-bold"
          >
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="sr-only">Загрузка...</span>
            <span>Загрузка новых статей...</span>
          </motion.div>
        )}
      </div>

      {!hasMore && posts.length > 0 && !q && (
        <div className="text-center py-10 text-[#707579] font-bold">
          Вы просмотрели все статьи
        </div>
      )}
    </div>
  );
}

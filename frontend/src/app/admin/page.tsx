'use client';

import { useEffect, useState } from 'react';
import { 
  FileText, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Plus,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api-client';
import { seoBlogPosts } from '@/lib/seo-blog-posts';

interface DashboardStats {
  totalPosts: number;
  totalCategories: number;
  totalTags: number;
  totalComments: number;
  totalViews: number;
  latestPosts: DashboardPost[];
  popularPosts: DashboardPost[];
}

interface DashboardPost {
  id: string;
  title: string;
  createdAt: string;
  views: number;
  published: boolean;
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const dateLocale = i18n.language === 'ru' ? ru : enUS;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get('/blog/stats');
        const apiStats = response.data as DashboardStats;
        const seoPosts: DashboardPost[] = seoBlogPosts.map((post) => ({
          id: `seo:${post.slug}`,
          title: post.title,
          createdAt: post.createdAt,
          views: post.views ?? 0,
          published: true,
        }));
        const mergedPostsByTitle = new Map<string, DashboardPost>();

        [...(apiStats.latestPosts ?? []), ...seoPosts].forEach((post) => {
          const key = post.title.trim().toLowerCase();
          if (!mergedPostsByTitle.has(key)) {
            mergedPostsByTitle.set(key, post);
          }
        });

        const mergedPosts = [...mergedPostsByTitle.values()].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        const mergedPopular = [...mergedPosts]
          .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
          .slice(0, 5);

        setStats({
          ...apiStats,
          totalPosts: Math.max(apiStats.totalPosts ?? 0, mergedPosts.length),
          totalViews: Math.max(
            apiStats.totalViews ?? 0,
            mergedPosts.reduce((sum, post) => sum + (post.views ?? 0), 0),
          ),
          latestPosts: mergedPosts.slice(0, 5),
          popularPosts: mergedPopular,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium animate-pulse text-lg">{t('common.loading')}</p>
      </div>
    );
  }

  const statCards = [
    { 
      name: t('common.total_posts'), 
      value: stats?.totalPosts.toLocaleString() || '0', 
      icon: FileText, 
      color: 'bg-blue-50 text-blue-600',
      accent: 'bg-blue-500'
    },
    { 
      name: t('common.total_views'), 
      value: stats?.totalViews.toLocaleString() || '0', 
      icon: Eye, 
      color: 'bg-green-50 text-green-600',
      accent: 'bg-green-500'
    },
    { 
      name: t('common.comments'), 
      value: stats?.totalComments.toLocaleString() || '0', 
      icon: MessageSquare, 
      color: 'bg-purple-50 text-purple-600',
      accent: 'bg-purple-500'
    },
    { 
      name: t('common.categories'), 
      value: stats?.totalCategories.toLocaleString() || '0', 
      icon: FolderOpen, 
      color: 'bg-amber-50 text-amber-600',
      accent: 'bg-amber-500'
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{t('common.dashboard')}</h1>
          <p className="text-slate-500 font-medium">
            {t('common.welcome_back')} {t('common.blog_overview')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t('common.view_site')}
            </Link>
          </Button>
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all px-6" asChild>
            <Link href="/admin/posts/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('common.new_post')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white rounded-3xl">
              <CardContent className="p-6 relative">
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-500 ${stat.accent}`} />
                
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-2xl ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.name}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Recent Posts */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">{t('common.recent_posts')}</CardTitle>
                <CardDescription className="font-medium">
                  {t('common.latest_content_updates')}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold" asChild>
                <Link href="/admin/posts">{t('common.view_all')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 pb-4">
              {stats?.latestPosts && stats.latestPosts.length > 0 ? (
                stats.latestPosts.map((post) => (
                  <Link key={post.id} href={`/admin/posts/edit/${post.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-100">
                      <div className="space-y-1.5 min-w-0 flex-1 mr-4">
                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(post.createdAt), 'MMM dd, yyyy', { locale: dateLocale })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter border-none ${
                          post.published 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {post.published ? t('common.published') : t('common.draft')}
                        </Badge>
                        <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-bold">{t('common.no_posts_yet')}</h3>
                  <p className="text-slate-400 text-sm mb-6">{t('common.start_creating')}</p>
                  <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all" asChild>
                    <Link href="/admin/posts/new">{t('common.create_first_post')}</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Posts */}
        <Card className="lg:col-span-3 border-none shadow-sm bg-slate-900 text-white rounded-3xl overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <Badge className="bg-blue-500/10 text-blue-400 border-none text-[10px] font-black uppercase tracking-widest">
                {t('common.popular_content')}
              </Badge>
            </div>
            <CardTitle className="text-xl font-black">{t('common.top_performing')}</CardTitle>
            <CardDescription className="text-slate-400 font-medium">
              {t('common.most_viewed')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6 flex-1">
            {stats?.popularPosts && stats.popularPosts.length > 0 ? (
              stats.popularPosts.map((post) => (
                <Link key={post.id} href={`/admin/posts/edit/${post.id}`}>
                  <div className="group cursor-pointer">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] font-black text-blue-400">
                        <Eye className="h-3 w-3" />
                        {post.views.toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-4 h-px bg-slate-800 group-last:hidden" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
                <div className="bg-slate-800 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm font-medium">{t('common.no_popular_posts')}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-8 pt-0 mt-auto">
            <Button className="w-full bg-white text-slate-950 hover:bg-blue-50 transition-all font-bold rounded-xl h-12" asChild>
              <Link href="/admin/stats">{t('common.detailed_analytics')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

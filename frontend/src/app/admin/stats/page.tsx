'use client';

import { useState, useEffect } from 'react';
import type { AxiosError } from 'axios';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Eye, 
  FileText, 
  FolderOpen, 
  Tags as TagsIcon,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api-client';
import { seoBlogPosts } from '@/lib/seo-blog-posts';

interface Stats {
  totalPosts: number;
  totalCategories: number;
  totalTags: number;
  totalComments: number;
  totalViews: number;
  latestPosts: {
    id: string;
    title: string;
    views: number;
    createdAt: string;
    status?: string;
    published?: boolean;
  }[];
  popularPosts: {
    id: string;
    title: string;
    views: number;
  }[];
}

type ApiErrorData = {
  message?: string;
};

export default function StatsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'ru' ? ru : enUS;
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/blog/stats');
      const apiStats = response.data as Stats;
      const seoPosts = seoBlogPosts.map((post) => ({
        id: `seo:${post.slug}`,
        title: post.title,
        views: post.views ?? 0,
        createdAt: post.createdAt,
        status: 'published',
      }));
      const mergedByTitle = new Map<string, Stats['latestPosts'][number]>();

      [...(apiStats.latestPosts ?? []), ...seoPosts].forEach((post) => {
        const key = post.title.trim().toLowerCase();
        if (!mergedByTitle.has(key)) {
          mergedByTitle.set(key, post);
        }
      });

      const mergedLatest = [...mergedByTitle.values()].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      const mergedPopular = [...mergedLatest]
        .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
        .slice(0, 5)
        .map((post) => ({
          id: post.id,
          title: post.title,
          views: post.views,
        }));

      setStats({
        ...apiStats,
        totalPosts: Math.max(apiStats.totalPosts ?? 0, mergedLatest.length),
        totalViews: Math.max(
          apiStats.totalViews ?? 0,
          mergedLatest.reduce((sum, post) => sum + (post.views ?? 0), 0),
        ),
        latestPosts: mergedLatest.slice(0, 5),
        popularPosts: mergedPopular,
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorData>;
      console.error('Error fetching stats:', error);
      if (axiosError.response) {
        console.error('Data:', axiosError.response.data);
        console.error('Status:', axiosError.response.status);
        console.error('Headers:', axiosError.response.headers);
      } else if (axiosError.request) {
        console.error('Request:', axiosError.request);
      } else {
        console.error('Message:', axiosError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">{t('stats.loading')}</span>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: t('stats.total_views'),
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: t('stats.total_posts'),
      value: stats.totalPosts.toLocaleString(),
      icon: FileText,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: t('stats.total_comments'),
      value: stats.totalComments.toLocaleString(),
      icon: MessageSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      title: t('stats.engagement'),
      value: stats.totalPosts > 0 ? (stats.totalComments / stats.totalPosts).toFixed(1) : '0',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      description: t('stats.engagement_desc')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('stats.title')}</h1>
        <Badge variant="outline" className="px-3 py-1">
          {t('stats.last_updated')}: {format(new Date(), 'HH:mm:ss', { locale: dateLocale })}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bg} p-2 rounded-full`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('stats.popular_content')}</CardTitle>
            <CardDescription>
              {t('stats.popular_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Eye className="h-3 w-3" />
                      {post.views.toLocaleString()} {t('stats.views')}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </div>
              ))}
              {stats.popularPosts.length === 0 && (
                <p className="text-center py-4 text-muted-foreground italic">{t('stats.no_popular')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('stats.recent_activity')}</CardTitle>
            <CardDescription>
              {t('stats.recent_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.latestPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{format(new Date(post.createdAt), 'MMM d, yyyy', { locale: dateLocale })}</span>
                      <span>•</span>
                      <Badge variant={post.status === 'published' || post.published ? 'default' : 'secondary'} className="text-[10px] h-4 px-1 leading-none">
                        {post.status === 'published' || post.published ? t('common.published') : t('common.draft')}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs font-medium">
                    {post.views} {t('stats.views')}
                  </div>
                </div>
              ))}
              {stats.latestPosts.length === 0 && (
                <p className="text-center py-4 text-muted-foreground italic">{t('stats.no_posts')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <FolderOpen className="h-8 w-8 text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{stats.totalCategories}</div>
          <p className="text-sm text-muted-foreground">{t('stats.categories')}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <TagsIcon className="h-8 w-8 text-green-500 mb-2" />
          <div className="text-2xl font-bold">{stats.totalTags}</div>
          <p className="text-sm text-muted-foreground">{t('stats.tags')}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Users className="h-8 w-8 text-purple-500 mb-2" />
          <div className="text-2xl font-bold">{stats.totalComments}</div>
          <p className="text-sm text-muted-foreground">{t('stats.comments')}</p>
        </Card>
      </div>
    </div>
  );
}

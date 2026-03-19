'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  ExternalLink,
  Download,
  Upload,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api-client';

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  views: number;
  category?: { name: string };
  author: { name?: string; email: string };
}

export default function PostsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'ru' ? ru : enUS;
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/blog/admin/posts');
      // The backend returns { posts: Post[], total: number }
      const data = response.data;
      if (data && typeof data === 'object' && Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error(t('posts.load_failed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await apiClient.get('/blog/export/json');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", `blog-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success(t('posts.export_success'));
    } catch {
      toast.error(t('posts.export_failed'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await apiClient.post('/blog/import/json', json);
        toast.success(t('posts.import_success', { count: res.data.count, total: res.data.total }));
        fetchPosts();
      } catch {
        toast.error(t('posts.import_failed'));
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const deletePost = async (id: string) => {
    if (!confirm(t('posts.delete_confirm'))) return;
    
    try {
      await apiClient.delete(`/blog/posts/${id}`);
      setPosts(posts.filter(post => post.id !== id));
      toast.success(t('posts.delete_success'));
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(t('posts.delete_failed'));
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{t('posts.title')}</h1>
          <p className="text-slate-500 font-medium">
            {t('posts.description')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="file" 
              className="hidden" 
              id="import-posts" 
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
            />
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all gap-2"
              onClick={() => document.getElementById('import-posts')?.click()}
              disabled={isImporting}
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {t('posts.import')}
            </Button>
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all gap-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {t('posts.export')}
          </Button>
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all px-6 gap-2" asChild>
            <Link href="/admin/posts/new">
              <Plus className="h-4 w-4" />
              {t('posts.new_post')}
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                placeholder={t('posts.search_placeholder')} 
                className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50 h-12 gap-2 font-bold text-slate-600">
                <Filter className="h-4 w-4" />
                {t('posts.filter')}
              </Button>
              <Button 
                variant="ghost" 
                className="rounded-xl h-12 w-12 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                onClick={fetchPosts}
                disabled={isLoading}
              >
                <Loader2 className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 px-4 pb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">{t('posts.info')}</th>
                  <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">{t('posts.status')}</th>
                  <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">{t('posts.category')}</th>
                  <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">{t('posts.views')}</th>
                  <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">{t('posts.date')}</th>
                  <th className="p-4 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">{t('posts.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="p-4 h-16 bg-slate-50/50 rounded-xl my-2" />
                    </tr>
                  ))
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-3xl bg-slate-50 text-slate-300">
                          <FileText className="h-10 w-10" />
                        </div>
                        <p className="text-slate-500 font-bold">{t('posts.no_posts')}</p>
                        <Button variant="link" onClick={() => setSearchQuery('')} className="text-blue-600 font-bold">{t('posts.clear_search')}</Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                            {post.title.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] lg:max-w-[400px] group-hover:text-blue-600 transition-colors">
                              {post.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium truncate italic">
                              /{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter border-none ${
                          post.published 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {post.published ? t('common.published') : t('common.draft')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-slate-600">
                          {post.category?.name || t('posts.uncategorized')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          {post.views.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">
                            {format(new Date(post.createdAt), 'MMM d, yyyy', { locale: dateLocale })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                            {format(new Date(post.createdAt), 'HH:mm', { locale: dateLocale })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" asChild title={t('posts.view_post')}>
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" asChild title={t('posts.edit_post')}>
                            <Link href={`/admin/posts/${post.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            onClick={() => deletePost(post.id)}
                            title={t('posts.delete_post')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

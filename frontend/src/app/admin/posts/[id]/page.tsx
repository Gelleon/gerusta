'use client';

import { useState, useEffect, use } from 'react';
import { isAxiosError } from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Save, 
  Sparkles, 
  Image as ImageIcon, 
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  History,
  Eye,
  Settings2,
  X,
  FileText,
  Globe,
  BarChart3,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getImageUrl, cn } from '@/lib/utils';

import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import apiClient, { postWithDirectApiFallback } from '@/lib/api-client';
import {
  type GeneratedArticle,
  generateArticleWithRouterAi,
} from '@/lib/routerai-article';

const postSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string(),
  categoryId: z.string(),
  featuredImage: z.string().optional(),
  published: z.boolean(),
  tags: z.array(z.string()),
  scheduledAt: z.string().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface Category {
  id: string;
  name: string;
}

interface PostTag {
  name: string;
}

interface PostVersion {
  id: string;
  createdAt: string;
  title: string;
  content: string;
}

interface PostData {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  categoryId?: string;
  featuredImage?: string;
  published: boolean;
  updatedAt?: string;
  views?: number;
  tags?: PostTag[];
  _count?: {
    comments?: number;
  };
  scheduledAt?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  versions?: PostVersion[];
}

type GenerateImageResponse = { url: string };

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [post, setPost] = useState<PostData | null>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      categoryId: '',
      featuredImage: '',
      published: false,
      tags: [],
      scheduledAt: null,
      metaTitle: '',
      metaDescription: '',
    }
  });

  const { handleSubmit, reset, setValue, watch } = form;

  const selectedTags = watch('tags');
  const versions = post?.versions ?? [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, postRes] = await Promise.all([
          apiClient.get('/blog/categories'),
          apiClient.get(`/blog/posts/${resolvedParams.id}`)
        ]);
        
        setCategories(categoriesRes.data);
        setPost(postRes.data);
        
        // Populate form
        reset({
          title: postRes.data.title,
          slug: postRes.data.slug || '',
          excerpt: postRes.data.excerpt || '',
          content: postRes.data.content,
          categoryId: postRes.data.categoryId || undefined,
          featuredImage: postRes.data.featuredImage || '',
          published: postRes.data.published,
          tags: postRes.data.tags?.map((t: PostTag) => t.name) || [],
          scheduledAt: postRes.data.scheduledAt ? new Date(postRes.data.scheduledAt).toISOString().slice(0, 16) : null,
          metaTitle: postRes.data.metaTitle || '',
          metaDescription: postRes.data.metaDescription || '',
        });
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error(t('posts.load_post_failed'));
        router.push('/admin/posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, reset, router, t]);

  const onSubmit: SubmitHandler<PostFormValues> = async (values) => {
    setIsSaving(true);
    try {
      const response = await apiClient.put(`/blog/posts/${resolvedParams.id}`, values);
      setPost(response.data);
      toast.success(t('posts.update_success'));
      // No redirect, allow continuous editing
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(t('posts.update_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    
    if (tagInput.trim()) {
      if (!selectedTags.includes(tagInput.trim())) {
        setValue('tags', [...selectedTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const generateContent = async () => {
    const title = watch('title');
    if (!title || title.length < 5) {
      toast.error(t('posts.title_required_ai'));
      return;
    }

    setIsGenerating(true);
    try {
      const article: GeneratedArticle = await generateArticleWithRouterAi({
        prompt: `Улучши пост на тему "${title}". ${watch('content') || ''}`,
        topic: title,
        keywords: selectedTags.join(', '),
      });
      setValue('title', article.title);
      setValue('excerpt', article.excerpt);
      setValue('content', article.content);
      toast.success(t('posts.ai_content_success'));
    } catch (error: unknown) {
      console.error('AI generation error:', error);
      if (isAxiosError(error)) {
        const apiMessage = typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : Array.isArray(error.response?.data?.message)
            ? error.response?.data?.message.join(', ')
            : '';
        toast.error(apiMessage || t('posts.ai_content_failed'));
      } else {
        toast.error(t('posts.ai_content_failed'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    const title = watch('title');
    if (!title || title.length < 5) {
      toast.error(t('posts.title_required_image'));
      return;
    }

    setIsGenerating(true);
    try {
      const response = await postWithDirectApiFallback<GenerateImageResponse>(
        '/ai/generate-image',
        { prompt: title },
        { timeout: 300000 },
      );
      setValue('featuredImage', response.url);
      toast.success(t('posts.ai_image_success'));
    } catch (error: unknown) {
      console.error('AI image generation error:', error);
      if (isAxiosError(error)) {
        const apiMessage = typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : Array.isArray(error.response?.data?.message)
            ? error.response?.data?.message.join(', ')
            : '';
        toast.error(apiMessage || t('posts.ai_image_failed'));
      } else {
        toast.error(t('posts.ai_image_failed'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-pulse">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-slate-200 rounded-lg" />
              <div className="h-4 w-32 bg-slate-100 rounded-lg" />
            </div>
          </div>
          <div className="h-12 w-64 bg-slate-100 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 h-[600px] bg-slate-50 rounded-3xl border border-slate-100" />
          <div className="h-[500px] bg-slate-50 rounded-3xl border border-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Enhanced Header */}
          <div className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-2 bg-white/80 backdrop-blur-md border-b border-slate-100 -mx-2 mb-4 transition-all">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                asChild
                className="rounded-full hover:bg-slate-100 transition-all"
              >
                <Link href="/admin/posts">
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </Link>
              </Button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 truncate max-w-[300px] md:max-w-md">
                    {watch('title') || t('posts.edit_title')}
                  </h1>
                  {watch('published') ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {t('posts.status_published', 'Published')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                      {t('posts.status_draft', 'Draft')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t('posts.last_updated')}: {post?.updatedAt ? new Date(post.updatedAt).toLocaleTimeString() : '...'}
                  </p>
                  <Separator orientation="vertical" className="h-3" />
                  <p className="text-slate-400 text-xs font-medium">
                    {watch('content')?.split(/\s+/).filter(Boolean).length || 0} {t('posts.words', 'words')}
                  </p>
                  {isSaving && (
                    <>
                      <Separator orientation="vertical" className="h-3" />
                      <div className="flex items-center gap-1.5 text-indigo-500 animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('posts.saving', 'Saving...')}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(`/blog/${post?.slug}`, '_blank')} 
                      disabled={!post?.published}
                      className="rounded-xl border-slate-200 hover:bg-slate-50 font-semibold"
                    >
                      <Eye className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">{t('posts.preview_live')}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('posts.preview_live')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button 
                variant="outline"
                onClick={async () => {
                  await handleSubmit(onSubmit)();
                  router.push('/admin/posts');
                }}
                disabled={isSaving}
                className="hidden md:flex rounded-xl border-slate-200 hover:bg-slate-50 font-bold px-4"
              >
                {t('common.save_and_close', 'Save & Close')}
              </Button>

              <Button 
                onClick={handleSubmit(onSubmit)} 
                disabled={isSaving}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 transition-all font-bold px-6"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 md:mr-2" />
                )}
                <span className="ml-2">{isSaving ? t('posts.updating') : t('posts.update_post')}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-8">
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl mb-6 w-full md:w-fit border border-slate-100">
                  <TabsTrigger value="editor" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-bold transition-all">
                    <FileText className="h-4 w-4 mr-2" />
                    {t('posts.content_editor', 'Editor')}
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-bold transition-all">
                    <Globe className="h-4 w-4 mr-2" />
                    {t('posts.seo_optimization', 'SEO & Meta')}
                  </TabsTrigger>
                  <TabsTrigger value="revisions" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-bold transition-all">
                    <History className="h-4 w-4 mr-2" />
                    {t('posts.revision_history', 'History')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-8 md:p-10 space-y-10">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-slate-500 font-bold ml-1 text-[10px] uppercase tracking-wider">{t('posts.post_title_label')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('posts.post_title_placeholder')}
                                {...field}
                                className="h-auto py-4 text-3xl md:text-4xl font-black rounded-none border-0 border-b-2 border-slate-50 focus:border-indigo-500 focus:ring-0 transition-all bg-transparent px-0 placeholder:text-slate-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="excerpt"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-slate-500 font-bold ml-1 text-[10px] uppercase tracking-wider">{t('posts.excerpt_label')}</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={t('posts.excerpt_placeholder')}
                                className="min-h-[120px] w-full rounded-2xl border border-slate-100 bg-slate-50/30 px-6 py-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none placeholder:text-slate-300 italic text-slate-600"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-[10px] text-slate-400 italic px-1">
                              {t('posts.excerpt_hint', 'A short summary for search results and cards.')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-500 font-bold ml-1 text-[10px] uppercase tracking-wider">
                            {t('posts.content_label')}
                          </Label>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all font-bold"
                            onClick={generateContent}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                            )}
                            {t('posts.ai_improve')}
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder={t('posts.content_placeholder')}
                                  className="min-h-[600px] w-full rounded-3xl border border-slate-100 bg-slate-50/30 px-8 py-8 text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none placeholder:text-slate-300 font-serif leading-relaxed resize-none shadow-inner"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="seo" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Card className="rounded-[32px] border-slate-100 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-50">
                      <CardTitle className="text-xl font-black text-slate-900">{t('posts.seo_optimization')}</CardTitle>
                      <CardDescription>{t('posts.seo_optimization_desc', 'Optimize your post for search engines.')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-slate-700 font-bold text-sm">{t('posts.slug_label', 'URL Slug')}</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-xs font-medium">/blog/</span>
                                <Input 
                                  placeholder={t('posts.slug_placeholder', 'post-url-slug')}
                                  className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 font-medium"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="text-[10px]">{t('posts.slug_hint', 'The unique URL part for this post.')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-slate-700 font-bold text-sm">{t('posts.meta_title_label')}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder={t('posts.meta_title_placeholder')}
                                  className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 pr-12 font-medium"
                                  {...field}
                                />
                                <span className={cn(
                                  "absolute right-4 top-3.5 text-[10px] font-bold",
                                  (field.value?.length || 0) > 60 ? "text-amber-500" : "text-slate-400"
                                )}>
                                  {field.value?.length || 0}/60
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription className="text-[10px]">{t('posts.meta_title_hint')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-slate-700 font-bold text-sm">{t('posts.meta_desc_label')}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Textarea 
                                  placeholder={t('posts.meta_desc_placeholder')}
                                  className="min-h-[120px] rounded-xl border-slate-200 focus:border-indigo-500 py-4 font-medium"
                                  {...field}
                                />
                                <span className={cn(
                                  "absolute right-4 bottom-4 text-[10px] font-bold",
                                  (field.value?.length || 0) > 160 ? "text-amber-500" : "text-slate-400"
                                )}>
                                  {field.value?.length || 0}/160
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription className="text-[10px]">{t('posts.meta_desc_hint')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="revisions" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Card className="rounded-[32px] border-slate-100 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-50">
                      <CardTitle className="text-xl font-black text-slate-900">{t('posts.revision_history')}</CardTitle>
                      <CardDescription>{t('posts.revision_history_desc', 'Restore previous versions of your post.')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      {versions.length > 0 ? (
                        <div className="grid gap-4">
                          {versions.map((version: PostVersion, idx: number) => (
                            <div key={version.id} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all group">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-sm group-hover:bg-indigo-50 transition-colors">
                                  <History className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-800">
                                    {new Date(version.createdAt).toLocaleDateString()} at {new Date(version.createdAt).toLocaleTimeString()}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                    {idx === versions.length - 1 ? t('posts.original_version', 'Initial Version') : `${t('posts.version', 'Version')} ${versions.length - idx}`}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200"
                                onClick={() => {
                                  setValue('title', version.title);
                                  setValue('content', version.content);
                                  toast.success(t('posts.restore_success'));
                                }}
                              >
                                {t('posts.restore_button')}
                              </Button>
                            </div>
                          )).reverse()}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                          <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center">
                            <History className="h-8 w-8 text-slate-200" />
                          </div>
                          <p className="text-slate-400 font-medium">{t('posts.no_revisions', 'No revisions yet.')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-white sticky top-24">
                <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/20">
                  <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900 uppercase tracking-tight">
                    <Settings2 className="h-4 w-4 text-indigo-500" />
                    {t('posts.publish_settings')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  {/* Category & Status */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">{t('posts.category_label')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all">
                                <SelectValue placeholder={t('posts.select_category')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl p-2">
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id} className="rounded-xl focus:bg-indigo-50 py-2.5 font-medium">
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between bg-indigo-50/30 p-5 rounded-3xl border border-indigo-50/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-black text-indigo-950 cursor-pointer">
                              {t('posts.published_label')}
                            </FormLabel>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tight">{t('posts.published_desc')}</p>
                          </div>
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="h-6 w-6 rounded-lg border-indigo-200 data-[state=checked]:bg-indigo-600 transition-all"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="bg-slate-50" />

                  {/* Image Upload Area */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">{t('posts.image_label')}</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="xs" 
                        className="rounded-lg text-indigo-600 font-bold hover:bg-indigo-50 h-7"
                        onClick={generateImage}
                        disabled={isGenerating}
                      >
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
                        {t('posts.ai_gen_button', 'AI Generation')}
                      </Button>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <div className="space-y-4">
                          <div className="aspect-video relative rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all overflow-hidden group shadow-inner">
                            {field.value ? (
                              <>
                                <Image
                                  src={getImageUrl(field.value)} 
                                  width={1280}
                                  height={720}
                                  sizes="(max-width: 1024px) 100vw, 33vw"
                                  unoptimized
                                  alt="Featured" 
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                  <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="sm" 
                                    className="rounded-xl h-9 w-9 p-0"
                                    onClick={() => setValue('featuredImage', '')}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-3 p-6 text-center">
                                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                  <ImageIcon className="h-6 w-6 text-slate-300" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('posts.no_image')}</p>
                              </div>
                            )}
                          </div>
                          <FormControl>
                            <Input 
                              placeholder={t('posts.image_placeholder')}
                              className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-indigo-500 text-xs font-medium transition-all"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                  </div>

                  <Separator className="bg-slate-50" />

                  {/* Tags */}
                  <div className="space-y-4">
                    <Label className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">{t('posts.tags_label')}</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} className="rounded-xl px-3 py-1 bg-white text-slate-600 border border-slate-100 flex items-center gap-1.5 shadow-sm hover:border-indigo-200 transition-all cursor-default">
                          {tag}
                          <button 
                            type="button" 
                            className="hover:text-red-500 transition-colors"
                            onClick={() => setValue('tags', selectedTags.filter(t => t !== tag))}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input 
                          placeholder={t('posts.tags_placeholder')}
                          value={tagInput}
                          className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-indigo-500 pr-10 font-medium transition-all"
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                        />
                        <Plus className="absolute right-4 top-4 h-4 w-4 text-slate-300" />
                      </div>
                      <Button 
                        type="button" 
                        variant="secondary"
                        size="sm"
                        className="h-12 rounded-xl px-4 font-bold border-slate-100 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                        onClick={() => handleAddTag()}
                        disabled={!tagInput.trim()}
                      >
                        {t('common.add', 'Add')}
                      </Button>
                    </div>
                  </div>

                  {/* Scheduling */}
                  <div className="space-y-4 pt-2">
                    <Label className="text-slate-500 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {t('posts.schedule_label', 'Schedule Publication')}
                    </Label>
                    <FormField
                      control={form.control}
                      name="scheduledAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-indigo-500 font-bold transition-all"
                              value={field.value || ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription className="text-[10px] text-slate-400 font-medium italic">
                            {t('posts.schedule_desc')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/30 p-6 border-t border-slate-50">
                  <div className="flex flex-col items-center justify-center w-full gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                      <BarChart3 className="h-3 w-3" />
                      Post Stats
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-black text-slate-700">{post?.views || 0}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{t('posts.views')}</p>
                      </div>
                      <Separator orientation="vertical" className="h-6" />
                      <div className="text-center">
                        <p className="text-sm font-black text-slate-700">{post?._count?.comments || 0}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{t('posts.comments', 'Comments')}</p>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

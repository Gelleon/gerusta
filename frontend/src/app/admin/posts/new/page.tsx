'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Save, 
  Send, 
  Sparkles, 
  Image as ImageIcon, 
  ArrowLeft,
  Loader2,
  Plus,
  X,
  Eye,
  Settings2
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import apiClient from '@/lib/api-client';

const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  excerpt: z.string().optional(),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  categoryId: z.string(),
  tags: z.array(z.string()),
  featuredImage: z.string().optional(),
  published: z.boolean(),
  scheduledAt: z.string().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function NewPostPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [tagInput, setTagInput] = useState('');

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/blog/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const generateAIContent = async () => {
    const title = form.getValues('title');
    if (!title || title.length < 5) {
      toast.error(t('posts.title_required_ai'));
      return;
    }

    setIsGeneratingContent(true);
    try {
      const response = await apiClient.post('/ai/generate-article', { 
        topic: title,
        keywords: form.getValues('tags')?.join(', ')
      });
      
      const content = response.data;
      form.setValue('content', content);
      toast.success(t('posts.ai_content_success'));
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast.error(t('posts.ai_content_failed'));
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const generateAIImage = async () => {
    const title = form.getValues('title');
    if (!title || title.length < 5) {
      toast.error(t('posts.title_required_image'));
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await apiClient.post('/ai/generate-image', { prompt: title });
      form.setValue('featuredImage', response.data.url);
      toast.success(t('posts.ai_image_success'));
    } catch (error) {
      console.error('Error generating AI image:', error);
      toast.error(t('posts.ai_image_failed'));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const onSubmit: SubmitHandler<PostFormValues> = async (values) => {
    setIsSaving(true);
    try {
      await apiClient.post('/blog/posts', values);
      toast.success(t('posts.create_success'));
      router.push('/admin/posts');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(t('posts.create_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const currentTags = form.getValues('tags') || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue('tags', [...currentTags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Button 
                type="button"
                variant="outline" 
                size="icon" 
                onClick={() => router.back()}
                className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all duration-300 group"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent">
                  {t('posts.create_title')}
                </h1>
                <p className="text-slate-500 text-sm mt-1">{t('posts.create_description')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/50 p-2 rounded-2xl border border-slate-100 backdrop-blur-sm">
              <Button 
                type="button"
                variant="ghost" 
                onClick={() => setPreviewMode(!previewMode)}
                className="rounded-xl hover:bg-slate-100 transition-all"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? t('posts.edit_mode') : t('posts.live_preview')}
              </Button>
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <Button 
                type="button"
                variant="outline" 
                onClick={form.handleSubmit((v) => onSubmit({ ...v, published: false }))} 
                disabled={isSaving}
                className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all"
              >
                <Save className="h-4 w-4 mr-2" />
                {t('posts.save_draft')}
              </Button>
              <Button 
                type="submit"
                onClick={form.handleSubmit((v) => onSubmit({ ...v, published: true }))} 
                disabled={isSaving}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="h-4 w-4 mr-2" />
                {t('posts.publish_post')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-indigo-950">{t('posts.content_editor')}</CardTitle>
                      <CardDescription>{t('posts.content_editor_desc')}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList className="mb-8 p-1.5 bg-slate-100/80 rounded-2xl w-fit">
                      <TabsTrigger value="content" className="rounded-xl px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-medium">{t('posts.content_tab')}</TabsTrigger>
                      <TabsTrigger value="seo" className="rounded-xl px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-medium">{t('posts.seo_tab')}</TabsTrigger>
                      <TabsTrigger value="preview" onClick={() => setPreviewMode(true)} className="rounded-xl px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-medium">{t('posts.preview_tab')}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-slate-700 font-bold ml-1">{t('posts.post_title_label')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('posts.post_title_placeholder')} 
                                {...field} 
                                className="h-14 text-xl font-bold rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all bg-slate-50/30" 
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
                            <FormLabel className="text-slate-700 font-bold ml-1">{t('posts.excerpt_label')}</FormLabel>
                            <FormControl>
                              <textarea 
                                placeholder={t('posts.excerpt_placeholder')} 
                                className="flex min-h-[100px] w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none resize-none placeholder:text-slate-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <FormLabel className="text-slate-700 font-bold">{t('posts.content_label')}</FormLabel>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl text-indigo-600 border-indigo-100 bg-indigo-50 hover:bg-indigo-100 transition-all duration-300 group"
                            onClick={generateAIContent}
                            disabled={isGeneratingContent}
                          >
                            {isGeneratingContent ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-2 text-indigo-500 group-hover:rotate-12 transition-transform" />
                            )}
                            {t('posts.ai_write_helper')}
                          </Button>
                        </div>

                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <textarea 
                                  placeholder={t('posts.content_placeholder')} 
                                  className="flex min-h-[500px] w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-6 py-5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-400 font-serif leading-relaxed"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="seo" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 mb-6">
                        <p className="text-sm text-blue-700 flex gap-2">
                          <Settings2 className="h-4 w-4 mt-0.5 shrink-0" />
                          {t('posts.seo_optimization_desc')}
                        </p>
                      </div>
                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-slate-700 font-bold ml-1">{t('posts.meta_title_label')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('posts.meta_title_placeholder')} {...field} className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10" />
                            </FormControl>
                            <FormDescription className="text-xs ml-1">{t('posts.meta_title_hint')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-slate-700 font-bold ml-1">{t('posts.meta_desc_label')}</FormLabel>
                            <FormControl>
                              <textarea 
                                placeholder={t('posts.meta_desc_placeholder')}
                                className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs ml-1">{t('posts.meta_desc_hint')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="rounded-3xl border border-slate-100 bg-white p-10 shadow-sm min-h-[600px]">
                        <article className="max-w-3xl mx-auto">
                          <header className="mb-10 text-center">
                            {form.watch('categoryId') && (
                              <Badge variant="outline" className="mb-4 rounded-full px-4 py-1 text-indigo-600 border-indigo-100 bg-indigo-50">
                                {categories.find(c => c.id === form.watch('categoryId'))?.name || t('posts.category')}
                              </Badge>
                            )}
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                              {form.watch('title') || t('posts.preview_title_placeholder')}
                            </h1>
                            {form.watch('excerpt') && (
                              <p className="text-xl text-slate-500 font-medium italic">
                                {form.watch('excerpt')}
                              </p>
                            )}
                          </header>

                          {form.watch('featuredImage') && (
                            <div className="mb-12 rounded-3xl overflow-hidden shadow-xl ring-1 ring-slate-200">
                              <Image
                                src={getImageUrl(form.watch('featuredImage'))} 
                                width={1600}
                                height={686}
                                sizes="(max-width: 1024px) 100vw, 1600px"
                                unoptimized
                                alt="Featured" 
                                className="w-full aspect-[21/9] object-cover" 
                              />
                            </div>
                          )}

                          <div className="prose prose-indigo prose-lg dark:prose-invert max-w-none whitespace-pre-wrap font-serif text-slate-800 leading-relaxed">
                            {form.watch('content') || (
                              <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-4">
                                <Sparkles className="h-12 w-12" />
                                <p className="text-lg font-medium">{t('posts.preview_content_placeholder')}</p>
                              </div>
                            )}
                          </div>

                          {form.watch('tags') && form.watch('tags').length > 0 && (
                            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap gap-2">
                              {form.watch('tags').map(tag => (
                                <Badge key={tag} variant="secondary" className="rounded-full px-4 py-1 bg-slate-100 text-slate-600 border-none">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </article>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-white sticky top-24">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-6 py-5">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-950">
                    <Settings2 className="h-4 w-4 text-indigo-500" />
                    {t('posts.publish_settings')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-4">
                    <FormLabel className="text-slate-700 font-bold flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-indigo-400" />
                      {t('posts.image_label')}
                    </FormLabel>
                    <div className="aspect-video relative rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200 transition-all overflow-hidden group">
                      {form.watch('featuredImage') ? (
                        <>
                          <Image
                            src={getImageUrl(form.watch('featuredImage'))} 
                            width={1280}
                            height={720}
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            unoptimized
                            alt="Preview" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              type="button"
                              variant="destructive" 
                              size="sm" 
                              onClick={() => form.setValue('featuredImage', '')}
                              className="rounded-xl"
                            >
                              <X className="h-4 w-4 mr-2" />
                              {t('common.delete')}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6">
                          <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm text-slate-500 mb-4">{t('posts.no_image')}</p>
                          <div className="flex flex-col gap-2">
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl border-indigo-100 text-indigo-600"
                              onClick={generateAIImage}
                              disabled={isGeneratingImage}
                            >
                              {isGeneratingImage ? (
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3 mr-2" />
                              )}
                              {t('posts.ai_generate')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-slate-700 font-bold">{t('posts.category_label')}</FormLabel>
                          <FormControl>
                            <select 
                              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                              {...field}
                            >
                              <option value="">{t('posts.select_category')}</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <FormLabel className="text-slate-700 font-bold">{t('posts.tags_label')}</FormLabel>
                      <div className="flex gap-2">
                        <Input 
                          placeholder={t('posts.tags_placeholder')} 
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          className="h-11 rounded-xl border-slate-200"
                        />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={addTag}
                          className="rounded-xl px-3"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.watch('tags')?.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="rounded-full pl-3 pr-1 py-1 bg-slate-100 text-slate-600 border-none group flex items-center gap-1"
                          >
                            {tag}
                            <button 
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:bg-slate-200 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-slate-700 font-bold">{t('posts.published_label')}</FormLabel>
                            <FormDescription className="text-xs">{t('posts.published_desc')}</FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6">
                  <Button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all duration-300"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {form.watch('published') ? t('posts.publish') : t('posts.save_draft')}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

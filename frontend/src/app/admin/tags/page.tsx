'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Tags as TagsIcon,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api-client';

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

export default function TagsPage() {
  const { t } = useTranslation();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTag, setCurrentTag] = useState<Partial<Tag>>({ name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/blog/tags');
      setTags(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error(t('tags.load_failed'));
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTags = Array.isArray(tags) ? tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTag.name?.trim()) {
      toast.error(t('tags.name_required'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && currentTag.id) {
        await apiClient.put(`/blog/tags/${currentTag.id}`, { name: currentTag.name });
        toast.success(t('tags.update_success'));
      } else {
        await apiClient.post('/blog/tags', { name: currentTag.name });
        toast.success(t('tags.create_success'));
      }
      setIsDialogOpen(false);
      fetchTags();
    } catch (error: any) {
      console.error('Error saving tag:', error);
      toast.error(error.response?.data?.message || t('tags.save_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('tags.delete_confirm'))) return;

    try {
      await apiClient.delete(`/blog/tags/${id}`);
      toast.success(t('tags.delete_success'));
      fetchTags();
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      toast.error(error.response?.data?.message || t('tags.delete_failed'));
    }
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setCurrentTag({ name: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (tag: Tag) => {
    setIsEditing(true);
    setCurrentTag(tag);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('tags.title')}</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t('tags.add_tag')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('tags.management')}</CardTitle>
          <CardDescription>
            {t('tags.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('tags.search_placeholder')} 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr className="text-left font-medium">
                  <th className="p-4">{t('tags.name')}</th>
                  <th className="p-4">{t('tags.slug')}</th>
                  <th className="p-4 text-center">{t('tags.count')}</th>
                  <th className="p-4 text-right">{t('tags.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">{t('common.loading')}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTags.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      {t('tags.no_tags')}
                    </td>
                  </tr>
                ) : (
                  filteredTags.map((tag) => (
                    <tr key={tag.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-medium bg-blue-50 text-blue-700 border-blue-200">
                            #{tag.name}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {tag.slug}
                      </td>
                      <td className="p-4 text-center">
                        {tag._count?.posts || 0}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(tag.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? t('tags.edit_tag') : t('tags.create_tag')}</DialogTitle>
            <DialogDescription>
              {t('tags.description')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">{t('tags.name')}</label>
                <Input 
                  id="name" 
                  value={currentTag.name} 
                  onChange={(e) => setCurrentTag({ ...currentTag, name: e.target.value })}
                  placeholder={t('tags.name_placeholder')}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  t('common.save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

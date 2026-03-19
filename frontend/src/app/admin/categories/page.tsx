'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  FolderOpen,
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
} from '@/components/ui/dialog';
import apiClient from '@/lib/api-client';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

type ApiErrorData = {
  message?: string;
};

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({ name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/blog/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(t('categories.load_failed'));
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = Array.isArray(categories) ? categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory.name?.trim()) {
      toast.error(t('categories.name_required'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && currentCategory.id) {
        await apiClient.put(`/blog/categories/${currentCategory.id}`, { name: currentCategory.name });
        toast.success(t('categories.update_success'));
      } else {
        await apiClient.post('/blog/categories', { name: currentCategory.name });
        toast.success(t('categories.create_success'));
      }
      setIsDialogOpen(false);
      void fetchCategories();
    } catch (error: unknown) {
      const errorMessage = (error as AxiosError<ApiErrorData>).response?.data?.message;
      console.error('Error saving category:', error);
      toast.error(errorMessage || t('categories.save_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('categories.delete_confirm'))) return;

    try {
      await apiClient.delete(`/blog/categories/${id}`);
      toast.success(t('categories.delete_success'));
      void fetchCategories();
    } catch (error: unknown) {
      const errorMessage = (error as AxiosError<ApiErrorData>).response?.data?.message;
      console.error('Error deleting category:', error);
      toast.error(errorMessage || t('categories.delete_failed'));
    }
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setCurrentCategory({ name: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('categories.title')}</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t('categories.add_category')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('categories.management')}</CardTitle>
          <CardDescription>
            {t('categories.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('categories.search_placeholder')} 
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
                  <th className="p-4">{t('categories.name')}</th>
                  <th className="p-4">{t('categories.slug')}</th>
                  <th className="p-4 text-center">{t('categories.count')}</th>
                  <th className="p-4 text-right">{t('categories.actions')}</th>
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
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      {t('categories.no_categories')}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {category.slug}
                      </td>
                      <td className="p-4 text-center">
                        {category._count?.posts || 0}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(category.id)}
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
            <DialogTitle>{isEditing ? t('categories.edit_category') : t('categories.create_category')}</DialogTitle>
            <DialogDescription>
              {t('categories.description')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">{t('categories.name')}</label>
                <Input 
                  id="name" 
                  value={currentCategory.name} 
                  onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  placeholder={t('categories.name_placeholder')}
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

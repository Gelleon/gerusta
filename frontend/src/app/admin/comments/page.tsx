'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  MessageSquare,
  Loader2,
  ExternalLink,
  User,
  Mail,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api-client';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  approved: boolean;
  createdAt: string;
  postId: string;
  post: {
    title: string;
  };
}

export default function CommentsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'ru' ? ru : enUS;
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/blog/comments');
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error(t('comments.load_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredComments = comments.filter(comment => 
    comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.authorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    setIsProcessing(id);
    try {
      await apiClient.put(`/blog/comments/${id}/approve`);
      toast.success(t('comments.approve_success'));
      fetchComments();
    } catch (error) {
      console.error('Error approving comment:', error);
      toast.error(t('comments.approve_failed'));
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('comments.delete_confirm'))) return;

    setIsProcessing(id);
    try {
      await apiClient.delete(`/blog/comments/${id}`);
      toast.success(t('comments.delete_success'));
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(t('comments.delete_failed'));
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('comments.title')}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50">
            {t('comments.total')}: {comments.length}
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {t('comments.pending')}: {comments.filter(c => !c.approved).length}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('comments.moderation')}</CardTitle>
          <CardDescription>
            {t('comments.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('comments.search_placeholder')} 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>{t('comments.loading')}</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="py-12 text-center border rounded-lg bg-muted/20 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>{t('comments.no_comments')}</p>
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`p-4 border rounded-lg transition-all ${
                    !comment.approved ? 'bg-yellow-50/50 border-yellow-200 shadow-sm' : 'bg-card'
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <User className="h-3 w-3" />
                          {comment.authorName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {comment.authorEmail}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm', { locale: dateLocale })}
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-medium">
                          <ExternalLink className="h-3 w-3" />
                          {t('comments.post')}: {comment.post.title}
                        </div>
                        {!comment.approved && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-[10px] h-5 px-1.5 uppercase font-bold tracking-wider">
                            {t('comments.pending_approval')}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>

                    <div className="flex md:flex-col justify-end gap-2 shrink-0">
                      {!comment.approved && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(comment.id)}
                          disabled={isProcessing === comment.id}
                        >
                          {isProcessing === comment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          {t('comments.approve')}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(comment.id)}
                        disabled={isProcessing === comment.id}
                      >
                        {isProcessing === comment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        {t('comments.delete')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

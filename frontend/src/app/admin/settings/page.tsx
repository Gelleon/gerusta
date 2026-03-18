'use client';

import { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Shield, 
  Bell, 
  Globe, 
  Palette,
  Save,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api-client';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await apiClient.put('/auth/update-profile', {
        name: formData.name,
        email: formData.email
      });
      setUser(response.data);
      toast.success(t('settings.profile_updated'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('settings.update_profile_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t('settings.passwords_dont_match'));
      return;
    }
    
    setIsSaving(true);
    try {
      await apiClient.put('/auth/update-profile', {
        password: formData.newPassword
      });
      toast.success(t('settings.password_updated'));
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('settings.update_password_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{t('settings.title')}</h1>
          <p className="text-slate-500 font-medium">
            {t('settings.description')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-2xl inline-flex h-auto">
          <TabsTrigger value="profile" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <UserIcon className="h-4 w-4 mr-2" />
            {t('settings.profile')}
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4 mr-2" />
            {t('settings.security')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bell className="h-4 w-4 mr-2" />
            {t('settings.notifications')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Palette className="h-4 w-4 mr-2" />
            {t('settings.appearance')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold">{t('settings.profile_info')}</CardTitle>
              <CardDescription>{t('settings.profile_description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-slate-700">{t('settings.full_name')}</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder={t('settings.full_name_placeholder')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-700">{t('settings.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder={t('settings.email_placeholder')}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium pl-1 italic">{t('settings.email_hint')}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 bg-slate-50/50 flex justify-end">
              <Button 
                onClick={handleSaveProfile} 
                disabled={isSaving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-8 shadow-lg shadow-blue-500/25"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('settings.save_changes')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold">{t('settings.security_settings')}</CardTitle>
              <CardDescription>{t('settings.security_description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="new-password text-sm font-bold text-slate-700">{t('settings.new_password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="new-password" 
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="pl-10 rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password text-sm font-bold text-slate-700">{t('settings.confirm_password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="confirm-password" 
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10 rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 bg-slate-50/50 flex justify-end">
              <Button 
                onClick={handleUpdatePassword} 
                disabled={isSaving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-8 shadow-lg shadow-blue-500/25"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('settings.updating')}
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    {t('settings.update_password')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold">{t('settings.notification_preferences')}</CardTitle>
              <CardDescription>{t('settings.notification_description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-slate-900">{t('settings.email_notifications')}</Label>
                    <p className="text-xs text-slate-500 font-medium">{t('settings.email_notifications_desc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-slate-900">{t('settings.comment_alerts')}</Label>
                    <p className="text-xs text-slate-500 font-medium">{t('settings.comment_alerts_desc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-slate-900">{t('settings.security_alerts')}</Label>
                    <p className="text-xs text-slate-500 font-medium">{t('settings.security_alerts_desc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold">{t('settings.appearance_settings')}</CardTitle>
              <CardDescription>{t('settings.appearance_description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="flex flex-col gap-3 p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/50 text-left transition-all">
                  <div className="w-full aspect-video bg-white rounded-lg border border-slate-200 p-2 space-y-2 shadow-sm">
                    <div className="h-2 w-2/3 bg-slate-100 rounded" />
                    <div className="h-2 w-1/2 bg-slate-100 rounded" />
                    <div className="h-8 w-full bg-blue-50 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{t('settings.light_mode')}</span>
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                </button>
                <button className="flex flex-col gap-3 p-4 rounded-2xl border-2 border-transparent bg-slate-50 text-left hover:border-slate-200 transition-all opacity-50 cursor-not-allowed">
                  <div className="w-full aspect-video bg-slate-900 rounded-lg border border-slate-800 p-2 space-y-2 shadow-sm">
                    <div className="h-2 w-2/3 bg-slate-800 rounded" />
                    <div className="h-2 w-1/2 bg-slate-800 rounded" />
                    <div className="h-8 w-full bg-slate-800 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{t('settings.dark_mode')}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">{t('settings.soon')}</span>
                  </div>
                </button>
                <button className="flex flex-col gap-3 p-4 rounded-2xl border-2 border-transparent bg-slate-50 text-left hover:border-slate-200 transition-all opacity-50 cursor-not-allowed">
                  <div className="w-full aspect-video bg-slate-100 rounded-lg border border-slate-200 p-2 space-y-2 shadow-sm flex flex-col justify-end overflow-hidden">
                    <div className="h-1/2 w-full bg-slate-900 -mb-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{t('settings.system')}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">{t('settings.soon')}</span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

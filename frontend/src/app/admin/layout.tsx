'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  PlusSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Home,
  MessageSquare,
  BarChart3,
  Tags,
  FolderOpen
} from 'lucide-react';

import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const navItems = [
    { name: t('common.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('common.posts'), href: '/admin/posts', icon: FileText },
    { name: t('common.new_post'), href: '/admin/posts/new', icon: PlusSquare },
    { name: t('common.categories'), href: '/admin/categories', icon: FolderOpen },
    { name: t('common.tags'), href: '/admin/tags', icon: Tags },
    { name: t('common.comments'), href: '/admin/comments', icon: MessageSquare },
    { name: t('common.statistics'), href: '/admin/stats', icon: BarChart3 },
    { name: t('common.settings'), href: '/admin/settings', icon: Settings },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 w-64 fixed left-0 top-0 overflow-y-auto border-r border-slate-800/50 shadow-2xl">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3">
          <div className="bg-blue-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
            <span className="text-white -rotate-3">G</span>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Gerusta
          </span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {t('common.main_menu')}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/50 rounded-lg flex items-center gap-1.5">
                <span>{currentLanguage.flag}</span>
                <span>{currentLanguage.code.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-100 min-w-[120px] rounded-xl">
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center gap-2 cursor-pointer focus:bg-slate-800 focus:text-white px-3 py-2 ${i18n.language === lang.code ? 'bg-blue-600/10 text-blue-400' : ''}`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="text-xs font-bold">{lang.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 mt-auto">
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-inner">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">{user?.name || 'Admin'}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{user?.role}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 p-3 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all border border-slate-800/50"
            title={t('common.view_site')}
          >
            <Home className="h-4 w-4" />
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 p-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all border border-slate-800/50"
            title={t('common.logout')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-slate-950 text-white sticky top-0 z-50 border-b border-slate-800">
        <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg">G</div>
          <span>Gerusta</span>
        </h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-900">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-slate-950 border-r-slate-800 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-10 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
      
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

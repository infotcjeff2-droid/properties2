'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, User, LogOut, LogIn, Search } from 'lucide-react';
import { propertyStorage } from '@/lib/storage';
// 不再需要自動初始化假數據
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from '@/components/theme/ThemeToggle';

interface HeaderProps {
  userName?: string | null;
  userEmail?: string | null;
  isAuthenticated?: boolean;
}

export default function Header({ userName, userEmail, isAuthenticated = false }: HeaderProps) {
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 只有已登入用戶才顯示通知
    if (!isAuthenticated) {
      return;
    }

    // 不再自動初始化假數據
    
    const loadNotificationCount = () => {
      const allProperties = propertyStorage.getAll();
      // 獲取最近7天內新增的物業
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const newProps = allProperties.filter((prop: any) => {
        const createdAt = new Date(prop.createdAt);
        return createdAt >= sevenDaysAgo;
      });
      
      setNotificationCount(newProps.length);
    };

    const handleDataInitialized = () => {
      setTimeout(loadNotificationCount, 100);
    };

    window.addEventListener('dummyDataInitialized', handleDataInitialized);
    setTimeout(loadNotificationCount, 200);

    return () => {
      window.removeEventListener('dummyDataInitialized', handleDataInitialized);
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // 清除訪客訪問標記
      document.cookie = 'guest-access=; path=/; max-age=0';
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    // 清除訪客訪問標記，確保用戶可以正常登入
    if (typeof document !== 'undefined') {
      document.cookie = 'guest-access=; path=/; max-age=0';
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-64 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex-1 max-w-md">
          {/* 全局搜尋欄 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索編號、租客、地段..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* 主題切換 */}
          <ThemeToggle />

          {/* 通知圖標 - 只有已登入用戶才顯示 */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
              />
            </div>
          )}

          {/* 用戶信息或登入按鈕 */}
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userName || '用戶'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
                </div>
              </div>

              {/* 登出按鈕 */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                title="登出"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            /* 登入按鈕 */
            <button
              onClick={handleLogin}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">登入</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}


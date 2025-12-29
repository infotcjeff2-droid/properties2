'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { isGuest } from '@/lib/auth-client-utils';

export default function TenantPageContent() {
  const [isGuestUser, setIsGuestUser] = useState(false);

  useEffect(() => {
    setIsGuestUser(isGuest());
  }, []);
  return (
    <div className="p-6">
      {/* 標題和新增按鈕 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">承租人管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">管理所有承租人資訊</p>
        </div>
        {!isGuestUser && (
          <button
            onClick={() => alert('功能開發中...')}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
          >
            <Plus className="w-5 h-5" />
            <span>新增承租人</span>
          </button>
        )}
      </div>

      {/* 過濾欄 */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
          <option value="ALL">所有狀態</option>
          <option value="ACTIVE">活躍</option>
          <option value="INACTIVE">非活躍</option>
          <option value="BLACKLISTED">已列入黑名單</option>
        </select>
      </div>

      {/* 內容區域 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400 text-center py-12">功能開發中...</p>
      </div>
    </div>
  );
}


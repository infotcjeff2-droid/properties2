'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { isGuest } from '@/lib/auth-client-utils';
import Link from 'next/link';
import ProprietorList from '@/components/proprietors/ProprietorList';

export default function ProprietorPageContent() {
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [userRole, setUserRole] = useState<string | undefined>();

  useEffect(() => {
    setIsGuestUser(isGuest());
    // 獲取用戶角色（客戶端）
    const getUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user?.role);
        }
      } catch (error) {
        console.error('Failed to get user role:', error);
      }
    };
    getUserRole();
  }, []);

  return (
    <div className="p-6">
      {/* 標題和新增按鈕 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">資產擁有方</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">管理資產擁有方信息</p>
        </div>
        {!isGuestUser && (
          <Link
            href="/proprietor/new"
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
          >
            <Plus className="w-5 h-5" />
            <span>新增資產擁有方</span>
          </Link>
        )}
      </div>

      {/* 列表組件 */}
      <ProprietorList
        userRole={userRole}
      />
    </div>
  );
}


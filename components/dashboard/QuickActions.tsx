'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import { isGuest } from '@/lib/auth-client-utils';

export default function QuickActions() {
  const [isGuestUser, setIsGuestUser] = useState(false);

  useEffect(() => {
    setIsGuestUser(isGuest());
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {!isGuestUser && (
        <>
          <Link
            href="/properties/new"
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition"
          >
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">新增物業</span>
          </Link>
          <Link
            href="/contracts/new"
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition"
          >
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">新增合約</span>
          </Link>
          <Link
            href="/maintenance/new"
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition"
          >
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">新增修單</span>
          </Link>
        </>
      )}
      <Link
        href="/properties"
        className="flex items-center justify-center space-x-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition"
      >
        <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">查看所有物業</span>
      </Link>
    </div>
  );
}


'use client';

import Link from 'next/link';
import { Building2, Trash2 } from 'lucide-react';
import { isAdmin } from '@/lib/auth-client-utils';
import { proprietorStorage } from '@/lib/storage';
import { useRouter } from 'next/navigation';

interface Proprietor {
  id: string;
  code: string;
  englishName: string;
  type: string;
  property: string;
  shortName?: string;
  createdAt: string;
}

interface ProprietorCardProps {
  proprietor: Proprietor;
  userRole?: string;
  onDelete?: () => void;
}

const typeLabels: Record<string, string> = {
  GROUP_COMPANY: '集團旗下公司',
  JOINT_VENTURE: '合資公司',
  LANDLORD: '出租的業主',
  MANAGED_INDIVIDUAL: '代管理的個體',
};

export default function ProprietorCard({ proprietor, userRole, onDelete }: ProprietorCardProps) {
  const router = useRouter();
  const canDelete = userRole && isAdmin(userRole);
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`確定要刪除資產擁有方 "${proprietor.englishName || proprietor.code}" 嗎？此操作無法復原。`)) {
      return;
    }

    try {
      proprietorStorage.delete(proprietor.id);
      if (onDelete) {
        onDelete();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('刪除資產擁有方失敗:', error);
      alert('刪除資產擁有方失敗，請重試。');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
      <Link href={`/proprietor/${encodeURIComponent(proprietor.englishName || proprietor.id)}`} className="block">
        {/* 圖標區域 */}
        <div className="relative h-32 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center">
          <Building2 className="w-12 h-12 text-white" />
        </div>

        {/* 內容區域 */}
        <div className="p-4">
          {/* 擁有方代碼 */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{proprietor.code}</p>

          {/* 擁有方英文名稱 */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{proprietor.englishName}</h3>

          {/* 擁有方簡稱 */}
          {proprietor.shortName && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{proprietor.shortName}</p>
          )}

          {/* 擁有方信息 */}
          <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">類別:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {typeLabels[proprietor.type] || proprietor.type}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">性質:</span>
              <span className="text-gray-900 dark:text-white font-medium">{proprietor.property}</span>
            </div>
          </div>
        </div>
      </Link>
      
      {/* 刪除按鈕 */}
      {canDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition z-20 shadow-lg opacity-0 group-hover:opacity-100"
          title="刪除資產擁有方"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { proprietorStorage } from '@/lib/storage';
import ProprietorCard from './ProprietorCard';
import { isGuest } from '@/lib/auth-client-utils';

interface ProprietorListProps {
  userCompanyId?: string | null;
  userRole?: string;
}

export default function ProprietorList({ userCompanyId, userRole }: ProprietorListProps) {
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [proprietors, setProprietors] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    // 檢查是否為訪客
    setIsGuestUser(isGuest());
    
    // 只確保 proprietorStorage 已初始化，不重置其他數據
    if (typeof window !== 'undefined') {
      const proprietors = localStorage.getItem('pm_proprietors');
      if (!proprietors) {
        localStorage.setItem('pm_proprietors', JSON.stringify([]));
      }
    }
    
    const loadProprietors = () => {
      const allProprietors = proprietorStorage.getAll(userCompanyId || undefined);
      setProprietors(allProprietors);
    };

    // 立即載入數據
    setTimeout(loadProprietors, 100);
  }, [userCompanyId]);

  const filteredProprietors = proprietors.filter((proprietor) => {
    const matchesType = typeFilter === 'ALL' || proprietor.type === typeFilter;
    return matchesType;
  });

  return (
    <div>
      {/* 過濾欄 */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="ALL">所有類別</option>
          <option value="GROUP_COMPANY">集團旗下公司</option>
          <option value="JOINT_VENTURE">合資公司</option>
          <option value="LANDLORD">出租的業主</option>
          <option value="MANAGED_INDIVIDUAL">代管理的個體</option>
        </select>
      </div>

      {/* 統計信息 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">{filteredProprietors.length}</span> 個結果
        </div>
      </div>

      {/* 資產擁有方網格 - 4列布局 */}
      {filteredProprietors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProprietors.map((proprietor) => (
            <ProprietorCard 
              key={proprietor.id} 
              proprietor={proprietor} 
              userRole={userRole} 
              onDelete={() => {
                const allProprietors = proprietorStorage.getAll(userCompanyId || undefined);
                setProprietors(allProprietors);
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">沒有找到符合條件的資產擁有方</p>
        </div>
      )}
    </div>
  );
}


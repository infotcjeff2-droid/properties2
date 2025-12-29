'use client';

import { useEffect, useState } from 'react';
import { propertyStorage } from '@/lib/storage';
import PropertyCard from './PropertyCard';
import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { isGuest, isAdmin } from '@/lib/auth-client-utils';

export default function PropertyList({ userCompanyId, userRole }: { userCompanyId?: string | null; userRole?: string }) {
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [clearing, setClearing] = useState(false);
  const canAdmin = userRole && isAdmin(userRole);

  useEffect(() => {
    // 檢查是否為訪客
    setIsGuestUser(isGuest());
    
    // 載入物業數據的函數
    const loadProperties = () => {
      if (typeof window === 'undefined') return;
      
      // 確保所有必要的 localStorage 鍵都存在
      const requiredKeys = [
        'pm_properties',
        'pm_proprietors',
        'pm_tenants',
        'pm_renting_records',
        'pm_rent_out_records'
      ];
      
      requiredKeys.forEach(key => {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify([]));
        }
      });
      
      // 不再自動初始化 dummy data
      // 如果用戶需要數據，可以通過其他方式手動初始化
      
      // 載入物業數據
      const allProperties = propertyStorage.getAll(userCompanyId || undefined);
      setProperties(allProperties);
    };
    
    // 初始載入
    loadProperties();
    
    // 監聽物業更新和刪除事件（使用防抖避免過度更新）
    let debounceTimer: NodeJS.Timeout | null = null;
    const handlePropertyUpdate = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        loadProperties();
      }, 50);
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pm_properties') {
        handlePropertyUpdate();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('propertyUpdated', handlePropertyUpdate);
      window.addEventListener('propertyDeleted', handlePropertyUpdate);
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        window.removeEventListener('propertyUpdated', handlePropertyUpdate);
        window.removeEventListener('propertyDeleted', handlePropertyUpdate);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [userCompanyId]);

  const handleClearAll = () => {
    if (!confirm('確定要清除所有物業數據嗎？此操作將刪除所有物業、合同、維護訂單、交易記錄和相關數據，且無法復原！')) {
      return;
    }
    
    if (!confirm('再次確認：您真的要清除所有數據嗎？這是一個不可逆的操作！')) {
      return;
    }
    
    setClearing(true);
    try {
      propertyStorage.clearAll();
      // 重新載入數據（應該是空的）
      const allProperties = propertyStorage.getAll(userCompanyId || undefined);
      setProperties(allProperties);
      
      // 觸發頁面刷新以確保所有組件都更新
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('清除數據失敗:', error);
      alert('清除數據失敗，請重試。');
    } finally {
      setClearing(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesStatus = statusFilter === 'ALL' || property.status === statusFilter;
    
    return matchesStatus;
  });

  return (
    <div>
      {/* 過濾欄和操作按鈕 */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="ALL">所有狀態</option>
          <option value="HOLDING">持有中</option>
          <option value="SOLD">已售</option>
          <option value="LEASE_STOPPED">已停租</option>
        </select>
        
        {canAdmin && (
          <button
            onClick={handleClearAll}
            disabled={clearing || properties.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="清除所有物業數據（包括後台）"
          >
            <Trash2 className="w-4 h-4" />
            <span>{clearing ? '清除中...' : '清除所有數據'}</span>
          </button>
        )}
      </div>

      {/* 統計信息 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">{filteredProperties.length}</span> 個結果
          <span className="text-gray-500 dark:text-gray-500 ml-2">(持有中)</span>
        </div>
      </div>

      {/* 物業網格 - 4列布局 */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              userRole={userRole} 
              onDelete={() => {
                // 立即重新載入數據
                const allProperties = propertyStorage.getAll(userCompanyId || undefined);
                setProperties(allProperties);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">沒有找到符合條件的物業</p>
        </div>
      )}
    </div>
  );
}


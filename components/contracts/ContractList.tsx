'use client';

import { useEffect, useState } from 'react';
import { contractStorage, propertyStorage, tenantStorage } from '@/lib/storage';
// 不再需要自動初始化假數據
import ContractCard from './ContractCard';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { isGuest } from '@/lib/auth-client-utils';

export default function ContractList({ userCompanyId }: { userCompanyId?: string | null }) {
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    // 檢查是否為訪客
    setIsGuestUser(isGuest());
    
    // 不再自動初始化假數據
    
    const loadContracts = () => {
      const allContracts = contractStorage.getAll(userCompanyId || undefined);
      const properties = propertyStorage.getAll();
      const tenants = tenantStorage.getAll();
      
      // 關聯物業和租客信息
      const enrichedContracts = allContracts.map((contract: any) => ({
        ...contract,
        property: properties.find((p: any) => p.id === contract.propertyId),
        tenant: tenants.find((t: any) => t.id === contract.tenantId),
      }));
      
      setContracts(enrichedContracts);
    };

    // 監聽數據初始化事件
    const handleDataInitialized = () => {
      setTimeout(loadContracts, 100);
    };

    window.addEventListener('dummyDataInitialized', handleDataInitialized);
    setTimeout(loadContracts, 200);

    return () => {
      window.removeEventListener('dummyDataInitialized', handleDataInitialized);
    };
  }, [userCompanyId]);

  const filteredContracts = contracts.filter((contract) => {
    const matchesStatus = statusFilter === 'ALL' || contract.status === statusFilter;
    
    return matchesStatus;
  });

  return (
    <div>
      {/* 過濾欄 */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="ALL">所有狀態</option>
          <option value="ACTIVE">活躍</option>
          <option value="EXPIRED">已過期</option>
          <option value="TERMINATED">已終止</option>
        </select>
      </div>

      {/* 統計信息 */}
      <div className="mb-4 text-sm text-gray-600">
        共找到 {filteredContracts.length} 個合約
      </div>

      {/* 合約網格 */}
      {filteredContracts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">沒有找到符合條件的合約</p>
        </div>
      )}
    </div>
  );
}


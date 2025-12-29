'use client';

import { useEffect, useState } from 'react';
import { maintenanceStorage, propertyStorage, tenantStorage } from '@/lib/storage';
// 不再需要自動初始化假數據
import MaintenanceCard from './MaintenanceCard';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { isGuest } from '@/lib/auth-client-utils';

export default function MaintenanceList({ userCompanyId }: { userCompanyId?: string | null }) {
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  useEffect(() => {
    // 檢查是否為訪客
    setIsGuestUser(isGuest());
    
    // 不再自動初始化假數據
    
    const loadOrders = () => {
      const allOrders = maintenanceStorage.getAll(userCompanyId || undefined);
      const properties = propertyStorage.getAll();
      const tenants = tenantStorage.getAll();
      
      // 關聯物業和租客信息
      const enrichedOrders = allOrders.map((order: any) => ({
        ...order,
        property: properties.find((p: any) => p.id === order.propertyId),
        tenant: order.tenantId ? tenants.find((t: any) => t.id === order.tenantId) : null,
      }));
      
      setOrders(enrichedOrders);
    };

    // 監聽數據初始化事件
    const handleDataInitialized = () => {
      setTimeout(loadOrders, 100);
    };

    window.addEventListener('dummyDataInitialized', handleDataInitialized);
    setTimeout(loadOrders, 200);

    return () => {
      window.removeEventListener('dummyDataInitialized', handleDataInitialized);
    };
  }, [userCompanyId]);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || order.priority === priorityFilter;
    
    return matchesStatus && matchesPriority;
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
          <option value="PENDING">待處理</option>
          <option value="IN_PROGRESS">進行中</option>
          <option value="COMPLETED">已完成</option>
          <option value="CANCELLED">已取消</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="ALL">所有優先級</option>
          <option value="LOW">低</option>
          <option value="MEDIUM">中</option>
          <option value="HIGH">高</option>
          <option value="URGENT">緊急</option>
        </select>
      </div>

      {/* 統計信息 */}
      <div className="mb-4 text-sm text-gray-600">
        共找到 {filteredOrders.length} 個修單
      </div>

      {/* 修單網格 */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <MaintenanceCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">沒有找到符合條件的修單</p>
        </div>
      )}
    </div>
  );
}


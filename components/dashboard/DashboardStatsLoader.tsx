'use client';

import { useEffect, useState } from 'react';
import { propertyStorage, contractStorage, transactionStorage, maintenanceStorage } from '@/lib/storage';
// 不再需要自動初始化假數據
import StatCard from './StatCard';
import { Building2, FileText, DollarSign, Wrench } from 'lucide-react';

interface Stats {
  occupancyRate: { current: number; total: number; percentage: number };
  expiringContracts: { count: number; total: number };
  pendingPayments: { pending: number; overdue: number; total: number };
  maintenanceOrders: { recent: number; pending: number };
  postingRate: { percentage: number; available: number; total: number };
}

export default function DashboardStatsLoader({ userCompanyId }: { userCompanyId?: string | null }) {
  const [stats, setStats] = useState<Stats>({
    occupancyRate: { current: 0, total: 0, percentage: 0 },
    expiringContracts: { count: 0, total: 0 },
    pendingPayments: { pending: 0, overdue: 0, total: 0 },
    maintenanceOrders: { recent: 0, pending: 0 },
    postingRate: { percentage: 0, available: 0, total: 0 },
  });

  useEffect(() => {
    // 不再自動初始化假數據
    
    const loadData = () => {
      // 從 localStorage 獲取數據並計算統計
      const properties = propertyStorage.getAll(userCompanyId || undefined);
      const contracts = contractStorage.getAll(userCompanyId || undefined);
      const transactions = transactionStorage.getAll(userCompanyId || undefined);
      const maintenanceOrders = maintenanceStorage.getAll(userCompanyId || undefined);
      
      // #region agent log
      console.log('[DashboardStatsLoader] Loaded data:', {
        properties: properties.length,
        contracts: contracts.length,
        transactions: transactions.length,
        maintenanceOrders: maintenanceOrders.length,
      });
      // #endregion

    // 計算統計
    const totalProperties = properties.length;
    // 有活躍合約的物業數量
    const activeContractPropertyIds = new Set(
      contracts.filter((c: any) => c.status === 'ACTIVE').map((c: any) => c.propertyId)
    );
    const rentedProperties = activeContractPropertyIds.size;
    const occupancyRate = totalProperties > 0 
      ? Math.round((rentedProperties / totalProperties) * 100) 
      : 0;

    const activeContracts = contracts.filter((c: any) => c.status === 'ACTIVE').length;
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const now = new Date();
    const expiringContracts = contracts.filter((c: any) => {
      if (c.status !== 'ACTIVE') return false;
      const endDate = new Date(c.endDate);
      return endDate <= sevenDaysFromNow && endDate >= now;
    }).length;

    const pendingTransactions = transactions.filter((t: any) => 
      t.status === 'PENDING' && t.type === 'INCOME'
    ).length;
    const overdueTransactions = transactions.filter((t: any) => 
      t.status === 'OVERDUE' && t.type === 'INCOME'
    ).length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentMaintenanceOrders = maintenanceOrders.filter((o: any) => {
      const createdAt = new Date(o.createdAt);
      return createdAt >= sevenDaysAgo;
    }).length;
    const pendingMaintenanceOrders = maintenanceOrders.filter((o: any) => 
      o.status === 'PENDING'
    ).length;

    // 可招租物業 = 總物業 - 有活躍合約的物業
    const availableProperties = totalProperties - rentedProperties;
    const postingRate = totalProperties > 0 
      ? Math.round((availableProperties / totalProperties) * 100) 
      : 0;

    setStats({
      occupancyRate: {
        current: rentedProperties,
        total: totalProperties,
        percentage: occupancyRate,
      },
      expiringContracts: {
        count: expiringContracts,
        total: activeContracts,
      },
      pendingPayments: {
        pending: pendingTransactions,
        overdue: overdueTransactions,
        total: pendingTransactions + overdueTransactions,
      },
      maintenanceOrders: {
        recent: recentMaintenanceOrders,
        pending: pendingMaintenanceOrders,
      },
      postingRate: {
        percentage: postingRate,
        available: availableProperties,
        total: totalProperties,
      },
    });
    };
    
    // 監聽數據初始化事件
    const handleDataInitialized = () => {
      console.log('[DashboardStatsLoader] Data initialized event received');
      setTimeout(loadData, 50);
    };
    
    window.addEventListener('dummyDataInitialized', handleDataInitialized);
    
    // 立即嘗試加載（如果數據已存在）
    setTimeout(loadData, 200);
    
    return () => {
      window.removeEventListener('dummyDataInitialized', handleDataInitialized);
    };
  }, [userCompanyId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="即時物件出租率"
        value={`${stats.occupancyRate.current}/${stats.occupancyRate.total}`}
        subtitle={`${stats.occupancyRate.percentage}%`}
        icon={Building2}
        color="blue"
      />
      <StatCard
        title="即將到期合約"
        value={stats.expiringContracts.count}
        subtitle={`共 ${stats.expiringContracts.total} 個活躍合約`}
        icon={FileText}
        color="yellow"
      />
      <StatCard
        title="應到帳款項"
        value={stats.pendingPayments.total}
        subtitle={`待付: ${stats.pendingPayments.pending} | 逾期: ${stats.pendingPayments.overdue}`}
        icon={DollarSign}
        color="red"
      />
      <StatCard
        title="7日內修單"
        value={stats.maintenanceOrders.recent}
        subtitle={`待處理: ${stats.maintenanceOrders.pending}`}
        icon={Wrench}
        color="purple"
      />
    </div>
  );
}


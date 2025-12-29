// 強制初始化假數據的工具函數

import { generateDummyData } from './dummy-data';

const STORAGE_KEYS = {
  PROPERTIES: 'pm_properties',
  TENANTS: 'pm_tenants',
  CONTRACTS: 'pm_contracts',
  MAINTENANCE_ORDERS: 'pm_maintenance_orders',
  TRANSACTIONS: 'pm_transactions',
} as const;

export function initDummyData() {
  if (typeof window === 'undefined') return false;
  
  // 檢查是否是用戶主動清除的數據
  // 如果是，則不允許自動初始化
  const dataClearedByUser = localStorage.getItem('pm_data_cleared_by_user');
  if (dataClearedByUser === 'true') {
    console.log('[initDummyData] Data was cleared by user, skipping initialization');
    return false;
  }
  
  const dummyData = generateDummyData();
  
  // 強制設置假數據
  localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(dummyData.properties));
  localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(dummyData.tenants));
  localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(dummyData.contracts));
  localStorage.setItem(STORAGE_KEYS.MAINTENANCE_ORDERS, JSON.stringify(dummyData.maintenanceOrders));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(dummyData.transactions));
  
  console.log('[initDummyData] Dummy data initialized');
  return true;
}

// 自動初始化已移除
// 初始化邏輯現在由 lib/storage.ts 的 initStorage() 統一處理
// 這樣可以避免多處初始化導致的問題，並確保正確檢查 pm_data_cleared_by_user 標記


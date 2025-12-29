'use client';

import { useState } from 'react';
import { initDummyData } from '@/lib/init-dummy-data';

export default function ForceInitButton() {
  const [loading, setLoading] = useState(false);

  const handleForceInit = () => {
    if (typeof window === 'undefined') return;
    
    setLoading(true);
    
    // 清除所有相關的 localStorage 數據
    const keys = [
      'pm_properties',
      'pm_tenants',
      'pm_contracts',
      'pm_maintenance_orders',
      'pm_transactions',
    ];
    
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('[ForceInitButton] Cleared localStorage, initializing...');
    
    // 初始化假數據
    initDummyData();
    
    // 觸發事件通知其他組件
    window.dispatchEvent(new CustomEvent('dummyDataInitialized'));
    
    setTimeout(() => {
      setLoading(false);
      // 刷新頁面
      window.location.reload();
    }, 500);
  };

  return (
    <button
      onClick={handleForceInit}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
    >
      {loading ? '初始化中...' : '強制初始化假數據'}
    </button>
  );
}


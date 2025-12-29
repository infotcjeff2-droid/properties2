'use client';

import { useEffect } from 'react';

export default function DataInitializer() {
  useEffect(() => {
    // 完全禁用自動初始化假數據
    // 假數據只能通過手動方式（如 ForceInitButton）初始化
    if (typeof window !== 'undefined') {
      console.log('[DataInitializer] Auto-initialization disabled. Use ForceInitButton to manually initialize dummy data if needed.');
    }
  }, []); // 空依賴數組，確保只執行一次

  return null; // 這個組件不渲染任何內容
}


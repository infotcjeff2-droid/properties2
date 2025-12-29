'use client';

import { useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 確保只在客戶端執行
    if (typeof window === 'undefined') return;

    // 監聽主題變化事件（由 ThemeToggle 觸發）
    const handleThemeChange = () => {
      if (typeof window !== 'undefined') {
        const theme = localStorage.getItem('theme') || 'light';
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    // 不在此處調用 handleThemeChange()，因為腳本已經在 head 中設置了
    // 只在監聽主題變化事件時才更新（避免 hydration 錯誤）

    // 監聽自定義主題變化事件
    window.addEventListener('themechange', handleThemeChange);

    return () => {
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  return <>{children}</>;
}


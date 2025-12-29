'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 檢查是否已登入（只在組件掛載時檢查一次）
  useEffect(() => {
    // 確保只在客戶端執行
    if (typeof window === 'undefined') return;
    
    // 如果正在登入中，不檢查認證狀態
    if (loading) return;
    
    const checkAuth = async () => {
      try {
        // 等待一小段時間，確保任何重定向後的 cookie 都已保存
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // 確保發送 cookie
        });
        if (response.ok) {
          const data = await response.json();
          // 已登入，處理重定向
          const urlParams = new URLSearchParams(window.location.search);
          const redirectPath = urlParams.get('redirect');
          
          if (redirectPath) {
            // 如果有 redirect 參數，重定向到該頁面
            window.location.href = redirectPath;
          } else {
            // 否則根據角色重定向
            if (data.user && data.user.role === 'SUPER_ADMIN') {
              window.location.href = '/dashboard';
            } else {
              window.location.href = '/properties';
            }
          }
        }
        // 如果未登入，不自動重定向，讓用戶選擇登入或直接進入
      } catch (err) {
        // 忽略錯誤，繼續顯示登入頁面
      }
    };

    // 延遲執行，確保組件已完全掛載
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [loading]); // 依賴 loading，避免在登入過程中檢查

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:45',message:'Login form submitted',data:{email,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'login-debug',hypothesisId:'HYP-6'})}).catch(()=>{});
    // #endregion

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 確保接收和發送 cookie
        body: JSON.stringify({ email, password }),
      });

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:58',message:'Login response received',data:{status:response.status,ok:response.ok,hasCookies:document.cookie.includes('auth-token')},timestamp:Date.now(),sessionId:'debug-session',runId:'login-debug',hypothesisId:'HYP-6'})}).catch(()=>{});
      // #endregion

      const data = await response.json();

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:62',message:'Login response parsed',data:{success:data.success,hasUser:!!data.user,userRole:data.user?.role,error:data.error,hasCookies:document.cookie.includes('auth-token')},timestamp:Date.now(),sessionId:'debug-session',runId:'login-debug',hypothesisId:'HYP-6'})}).catch(()=>{});
      // #endregion

      if (!response.ok) {
        // 提供更詳細的錯誤信息
        let errorMessage = data.error || '登入失敗';
        if (response.status === 500) {
          errorMessage = '服務器錯誤：請檢查數據庫連接和環境變數設置';
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // 登入成功，等待一小段時間確保 cookie 已保存到瀏覽器
      // httpOnly cookie 會在響應頭中設置，瀏覽器會自動保存
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 可選：驗證 cookie 是否已設置（但不阻塞重定向）
      // 因為 httpOnly cookie 需要完整頁面重新加載才能被服務器端讀取
      try {
        const verifyResponse = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('[Login] Cookie verified before redirect:', verifyData);
        } else {
          console.warn('[Login] Cookie verification failed, but continuing with redirect:', verifyResponse.status);
          // 即使驗證失敗，也繼續重定向（可能是時序問題，重定向後會重新驗證）
        }
      } catch (verifyErr) {
        console.warn('[Login] Cookie verification error, but continuing with redirect:', verifyErr);
        // 即使驗證失敗，也繼續重定向
      }
      
      // 進行重定向
      // 先檢查 URL 中的 redirect 參數
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect');
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:75',message:'Before redirect',data:{redirectPath,userRole:data.user?.role,success:data.success},timestamp:Date.now(),sessionId:'debug-session',runId:'login-debug',hypothesisId:'HYP-4'})}).catch(()=>{});
      // #endregion
      
      // 使用 window.location.href 進行完整頁面重定向
      // 這樣可以確保 cookie 被正確保存和讀取
      // httpOnly cookie 需要完整頁面重新加載才能被服務器端讀取
      if (redirectPath) {
        // 如果有 redirect 參數，重定向到該頁面
        window.location.href = redirectPath;
      } else {
        // 否則根據角色決定重定向位置
        // 只有 SUPER_ADMIN 重定向到 dashboard，其他角色重定向到 properties
        if (data.user && data.user.role === 'SUPER_ADMIN') {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/properties';
        }
      }
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:89',message:'Login error caught',data:{errorMessage:err?.message,errorName:err?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'login-debug',hypothesisId:'HYP-6'})}).catch(()=>{});
      // #endregion
      setError('登入失敗，請稍後再試');
      setLoading(false);
    }
  };

  const handleDirectAccess = async () => {
    setError('');
    setLoading(true);

    try {
      // 獲取重定向路徑
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect') || '/properties';

      // 調用 API 設置訪客訪問 cookie
      const response = await fetch(`/api/auth/guest-access?redirect=${encodeURIComponent(redirectPath)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '設置訪客訪問失敗');
        setLoading(false);
        return;
      }

      // 重定向到目標頁面（使用完整頁面重定向以確保 cookie 設置）
      window.location.href = redirectPath;
    } catch (err) {
      setError('設置訪客訪問失敗，請稍後再試');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            物業管理系統
          </h1>
          <p className="text-gray-600 dark:text-gray-400">請登入您的帳號</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              電子郵件
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              密碼
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">或</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDirectAccess}
            disabled={loading}
            className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {loading ? '處理中...' : '直接進入'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>只有管理員可以創建新公司和使用者</p>
        </div>
      </div>
    </div>
  );
}


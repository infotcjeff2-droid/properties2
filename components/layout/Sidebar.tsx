'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  ArrowLeftRight,
  ArrowRight,
  List,
  User,
  Users,
  LayoutDashboard
} from 'lucide-react';
import { clsx } from 'clsx';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  labelEn: string;
  path: string;
  id: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { 
    icon: LayoutDashboard, 
    label: '儀表板', 
    labelEn: 'Dashboard',
    path: '/dashboard',
    id: 'dashboard',
    adminOnly: true // 只有管理員可以看到
  },
  { 
    icon: Building2, 
    label: '物業', 
    labelEn: 'Properties',
    path: '/properties',
    id: 'properties'
  },
  { 
    icon: ArrowLeftRight, 
    label: '交租', 
    labelEn: 'Renting',
    path: '/renting',
    id: 'renting'
  },
  { 
    icon: ArrowRight, 
    label: '收租', 
    labelEn: 'Rent Out',
    path: '/rent-out',
    id: 'rent-out'
  },
  { 
    icon: User, 
    label: '資產擁有方', 
    labelEn: 'Proprietor',
    path: '/proprietor',
    id: 'proprietor'
  },
  { 
    icon: Users, 
    label: '承租人', 
    labelEn: 'Tenants',
    path: '/tenants',
    id: 'tenants'
  },
  { 
    icon: List, 
    label: '關聯表', 
    labelEn: 'Show All',
    path: '/show-all',
    id: 'show-all'
  },
];

interface SidebarProps {
  userRole?: string | null;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // 移除調試代碼，避免無限請求
  // #region agent log (disabled)
  // if (typeof window !== 'undefined') {
  //   fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Sidebar.tsx:100',message:'Sidebar render',data:{pathname,mounted,userRole,isClient:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // }
  // #endregion

  useEffect(() => {
    // 移除調試代碼，避免無限請求
    // #region agent log (disabled)
    // fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Sidebar.tsx:105',message:'Sidebar useEffect',data:{pathname,mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    setMounted(true);
  }, []);

  // 根據角色過濾菜單項
  const filteredMenuItems = menuItems.filter(item => {
    // 如果是管理員專用項目，只對 SUPER_ADMIN 顯示
    if (item.adminOnly && userRole !== 'SUPER_ADMIN') {
      return false;
    }
    // 如果是 team 項目，只對 SUPER_ADMIN 和 COMPANY_ADMIN 顯示
    if (item.id === 'team' && userRole !== 'SUPER_ADMIN' && userRole !== 'COMPANY_ADMIN') {
      return false;
    }
    return true;
  });

  return (
    <div className="w-64 bg-gray-900 dark:bg-gray-950 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">物業管理系統</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Property Management</p>
      </div>

      <nav className="mt-8">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
                  // 只在客戶端掛載後才檢查路徑匹配，確保服務器和客戶端初始渲染一致
          // 服務器端渲染時始終返回 false，避免 hydration 錯誤
          const isActive = mounted && pathname ? (pathname === item.path || pathname.startsWith(item.path + '/')) : false;
          
          // 移除調試代碼，避免無限請求
          // #region agent log (disabled)
          // if (typeof window !== 'undefined' && item.id === 'dashboard') {
          //   fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Sidebar.tsx:137',message:'Menu item active check',data:{itemPath:item.path,pathname,mounted,isActive},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
          // }
          // #endregion
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={clsx(
                'flex items-center px-6 py-3 text-gray-300 dark:text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-800 hover:text-white transition-colors',
                isActive && 'bg-gray-800 dark:bg-gray-800 text-white border-l-4 border-blue-500'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.labelEn}</span>
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}


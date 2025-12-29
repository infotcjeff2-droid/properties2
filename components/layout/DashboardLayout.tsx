import { getAuthUser } from '@/lib/auth-utils';
import Sidebar from './Sidebar';
import Header from './Header';
import { userStorage } from '@/lib/storage';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getAuthUser();

  // 獲取用戶完整信息（包括姓名）
  // 注意：在服務器端無法訪問 localStorage，所以使用基本信息
  // 實際的用戶名將在客戶端組件中獲取
  const userName = user?.email || null;
  const userEmail = user?.email || null;
  const userRole = user?.role || null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar userRole={userRole} />
      <div className="flex-1 ml-64">
        <Header 
          userName={userName} 
          userEmail={userEmail}
          isAuthenticated={!!user}
        />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}


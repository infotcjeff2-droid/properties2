import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import dynamic from 'next/dynamic';
import MaintenanceList from '@/components/maintenance/MaintenanceList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

// 動態導入客戶端組件
const DataInitializer = dynamic(
  () => import('@/components/dashboard/DataInitializer'),
  { ssr: false }
);

export default async function MaintenancePage() {
  const user = await getAuthUser();

  return (
    <DashboardLayout>
      <DataInitializer />
      <div className="p-6">
        {/* 標題和新增按鈕 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">修繕管理</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">管理修繕訂單</p>
          </div>
          {user && (
            <Link
              href="/maintenance/new"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
            >
              <Plus className="w-5 h-5" />
              <span>新增修單</span>
            </Link>
          )}
        </div>

        <MaintenanceList userCompanyId={user?.companyId || null} />
      </div>
    </DashboardLayout>
  );
}


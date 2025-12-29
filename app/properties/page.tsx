import DashboardLayout from '@/components/layout/DashboardLayout';
import dynamicImport from 'next/dynamic';
import PropertyList from '@/components/properties/PropertyList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

// 靜態導出模式：認證將在客戶端處理

// 動態導入客戶端組件
const DataInitializer = dynamicImport(
  () => import('@/components/dashboard/DataInitializer'),
  { ssr: false }
);

export default function PropertiesPage() {
  // 靜態導出模式下，認證在客戶端處理
  const user = null;

  return (
    <DashboardLayout>
      <DataInitializer />
      <div className="p-6">
        {/* 標題和新增按鈕 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">物業管理</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">管理所有物業資訊</p>
          </div>
          {user && (
            <Link
              href="/properties/new"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
            >
              <Plus className="w-5 h-5" />
              <span>新增物業</span>
            </Link>
          )}
        </div>

        <PropertyList userCompanyId={user?.companyId || null} userRole={user?.role} />
      </div>
    </DashboardLayout>
  );
}


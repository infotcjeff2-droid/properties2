import DashboardLayout from '@/components/layout/DashboardLayout';
import dynamicImport from 'next/dynamic';
import QuickActions from '@/components/dashboard/QuickActions';

// 靜態導出模式：認證將在客戶端處理

// 動態導入客戶端組件，禁用 SSR 以避免 hydration 錯誤
const DataInitializer = dynamicImport(
  () => import('@/components/dashboard/DataInitializer'),
  { ssr: false }
);

const ForceInitButton = dynamicImport(
  () => import('@/components/dashboard/ForceInitButton'),
  { ssr: false }
);

const DashboardStatsLoader = dynamicImport(
  () => import('@/components/dashboard/DashboardStatsLoader'),
  { ssr: false }
);

const FinancialChart = dynamicImport(
  () => import('@/components/dashboard/FinancialChart'),
  { ssr: false }
);

const PostingRateChart = dynamicImport(
  () => import('@/components/dashboard/PostingRateChart'),
  { ssr: false }
);

// 靜態導出模式：所有認證和重定向邏輯在客戶端處理
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DataInitializer />
      <div className="p-6">
        {/* 頁面標題 */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">管理儀表板</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">物件狀態、收支情況一目了然！</p>
          </div>
          <ForceInitButton />
        </div>

        {/* 統計卡片 - 從 localStorage 加載 */}
        <DashboardStatsLoader userCompanyId={null} />

        {/* 圖表和快捷操作 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 招租廣告刊登率 */}
          <div className="lg:col-span-1">
            <PostingRateChart />
          </div>

          {/* 收支情況 */}
          <div className="lg:col-span-2">
            <FinancialChart />
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快捷操作</h3>
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
}

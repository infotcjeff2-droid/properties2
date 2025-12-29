import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import dynamicImport from 'next/dynamic';
import QuickActions from '@/components/dashboard/QuickActions';

// 強制動態渲染，因為需要使用 cookies()
export const dynamic = 'force-dynamic';

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

async function getDashboardStats() {
  // 使用 localStorage 的數據將在客戶端獲取
  // 服務器端返回默認值
  return {
    stats: {
      occupancyRate: { current: 0, total: 0, percentage: 0 },
      expiringContracts: { count: 0, total: 0 },
      pendingPayments: { pending: 0, overdue: 0, total: 0 },
      maintenanceOrders: { recent: 0, pending: 0 },
      postingRate: { percentage: 0, available: 0, total: 0 },
    },
  };
}

export default async function DashboardPage() {
  console.log('[dashboard/page] Checking authentication...');
  const user = await getAuthUser();

  if (!user) {
    console.log('[dashboard/page] No user found, redirecting to login');
    redirect('/login');
  }

  console.log('[dashboard/page] User found:', user.email, 'Role:', user.role);

  // 只有 SUPER_ADMIN 可以訪問 dashboard
  if (user.role !== 'SUPER_ADMIN') {
    console.log('[dashboard/page] User is not SUPER_ADMIN, showing access denied');
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Access Denied</h2>
            <p className="text-red-700 dark:text-red-300">
              您沒有權限訪問此頁面。只有管理員可以訪問儀表板。
            </p>
            <p className="text-red-600 dark:text-red-400 mt-2 text-sm">
              You do not have permission to access this page. Only administrators can access the dashboard.
            </p>
            <div className="mt-4">
              <a
                href="/properties"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                返回物業頁面
              </a>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
        <DashboardStatsLoader userCompanyId={user.companyId} />

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

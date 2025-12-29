import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import dynamicImport from 'next/dynamic';
import MaintenanceDetail from '@/components/maintenance/MaintenanceDetail';

// 動態導入客戶端組件
const DataInitializer = dynamicImport(
  () => import('@/components/dashboard/DataInitializer'),
  { ssr: false }
);

// 為靜態導出生成參數
// 返回一個占位符參數，實際路由將在客戶端處理
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

// 靜態導出模式：generateStaticParams 返回空數組表示所有路由在運行時生成

export default async function MaintenanceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <DataInitializer />
      <div className="p-6">
        <MaintenanceDetail orderId={params.id} userRole={user.role} />
      </div>
    </DashboardLayout>
  );
}


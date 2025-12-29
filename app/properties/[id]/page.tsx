import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import dynamicImport from 'next/dynamic';
import PropertyDetail from '@/components/properties/PropertyDetail';

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

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getAuthUser();

  return (
    <DashboardLayout>
      <DataInitializer />
      <div className="p-6">
        <PropertyDetail propertyId={params.id} userRole={user?.role} />
      </div>
    </DashboardLayout>
  );
}


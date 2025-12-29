import DashboardLayout from '@/components/layout/DashboardLayout';
import dynamicImport from 'next/dynamic';
import ContractDetail from '@/components/contracts/ContractDetail';

// 動態導入客戶端組件
const DataInitializer = dynamicImport(
  () => import('@/components/dashboard/DataInitializer'),
  { ssr: false }
);

// 為靜態導出生成參數
// 返回空數組，允許所有動態路由在客戶端處理
export async function generateStaticParams() {
  return [];
}

// 允許動態參數（在靜態導出模式下）
export const dynamicParams = true;

export default function ContractDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // 靜態導出模式：認證在客戶端處理
  const user = null;

  return (
    <DashboardLayout>
      <DataInitializer />
      <div className="p-6">
        <ContractDetail contractId={params.id} userRole={user.role} />
      </div>
    </DashboardLayout>
  );
}


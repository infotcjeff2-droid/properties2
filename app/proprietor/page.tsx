import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import dynamic from 'next/dynamic';
import ProprietorPageContent from '@/components/pages/ProprietorPageContent';

// 動態導入客戶端組件
const DataInitializer = dynamic(
  () => import('@/components/dashboard/DataInitializer'),
  { ssr: false }
);

export default async function ProprietorPage() {
  const user = await getAuthUser();

  return (
    <DashboardLayout>
      <DataInitializer />
      <ProprietorPageContent />
    </DashboardLayout>
  );
}


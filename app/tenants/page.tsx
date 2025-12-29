import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TenantPageContent from '@/components/pages/TenantPageContent';

export default async function TenantsPage() {
  return (
    <DashboardLayout>
      <TenantPageContent />
    </DashboardLayout>
  );
}

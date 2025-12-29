import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ShowAllPageContent from '@/components/pages/ShowAllPageContent';

export default async function ShowAllPage() {
  return (
    <DashboardLayout>
      <ShowAllPageContent />
    </DashboardLayout>
  );
}


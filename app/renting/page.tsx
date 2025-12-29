import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RentingPageContent from '@/components/pages/RentingPageContent';

export default async function RentingPage() {
  return (
    <DashboardLayout>
      <RentingPageContent />
    </DashboardLayout>
  );
}


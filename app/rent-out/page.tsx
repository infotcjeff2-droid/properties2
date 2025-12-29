import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RentOutPageContent from '@/components/pages/RentOutPageContent';

export default async function RentOutPage() {
  return (
    <DashboardLayout>
      <RentOutPageContent />
    </DashboardLayout>
  );
}


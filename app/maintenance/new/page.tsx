import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MaintenanceForm from '@/components/forms/MaintenanceForm';

export default async function NewMaintenancePage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">新增修單</h1>
          <p className="text-gray-600 mt-1">創建新的修繕訂單</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <MaintenanceForm />
        </div>
      </div>
    </DashboardLayout>
  );
}


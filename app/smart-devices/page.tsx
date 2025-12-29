import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function SmartDevicesPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">智能設備</h1>
          <p className="text-gray-600 mt-1">管理智能家居設備</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">智能設備功能開發中...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}


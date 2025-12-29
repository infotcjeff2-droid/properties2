import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function TeamPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">團隊管理</h1>
          <p className="text-gray-600 mt-1">管理團隊成員</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">團隊管理功能開發中...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}


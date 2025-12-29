import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PropertyForm from '@/components/forms/PropertyForm';

export default async function NewPropertyPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">新增物業</h1>
          <p className="text-gray-600 mt-1">填寫物業基本信息</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <PropertyForm />
        </div>
      </div>
    </DashboardLayout>
  );
}


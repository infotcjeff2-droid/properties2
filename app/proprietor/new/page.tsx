import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProprietorForm from '@/components/forms/ProprietorForm';

export default async function NewProprietorPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">新增資產擁有方</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">填寫資產擁有方基本信息</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <ProprietorForm />
        </div>
      </div>
    </DashboardLayout>
  );
}


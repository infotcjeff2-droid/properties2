import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContractForm from '@/components/forms/ContractForm';

export default async function NewContractPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">新增合約</h1>
          <p className="text-gray-600 mt-1">創建新的租賃合約</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ContractForm />
        </div>
      </div>
    </DashboardLayout>
  );
}


import { redirect } from 'next/navigation';
import { getAuthUser, isAdmin } from '@/lib/auth-utils';

export default async function AdminPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  if (!isAdmin(user.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">系統管理</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">公司管理</h2>
            <p className="text-gray-600 mb-4">創建和管理公司帳號</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              管理公司
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">用戶管理</h2>
            <p className="text-gray-600 mb-4">創建和管理系統用戶</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              管理用戶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


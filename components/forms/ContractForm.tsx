'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { contractStorage, propertyStorage, tenantStorage } from '@/lib/storage';
// 不再需要自動初始化假數據

export default function ContractForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    deposit: '',
  });

  useEffect(() => {
    // 不再自動初始化假數據
    setProperties(propertyStorage.getAll());
    setTenants(tenantStorage.getAll());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const contractData = {
        companyId: null,
        propertyId: formData.propertyId,
        tenantId: formData.tenantId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        rentAmount: parseFloat(formData.rentAmount),
        deposit: formData.deposit ? parseFloat(formData.deposit) : null,
        status: 'ACTIVE',
        documentUrl: null,
      };

      contractStorage.create(contractData);
      
      router.push('/contracts');
      router.refresh();
    } catch (err: any) {
      setError(err.message || '創建合約失敗');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 選擇物業 */}
        <div>
          <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-2">
            物業 <span className="text-red-500">*</span>
          </label>
          <select
            id="propertyId"
            value={formData.propertyId}
            onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">請選擇物業</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.propertyNumber} - {prop.name}
              </option>
            ))}
          </select>
        </div>

        {/* 選擇租客 */}
        <div>
          <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-2">
            租客 <span className="text-red-500">*</span>
          </label>
          <select
            id="tenantId"
            value={formData.tenantId}
            onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">請選擇租客</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} ({tenant.email || tenant.phone})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            如果沒有租客，請先到租客管理頁面創建
          </p>
        </div>

        {/* 開始日期 */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            開始日期 <span className="text-red-500">*</span>
          </label>
          <input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* 結束日期 */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            結束日期 <span className="text-red-500">*</span>
          </label>
          <input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* 租金 */}
        <div>
          <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700 mb-2">
            月租金 (HKD) <span className="text-red-500">*</span>
          </label>
          <input
            id="rentAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.rentAmount}
            onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="例如: 50000"
          />
        </div>

        {/* 押金 */}
        <div>
          <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 mb-2">
            押金 (HKD)
          </label>
          <input
            id="deposit"
            type="number"
            step="0.01"
            min="0"
            value={formData.deposit}
            onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="例如: 100000"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? '創建中...' : '創建合約'}
        </button>
      </div>
    </form>
  );
}


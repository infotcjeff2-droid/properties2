'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { maintenanceStorage, propertyStorage, tenantStorage } from '@/lib/storage';
// 不再需要自動初始化假數據

export default function MaintenanceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedTo: '',
    cost: '',
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
      const orderData = {
        companyId: null,
        propertyId: formData.propertyId,
        tenantId: formData.tenantId || null,
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        status: 'PENDING',
        assignedTo: formData.assignedTo || null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };

      maintenanceStorage.create(orderData);
      
      router.push('/maintenance');
      router.refresh();
    } catch (err: any) {
      setError(err.message || '創建修單失敗');
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
            租客
          </label>
          <select
            id="tenantId"
            value={formData.tenantId}
            onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">無（非租客相關）</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} ({tenant.email || tenant.phone})
              </option>
            ))}
          </select>
        </div>

        {/* 標題 */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            標題 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="例如: 水龍頭漏水"
          />
        </div>

        {/* 描述 */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            描述
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="詳細描述修繕問題..."
          />
        </div>

        {/* 優先級 */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            優先級 <span className="text-red-500">*</span>
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="LOW">低</option>
            <option value="MEDIUM">中</option>
            <option value="HIGH">高</option>
            <option value="URGENT">緊急</option>
          </select>
        </div>

        {/* 分配給 */}
        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
            分配給
          </label>
          <input
            id="assignedTo"
            type="text"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="員工姓名或 ID"
          />
        </div>

        {/* 預估成本 */}
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
            預估成本 (HKD)
          </label>
          <input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="例如: 5000"
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
          {loading ? '創建中...' : '創建修單'}
        </button>
      </div>
    </form>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { proprietorStorage } from '@/lib/storage';

interface ProprietorFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  proprietorId?: string; // 編輯模式時傳入
}

export default function ProprietorForm({ onSuccess, onCancel, proprietorId }: ProprietorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = !!proprietorId;
  
  const [formData, setFormData] = useState({
    code: '', // 擁有方代碼
    englishName: '', // 擁有方英文名稱
    type: 'GROUP_COMPANY', // 擁有人類別
    property: '', // 擁有方性質 (公司/個人)
    shortName: '', // 擁有方簡稱
  });

  // 如果是編輯模式，載入現有數據
  useEffect(() => {
    if (isEditMode && proprietorId) {
      // 只確保 proprietorStorage 已初始化，不重置其他數據
      if (typeof window !== 'undefined') {
        const proprietors = localStorage.getItem('pm_proprietors');
        if (!proprietors) {
          localStorage.setItem('pm_proprietors', JSON.stringify([]));
        }
      }
      const proprietor = proprietorStorage.getById(proprietorId);
      if (proprietor) {
        setFormData({
          code: proprietor.code || '',
          englishName: proprietor.englishName || '',
          type: proprietor.type || 'GROUP_COMPANY',
          property: proprietor.property || '',
          shortName: proprietor.shortName || '',
        });
      }
    }
  }, [isEditMode, proprietorId]);

  const proprietorTypes = [
    { value: 'GROUP_COMPANY', label: '集團旗下公司' },
    { value: 'JOINT_VENTURE', label: '合資公司' },
    { value: 'LANDLORD', label: '出租的業主' },
    { value: 'MANAGED_INDIVIDUAL', label: '代管理的個體' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 驗證必填欄位
      if (!formData.code.trim()) {
        setError('請輸入擁有方代碼');
        setLoading(false);
        return;
      }

      if (!formData.englishName.trim()) {
        setError('請輸入擁有方英文名稱');
        setLoading(false);
        return;
      }

      if (!formData.property.trim()) {
        setError('請輸入擁有方性質');
        setLoading(false);
        return;
      }

      // 只確保 proprietorStorage 已初始化，不重置其他數據
      if (typeof window !== 'undefined') {
        const proprietors = localStorage.getItem('pm_proprietors');
        if (!proprietors) {
          localStorage.setItem('pm_proprietors', JSON.stringify([]));
        }
      }

      const proprietorData = {
        code: formData.code.trim(),
        englishName: formData.englishName.trim(),
        type: formData.type,
        property: formData.property.trim(),
        shortName: formData.shortName.trim() || null,
        companyId: null, // 可以根據需要設置
      };

      if (isEditMode && proprietorId) {
        // 更新模式
        proprietorStorage.update(proprietorId, proprietorData);
      } else {
        // 創建模式
        proprietorStorage.create(proprietorData);
      }
      
      // 觸發成功回調
      if (onSuccess) {
        onSuccess();
      } else {
        // 跳轉回列表頁
        router.push('/proprietor');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || '創建資產擁有方失敗');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左側欄位 */}
        <div className="space-y-4">
          {/* 擁有方代碼 */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proprietor Code 擁有方代碼 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="輸入擁有方代碼"
              required
            />
          </div>

          {/* 擁有方英文名稱 */}
          <div>
            <label htmlFor="englishName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proprietor English Name 擁有方英文名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="englishName"
              value={formData.englishName}
              onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="輸入擁有方英文名稱"
              required
            />
          </div>

          {/* 擁有人類別 */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proprietor Type 擁有人類別
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {proprietorTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 右側欄位 */}
        <div className="space-y-4">
          {/* 擁有方性質 */}
          <div>
            <label htmlFor="property" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proprietor Property 擁有方性質 <span className="text-red-500">*</span>
            </label>
            <select
              id="property"
              value={formData.property}
              onChange={(e) => setFormData({ ...formData, property: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="">-- 請選擇 --</option>
              <option value="公司">公司</option>
              <option value="個人">個人</option>
            </select>
          </div>

          {/* 擁有方簡稱 */}
          <div>
            <label htmlFor="shortName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proprietor Short Name 擁有方簡稱
            </label>
            <input
              type="text"
              id="shortName"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="輸入擁有方簡稱"
            />
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? (isEditMode ? '更新中...' : '創建中...') : (isEditMode ? '更新' : '創建')}
        </button>
      </div>
    </form>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { contractStorage, propertyStorage, tenantStorage } from '@/lib/storage';
// 不再需要自動初始化假數據
import { FileText, Calendar, DollarSign, User, Building2, Edit, Save, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth-client-utils';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  TERMINATED: 'bg-red-100 text-red-800',
};

export default function ContractDetail({ contractId, userRole }: { contractId: string; userRole?: string }) {
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const canEdit = userRole && isAdmin(userRole);

  useEffect(() => {
    // 不再自動初始化假數據
    
    const loadContract = () => {
      const contractData = contractStorage.getById(contractId);
      if (contractData) {
        setContract(contractData);
        const propertyData = propertyStorage.getById(contractData.propertyId);
        const tenantData = tenantStorage.getById(contractData.tenantId);
        setProperty(propertyData);
        setTenant(tenantData);
      }
      setLoading(false);
    };

    const handleDataInitialized = () => {
      setTimeout(loadContract, 100);
    };

    window.addEventListener('dummyDataInitialized', handleDataInitialized);
    setTimeout(loadContract, 200);

    return () => {
      window.removeEventListener('dummyDataInitialized', handleDataInitialized);
    };
  }, [contractId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">載入中...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">找不到此合約</p>
        <Link href="/contracts" className="text-blue-600 dark:text-blue-400 hover:underline">
          返回合約列表
        </Link>
      </div>
    );
  }

  const isExpiringSoon = () => {
    if (!contract.endDate) return false;
    const endDate = new Date(contract.endDate);
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    return endDate <= sevenDaysLater && endDate >= now;
  };

  return (
    <div>
      {/* 標題欄 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/contracts"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">租賃合約</h1>
            <p className="text-gray-600 mt-1">合約詳情</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="w-4 h-4" />
                <span>編輯</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSaving(true);
                    const updated = contractStorage.update(contractId, {
                      ...editForm,
                      startDate: new Date(editForm.startDate).toISOString(),
                      endDate: new Date(editForm.endDate).toISOString(),
                      rentAmount: parseFloat(editForm.rentAmount),
                      deposit: editForm.deposit ? parseFloat(editForm.deposit) : null,
                    });
                    setContract(updated);
                    setIsEditing(false);
                    setSaving(false);
                    router.refresh();
                  }}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? '保存中...' : '保存'}</span>
                </button>
                <button
                  onClick={() => {
                    setEditForm({
                      startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
                      endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
                      rentAmount: contract.rentAmount || '',
                      deposit: contract.deposit || '',
                      status: contract.status || 'ACTIVE',
                    });
                    setIsEditing(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <X className="w-4 h-4" />
                  <span>取消</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 主要信息卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 基本信息 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">合約信息</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">狀態</label>
                <div>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${statusColors[contract.status] || 'bg-gray-100 text-gray-800'}`}>
                    {contract.status === 'ACTIVE' ? '活躍' : contract.status === 'EXPIRED' ? '已過期' : '已終止'}
                  </span>
                  {isExpiringSoon() && (
                    <span className="ml-2 px-2 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800">
                      即將到期
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {contract.startDate && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center mb-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    開始日期
                  </label>
                  <p className="text-gray-900 font-medium">
                    {new Date(contract.startDate).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              )}
              {contract.endDate && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center mb-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    結束日期
                  </label>
                  <p className="text-gray-900 font-medium">
                    {new Date(contract.endDate).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {contract.rentAmount != null && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center mb-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    月租金
                  </label>
                  <p className="text-gray-900 font-medium text-lg">
                    ${contract.rentAmount.toLocaleString()}
                  </p>
                </div>
              )}
              {contract.deposit != null && (
                <div>
                  <label className="text-sm text-gray-500">押金</label>
                  <p className="text-gray-900 font-medium text-lg">
                    ${contract.deposit.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 側邊信息 */}
        <div className="space-y-6">
          {/* 物業信息 */}
          {property && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                物業信息
              </h2>
              <div className="space-y-2">
                <Link href={`/properties/${encodeURIComponent(property.name || property.id)}`} className="text-blue-600 hover:underline">
                  <p className="font-medium">{property.name}</p>
                </Link>
                <p className="text-sm text-gray-600">{property.propertyNumber}</p>
                <p className="text-sm text-gray-600">{property.address}</p>
              </div>
            </div>
          )}

          {/* 租客信息 */}
          {tenant && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                租客信息
              </h2>
              <div className="space-y-2">
                <p className="font-medium">{tenant.name}</p>
                {tenant.email && <p className="text-sm text-gray-600">{tenant.email}</p>}
                {tenant.phone && <p className="text-sm text-gray-600">{tenant.phone}</p>}
              </div>
            </div>
          )}

          {/* 時間信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">時間信息</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">創建時間</label>
                <p className="text-gray-900 text-sm">
                  {new Date(contract.createdAt).toLocaleString('zh-TW')}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">更新時間</label>
                <p className="text-gray-900 text-sm">
                  {new Date(contract.updatedAt).toLocaleString('zh-TW')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


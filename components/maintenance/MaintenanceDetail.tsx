'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { maintenanceStorage, propertyStorage, tenantStorage } from '@/lib/storage';
// 不再需要自動初始化假數據
import { Wrench, Calendar, DollarSign, User, Building2, Edit, Save, X, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth-client-utils';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const priorityLabels: Record<string, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '緊急',
};

const statusLabels: Record<string, string> = {
  PENDING: '待處理',
  IN_PROGRESS: '進行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

export default function MaintenanceDetail({ orderId, userRole }: { orderId: string; userRole?: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const canEdit = userRole && isAdmin(userRole);

  useEffect(() => {
    // 不再自動初始化假數據
    
    const loadOrder = () => {
      const orderData = maintenanceStorage.getById(orderId);
      if (orderData) {
        setOrder(orderData);
        const propertyData = propertyStorage.getById(orderData.propertyId);
        setProperty(propertyData);
        if (orderData.tenantId) {
          const tenantData = tenantStorage.getById(orderData.tenantId);
          setTenant(tenantData);
        }
      }
      setLoading(false);
    };

    const handleDataInitialized = () => {
      setTimeout(loadOrder, 100);
    };

    window.addEventListener('dummyDataInitialized', handleDataInitialized);
    setTimeout(loadOrder, 200);

    return () => {
      window.removeEventListener('dummyDataInitialized', handleDataInitialized);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">載入中...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">找不到此修單</p>
        <Link href="/maintenance" className="text-blue-600 dark:text-blue-400 hover:underline">
          返回修單列表
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* 標題欄 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/maintenance"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.title}</h1>
            <p className="text-gray-600 mt-1">修單詳情</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
            {statusLabels[order.status] || order.status}
          </span>
          <span className={`px-3 py-1 rounded text-sm font-medium ${priorityColors[order.priority] || 'bg-gray-100 text-gray-800'}`}>
            {priorityLabels[order.priority] || order.priority}
          </span>
          {canEdit && (
            !isEditing ? (
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
                    const updated = maintenanceStorage.update(orderId, {
                      ...editForm,
                      cost: editForm.cost ? parseFloat(editForm.cost) : null,
                    });
                    setOrder(updated);
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
                      title: order.title || '',
                      description: order.description || '',
                      priority: order.priority || 'MEDIUM',
                      status: order.status || 'PENDING',
                      assignedTo: order.assignedTo || '',
                      cost: order.cost || '',
                    });
                    setIsEditing(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <X className="w-4 h-4" />
                  <span>取消</span>
                </button>
              </>
            )
          )}
        </div>
      </div>

      {/* 主要信息卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 基本信息 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">修單信息</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">標題</label>
              <p className="text-gray-900 font-medium text-lg">{order.title}</p>
            </div>

            {order.description && (
              <div>
                <label className="text-sm text-gray-500">描述</label>
                <p className="text-gray-900 whitespace-pre-wrap">{order.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {order.assignedTo && (
                <div>
                  <label className="text-sm text-gray-500">分配給</label>
                  <p className="text-gray-900 font-medium">{order.assignedTo}</p>
                </div>
              )}
              {order.cost != null && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center mb-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    成本
                  </label>
                  <p className="text-gray-900 font-medium text-lg">
                    ${order.cost.toLocaleString()}
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
                <label className="text-sm text-gray-500 flex items-center mb-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  創建時間
                </label>
                <p className="text-gray-900 text-sm">
                  {new Date(order.createdAt).toLocaleString('zh-TW')}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">更新時間</label>
                <p className="text-gray-900 text-sm">
                  {new Date(order.updatedAt).toLocaleString('zh-TW')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


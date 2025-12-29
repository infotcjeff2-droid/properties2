'use client';

import Link from 'next/link';
import { Wrench, Calendar, AlertCircle } from 'lucide-react';

interface MaintenanceOrder {
  id: string;
  propertyId: string;
  tenantId?: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  cost?: number;
  property?: any;
  tenant?: any;
  createdAt: string;
}

interface MaintenanceCardProps {
  order: MaintenanceOrder;
}

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

export default function MaintenanceCard({ order }: MaintenanceCardProps) {
  return (
    <Link href={`/maintenance/${order.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wrench className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{order.title}</h3>
              <p className="text-sm text-gray-500 truncate">
                {order.property?.name || `物業 ${order.propertyId}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1 ml-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
              {statusLabels[order.status] || order.status}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[order.priority] || 'bg-gray-100 text-gray-800'}`}>
              {priorityLabels[order.priority] || order.priority}
            </span>
          </div>
        </div>

        {order.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{order.description}</p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{new Date(order.createdAt).toLocaleDateString('zh-TW')}</span>
          </div>
          {order.cost != null && (
            <div className="text-gray-900 font-medium">
              ${order.cost.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}


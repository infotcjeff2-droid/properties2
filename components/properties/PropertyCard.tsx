'use client';

import Link from 'next/link';
import { MapPin, Trash2 } from 'lucide-react';
import { isAdmin } from '@/lib/auth-client-utils';
import { propertyStorage } from '@/lib/storage';
import { useRouter } from 'next/navigation';

interface Property {
  id: string;
  propertyNumber: string;
  name: string;
  address: string;
  status: string;
  category: string;
  area?: number;
  createdAt: string;
  images?: string[] | Array<{ url: string }>;
}

interface PropertyCardProps {
  property: Property;
  userRole?: string;
  onDelete?: () => void;
}

const statusColors: Record<string, string> = {
  HOLDING: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  SOLD: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  LEASE_STOPPED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
};

const categoryLabels: Record<string, string> = {
  GROUP_ASSETS: '集團資產',
  COOPERATIVE_INVESTMENT: '合作投資',
  LEASED_OUT: '向外租用',
  MANAGED_ASSETS: '代管理資產',
};

export default function PropertyCard({ property, userRole, onDelete }: PropertyCardProps) {
  const router = useRouter();
  const canDelete = userRole && isAdmin(userRole);
  
  // 使用實際上傳的圖片，如果沒有則使用占位符
  const imageUrl = property.images && property.images.length > 0
    ? (typeof property.images[0] === 'string'
      ? property.images[0]
      : (property.images[0] as { url: string })?.url)
    : `https://via.placeholder.com/400x300?text=${encodeURIComponent(property.name || '物業')}`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`確定要刪除物業 "${property.name}" 嗎？此操作無法復原。`)) {
      return;
    }

    try {
      // 先調用 onDelete 回調（如果存在），讓父組件立即更新
      // 這樣可以確保 UI 立即響應，即使存儲操作稍慢
      if (onDelete) {
        // 先執行刪除操作
        const deleted = propertyStorage.delete(property.id);
        if (!deleted) {
          // 如果通過 ID 刪除失敗，嘗試通過名稱刪除
          const deletedByName = propertyStorage.delete(property.name || property.id);
          if (!deletedByName) {
            alert('刪除物業失敗：找不到要刪除的物業。');
            return;
          }
        }
        // 然後立即調用回調更新 UI
        onDelete();
      } else {
        // 如果沒有回調，執行刪除並刷新
        const deleted = propertyStorage.delete(property.id);
        if (!deleted) {
          const deletedByName = propertyStorage.delete(property.name || property.id);
          if (!deletedByName) {
            alert('刪除物業失敗：找不到要刪除的物業。');
            return;
          }
        }
        router.refresh();
      }
    } catch (error) {
      console.error('刪除物業失敗:', error);
      alert('刪除物業失敗，請重試。');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
      <Link href={`/properties/${encodeURIComponent(property.name || property.id)}`} className="block">
        {/* 圖片區域 */}
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img
            src={imageUrl}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // 如果圖片加載失敗，使用占位符
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(property.name || '物業')}`;
            }}
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[property.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
              {property.status === 'HOLDING' ? '持有中' : property.status === 'SOLD' ? '已售' : '已停租'}
            </span>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="p-4">
          {/* 地址 */}
          <div className="flex items-start mb-3">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">{property.address}</p>
          </div>

          {/* 物業名稱 */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{property.name}</h3>

          {/* 物業編號 */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{property.propertyNumber}</p>

          {/* 物業信息 */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center space-x-4">
              {property.area != null && (
                <span className="flex items-center">
                  <span className="mr-1">面積:</span>
                  <span className="font-medium">{property.area.toLocaleString()} 平方呎</span>
                </span>
              )}
            </div>
          </div>

          {/* 類別 */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {categoryLabels[property.category] || property.category}
            </p>
          </div>
        </div>
      </Link>
      
      {/* 刪除按鈕 - 放在 Link 外部，使用絕對定位，hover 時才顯示 */}
      {canDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition z-20 shadow-lg opacity-0 group-hover:opacity-100"
          title="刪除物業"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { propertyStorage } from '@/lib/storage';
// 不再需要自動初始化假數據
import Link from 'next/link';
import { Building2, X } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [newProperties, setNewProperties] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 不再自動初始化假數據
    
    const loadNewProperties = () => {
      const allProperties = propertyStorage.getAll();
      // 獲取最近7天內新增的物業
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const newProps = allProperties.filter((prop: any) => {
        const createdAt = new Date(prop.createdAt);
        return createdAt >= sevenDaysAgo;
      });
      
      setNewProperties(newProps);
    };

    const handleDataInitialized = () => {
      setTimeout(loadNewProperties, 100);
    };

    window.addEventListener('dummyDataInitialized', handleDataInitialized);
    setTimeout(loadNewProperties, 200);

    return () => {
      window.removeEventListener('dummyDataInitialized', handleDataInitialized);
    };
  }, []);

  // 點擊外部關閉下拉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">新增物業通知</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {newProperties.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {newProperties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${encodeURIComponent(property.name || property.id)}`}
                onClick={onClose}
                className="block p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {property.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {property.propertyNumber}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(property.createdAt).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">暫無新增物業</p>
          </div>
        )}
      </div>
      
      {newProperties.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/properties"
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            查看所有物業 →
          </Link>
        </div>
      )}
    </div>
  );
}


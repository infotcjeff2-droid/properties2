'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { propertyStorage } from '@/lib/storage';
import { Building2, MapPin, Calendar, Edit, Save, X, ArrowLeft, Upload, User, Users, ExternalLink, ChevronRight, FileText, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth-client-utils';
import Modal from '@/components/ui/Modal';

const statusColors: Record<string, string> = {
  HOLDING: 'bg-green-100 text-green-800',
  SOLD: 'bg-gray-100 text-gray-800',
  LEASE_STOPPED: 'bg-red-100 text-red-800',
};

const categoryLabels: Record<string, string> = {
  GROUP_ASSETS: '集團資產',
  COOPERATIVE_INVESTMENT: '合作投資',
  LEASED_OUT: '向外租用',
  MANAGED_ASSETS: '代管理資產',
};

export default function PropertyDetail({ propertyId, userRole }: { propertyId: string; userRole?: string }) {
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [geoMap, setGeoMap] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState({ cover: false, geo: false });
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const geoMapInputRef = useRef<HTMLInputElement>(null);
  const canEdit = userRole && isAdmin(userRole);
  
  // 關聯資料
  const [relatedData, setRelatedData] = useState({
    rentingRecord: null as any,
    rentOutRecord: null as any,
    proprietor: null as any,
    tenant: null as any,
  });

  // 關聯選項
  const [options, setOptions] = useState({
    rentingRecords: [] as any[],
    rentOutRecords: [] as any[],
    proprietors: [] as any[],
    tenants: [] as any[],
  });

  useEffect(() => {
    // 只確保 propertyStorage 已初始化，不重置其他數據
    if (typeof window !== 'undefined') {
      const properties = localStorage.getItem('pm_properties');
      if (!properties) {
        localStorage.setItem('pm_properties', JSON.stringify([]));
      }
    }
    
    const loadProperty = () => {
      const data = propertyStorage.getById(propertyId);
      if (data) {
        setProperty(data);
        setEditForm({
          name: data.name || '',
          propertyNumber: data.propertyNumber || '',
          address: data.address || '',
          lotNumber: data.lotNumber || '',
          area: data.area || '',
          landUse: data.landUse || '',
          status: data.status || 'HOLDING',
          category: data.category || 'GROUP_ASSETS',
          // 關聯欄位
          rentingRecordId: data.rentingRecordId || '',
          rentOutRecordId: data.rentOutRecordId || '',
          proprietorId: data.proprietorId || '',
          tenantId: data.tenantId || '',
        });
        
        // 載入關聯資料和選項（只讀取，不修改）
        try {
          // 直接讀取 localStorage，不觸發 initStorage
          const rentingData = localStorage.getItem('pm_renting_records');
          const rentOutData = localStorage.getItem('pm_rent_out_records');
          const proprietorData = localStorage.getItem('pm_proprietors');
          const tenantData = localStorage.getItem('pm_tenants');
          
          const rentingRecords = rentingData ? JSON.parse(rentingData) : [];
          const rentOutRecords = rentOutData ? JSON.parse(rentOutData) : [];
          const proprietors = proprietorData ? JSON.parse(proprietorData) : [];
          const tenants = tenantData ? JSON.parse(tenantData) : [];
          
          // 設置選項（只在數據變化時更新）
          setOptions(prevOptions => {
            // 使用更簡單的比較方式，避免 JSON.stringify 的性能問題
            const prevIds = {
              renting: prevOptions.rentingRecords.map((r: any) => r.id).sort().join(','),
              rentOut: prevOptions.rentOutRecords.map((r: any) => r.id).sort().join(','),
              proprietors: prevOptions.proprietors.map((p: any) => p.id).sort().join(','),
              tenants: prevOptions.tenants.map((t: any) => t.id).sort().join(',')
            };
            const newIds = {
              renting: rentingRecords.map((r: any) => r.id).sort().join(','),
              rentOut: rentOutRecords.map((r: any) => r.id).sort().join(','),
              proprietors: proprietors.map((p: any) => p.id).sort().join(','),
              tenants: tenants.map((t: any) => t.id).sort().join(',')
            };
            
            const hasChanged = 
              prevIds.renting !== newIds.renting ||
              prevIds.rentOut !== newIds.rentOut ||
              prevIds.proprietors !== newIds.proprietors ||
              prevIds.tenants !== newIds.tenants;
            
            if (!hasChanged) {
              return prevOptions;
            }
            
            return {
              rentingRecords,
              rentOutRecords,
              proprietors,
              tenants,
            };
          });
          
          // 設置關聯資料
          // 查找 proprietor：支持通過 ID 或 englishName 匹配
          let proprietor = null;
          if (data.proprietorId) {
            // 首先嘗試通過 ID 匹配
            proprietor = proprietors.find((p: any) => p.id === data.proprietorId);
            // 如果找不到，嘗試通過 englishName 匹配
            if (!proprietor) {
              proprietor = proprietors.find((p: any) => p.englishName === data.proprietorId);
            }
          }
          
          const newRelatedData = {
            rentingRecord: data.rentingRecordId ? rentingRecords.find((r: any) => r.id === data.rentingRecordId) : null,
            rentOutRecord: data.rentOutRecordId ? rentOutRecords.find((r: any) => r.id === data.rentOutRecordId) : null,
            proprietor: proprietor,
            tenant: data.tenantId ? tenants.find((t: any) => t.id === data.tenantId) : null,
          };
          
          // 只在數據變化時更新
          setRelatedData(prevData => {
            const hasChanged = 
              prevData.rentingRecord?.id !== newRelatedData.rentingRecord?.id ||
              prevData.rentOutRecord?.id !== newRelatedData.rentOutRecord?.id ||
              prevData.proprietor?.id !== newRelatedData.proprietor?.id ||
              prevData.tenant?.id !== newRelatedData.tenant?.id;
            
            if (!hasChanged) {
              return prevData;
            }
            
            return newRelatedData;
          });
          
          console.log('[PropertyDetail] Loading related data:', {
            propertyId: data.id,
            proprietorId: data.proprietorId,
            foundProprietor: proprietor ? { id: proprietor.id, englishName: proprietor.englishName } : null,
            allProprietors: proprietors.map((p: any) => ({ id: p.id, englishName: p.englishName }))
          });
        } catch (error) {
          console.error('Error loading related data:', error);
        }
      }
      setLoading(false);
    };

    // 直接載入數據，不使用 setTimeout
    loadProperty();
  }, [propertyId]);

  const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
  const maxSizeCover = 10 * 1024 * 1024; // 10 MB
  const maxSizeGeo = 10 * 1024 * 1024; // 10 MB

  const validateFile = (file: File, maxSize: number): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return '不支持的格式。請上傳 JPG, PNG, SVG 或 WEBP 格式的圖片。';
    }
    if (file.size > maxSize && maxSize > 0) {
      return `文件大小超過限制。最大允許大小：${(maxSize / 1024 / 1024).toFixed(0)} MB。`;
    }
    return null;
  };

  const handleFileSelect = (file: File, type: 'cover' | 'geo') => {
    const maxSize = type === 'cover' ? maxSizeCover : maxSizeGeo;
    const error = validateFile(file, maxSize);
    if (error) {
      alert(error);
      return;
    }
    if (type === 'cover') {
      setCoverImage(file);
    } else {
      setGeoMap(file);
    }
  };

  const handleDrag = (e: React.DragEvent, type: 'cover' | 'geo') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive({ ...dragActive, [type]: true });
    } else if (e.type === 'dragleave') {
      setDragActive({ ...dragActive, [type]: false });
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'cover' | 'geo') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [type]: false });
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], type);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'geo') => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0], type);
    }
  };

  const removeFile = (type: 'cover' | 'geo') => {
    if (type === 'cover') {
      setCoverImage(null);
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = '';
      }
    } else {
      setGeoMap(null);
      if (geoMapInputRef.current) {
        geoMapInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!property) return;
    setSaving(true);
    try {
      let coverImageUrl = property.images && property.images.length > 0 
        ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.url || null)
        : null;
      let geoMapUrl = typeof property.geoMap === 'string' ? property.geoMap : property.geoMap?.url || null;

      // 上傳封面圖片（如果有新文件）
      if (coverImage) {
        const coverFormData = new FormData();
        coverFormData.append('file', coverImage);
        coverFormData.append('type', 'cover');
        
        const coverResponse = await fetch('/api/upload', {
          method: 'POST',
          body: coverFormData,
        });
        
        if (coverResponse.ok) {
          const coverData = await coverResponse.json();
          coverImageUrl = coverData.url;
        }
      }

      // 上傳地理資訊圖（如果有新文件）
      if (geoMap) {
        const geoFormData = new FormData();
        geoFormData.append('file', geoMap);
        geoFormData.append('type', 'geo');
        
        const geoResponse = await fetch('/api/upload', {
          method: 'POST',
          body: geoFormData,
        });
        
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          geoMapUrl = geoData.url;
        }
      }

      // 使用物業的實際 ID 進行更新（propertyId 可能是名稱）
      const actualPropertyId = property.id;
      const updated = propertyStorage.update(actualPropertyId, {
        ...editForm,
        area: editForm.area ? parseFloat(editForm.area) : null,
        images: coverImageUrl ? [coverImageUrl] : (property.images || []),
        geoMap: geoMapUrl !== null ? geoMapUrl : property.geoMap,
        // 關聯欄位（只存儲ID，不影響其他數據）
        rentingRecordId: editForm.rentingRecordId || null,
        rentOutRecordId: editForm.rentOutRecordId || null,
        proprietorId: editForm.proprietorId || null,
        tenantId: editForm.tenantId || null,
      });
      
      if (!updated) {
        throw new Error('無法找到要更新的物業');
      }
      
      // 重新從存儲中獲取最新的數據（確保獲取完整的最新數據）
      const reloadProperty = () => {
        const freshData = propertyStorage.getById(updated.id);
        if (freshData) {
          setProperty(freshData);
          // 更新編輯表單以反映最新數據
          setEditForm({
            name: freshData.name || '',
            propertyNumber: freshData.propertyNumber || '',
            address: freshData.address || '',
            lotNumber: freshData.lotNumber || '',
            area: freshData.area || '',
            landUse: freshData.landUse || '',
            status: freshData.status || 'HOLDING',
            category: freshData.category || 'GROUP_ASSETS',
            rentingRecordId: freshData.rentingRecordId || '',
            rentOutRecordId: freshData.rentOutRecordId || '',
            proprietorId: freshData.proprietorId || '',
            tenantId: freshData.tenantId || '',
          });
          
          // 重新載入關聯資料
          try {
            const rentingData = localStorage.getItem('pm_renting_records');
            const rentOutData = localStorage.getItem('pm_rent_out_records');
            const proprietorData = localStorage.getItem('pm_proprietors');
            const tenantData = localStorage.getItem('pm_tenants');
            
            const rentingRecords = rentingData ? JSON.parse(rentingData) : [];
            const rentOutRecords = rentOutData ? JSON.parse(rentOutData) : [];
            const proprietors = proprietorData ? JSON.parse(proprietorData) : [];
            const tenants = tenantData ? JSON.parse(tenantData) : [];
            
            // 查找 proprietor：支持通過 ID 或 englishName 匹配
            let proprietor = null;
            if (freshData.proprietorId) {
              proprietor = proprietors.find((p: any) => p.id === freshData.proprietorId);
              if (!proprietor) {
                proprietor = proprietors.find((p: any) => p.englishName === freshData.proprietorId);
              }
            }
            
            setRelatedData({
              rentingRecord: freshData.rentingRecordId ? rentingRecords.find((r: any) => r.id === freshData.rentingRecordId) : null,
              rentOutRecord: freshData.rentOutRecordId ? rentOutRecords.find((r: any) => r.id === freshData.rentOutRecordId) : null,
              proprietor: proprietor,
              tenant: freshData.tenantId ? tenants.find((t: any) => t.id === freshData.tenantId) : null,
            });
            
            console.log('[PropertyDetail] Reloaded property and related data after save:', {
              propertyId: freshData.id,
              propertyName: freshData.name,
              proprietorId: freshData.proprietorId,
              foundProprietor: proprietor ? { id: proprietor.id, englishName: proprietor.englishName } : null
            });
          } catch (error) {
            console.error('Error reloading related data:', error);
          }
        }
      };
      
      setIsEditing(false);
      setCoverImage(null);
      setGeoMap(null);
      
      // 立即重新載入數據
      reloadProperty();
      
      // 觸發自定義事件，通知其他頁面（如資產擁有方頁面）物業已更新
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('propertyUpdated', { 
          detail: { propertyId: updated.id, proprietorId: updated.proprietorId } 
        }));
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert('更新物業失敗，請重試。');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: property?.name || '',
      propertyNumber: property?.propertyNumber || '',
      address: property?.address || '',
      lotNumber: property?.lotNumber || '',
      area: property?.area || '',
      landUse: property?.landUse || '',
      status: property?.status || 'HOLDING',
      category: property?.category || 'GROUP_ASSETS',
      // 關聯欄位
      rentingRecordId: property?.rentingRecordId || '',
      rentOutRecordId: property?.rentOutRecordId || '',
      proprietorId: property?.proprietorId || '',
      tenantId: property?.tenantId || '',
    });
    setCoverImage(null);
    setGeoMap(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">載入中...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">找不到此物業</p>
        <Link href="/properties" className="text-blue-600 dark:text-blue-400 hover:underline">
          返回物業列表
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top navigation bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-3 mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/properties" className="hover:text-blue-600 dark:hover:text-blue-400">
            Properties
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/properties" className="hover:text-blue-600 dark:hover:text-blue-400">
            物業
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">
            {property.name || property.propertyNumber || property.id}
          </span>
        </div>
      </div>

      {/* Large banner image */}
      {property.images && property.images.length > 0 && !isEditing && (
        <div className="w-full h-64 md:h-80 lg:h-96 relative overflow-hidden rounded-lg mb-6">
          <img
            src={typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.url || property.images[0]?.name || ''}
            alt={property.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/1200x400?text=${encodeURIComponent(property.name || '物業')}`;
            }}
          />
        </div>
      )}


        {/* 主要內容區域 - 左右分欄佈局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側區域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 物業狀態欄 */}
            <div className={`${property.status === 'HOLDING' ? 'bg-green-500' : property.status === 'SOLD' ? 'bg-gray-500' : 'bg-red-500'} text-white px-6 py-4 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold">{property.status === 'HOLDING' ? '持有中' : property.status === 'SOLD' ? '已售' : '已停租'}</span>
                <p className="text-sm mt-1 opacity-90">
                  {property.propertyNumber} {property.address}
                </p>
              </div>
            </div>
            </div>

            {/* 基本資料區塊 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">基本資料</h2>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>編輯</span>
                </button>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">物業編號</label>
                  <p className="text-gray-900 dark:text-white font-medium">{property.propertyNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">狀態</label>
                  <div>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${statusColors[property.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                      {property.status === 'HOLDING' ? '持有中' : property.status === 'SOLD' ? '已售' : '已停租'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  地址
                </label>
                <p className="text-gray-900 dark:text-white">{property.address}</p>
              </div>

              {property.lotNumber && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">地段</label>
                  <p className="text-gray-900 dark:text-white">{property.lotNumber}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {property.area != null && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">面積</label>
                    <p className="text-gray-900 dark:text-white font-medium">{property.area.toLocaleString()} 平方呎</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">資產類別</label>
                  <p className="text-gray-900 dark:text-white font-medium">{categoryLabels[property.category] || property.category}</p>
                </div>
              </div>

              {property.landUse && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">土地用途</label>
                  <p className="text-gray-900 dark:text-white">{property.landUse}</p>
                </div>
              )}
            </div>
            </div>

          {/* 關聯資料區塊 - 始終顯示，即使沒有關聯資料 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <LinkIcon className="w-5 h-5 mr-2" />
              關聯資料
            </h2>
            {(relatedData.rentingRecord || relatedData.rentOutRecord || relatedData.proprietor || relatedData.tenant) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedData.rentingRecord && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">交租記錄</h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      {relatedData.rentingRecord.id}
                    </p>
                  </div>
                )}
                
                {relatedData.rentOutRecord && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-green-900 dark:text-green-300">收租記錄</h3>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {relatedData.rentOutRecord.id}
                    </p>
                  </div>
                )}
                
                {relatedData.proprietor && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-purple-900 dark:text-purple-300">資產擁有方</h3>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-400">
                      {relatedData.proprietor.englishName || relatedData.proprietor.code || relatedData.proprietor.id}
                    </p>
                    <Link 
                      href={`/proprietor/${encodeURIComponent(relatedData.proprietor.englishName || relatedData.proprietor.id)}`}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-flex items-center"
                    >
                      查看詳情 <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                )}
                
                {relatedData.tenant && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-orange-900 dark:text-orange-300">承租人</h3>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      {relatedData.tenant.name || relatedData.tenant.id}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                暫無關聯資料
              </div>
            )}
          </div>

          </div>

          {/* 右側區域 */}
          <div className="space-y-6">
            {/* 交租情況區塊 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">交租情況</h2>
              </div>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                暫無交租記錄
              </div>
            </div>

            {/* 地理資訊圖區塊 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">地理資訊圖</h2>
            {property.geoMap ? (
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                <img
                  src={typeof property.geoMap === 'string' ? property.geoMap : property.geoMap?.url || property.geoMap?.name || ''}
                  alt="地理資訊圖"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=地理資訊圖`;
                  }}
                />
              </div>
            ) : (
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-400 dark:text-gray-500 text-sm">暫無地理資訊圖</span>
              </div>
            )}
            
            {/* 相冊和圖則 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">相冊</span>
                </div>
                <select className="text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option>新到舊</option>
                  <option>舊到新</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer">
                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">圖則</span>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditing}
          onClose={handleCancel}
          title="編輯物業資料"
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* 基本資料表單 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">物業編號</label>
                  <input
                    type="text"
                    value={editForm.propertyNumber}
                    onChange={(e) => setEditForm({ ...editForm, propertyNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">狀態</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="HOLDING">持有中</option>
                    <option value="SOLD">已售</option>
                    <option value="LEASE_STOPPED">已停租</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">物業名稱</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  地址
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">地段</label>
                  <input
                    type="text"
                    value={editForm.lotNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, lotNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">面積 (平方呎)</label>
                  <input
                    type="number"
                    value={editForm.area || ''}
                    onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">土地用途</label>
                  <input
                    type="text"
                    value={editForm.landUse || ''}
                    onChange={(e) => setEditForm({ ...editForm, landUse: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">資產類別</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="GROUP_ASSETS">集團資產</option>
                    <option value="COOPERATIVE_INVESTMENT">合作投資</option>
                    <option value="LEASED_OUT">向外租用</option>
                    <option value="MANAGED_ASSETS">代管理資產</option>
                  </select>
                </div>
              </div>

            </div>

            {/* 圖片上傳區域 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 封面圖片上傳 */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">封面圖片</h3>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                    dragActive.cover
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : coverImage || (property.images && property.images.length > 0)
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragEnter={(e) => handleDrag(e, 'cover')}
                  onDragLeave={(e) => handleDrag(e, 'cover')}
                  onDragOver={(e) => handleDrag(e, 'cover')}
                  onDrop={(e) => handleDrop(e, 'cover')}
                >
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.svg,.webp"
                    onChange={(e) => handleFileInputChange(e, 'cover')}
                    className="hidden"
                    id="coverImageEdit"
                  />
                  {coverImage ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{coverImage.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('cover')}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(coverImage.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : property.images && property.images.length > 0 ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-2">
                        <img
                          src={typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.url || property.images[0]?.name || ''}
                          alt={property.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(property.name || '物業')}`;
                          }}
                        />
                      </div>
                      <label htmlFor="coverImageEdit" className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500">
                        更換圖片
                      </label>
                    </div>
                  ) : (
                    <div className="text-center">
                      <label htmlFor="coverImageEdit" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500">選擇檔案</span> 或拖放至此
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">格式: JPG, PNG, SVG, WEBP</p>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* 地理資訊圖上傳 */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">地理資訊圖</h3>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                    dragActive.geo
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : geoMap || property.geoMap
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragEnter={(e) => handleDrag(e, 'geo')}
                  onDragLeave={(e) => handleDrag(e, 'geo')}
                  onDragOver={(e) => handleDrag(e, 'geo')}
                  onDrop={(e) => handleDrop(e, 'geo')}
                >
                  <input
                    ref={geoMapInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.svg,.webp"
                    onChange={(e) => handleFileInputChange(e, 'geo')}
                    className="hidden"
                    id="geoMapEdit"
                  />
                  {geoMap ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{geoMap.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('geo')}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(geoMap.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : property.geoMap ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-2">
                        <img
                          src={typeof property.geoMap === 'string' ? property.geoMap : property.geoMap?.url || property.geoMap?.name || ''}
                          alt="地理資訊圖"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=地理資訊圖`;
                          }}
                        />
                      </div>
                      <label htmlFor="geoMapEdit" className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500">
                        更換圖片
                      </label>
                    </div>
                  ) : (
                    <div className="text-center">
                      <label htmlFor="geoMapEdit" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500">選擇檔案</span> 或拖放至此
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">格式: JPG, PNG, SVG, WEBP</p>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 關聯欄位區塊 */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">關聯資料</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 交租記錄 */}
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">交租記錄</label>
                  <select
                    value={editForm.rentingRecordId || ''}
                    onChange={(e) => setEditForm({ ...editForm, rentingRecordId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">請選擇交租記錄</option>
                    {options.rentingRecords.map((record) => (
                      <option key={record.id} value={record.id}>
                        {record.id} - {record.propertyId || '未指定物業'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 收租記錄 */}
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">收租記錄</label>
                  <select
                    value={editForm.rentOutRecordId || ''}
                    onChange={(e) => setEditForm({ ...editForm, rentOutRecordId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">請選擇收租記錄</option>
                    {options.rentOutRecords.map((record) => (
                      <option key={record.id} value={record.id}>
                        {record.id} - {record.propertyId || '未指定物業'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 資產擁有方 */}
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">資產擁有方</label>
                  <select
                    value={editForm.proprietorId || ''}
                    onChange={(e) => setEditForm({ ...editForm, proprietorId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">請選擇資產擁有方</option>
                    {options.proprietors.map((proprietor) => (
                      <option key={proprietor.id} value={proprietor.id}>
                        {proprietor.englishName || proprietor.code || proprietor.id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 承租人 */}
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">承租人</label>
                  <select
                    value={editForm.tenantId || ''}
                    onChange={(e) => setEditForm({ ...editForm, tenantId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">請選擇承租人</option>
                    {options.tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name || tenant.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <X className="w-4 h-4" />
                <span>取消</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? '保存中...' : '保存'}</span>
              </button>
            </div>
          </div>
        </Modal>
    </div>
  );
}

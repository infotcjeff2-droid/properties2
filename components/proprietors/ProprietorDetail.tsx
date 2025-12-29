'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { proprietorStorage } from '@/lib/storage';
import { Building2, Edit, Save, X, ArrowLeft, ChevronRight, Link as LinkIcon, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth-client-utils';
import Modal from '@/components/ui/Modal';
import ProprietorForm from '@/components/forms/ProprietorForm';

const typeLabels: Record<string, string> = {
  GROUP_COMPANY: '集團旗下公司',
  JOINT_VENTURE: '合資公司',
  LANDLORD: '出租的業主',
  MANAGED_INDIVIDUAL: '代管理的個體',
};

export default function ProprietorDetail({ proprietorId, userRole }: { proprietorId: string; userRole?: string }) {
  const router = useRouter();
  const [proprietor, setProprietor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [relatedProperties, setRelatedProperties] = useState<any[]>([]);
  const canEdit = userRole && isAdmin(userRole);

  useEffect(() => {
    // 只確保 proprietorStorage 已初始化，不重置其他數據
    if (typeof window !== 'undefined') {
      const proprietors = localStorage.getItem('pm_proprietors');
      if (!proprietors) {
        localStorage.setItem('pm_proprietors', JSON.stringify([]));
      }
    }
    
    const loadProprietor = () => {
      // proprietorId 現在可能是 englishName（URL 編碼的）
      const data = proprietorStorage.getById(proprietorId);
      console.log('[ProprietorDetail] Loading proprietor:', {
        urlProprietorId: proprietorId,
        foundProprietor: data ? {
          id: data.id,
          code: data.code,
          englishName: data.englishName,
          shortName: data.shortName
        } : null
      });
      if (data) {
        setProprietor(data);
      } else {
        console.warn('[ProprietorDetail] Proprietor not found for ID:', proprietorId);
      }
      setLoading(false);
    };

    // 載入關聯的物業（只讀取，不修改）
    const loadRelatedProperties = () => {
      try {
        // 直接讀取 localStorage，不觸發 initStorage
        const propertiesData = localStorage.getItem('pm_properties');
        if (propertiesData) {
          const properties = JSON.parse(propertiesData);
          if (Array.isArray(properties)) {
            // 獲取當前 proprietor 的完整信息，用於多種匹配方式
            // proprietorId 現在可能是 englishName（URL 編碼的），getById 會自動處理
            const currentProprietor = proprietorStorage.getById(proprietorId);
            const currentProprietorId = currentProprietor ? String(currentProprietor.id || '').trim() : '';
            const currentProprietorCode = currentProprietor ? String(currentProprietor.code || '').trim() : '';
            const currentProprietorEnglishName = currentProprietor ? String(currentProprietor.englishName || '').trim() : '';
            
            // 查找所有關聯到此 proprietor 的物業
            // 匹配方式：1. 直接ID匹配 2. 代碼匹配 3. 英文名稱匹配 4. 通過 proprietor 對象的所有字段匹配
            const related = properties.filter((p: any) => {
              // 檢查 proprietorId 是否存在且不為空
              if (!p.proprietorId) {
                console.log('[ProprietorDetail] Property has no proprietorId:', { propertyId: p.id, propertyName: p.name });
                return false;
              }
              
              const pProprietorId = String(p.proprietorId).trim();
              
              // 方式1: 直接ID匹配（使用實際的 proprietor ID）
              if (currentProprietorId && pProprietorId === currentProprietorId) {
                console.log('[ProprietorDetail] ✓ Found matching property by ID:', {
                  propertyId: p.id,
                  propertyName: p.name,
                  propertyProprietorId: p.proprietorId,
                  currentProprietorId: currentProprietorId
                });
                return true;
              }
              
              // 方式2: 如果 proprietorId 存儲的是代碼，則比較代碼
              if (currentProprietorCode && pProprietorId === currentProprietorCode) {
                console.log('[ProprietorDetail] ✓ Found matching property by code:', {
                  propertyId: p.id,
                  propertyName: p.name,
                  propertyProprietorId: p.proprietorId,
                  currentProprietorCode: currentProprietorCode
                });
                return true;
              }
              
              // 方式3: 如果 proprietorId 存儲的是英文名稱，則比較英文名稱
              if (currentProprietorEnglishName && pProprietorId === currentProprietorEnglishName) {
                console.log('[ProprietorDetail] ✓ Found matching property by englishName:', {
                  propertyId: p.id,
                  propertyName: p.name,
                  propertyProprietorId: p.proprietorId,
                  currentProprietorEnglishName: currentProprietorEnglishName
                });
                return true;
              }
              
              // 方式4: 如果 proprietorId 是其他格式，嘗試通過 proprietor 對象的所有字段匹配
              // 這用於處理舊數據或格式不一致的情況
              if (currentProprietor) {
                // 檢查是否 proprietorId 存儲的是 proprietor 的某個屬性值
                const proprietorFields = [
                  currentProprietor.id,
                  currentProprietor.code,
                  currentProprietor.englishName,
                  currentProprietor.shortName
                ].filter(Boolean).map(String).map(f => f.trim());
                
                // 同時檢查 proprietorId 是否匹配任何字段（不區分大小寫）
                const matchesField = proprietorFields.some(field => {
                  const fieldTrimmed = field.trim();
                  const pIdTrimmed = pProprietorId.trim();
                  return fieldTrimmed === pIdTrimmed || 
                         fieldTrimmed.toLowerCase() === pIdTrimmed.toLowerCase();
                });
                
                if (matchesField) {
                  const matchedField = proprietorFields.find(f => {
                    const fTrimmed = f.trim();
                    const pIdTrimmed = pProprietorId.trim();
                    return fTrimmed === pIdTrimmed || fTrimmed.toLowerCase() === pIdTrimmed.toLowerCase();
                  });
                  console.log('[ProprietorDetail] ✓ Found matching property by proprietor field:', {
                    propertyId: p.id,
                    propertyName: p.name,
                    propertyProprietorId: p.proprietorId,
                    matchedField: matchedField,
                    allProprietorFields: proprietorFields
                  });
                  return true;
                }
              }
              
              // 如果都不匹配，記錄詳細信息用於調試
              console.log('[ProprietorDetail] ✗ Property does not match:', {
                propertyId: p.id,
                propertyName: p.name,
                propertyProprietorId: pProprietorId,
                currentProprietorId: currentProprietorId,
                currentProprietorCode: currentProprietorCode,
                currentProprietorEnglishName: currentProprietorEnglishName
              });
              
              return false;
            });
            
            console.log('[ProprietorDetail] Loading related properties:', {
              urlProprietorId: proprietorId, // URL 中的參數（可能是 englishName）
              currentProprietor: currentProprietor ? {
                id: currentProprietor.id,
                code: currentProprietor.code,
                englishName: currentProprietor.englishName,
                shortName: currentProprietor.shortName
              } : null,
              currentProprietorId: currentProprietorId,
              currentProprietorCode: currentProprietorCode,
              currentProprietorEnglishName: currentProprietorEnglishName,
              totalProperties: properties.length,
              relatedCount: related.length,
              allPropertiesWithProprietorId: properties
                .filter((p: any) => p.proprietorId)
                .map((p: any) => ({ 
                  id: p.id, 
                  name: p.name, 
                  propertyNumber: p.propertyNumber,
                  proprietorId: p.proprietorId,
                  proprietorIdType: typeof p.proprietorId,
                  proprietorIdValue: String(p.proprietorId)
                })),
              relatedProperties: related.map((p: any) => ({ 
                id: p.id, 
                name: p.name, 
                propertyNumber: p.propertyNumber,
                proprietorId: p.proprietorId 
              })),
              matchingDetails: properties
                .filter((p: any) => p.proprietorId)
                .map((p: any) => {
                  const pProprietorId = String(p.proprietorId).trim();
                  return {
                    propertyId: p.id,
                    propertyName: p.name,
                    propertyProprietorId: pProprietorId,
                    matchesId: currentProprietorId && pProprietorId === currentProprietorId,
                    matchesCode: currentProprietorCode && pProprietorId === currentProprietorCode,
                    matchesEnglishName: currentProprietorEnglishName && pProprietorId === currentProprietorEnglishName
                  };
                })
            });
            
            // 只在數據變化時更新，避免無限循環
            setRelatedProperties(prevRelated => {
              const prevIds = prevRelated.map(p => p.id).sort().join(',');
              const newIds = related.map(p => p.id).sort().join(',');
              if (prevIds === newIds && prevRelated.length === related.length) {
                return prevRelated;
              }
              return related;
            });
          } else {
            console.warn('[ProprietorDetail] Properties data is not an array:', properties);
          }
        } else {
          console.warn('[ProprietorDetail] No properties data found in localStorage');
        }
      } catch (error) {
        console.error('[ProprietorDetail] Error loading related properties:', error);
      }
    };

    // 載入數據（只執行一次）
    loadProprietor();
    // 直接載入關聯物業，不使用 setTimeout
    loadRelatedProperties();
    
    // 監聽 localStorage 變化（跨標籤頁）
    let storageTimeout: NodeJS.Timeout | null = null;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pm_properties') {
        // 防抖：清除之前的延遲，設置新的延遲
        if (storageTimeout) {
          clearTimeout(storageTimeout);
        }
        storageTimeout = setTimeout(() => {
          loadRelatedProperties();
          storageTimeout = null;
        }, 300);
      }
    };
    
    // 監聽自定義事件，當物業數據更新時重新載入關聯物業
    let updateTimeout: NodeJS.Timeout | null = null;
    const handlePropertyUpdate = () => {
      console.log('[ProprietorDetail] Property updated event received, reloading related properties...');
      // 防抖：清除之前的延遲，設置新的延遲
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      updateTimeout = setTimeout(() => {
        loadRelatedProperties();
        updateTimeout = null;
      }, 500);
    };
    
    // 當頁面重新可見時重新載入關聯物業
    let visibilityTimeout: NodeJS.Timeout | null = null;
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 防抖：清除之前的延遲，設置新的延遲
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
        }
        visibilityTimeout = setTimeout(() => {
          loadRelatedProperties();
          visibilityTimeout = null;
        }, 300);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // 監聽自定義事件（同標籤頁內更新）
    window.addEventListener('propertyUpdated', handlePropertyUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // 清理所有定時器
      if (updateTimeout) clearTimeout(updateTimeout);
      if (storageTimeout) clearTimeout(storageTimeout);
      if (visibilityTimeout) clearTimeout(visibilityTimeout);
      
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('propertyUpdated', handlePropertyUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [proprietorId]);

  const handleEditSuccess = () => {
    setIsEditing(false);
    // 重新載入數據
    const data = proprietorStorage.getById(proprietorId);
    if (data) {
      setProprietor(data);
    }
    // 重新載入關聯物業
    const loadRelatedProperties = () => {
      try {
        const propertiesData = localStorage.getItem('pm_properties');
        if (propertiesData) {
          const properties = JSON.parse(propertiesData);
          if (Array.isArray(properties)) {
            const currentProprietorId = String(proprietorId).trim();
            const related = properties.filter((p: any) => {
              if (!p.proprietorId) return false;
              const pProprietorId = String(p.proprietorId).trim();
              return pProprietorId === currentProprietorId;
            });
            setRelatedProperties(related);
          }
        }
      } catch (error) {
        console.error('Error loading related properties:', error);
      }
    };
    setTimeout(loadRelatedProperties, 300);
    // 不刷新頁面，避免無限循環
    // router.refresh();
  };

  // 手動刷新關聯物業
  const handleRefreshRelatedProperties = () => {
    try {
      const propertiesData = localStorage.getItem('pm_properties');
      if (propertiesData) {
        const properties = JSON.parse(propertiesData);
        if (Array.isArray(properties)) {
          // 獲取當前 proprietor 的完整信息
          // proprietorId 現在可能是 englishName（URL 編碼的），getById 會自動處理
          const currentProprietor = proprietorStorage.getById(proprietorId);
          const currentProprietorId = currentProprietor ? String(currentProprietor.id || '').trim() : '';
          const currentProprietorCode = currentProprietor ? String(currentProprietor.code || '').trim() : '';
          const currentProprietorEnglishName = currentProprietor ? String(currentProprietor.englishName || '').trim() : '';
          
          const related = properties.filter((p: any) => {
            if (!p.proprietorId) return false;
            const pProprietorId = String(p.proprietorId).trim();
            
            // 多種匹配方式
            const matches = pProprietorId === currentProprietorId || 
                          (currentProprietorCode && pProprietorId === currentProprietorCode) ||
                          (currentProprietorEnglishName && pProprietorId === currentProprietorEnglishName);
            
            if (matches) {
              console.log('[ProprietorDetail] Manual refresh - found matching property:', {
                propertyId: p.id,
                propertyName: p.name,
                propertyProprietorId: p.proprietorId,
                currentProprietorId: proprietorId,
                currentProprietorCode: currentProprietorCode,
                currentProprietorEnglishName: currentProprietorEnglishName
              });
            }
            
            return matches;
          });
          
          console.log('[ProprietorDetail] Manual refresh result:', {
            proprietorId: proprietorId,
            currentProprietorCode: currentProprietorCode,
            currentProprietorEnglishName: currentProprietorEnglishName,
            totalProperties: properties.length,
            relatedCount: related.length,
            allPropertiesWithProprietorId: properties
              .filter((p: any) => p.proprietorId)
              .map((p: any) => ({ 
                id: p.id, 
                name: p.name, 
                proprietorId: p.proprietorId,
                proprietorIdType: typeof p.proprietorId
              }))
          });
          
          setRelatedProperties(related);
        }
      }
    } catch (error) {
      console.error('[ProprietorDetail] Error refreshing related properties:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">載入中...</p>
      </div>
    );
  }

  if (!proprietor) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">找不到此資產擁有方</p>
        <Link href="/proprietor" className="text-blue-600 dark:text-blue-400 hover:underline">
          返回資產擁有方列表
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top navigation bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-3 mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/proprietor" className="hover:text-blue-600 dark:hover:text-blue-400">
            Proprietor
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/proprietor" className="hover:text-blue-600 dark:hover:text-blue-400">
            資產擁有方
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">
            {proprietor.englishName || proprietor.id}
          </span>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側區域 */}
        <div className="lg:col-span-2 space-y-6">
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
                  <label className="text-sm text-gray-500 dark:text-gray-400">擁有方代碼</label>
                  <p className="text-gray-900 dark:text-white font-medium">{proprietor.code}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">擁有人類別</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {typeLabels[proprietor.type] || proprietor.type}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">擁有方英文名稱</label>
                <p className="text-gray-900 dark:text-white font-medium">{proprietor.englishName}</p>
              </div>

              {proprietor.shortName && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">擁有方簡稱</label>
                  <p className="text-gray-900 dark:text-white font-medium">{proprietor.shortName}</p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">擁有方性質</label>
                <p className="text-gray-900 dark:text-white font-medium">{proprietor.property}</p>
              </div>
            </div>
          </div>

          {/* 關聯物業區塊 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <LinkIcon className="w-5 h-5 mr-2" />
                關聯物業
              </h2>
              <button
                onClick={handleRefreshRelatedProperties}
                className="flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                title="刷新關聯物業"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                刷新
              </button>
            </div>
            {relatedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedProperties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/properties/${encodeURIComponent(property.name || property.id)}`}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {property.name || property.propertyNumber}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {property.propertyNumber}
                    </p>
                    {property.address && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                        {property.address}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                暫無關聯物業
              </div>
            )}
          </div>

        </div>

        {/* 右側區域 */}
        <div className="space-y-6">
          {/* 圖標卡片 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-8 text-center">
            <Building2 className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{proprietor.englishName}</h3>
            <p className="text-blue-100 text-sm">{proprietor.code}</p>
          </div>

          {/* 創建時間 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">創建時間</span>
                <span className="text-gray-900 dark:text-white">
                  {proprietor.createdAt ? new Date(proprietor.createdAt).toLocaleDateString('zh-TW') : '-'}
                </span>
              </div>
              {proprietor.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">更新時間</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(proprietor.updatedAt).toLocaleDateString('zh-TW')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="編輯資產擁有方"
        maxWidth="2xl"
      >
        <ProprietorForm
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
          proprietorId={proprietorId}
        />
      </Modal>
    </div>
  );
}


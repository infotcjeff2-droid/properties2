// 基於 localStorage 的數據存儲系統
// 注意：已完全禁用自動初始化假數據，只保留手動初始化功能

const STORAGE_KEYS = {
  USERS: 'pm_users',
  COMPANIES: 'pm_companies',
  PROPERTIES: 'pm_properties',
  TENANTS: 'pm_tenants',
  CONTRACTS: 'pm_contracts',
  MAINTENANCE_ORDERS: 'pm_maintenance_orders',
  TRANSACTIONS: 'pm_transactions',
  NOTIFICATIONS: 'pm_notifications',
  PROPRIETORS: 'pm_proprietors',
  RENTING_RECORDS: 'pm_renting_records',
  RENT_OUT_RECORDS: 'pm_rent_out_records',
} as const;

// 初始化標記，確保只初始化一次
let storageInitialized = false;

// 初始化默認數據（只執行一次）
function initStorage() {
  if (typeof window === 'undefined') return;
  
  // 如果已經初始化過，直接返回
  if (storageInitialized) {
    return;
  }
  
  // 首先檢查是否是用戶主動清除的數據
  // 如果是，則完全跳過所有初始化邏輯
  const dataClearedByUser = localStorage.getItem('pm_data_cleared_by_user');
  if (dataClearedByUser === 'true') {
    console.log('[Storage] Data was cleared by user, skipping all initialization');
    // 只初始化必要的空數組結構，但不初始化 dummy data
    const initEmptyIfNotExists = (key: string) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    };
    initEmptyIfNotExists(STORAGE_KEYS.PROPRIETORS);
    initEmptyIfNotExists(STORAGE_KEYS.RENTING_RECORDS);
    initEmptyIfNotExists(STORAGE_KEYS.RENT_OUT_RECORDS);
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    }
    storageInitialized = true;
    return;
  }

  // 初始化用戶（如果不存在）
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      {
        id: 'admin-1',
        email: 'admin@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', // admin123
        name: '系統管理員',
        role: 'SUPER_ADMIN',
        companyId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // 初始化其他數據結構（只初始化為空數組，不自動初始化假數據）
  if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify([]));
  }
  
  // 完全禁用自動初始化假數據
  // 所有數據類型只初始化為空數組（如果不存在）
  // 假數據只能通過手動方式（如 ForceInitButton）初始化
  const initEmptyIfNotExists = (key: string) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
      console.log(`[Storage] Initialized ${key} as empty array (structure only, no dummy data)`);
    }
  };
  
  // 只初始化數據結構，不初始化假數據
  initEmptyIfNotExists(STORAGE_KEYS.PROPERTIES);
  initEmptyIfNotExists(STORAGE_KEYS.TENANTS);
  initEmptyIfNotExists(STORAGE_KEYS.CONTRACTS);
  initEmptyIfNotExists(STORAGE_KEYS.MAINTENANCE_ORDERS);
  initEmptyIfNotExists(STORAGE_KEYS.TRANSACTIONS);
  
  console.log('[Storage] Storage structure initialized (no dummy data auto-initialization)');
  
  // 這些數據類型始終只初始化為空數組（如果不存在）
  // 重要：只初始化不存在的數據，絕不覆蓋現有數據
  // 使用更嚴格的檢查，確保不會覆蓋現有數據
  // 但如果是用戶主動清除的，則不自動初始化
  const initIfNotExists = (key: string) => {
    // 使用外層定義的 dataClearedByUser 變量
    if (dataClearedByUser === 'true') {
      console.log(`[Storage] Data was cleared by user, skipping initialization of ${key}`);
      return;
    }
    
    const existing = localStorage.getItem(key);
    if (!existing) {
      // 只有在完全不存在時才初始化
      localStorage.setItem(key, JSON.stringify([]));
      console.log(`[Storage] Initialized ${key} as empty array (first time only)`);
    } else {
      // 驗證現有數據是否為有效數組
      try {
        const parsed = JSON.parse(existing);
        if (!Array.isArray(parsed)) {
          // 如果不是數組，才重新初始化（這種情況很少見）
          console.log(`[Storage] ${key} is not an array, reinitializing`);
          localStorage.setItem(key, JSON.stringify([]));
        } else {
          // 是有效數組，不觸碰
          console.log(`[Storage] ${key} already exists with ${parsed.length} items, skipping`);
        }
      } catch (error) {
        // 解析失敗，重新初始化
        console.log(`[Storage] Error parsing ${key}, reinitializing`);
        localStorage.setItem(key, JSON.stringify([]));
      }
    }
  };
  
  initIfNotExists(STORAGE_KEYS.PROPRIETORS);
  initIfNotExists(STORAGE_KEYS.RENTING_RECORDS);
  initIfNotExists(STORAGE_KEYS.RENT_OUT_RECORDS);
  
  // 檢查是否是用戶主動清除的數據
  const dataClearedByUserForNotifications = localStorage.getItem('pm_data_cleared_by_user');
  if (dataClearedByUserForNotifications !== 'true') {
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    }
  }
  
  // 標記為已初始化
  storageInitialized = true;
}

// 獲取數據
export function getStorageData<T>(key: keyof typeof STORAGE_KEYS | string): T[] {
  if (typeof window === 'undefined') return [];
  
  // 只在首次調用時初始化
  if (!storageInitialized) {
    initStorage();
  }
  
  const storageKey = typeof key === 'string' && key in STORAGE_KEYS 
    ? STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]
    : key;
  const data = localStorage.getItem(storageKey);
  try {
    const parsed = data ? JSON.parse(data) : [];
    // #region agent log
    if (key === 'PROPERTIES') {
      console.log(`[Storage] Getting ${key}:`, parsed.length, 'items');
    }
    // #endregion
    return parsed;
  } catch (error) {
    console.error(`[Storage] Error parsing ${key}:`, error);
    return [];
  }
}

// 保存數據
export function setStorageData<T>(key: keyof typeof STORAGE_KEYS | string, data: T[]): void {
  if (typeof window === 'undefined') return;
  const storageKey = typeof key === 'string' && key in STORAGE_KEYS 
    ? STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]
    : key;
  localStorage.setItem(storageKey, JSON.stringify(data));
}

// 生成唯一 ID
export function generateId(prefix: string = ''): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 用戶操作
export const userStorage = {
  getAll: () => getStorageData<any>(STORAGE_KEYS.USERS),
  getByEmail: (email: string) => {
    const users = getStorageData<any>(STORAGE_KEYS.USERS);
    return users.find((u: any) => u.email === email) || null;
  },
  getById: (id: string) => {
    const users = getStorageData<any>(STORAGE_KEYS.USERS);
    return users.find((u: any) => u.id === id) || null;
  },
  create: (userData: any) => {
    const users = getStorageData<any>(STORAGE_KEYS.USERS);
    const newUser = {
      ...userData,
      id: generateId('user'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    setStorageData(STORAGE_KEYS.USERS, users);
    return newUser;
  },
  update: (id: string, updates: any) => {
    const users = getStorageData<any>(STORAGE_KEYS.USERS);
    const index = users.findIndex((u: any) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.USERS, users);
    return users[index];
  },
  delete: (id: string) => {
    const users = getStorageData<any>(STORAGE_KEYS.USERS);
    const filtered = users.filter((u: any) => u.id !== id);
    setStorageData(STORAGE_KEYS.USERS, filtered);
    return true;
  },
};

// 公司操作
export const companyStorage = {
  getAll: () => getStorageData<any>(STORAGE_KEYS.COMPANIES),
  getById: (id: string) => {
    const companies = getStorageData<any>(STORAGE_KEYS.COMPANIES);
    return companies.find((c: any) => c.id === id) || null;
  },
  create: (companyData: any) => {
    const companies = getStorageData<any>(STORAGE_KEYS.COMPANIES);
    const newCompany = {
      ...companyData,
      id: generateId('company'),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    companies.push(newCompany);
    setStorageData(STORAGE_KEYS.COMPANIES, companies);
    return newCompany;
  },
  update: (id: string, updates: any) => {
    const companies = getStorageData<any>(STORAGE_KEYS.COMPANIES);
    const index = companies.findIndex((c: any) => c.id === id);
    if (index === -1) return null;
    companies[index] = { ...companies[index], ...updates, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.COMPANIES, companies);
    return companies[index];
  },
};

// 物業操作
export const propertyStorage = {
  getAll: (companyId?: string) => {
    const properties = getStorageData<any>(STORAGE_KEYS.PROPERTIES);
    if (companyId) {
      return properties.filter((p: any) => p.companyId === companyId);
    }
    return properties;
  },
  getById: (id: string) => {
    const properties = getStorageData<any>(STORAGE_KEYS.PROPERTIES);
    // 首先嘗試通過 ID 查找
    let property = properties.find((p: any) => p.id === id);
    // 如果找不到，嘗試通過名稱查找（URL 編碼的）
    if (!property) {
      try {
        const decodedId = decodeURIComponent(id);
        property = properties.find((p: any) => p.name === decodedId);
      } catch (e) {
        // 如果解碼失敗，嘗試直接匹配
        property = properties.find((p: any) => p.name === id);
      }
    }
    return property || null;
  },
  create: (propertyData: any) => {
    const properties = getStorageData<any>(STORAGE_KEYS.PROPERTIES);
    const newProperty = {
      ...propertyData,
      id: generateId('prop'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    properties.push(newProperty);
    setStorageData(STORAGE_KEYS.PROPERTIES, properties);
    
    // 觸發自定義事件，通知其他組件物業已更新
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('propertyUpdated'));
    }
    
    return newProperty;
  },
  update: (id: string, updates: any) => {
    const properties = getStorageData<any>(STORAGE_KEYS.PROPERTIES);
    // 首先嘗試通過 ID 查找
    let index = properties.findIndex((p: any) => p.id === id);
    // 如果找不到，嘗試通過名稱查找（URL 編碼的）
    if (index === -1) {
      try {
        const decodedId = decodeURIComponent(id);
        index = properties.findIndex((p: any) => p.name === decodedId);
      } catch (e) {
        // 如果解碼失敗，嘗試直接匹配
        index = properties.findIndex((p: any) => p.name === id);
      }
    }
    if (index === -1) {
      console.error('[PropertyStorage] Property not found for update:', id);
      return null;
    }
    properties[index] = { ...properties[index], ...updates, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.PROPERTIES, properties);
    
    // 觸發自定義事件，通知其他組件物業已更新
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('propertyUpdated'));
    }
    
    return properties[index];
  },
  delete: (id: string) => {
    const properties = getStorageData<any>(STORAGE_KEYS.PROPERTIES);
    // 首先嘗試通過 ID 查找並刪除
    let filtered = properties.filter((p: any) => p.id !== id);
    // 如果過濾後數量相同，說明可能是通過名稱查找
    if (filtered.length === properties.length) {
      try {
        const decodedId = decodeURIComponent(id);
        filtered = properties.filter((p: any) => p.name !== decodedId && p.id !== decodedId);
      } catch (e) {
        // 如果解碼失敗，嘗試直接匹配
        filtered = properties.filter((p: any) => p.name !== id && p.id !== id);
      }
    }
    
    // 確保數據確實被刪除了
    if (filtered.length === properties.length) {
      console.warn('[PropertyStorage] No property found to delete with id:', id);
      return false;
    }
    
    setStorageData(STORAGE_KEYS.PROPERTIES, filtered);
    
    // 觸發自定義事件，通知其他組件物業已刪除
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('propertyUpdated', { 
        detail: { propertyId: id, action: 'deleted' } 
      }));
      window.dispatchEvent(new CustomEvent('propertyDeleted', { 
        detail: { propertyId: id } 
      }));
    }
    
    console.log('[PropertyStorage] Deleted property:', id, 'Remaining:', filtered.length);
    
    return true;
  },
  clearAll: () => {
    if (typeof window === 'undefined') return false;
    
    // 首先設置標記，表示數據已被用戶主動清除，不應自動重新初始化
    // 這個標記必須在清除數據之前設置，以確保刷新後不會重新初始化
    localStorage.setItem('pm_data_cleared_by_user', 'true');
    console.log('[PropertyStorage] Set pm_data_cleared_by_user flag to true');
    
    // 清除所有物業數據
    setStorageData(STORAGE_KEYS.PROPERTIES, []);
    
    // 清除相關的關聯數據（合同、維護訂單、交易記錄等）
    // 這些數據可能引用了物業，所以也要清除
    setStorageData(STORAGE_KEYS.CONTRACTS, []);
    setStorageData(STORAGE_KEYS.MAINTENANCE_ORDERS, []);
    setStorageData(STORAGE_KEYS.TRANSACTIONS, []);
    setStorageData(STORAGE_KEYS.RENTING_RECORDS, []);
    setStorageData(STORAGE_KEYS.RENT_OUT_RECORDS, []);
    
    // 清除通知（可能包含物業相關的通知）
    const notifications = getStorageData<any>(STORAGE_KEYS.NOTIFICATIONS);
    const filteredNotifications = notifications.filter((n: any) => !n.propertyId);
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, filteredNotifications);
    
    // 觸發自定義事件，通知其他組件所有物業已清除
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('propertyUpdated', { 
        detail: { action: 'clearedAll' } 
      }));
      window.dispatchEvent(new CustomEvent('propertyDeleted', { 
        detail: { action: 'clearedAll' } 
      }));
    }
    
    console.log('[PropertyStorage] Cleared all properties and related data');
    return true;
  },
};

// 租客操作
export const tenantStorage = {
  getAll: (companyId?: string) => {
    const tenants = getStorageData<any>(STORAGE_KEYS.TENANTS);
    if (companyId) {
      return tenants.filter((t: any) => t.companyId === companyId);
    }
    return tenants;
  },
  getById: (id: string) => {
    const tenants = getStorageData<any>(STORAGE_KEYS.TENANTS);
    return tenants.find((t: any) => t.id === id) || null;
  },
  create: (tenantData: any) => {
    const tenants = getStorageData<any>(STORAGE_KEYS.TENANTS);
    const newTenant = {
      ...tenantData,
      id: generateId('tenant'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tenants.push(newTenant);
    setStorageData(STORAGE_KEYS.TENANTS, tenants);
    return newTenant;
  },
  update: (id: string, updates: any) => {
    const tenants = getStorageData<any>(STORAGE_KEYS.TENANTS);
    const index = tenants.findIndex((t: any) => t.id === id);
    if (index === -1) return null;
    tenants[index] = { ...tenants[index], ...updates, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.TENANTS, tenants);
    return tenants[index];
  },
  delete: (id: string) => {
    const tenants = getStorageData<any>(STORAGE_KEYS.TENANTS);
    const filtered = tenants.filter((t: any) => t.id !== id);
    setStorageData(STORAGE_KEYS.TENANTS, filtered);
    return true;
  },
};

// 合約操作
export const contractStorage = {
  getAll: (companyId?: string) => {
    const contracts = getStorageData<any>(STORAGE_KEYS.CONTRACTS);
    if (companyId) {
      return contracts.filter((c: any) => c.companyId === companyId);
    }
    return contracts;
  },
  getById: (id: string) => {
    const contracts = getStorageData<any>(STORAGE_KEYS.CONTRACTS);
    return contracts.find((c: any) => c.id === id) || null;
  },
  create: (contractData: any) => {
    const contracts = getStorageData<any>(STORAGE_KEYS.CONTRACTS);
    const newContract = {
      ...contractData,
      id: generateId('contract'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    contracts.push(newContract);
    setStorageData(STORAGE_KEYS.CONTRACTS, contracts);
    return newContract;
  },
  update: (id: string, updates: any) => {
    const contracts = getStorageData<any>(STORAGE_KEYS.CONTRACTS);
    const index = contracts.findIndex((c: any) => c.id === id);
    if (index === -1) return null;
    contracts[index] = { ...contracts[index], ...updates, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.CONTRACTS, contracts);
    return contracts[index];
  },
};

// 修單操作
export const maintenanceStorage = {
  getAll: (companyId?: string) => {
    const orders = getStorageData<any>(STORAGE_KEYS.MAINTENANCE_ORDERS);
    if (companyId) {
      return orders.filter((o: any) => o.companyId === companyId);
    }
    return orders;
  },
  getById: (id: string) => {
    const orders = getStorageData<any>(STORAGE_KEYS.MAINTENANCE_ORDERS);
    return orders.find((o: any) => o.id === id) || null;
  },
  create: (orderData: any) => {
    const orders = getStorageData<any>(STORAGE_KEYS.MAINTENANCE_ORDERS);
    const newOrder = {
      ...orderData,
      id: generateId('maint'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    setStorageData(STORAGE_KEYS.MAINTENANCE_ORDERS, orders);
    return newOrder;
  },
  update: (id: string, updates: any) => {
    const orders = getStorageData<any>(STORAGE_KEYS.MAINTENANCE_ORDERS);
    const index = orders.findIndex((o: any) => o.id === id);
    if (index === -1) return null;
    orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.MAINTENANCE_ORDERS, orders);
    return orders[index];
  },
};

// 交易操作
export const transactionStorage = {
  getAll: (companyId?: string) => {
    const transactions = getStorageData<any>(STORAGE_KEYS.TRANSACTIONS);
    if (companyId) {
      return transactions.filter((t: any) => t.companyId === companyId);
    }
    return transactions;
  },
  create: (transactionData: any) => {
    const transactions = getStorageData<any>(STORAGE_KEYS.TRANSACTIONS);
    const newTransaction = {
      ...transactionData,
      id: generateId('trans'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    setStorageData(STORAGE_KEYS.TRANSACTIONS, transactions);
    return newTransaction;
  },
};

// 資產擁有方操作
export const proprietorStorage = {
  getAll: (companyId?: string) => {
    // 直接讀取 localStorage，不觸發 initStorage
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PROPRIETORS);
    try {
      const proprietors = data ? JSON.parse(data) : [];
      if (!Array.isArray(proprietors)) return [];
      if (companyId) {
        return proprietors.filter((p: any) => p.companyId === companyId);
      }
      return proprietors;
    } catch (error) {
      console.error(`[Storage] Error parsing PROPRIETORS:`, error);
      return [];
    }
  },
  getById: (id: string) => {
    // 直接讀取 localStorage，不觸發 initStorage
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.PROPRIETORS);
    try {
      const proprietors = data ? JSON.parse(data) : [];
      if (!Array.isArray(proprietors)) return null;
      // 首先嘗試通過 ID 查找
      let proprietor = proprietors.find((p: any) => p.id === id);
      // 如果找不到，嘗試通過 englishName 查找（URL 編碼的）
      if (!proprietor) {
        try {
          const decodedId = decodeURIComponent(id);
          proprietor = proprietors.find((p: any) => p.englishName === decodedId);
        } catch (e) {
          // 如果解碼失敗，嘗試直接匹配
          proprietor = proprietors.find((p: any) => p.englishName === id);
        }
      }
      return proprietor || null;
    } catch (error) {
      console.error(`[Storage] Error parsing PROPRIETORS:`, error);
      return null;
    }
  },
  create: (proprietorData: any) => {
    // 直接讀取和寫入 localStorage，不觸發 initStorage
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.PROPRIETORS);
    let proprietors: any[] = [];
    try {
      proprietors = data ? JSON.parse(data) : [];
      if (!Array.isArray(proprietors)) {
        proprietors = [];
      }
    } catch (error) {
      console.error(`[Storage] Error parsing PROPRIETORS:`, error);
      proprietors = [];
    }
    
    const newProprietor = {
      ...proprietorData,
      id: generateId('proprietor'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    proprietors.push(newProprietor);
    localStorage.setItem(STORAGE_KEYS.PROPRIETORS, JSON.stringify(proprietors));
    return newProprietor;
  },
  update: (id: string, updates: any) => {
    // 直接讀取和寫入 localStorage，不觸發 initStorage
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.PROPRIETORS);
    let proprietors: any[] = [];
    try {
      proprietors = data ? JSON.parse(data) : [];
      if (!Array.isArray(proprietors)) {
        proprietors = [];
      }
    } catch (error) {
      console.error(`[Storage] Error parsing PROPRIETORS:`, error);
      return null;
    }
    
    const index = proprietors.findIndex((p: any) => p.id === id);
    if (index === -1) return null;
    proprietors[index] = { ...proprietors[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PROPRIETORS, JSON.stringify(proprietors));
    return proprietors[index];
  },
  delete: (id: string) => {
    // 直接讀取和寫入 localStorage，不觸發 initStorage
    if (typeof window === 'undefined') return false;
    const data = localStorage.getItem(STORAGE_KEYS.PROPRIETORS);
    let proprietors: any[] = [];
    try {
      proprietors = data ? JSON.parse(data) : [];
      if (!Array.isArray(proprietors)) {
        proprietors = [];
      }
    } catch (error) {
      console.error(`[Storage] Error parsing PROPRIETORS:`, error);
      return false;
    }
    
    const filtered = proprietors.filter((p: any) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROPRIETORS, JSON.stringify(filtered));
    return true;
  },
};

// 交租記錄操作
export const rentingStorage = {
  getAll: (companyId?: string) => {
    const records = getStorageData<any>(STORAGE_KEYS.RENTING_RECORDS);
    if (companyId) {
      return records.filter((r: any) => r.companyId === companyId);
    }
    return records;
  },
  getById: (id: string) => {
    const records = getStorageData<any>(STORAGE_KEYS.RENTING_RECORDS);
    return records.find((r: any) => r.id === id) || null;
  },
  create: (recordData: any) => {
    const records = getStorageData<any>(STORAGE_KEYS.RENTING_RECORDS);
    const newRecord = {
      ...recordData,
      id: generateId('renting'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.RENTING_RECORDS, records);
    return newRecord;
  },
};

// 收租記錄操作
export const rentOutStorage = {
  getAll: (companyId?: string) => {
    const records = getStorageData<any>(STORAGE_KEYS.RENT_OUT_RECORDS);
    if (companyId) {
      return records.filter((r: any) => r.companyId === companyId);
    }
    return records;
  },
  getById: (id: string) => {
    const records = getStorageData<any>(STORAGE_KEYS.RENT_OUT_RECORDS);
    return records.find((r: any) => r.id === id) || null;
  },
  create: (recordData: any) => {
    const records = getStorageData<any>(STORAGE_KEYS.RENT_OUT_RECORDS);
    const newRecord = {
      ...recordData,
      id: generateId('rentout'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.RENT_OUT_RECORDS, records);
    return newRecord;
  },
};


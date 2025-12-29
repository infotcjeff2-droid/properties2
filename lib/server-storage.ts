// 服務器端存儲（使用 JSON 文件）
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { generateDummyData } from './dummy-data';

const STORAGE_FILE = join(process.cwd(), '.data', 'storage.json');

interface StorageData {
  users: any[];
  companies: any[];
  properties: any[];
  tenants: any[];
  contracts: any[];
  maintenanceOrders: any[];
  transactions: any[];
  notifications: any[];
}

function getStorage(): StorageData {
  if (!existsSync(STORAGE_FILE)) {
    // 創建目錄
    const dataDir = join(process.cwd(), '.data');
    if (!existsSync(dataDir)) {
      require('fs').mkdirSync(dataDir, { recursive: true });
    }
    
    // 初始化默認數據
    const dummyData = generateDummyData();
    const defaultData: StorageData = {
      users: [
        {
          id: 'admin-1',
          email: 'admin@example.com',
          password: '$2a$12$1NwP8tfA.Af.CooT550kf.o5L1S5fX1.G7Wi9pra6iyJuN7Izx/uK', // admin123
          name: '系統管理員',
          role: 'SUPER_ADMIN',
          companyId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      companies: [],
      properties: dummyData.properties,
      tenants: dummyData.tenants,
      contracts: dummyData.contracts,
      maintenanceOrders: dummyData.maintenanceOrders,
      transactions: dummyData.transactions,
      notifications: [],
    };
    
    writeFileSync(STORAGE_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  
  try {
    const data = readFileSync(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading storage file:', error);
    return {
      users: [],
      companies: [],
      properties: [],
      tenants: [],
      contracts: [],
      maintenanceOrders: [],
      transactions: [],
      notifications: [],
    };
  }
}

function saveStorage(data: StorageData): void {
  try {
    writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing storage file:', error);
  }
}

export const serverStorage = {
  users: {
    getAll: () => getStorage().users,
    getByEmail: (email: string) => {
      const users = getStorage().users;
      return users.find(u => u.email === email) || null;
    },
    getById: (id: string) => {
      const users = getStorage().users;
      return users.find(u => u.id === id) || null;
    },
    create: (userData: any) => {
      const storage = getStorage();
      const newUser = {
        ...userData,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.users.push(newUser);
      saveStorage(storage);
      return newUser;
    },
  },
  companies: {
    getAll: () => getStorage().companies,
    getById: (id: string) => {
      const companies = getStorage().companies;
      return companies.find(c => c.id === id) || null;
    },
    create: (companyData: any) => {
      const storage = getStorage();
      const newCompany = {
        ...companyData,
        id: `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.companies.push(newCompany);
      saveStorage(storage);
      return newCompany;
    },
  },
};


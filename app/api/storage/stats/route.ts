import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import { propertyStorage, contractStorage, transactionStorage, maintenanceStorage } from '@/lib/storage';

// 這個 API 在客戶端調用，通過請求體傳遞數據
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyId } = body;

    const where: any = {};
    
    // 如果不是 SUPER_ADMIN，只查詢自己公司的數據
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      where.companyId = user.companyId;
    } else if (companyId) {
      where.companyId = companyId;
    }

    // 獲取物業統計（從客戶端傳遞的數據）
    const properties = body.properties || [];
    const totalProperties = properties.length;
    const rentedProperties = properties.filter((p: any) => p.status === 'HOLDING').length;

    // 獲取合約統計
    const contracts = body.contracts || [];
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter((c: any) => c.status === 'ACTIVE').length;

    // 即將到期的合約（7天內）
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const now = new Date();
    
    const expiringContracts = contracts.filter((c: any) => {
      if (c.status !== 'ACTIVE') return false;
      const endDate = new Date(c.endDate);
      return endDate <= sevenDaysFromNow && endDate >= now;
    }).length;

    // 應到帳款項
    const transactions = body.transactions || [];
    const pendingTransactions = transactions.filter((t: any) => 
      t.status === 'PENDING' && t.type === 'INCOME'
    ).length;
    const overdueTransactions = transactions.filter((t: any) => 
      t.status === 'OVERDUE' && t.type === 'INCOME'
    ).length;

    // 7日內修單
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const maintenanceOrders = body.maintenanceOrders || [];
    const recentMaintenanceOrders = maintenanceOrders.filter((o: any) => {
      const createdAt = new Date(o.createdAt);
      return createdAt >= sevenDaysAgo;
    }).length;
    const pendingMaintenanceOrders = maintenanceOrders.filter((o: any) => 
      o.status === 'PENDING'
    ).length;

    // 計算出租率
    const occupancyRate = totalProperties > 0 
      ? Math.round((rentedProperties / totalProperties) * 100) 
      : 0;

    // 招租廣告刊登率
    const availableProperties = totalProperties - rentedProperties;
    const postingRate = totalProperties > 0 
      ? Math.round((availableProperties / totalProperties) * 100) 
      : 0;

    return NextResponse.json({
      stats: {
        occupancyRate: {
          current: rentedProperties,
          total: totalProperties,
          percentage: occupancyRate,
        },
        expiringContracts: {
          count: expiringContracts,
          total: activeContracts,
        },
        pendingPayments: {
          pending: pendingTransactions,
          overdue: overdueTransactions,
          total: pendingTransactions + overdueTransactions,
        },
        maintenanceOrders: {
          recent: recentMaintenanceOrders,
          pending: pendingMaintenanceOrders,
        },
        postingRate: {
          percentage: postingRate,
          available: availableProperties,
          total: totalProperties,
        },
      },
    });
  } catch (error) {
    console.error('Get storage stats error:', error);
    return NextResponse.json(
      { error: '獲取統計數據失敗' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import { propertyStorage, contractStorage, transactionStorage, maintenanceStorage } from '@/lib/storage';

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    // 在服務器端無法訪問 localStorage，需要通過 API 獲取
    // 這裡返回基本結構，實際數據將在客戶端獲取
    return NextResponse.json({
      stats: {
        occupancyRate: {
          current: 0,
          total: 0,
          percentage: 0,
        },
        expiringContracts: {
          count: 0,
          total: 0,
        },
        pendingPayments: {
          pending: 0,
          overdue: 0,
          total: 0,
        },
        maintenanceOrders: {
          recent: 0,
          pending: 0,
        },
        postingRate: {
          percentage: 0,
          available: 0,
          total: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: '獲取統計數據失敗' },
      { status: 500 }
    );
  }
}

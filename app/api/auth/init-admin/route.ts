import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/auth';

export async function POST() {
  try {
    // 檢查管理員是否已存在
    const existingAdmin = await getUserByEmail('admin@example.com');
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: '管理員已存在',
        email: 'admin@example.com',
        password: 'admin123',
      });
    }

    // 創建新的管理員
    const admin = await createUser(
      'admin@example.com',
      'admin123',
      '系統管理員',
      'SUPER_ADMIN'
    );

    return NextResponse.json({
      success: true,
      message: '管理員創建成功',
      email: admin.email,
      password: 'admin123',
    });
  } catch (error: any) {
    console.error('Init admin error:', error);
    return NextResponse.json(
      { error: '創建管理員失敗: ' + error.message },
      { status: 500 }
    );
  }
}


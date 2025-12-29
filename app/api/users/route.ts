import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';
import { createUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// 獲取用戶列表
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    // SUPER_ADMIN 可以查看所有用戶
    // COMPANY_ADMIN 只能查看自己公司的用戶
    // 其他角色無權限
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json(
        { error: '無權限訪問' },
        { status: 403 }
      );
    }

    const where: any = {};
    
    if (user.role === 'COMPANY_ADMIN' && user.companyId) {
      where.companyId = user.companyId;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: '獲取用戶列表失敗' },
      { status: 500 }
    );
  }
}

// 創建新用戶
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
    const { email, password, name, role, companyId } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '請提供電子郵件、密碼和姓名' },
        { status: 400 }
      );
    }

    // 檢查權限
    let targetCompanyId = companyId;
    let targetRole = role || UserRole.STAFF;

    if (user.role === 'SUPER_ADMIN') {
      // SUPER_ADMIN 可以創建任何角色和任何公司的用戶
      if (!companyId) {
        return NextResponse.json(
          { error: '請指定公司' },
          { status: 400 }
        );
      }

      // 驗證公司存在
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return NextResponse.json(
          { error: '公司不存在' },
          { status: 400 }
        );
      }
    } else if (user.role === 'COMPANY_ADMIN') {
      // COMPANY_ADMIN 只能創建自己公司的用戶，且不能創建 SUPER_ADMIN 或 COMPANY_ADMIN
      if (!user.companyId) {
        return NextResponse.json(
          { error: '您不屬於任何公司' },
          { status: 400 }
        );
      }

      targetCompanyId = user.companyId;

      if (targetRole === 'SUPER_ADMIN' || targetRole === 'COMPANY_ADMIN') {
        return NextResponse.json(
          { error: '無權限創建此角色' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: '無權限創建用戶' },
        { status: 403 }
      );
    }

    // 檢查郵箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '該電子郵件已被使用' },
        { status: 400 }
      );
    }

    // 創建用戶
    const newUser = await createUser(
      email,
      password,
      name,
      targetRole as UserRole,
      targetCompanyId
    );

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: '創建用戶失敗' },
      { status: 500 }
    );
  }
}


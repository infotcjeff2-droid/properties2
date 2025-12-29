import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';
import { UserRole } from '@prisma/client';

// 獲取所有公司（僅限 SUPER_ADMIN）
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: '無權限訪問' },
        { status: 403 }
      );
    }

    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            properties: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { error: '獲取公司列表失敗' },
      { status: 500 }
    );
  }
}

// 創建新公司（僅限 SUPER_ADMIN）
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: '只有超級管理員可以創建公司' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, domain, subscriptionPlan } = body;

    if (!name) {
      return NextResponse.json(
        { error: '請提供公司名稱' },
        { status: 400 }
      );
    }

    // 檢查域名是否已存在
    if (domain) {
      const existing = await prisma.company.findUnique({
        where: { domain },
      });

      if (existing) {
        return NextResponse.json(
          { error: '該域名已被使用' },
          { status: 400 }
        );
      }
    }

    const company = await prisma.company.create({
      data: {
        name,
        domain: domain || null,
        subscriptionPlan: subscriptionPlan || null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json(
      { error: '創建公司失敗' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  try {
    console.log('[api/auth/me] Checking authentication...');
    
    // 在 API 路由中，使用 NextRequest 讀取 cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      console.log('[api/auth/me] No auth-token cookie found');
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    console.log('[api/auth/me] Token found, length:', token.length);
    
    const { payload } = await jwtVerify(token, secret);
    
    console.log('[api/auth/me] JWT verified successfully:', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return NextResponse.json({
      user: {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
        companyId: payload.companyId as string | null,
      },
    });
  } catch (error: any) {
    console.error('[api/auth/me] Error:', error?.message || error);
    return NextResponse.json(
      { error: '獲取用戶信息失敗' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { serverStorage } from '@/lib/server-storage';
import { hashPassword } from '@/lib/auth';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    // 檢查是否已存在訪客帳號
    const existingGuest = serverStorage.users.getByEmail('guest@example.com');
    
    let guestUser;
    if (existingGuest) {
      guestUser = existingGuest;
    } else {
      // 創建新的訪客帳號
      const hashedPassword = await hashPassword('guest123');
      guestUser = serverStorage.users.create({
        email: 'guest@example.com',
        password: hashedPassword,
        name: '訪客',
        role: 'STAFF', // 訪客使用 STAFF 角色，權限較低
        companyId: null,
      });
    }

    // 創建 JWT token
    const token = await new SignJWT({
      userId: guestUser.id,
      email: guestUser.email,
      role: guestUser.role,
      companyId: guestUser.companyId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      user: {
        id: guestUser.id,
        email: guestUser.email,
        name: guestUser.name,
        role: guestUser.role,
        companyId: guestUser.companyId,
        company: null,
      },
    });

    // 設置 HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Guest login error:', error);
    return NextResponse.json(
      { error: '訪客登入失敗，請稍後再試' },
      { status: 500 }
    );
  }
}


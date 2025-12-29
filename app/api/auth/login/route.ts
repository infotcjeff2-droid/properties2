import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/auth';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    // #region agent log
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(process.cwd(), '.cursor', 'debug.log');
    const logEntry1 = JSON.stringify({
      location: 'login/route.ts:9',
      message: 'Login API called',
      data: { hasBody: true },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'LOGIN-1'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry1); } catch (e) {}
    // #endregion

    const body = await request.json();
    const { email, password } = body;

    // #region agent log
    const logEntry2 = JSON.stringify({
      location: 'login/route.ts:15',
      message: 'Login request parsed',
      data: { hasEmail: !!email, hasPassword: !!password, email },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'LOGIN-1'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry2); } catch (e) {}
    // #endregion

    if (!email || !password) {
      return NextResponse.json(
        { error: '請提供電子郵件和密碼' },
        { status: 400 }
      );
    }

    // #region agent log
    const logEntry3 = JSON.stringify({
      location: 'login/route.ts:21',
      message: 'Calling verifyUser',
      data: { email },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'LOGIN-2'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry3); } catch (e) {}
    // #endregion

    const user = await verifyUser(email, password);

    // #region agent log
    const logEntry4 = JSON.stringify({
      location: 'login/route.ts:23',
      message: 'verifyUser result',
      data: { hasUser: !!user, userId: user?.id },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'LOGIN-2'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry4); } catch (e) {}
    // #endregion

    if (!user) {
      return NextResponse.json(
        { error: '電子郵件或密碼錯誤' },
        { status: 401 }
      );
    }

    // 創建 JWT token
    // #region agent log
    const logEntry5 = JSON.stringify({
      location: 'login/route.ts:85',
      message: 'Creating JWT token',
      data: { userId: user.id, email: user.email, role: user.role },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'HYP-3'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry5); } catch (e) {}
    // #endregion

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // #region agent log
    const logEntry6 = JSON.stringify({
      location: 'login/route.ts:95',
      message: 'JWT token created',
      data: { hasToken: !!token, tokenLength: token?.length },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'HYP-3'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry6); } catch (e) {}
    // #endregion

    // 先創建響應對象
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        company: user.company,
      },
    });

    // 設置 HTTP-only cookie
    // 使用與 guest-access 相同的設置方式，確保一致性
    // 在開發環境中，secure 必須為 false（localhost 不是 HTTPS）
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 在開發環境中設為 false，生產環境設為 true
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    // 驗證 cookie 是否已設置
    const cookieValue = response.cookies.get('auth-token')?.value;
    const allCookies = response.cookies.getAll();
    const setCookieHeaders = response.headers.getSetCookie();
    
    console.log('[Login] Cookie set:', {
      hasCookie: !!cookieValue,
      cookieLength: cookieValue?.length,
      isHttpOnly: true,
      tokenPrefix: token.substring(0, 20) + '...',
      env: process.env.NODE_ENV,
      allCookiesCount: allCookies.length,
      setCookieHeadersCount: setCookieHeaders.length,
      setCookieHeaders: setCookieHeaders,
    });

    // #region agent log
    const logEntry7 = JSON.stringify({
      location: 'login/route.ts:116',
      message: 'Cookie set on response',
      data: { 
        hasToken: !!token,
        cookieSet: response.cookies.has('auth-token'),
        cookieValue: response.cookies.get('auth-token')?.value?.substring(0, 20) + '...'
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'HYP-2'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry7); } catch (e) {}
    // #endregion

    return response;
  } catch (error: any) {
    // #region agent log
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(process.cwd(), '.cursor', 'debug.log');
    const logEntry = JSON.stringify({
      location: 'login/route.ts:64',
      message: 'Login error caught',
      data: { 
        errorMessage: error?.message, 
        errorName: error?.name,
        errorStack: error?.stack?.substring(0, 200)
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'LOGIN-3'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry); } catch (e) {}
    // #endregion

    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登入失敗，請稍後再試' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

const publicRoutes = ['/login'];
const adminRoutes = ['/admin', '/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳過 API 路由（除了需要認證的）
  if (pathname.startsWith('/api/')) {
    // API 路由在各自的處理函數中處理認證
    return NextResponse.next();
  }

  // 登入頁面始終允許訪問
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // 檢查認證 token
  const token = request.cookies.get('auth-token')?.value;
  // 檢查訪客訪問標記
  const guestAccess = request.cookies.get('guest-access')?.value;

  // #region agent log
  // Note: Cannot use fs in Edge Runtime, logging disabled in middleware
  // #endregion

  // 如果沒有 token 且沒有訪客訪問標記，重定向到登入頁面
  if (!token && !guestAccess) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果有訪客訪問標記，允許訪問（除了管理員路由）
  if (!token && guestAccess) {
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // #region agent log
    // Note: Cannot use fs in Edge Runtime, logging disabled in middleware
    // #endregion

    // 檢查管理員路由（只有 SUPER_ADMIN 可以訪問）
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (role !== 'SUPER_ADMIN') {
        // 如果不是 SUPER_ADMIN，重定向到 properties 頁面
        return NextResponse.redirect(new URL('/properties', request.url));
      }
    }

    // 添加用戶信息到請求頭（可選）
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', role);
    requestHeaders.set('x-company-id', (payload.companyId as string) || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error: any) {
    // #region agent log
    // Note: Cannot use fs in Edge Runtime, logging disabled in middleware
    // #endregion

    // Token 無效，清除 cookie 並允許訪問公開路由
    const response = NextResponse.next();
    response.cookies.delete('auth-token');
    
    // 如果是管理員路由，重定向到登入頁
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled separately in middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// 在靜態導出模式下，middleware 不會運行
// 認證將在客戶端處理


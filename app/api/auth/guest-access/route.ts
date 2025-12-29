import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectPath = searchParams.get('redirect') || '/properties';

    const response = NextResponse.json({ 
      success: true,
      redirect: redirectPath 
    });

    // 設置訪客訪問 cookie（24小時有效）
    response.cookies.set('guest-access', 'true', {
      httpOnly: false, // 允許客戶端讀取
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24小時
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Guest access error:', error);
    return NextResponse.json(
      { error: '設置訪客訪問失敗' },
      { status: 500 }
    );
  }
}


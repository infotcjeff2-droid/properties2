import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth-token');
  response.cookies.delete('guest-access'); // 同時清除訪客訪問標記
  return response;
}


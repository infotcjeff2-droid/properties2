import { NextResponse } from 'next/server';
import { generateDummyData } from '@/lib/dummy-data';

export async function POST() {
  try {
    // 這個 API 用於服務器端初始化，但我們主要使用客戶端 localStorage
    // 所以這裡只是返回成功，實際初始化在客戶端完成
    return NextResponse.json({ 
      success: true, 
      message: '請在客戶端使用 initDummyData() 函數初始化數據' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


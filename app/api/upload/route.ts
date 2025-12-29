import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'cover' or 'geo'

    if (!file) {
      return NextResponse.json(
        { error: '沒有上傳文件' },
        { status: 400 }
      );
    }

    // 驗證文件類型
    const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!acceptedFormats.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件格式。請上傳 JPG, PNG, SVG 或 WEBP 格式的圖片。' },
        { status: 400 }
      );
    }

    // 創建上傳目錄（如果不存在）
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}-${timestamp}-${randomStr}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // 將文件轉換為 Buffer 並保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 返回文件 URL（相對於 public 目錄）
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('文件上傳錯誤:', error);
    return NextResponse.json(
      { error: '文件上傳失敗: ' + error.message },
      { status: 500 }
    );
  }
}


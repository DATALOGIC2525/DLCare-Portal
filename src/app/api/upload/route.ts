import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // 認証チェック：SYSTEM_ADMINのみ許可
    if (session?.user?.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // ユニークなファイル名を生成
    const ext = path.extname(file.name) || '.png';
    const filename = `${crypto.randomUUID()}${ext}`;
    
    // 保存先ディレクトリ（public/uploads）
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // ディレクトリが存在しない場合は作成
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // ファイルを保存
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // アクセス用URLを返す
    const url = `/uploads/${filename}`;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

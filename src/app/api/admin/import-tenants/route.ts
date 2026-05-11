import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 });
    }

    const text = await file.text();
    const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    
    if (rows.length < 2) {
      return NextResponse.json({ error: 'CSVのデータが空、またはヘッダーのみです' }, { status: 400 });
    }

    // ヘッダー行を除外
    const dataRows = rows.slice(1);
    
    // ソフトウェア列の定義（テンプレートの列インデックス: 5以降）
    // 5: 【DL Care】REAL4, 6: 見積・取合保守, 7: OA保守, 8: NC保守, 9: Arris保守, 10: 出荷計画, 11: 溶接ロボ, 12: へ移行中・DW保守はキャンセル
    const SOFTWARE_COLUMNS = [
      { index: 5, name: 'REAL4', category: 'DL Care' },
      { index: 6, name: '見積・取合保守', category: 'DL Care' },
      { index: 7, name: 'OA保守', category: 'DL Care' },
      { index: 8, name: 'NC保守', category: 'DL Care' },
      { index: 9, name: 'Arris保守', category: 'DL Care' },
      { index: 10, name: '出荷計画', category: 'DL Care' },
      { index: 11, name: '溶接ロボ', category: 'DL Care' },
      { index: 12, name: 'へ移行中・DW保守はキャンセル', category: 'DL Care' },
    ];
    
    // レスポンス用のCSVのヘッダーを作成 (BOMを付与してExcelの文字化けを防止)
    let resultCsv = '\uFEFFユーザー名,保守ID,登録用ID\n';

    for (const row of dataRows) {
      const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
      const parseCol = (index: number) => {
        const val = cols[index] || '';
        return val.replace(/^"|"$/g, '').trim();
      };

      const name = parseCol(0);
      if (!name) continue; // 名前がない行はスキップ

      const maintenanceId = parseCol(1) || null;
      const startMonth = parseCol(2) || null;
      const startYear = parseCol(3) || null;
      const paymentMethod = parseCol(4) || null;
      const remarks = parseCol(13) || null;

      // ランダムなIDを生成
      const newId = `DL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      // トランザクションで保存
      await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            name,
            userLimit: 10, // デフォルト
            maintenanceId,
            startMonth,
            startYear,
            paymentMethod,
            remarks
          }
        });

        // ソフトウェアの登録
        const softwaresToCreate = [];
        for (const softCol of SOFTWARE_COLUMNS) {
          const val = parseCol(softCol.index);
          // 〇 がついている場合
          if (val === '〇' || val === '○') {
            softwaresToCreate.push({
              tenantId: tenant.id,
              name: softCol.name,
              category: softCol.category,
              count: 1 // デフォルト1
            });
          }
        }

        if (softwaresToCreate.length > 0) {
          await tx.tenantSoftware.createMany({
            data: softwaresToCreate
          });
        }

        await tx.preIssuedId.create({
          data: {
            tenantId: tenant.id,
            issuedId: newId
          }
        });
      });

      // 結果CSVの行を追加
      resultCsv += `"${name}","${maintenanceId || ''}","${newId}"\n`;
    }

    // CSVファイルとしてレスポンスを返す
    return new NextResponse(resultCsv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="import_result.csv"',
      },
    });

  } catch (error: any) {
    console.error('CSV Import Error:', error);
    return NextResponse.json({ error: error.message || 'インポート中にエラーが発生しました' }, { status: 500 });
  }
}

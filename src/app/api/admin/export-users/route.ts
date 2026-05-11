import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      include: { tenant: true },
      orderBy: [
        { tenant: { name: 'asc' } },
        { createdAt: 'asc' }
      ],
    });

    // CSVのヘッダーを作成 (BOMを付与してExcelの文字化けを防止)
    // メルマガ配信に必要な項目を優先
    let csvContent = '\uFEFF会社名,保守ID,ご担当者氏名,メールアドレス,電話番号,部署名,役割,ステータス\n';

    for (const user of users) {
      const roleName = user.role === 'SYSTEM_ADMIN' ? 'システム管理者' : 
                       user.role === 'TENANT_ADMIN' ? 'テナント管理者' : '一般ユーザー';
      const status = user.isActive ? '有効' : '停止中';

      // CSVエスケープ処理（簡易）
      const escape = (val: string | null) => {
        if (!val) return '""';
        return `"${val.replace(/"/g, '""')}"`;
      };

      csvContent += `${escape(user.tenant.name)},${escape(user.tenant.maintenanceId)},${escape(user.contactName)},${escape(user.email)},${escape(user.phoneNumber)},${escape(user.department)},${escape(roleName)},${escape(status)}\n`;
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="dlcare_mailing_list_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export Users Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

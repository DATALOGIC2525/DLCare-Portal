import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Download, Building2, Mail, Phone } from 'lucide-react';

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') {
    redirect('/dashboard');
  }

  // テナントごとにユーザーをグループ化して取得（システム管理用テナントは除外）
  const tenants = await prisma.tenant.findMany({
    where: { name: { not: '株式会社データロジック (システム管理)' } },
    include: {
      users: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">登録ユーザーリスト</h2>
          <p className="text-slate-500 text-sm mt-1">マスター管理の登録企業と、そこに紐づく担当者情報を確認・エクスポートできます。</p>
        </div>
        <a href="/api/admin/export-users" download>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95">
            <Download className="h-4 w-4 mr-2" />
            メルマガ用CSVダウンロード
          </Button>
        </a>
      </div>

      <div className="space-y-6">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <Building2 className="h-5 w-5 text-slate-400" />
              <h3 className="font-bold text-slate-700 text-lg">{tenant.name}</h3>
              <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">
                保守ID: {tenant.maintenanceId || '未設定'}
              </Badge>
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-400">{tenant.users.length} 名の担当者</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[180px] font-bold text-slate-600">氏名</TableHead>
                    <TableHead className="w-[180px] font-bold text-slate-600">部署</TableHead>
                    <TableHead className="w-[100px] font-bold text-slate-600">権限</TableHead>
                    <TableHead className="font-bold text-slate-600">メールアドレス</TableHead>
                    <TableHead className="w-[150px] font-bold text-slate-600">電話番号</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenant.users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-800">{user.contactName}</TableCell>
                      <TableCell className="text-slate-600">{user.department || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'TENANT_ADMIN' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          {user.role === 'TENANT_ADMIN' ? '管理者' : '一般'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {user.phoneNumber ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {user.phoneNumber}
                          </div>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {tenant.users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-slate-400 italic bg-slate-50/30">
                        この企業にはまだ担当者が登録されていません。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}

        {tenants.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">登録されている企業がありません。</p>
          </div>
        )}
      </div>
    </div>
  );
}

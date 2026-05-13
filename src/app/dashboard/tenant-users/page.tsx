import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toggleUserStatus, updateUserRole } from './actions';
import { UserCreateForm } from './user-create-form';
import Link from 'next/link';
import { Users, UserPlus, ShieldCheck, UserCog, ArrowLeft, MoreHorizontal, UserCheck, UserX, Shield, User as UserIcon } from 'lucide-react';

export default async function TenantUsersPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'TENANT_ADMIN' && session.user.role !== 'SYSTEM_ADMIN')) {
    redirect('/dashboard');
  }

  const tenantId = session.user.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { users: { orderBy: { createdAt: 'asc' } } }
  });

  if (!tenant) return null;

  if (!tenant) return null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">ユーザー管理</h2>
          <p className="text-slate-500 text-sm mt-1">貴社に所属する担当者アカウントの作成と管理を行います。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── 担当者アカウント作成フォーム ── */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-md border-blue-100 bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
            <CardContent>
              <UserCreateForm />
            </CardContent>
          </Card>
        </div>

        {/* ── ユーザー一覧 ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                登録済みアカウント一覧
              </h3>
              <Badge variant="secondary" className="bg-slate-200/50 text-slate-600">{tenant.users.length} 名</Badge>
            </div>
            <div className="divide-y divide-slate-100">
              {tenant.users.map((user) => (
                <div key={user.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${user.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      {user.contactName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm truncate ${user.isActive ? 'text-slate-800' : 'text-slate-400'}`}>{user.contactName}</span>
                        {user.role === 'TENANT_ADMIN' && (
                          <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[9px] h-4">管理者</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 mr-2">
                      <form action={updateUserRole.bind(null, user.id, 'TENANT_ADMIN')}>
                        <Button 
                          type="submit" 
                          variant="ghost" 
                          size="sm" 
                          disabled={user.id === session.user.id || user.role === 'TENANT_ADMIN'}
                          className={`h-7 px-2 text-[10px] font-bold rounded-full ${user.role === 'TENANT_ADMIN' ? 'text-amber-600 bg-amber-50 cursor-default' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'}`}
                        >
                          {user.role === 'TENANT_ADMIN' ? <Shield className="h-3 w-3 mr-1" /> : <UserIcon className="h-3 w-3 mr-1" />}
                          {user.role === 'TENANT_ADMIN' ? '管理者' : '管理者にする'}
                        </Button>
                      </form>
                    </div>

                    <Badge variant={user.isActive ? 'default' : 'secondary'} className={`text-[10px] ${user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      {user.isActive ? '有効' : '停止中'}
                    </Badge>
                    
                    {user.role !== 'TENANT_ADMIN' && (
                      <form action={toggleUserStatus.bind(null, user.id, !user.isActive)}>
                        <Button
                          size="icon"
                          type="submit"
                          variant="ghost"
                          className={`h-8 w-8 rounded-full ${user.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title={user.isActive ? 'アカウントを停止' : 'アカウントを再開'}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
              
              {tenant.users.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-sm">
                  まだ担当者が登録されていません。左のフォームから作成してください。
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

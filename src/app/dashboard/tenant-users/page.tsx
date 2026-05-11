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
  const role = session?.user?.role;
  if (role !== 'TENANT_ADMIN' && role !== 'SYSTEM_ADMIN') {
    redirect('/dashboard');
  }

  const tenantId = session.user.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { users: { orderBy: { createdAt: 'asc' } } }
  });

  if (!tenant) return null;

  const activeUsers = tenant.users.filter(u => u.isActive);
  const canCreate = activeUsers.length < tenant.userLimit;
  const usagePercent = Math.min(100, (activeUsers.length / tenant.userLimit) * 100);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">ユーザー管理</h2>
          <p className="text-slate-500 text-sm mt-1">貴社に所属する担当者アカウントの作成と管理を行います。</p>
        </div>
      </div>

      {/* ── 利用状況サマリ ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-2.5 rounded-xl">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50/30">利用中</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">{activeUsers.length} <span className="text-sm font-normal text-slate-400">/ {tenant.userLimit} 名</span></div>
              <div className="text-sm text-slate-500">現在の有効なユーザー数</div>
            </div>
            <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${usagePercent > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${usagePercent}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-50 p-2.5 rounded-xl">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50/30">契約上限</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">{tenant.userLimit} <span className="text-sm font-normal text-slate-400">名</span></div>
              <div className="text-sm text-slate-500">ご契約のユーザー上限数</div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 italic">※上限変更は管理者にお問い合わせください</p>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-slate-200 ${!canCreate ? 'bg-red-50/30 border-red-100' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${!canCreate ? 'bg-red-100' : 'bg-indigo-50'}`}>
                <UserPlus className={`h-5 w-5 ${!canCreate ? 'text-red-600' : 'text-indigo-600'}`} />
              </div>
              <Badge variant="outline" className={`${!canCreate ? 'text-red-600 border-red-200' : 'text-indigo-600 border-indigo-100'}`}>
                作成可能
              </Badge>
            </div>
            <div className="space-y-1">
              <div className={`text-3xl font-bold ${!canCreate ? 'text-red-600' : 'text-slate-900'}`}>
                {Math.max(0, tenant.userLimit - activeUsers.length)} <span className="text-sm font-normal text-slate-400">名</span>
              </div>
              <div className="text-sm text-slate-500">あと何名作成できるか</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── 担当者アカウント作成フォーム ── */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-md border-blue-100 bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
            <CardContent>
              {canCreate ? (
                <UserCreateForm />
              ) : (
                <div className="p-6 bg-red-50 rounded-xl border border-red-100 text-center space-y-3">
                  <div className="mx-auto w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <UserX className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-sm font-bold text-red-900">作成上限に達しました</div>
                  <p className="text-xs text-red-700 leading-relaxed">
                    ユーザー上限を増やすには、システム管理者へお問い合わせください。
                  </p>
                </div>
              )}
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

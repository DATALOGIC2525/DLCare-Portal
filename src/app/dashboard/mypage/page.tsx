import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserSoftwareTable } from './user-software-table';
import { ProfileForm } from './profile-form';
import { User, Building2, ShieldCheck, Calendar, CreditCard, ClipboardList, Info, ArrowRight } from 'lucide-react';

export default async function MyPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tenant: {
        include: {
          softwares: {
            orderBy: [{ category: 'asc' }, { createdAt: 'asc' }]
          }
        }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  const { tenant } = user;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-12">
      <div className="flex items-end justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            マイページ
          </h1>
          <p className="text-slate-500 mt-1 font-medium">登録情報の確認とシステムの所有状況</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">アカウント権限</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 mt-1">
            {user.role === 'SYSTEM_ADMIN' ? 'システム管理者' : user.role === 'TENANT_ADMIN' ? 'ユーザー管理者' : '一般ユーザー'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側: アカウント設定フォーム */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-500" />
                アカウント設定
              </CardTitle>
              <CardDescription>
                氏名、メールアドレスの変更、パスワードの更新が行えます。
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ProfileForm user={user} />
            </CardContent>
          </Card>

          {/* 所有システム状況 */}
          <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-500" />
                所有システム一覧
              </CardTitle>
              <CardDescription>
                現在ご契約・ご利用中のソフトウェアおよびライセンス情報です。
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <UserSoftwareTable softwares={tenant.softwares} />
            </CardContent>
          </Card>
        </div>

        {/* 右側: 企業・保守情報 */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/60 bg-indigo-900 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Building2 size={120} />
            </div>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-200">
                <Building2 className="h-4 w-4" />
                所属企業情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div>
                <Label className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">企業名</Label>
                <p className="text-xl font-black leading-tight mt-0.5">{tenant.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <Label className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">保守ID</Label>
                  <p className="font-mono font-bold text-lg text-white">{tenant.maintenanceId || '-'}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">利用可能ユーザー</Label>
                  <p className="font-bold text-lg">{tenant.userLimit} 名</p>
                </div>
              </div>

              {(user.role === 'TENANT_ADMIN' || user.role === 'SYSTEM_ADMIN') && (
                <div className="pt-4 border-t border-indigo-800/50">
                  <a 
                    href="/dashboard/tenant-users" 
                    className="flex items-center justify-between group/link bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-indigo-200" />
                      <span className="text-xs font-bold text-white">ユーザー管理画面へ</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-indigo-300 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/60 bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                契約・保守内容
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
                    <Calendar size={14} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">保守開始時期</span>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {tenant.startYear || tenant.startMonth ? (
                    <>
                      {tenant.startYear} {tenant.startMonth}
                    </>
                  ) : '-'}
                </span>
              </div>

              <div className="flex items-start justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
                    <CreditCard size={14} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">支払方法</span>
                </div>
                <span className="text-xs font-bold text-slate-700">{tenant.paymentMethod || '-'}</span>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={14} className="text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-500">備考</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 leading-relaxed min-h-[60px]">
                  {tenant.remarks || '備考はありません'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

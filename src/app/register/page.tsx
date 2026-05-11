'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { UserPlus, Building, Mail, Lock, Phone, MapPin, User, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        const json = await res.json();
        throw new Error(json.error || '登録に失敗しました');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] relative overflow-hidden p-4">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />

      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm border-slate-200 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
        
        <CardHeader className="space-y-2 pb-8 pt-10">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-center text-slate-800">新規アカウント作成</CardTitle>
          <CardDescription className="text-center text-slate-500 text-base max-w-md mx-auto">
            マスター管理画面で発行された「登録ID」を使用して、管理者アカウントを作成します。
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            {error && (
              <div className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                {error}
              </div>
            )}
            
            <div className="max-w-md mx-auto space-y-5">
                <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  管理者アカウント情報
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                    ご担当者氏名 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="contactName" name="contactName" required placeholder="山田 太郎" className="pl-10 h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                    部署名
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="department" name="department" placeholder="営業部" className="pl-10 h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                    メールアドレス <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="email" name="email" type="email" required placeholder="name@example.com" className="pl-10 h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                    パスワード <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="password" name="password" type="password" required className="pl-10 h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50" />
                  </div>
                </div>
              </div>

            {/* Registration ID Section - Highlighted */}
            <div className="bg-blue-50/80 rounded-2xl p-6 border border-blue-100 mt-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 text-white rounded-full p-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-blue-900">登録認証</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preIssuedId" className="text-sm font-bold text-blue-800">
                  発行済み登録ID <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-blue-400" />
                  <Input 
                    id="preIssuedId" 
                    name="preIssuedId" 
                    required 
                    placeholder="管理画面から発行されたIDを入力" 
                    className="pl-10 h-12 border-blue-200 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono bg-white" 
                  />
                </div>
                <p className="text-[11px] text-blue-600/70 mt-2 ml-1">
                  ※登録IDが不明な場合は、システム管理者にお問い合わせください。
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6 pb-10 pt-4">
            <Button className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200" type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  アカウントを作成中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  アカウントを作成する <ChevronRight className="h-5 w-5" />
                </span>
              )}
            </Button>
            
            <div className="text-sm text-center text-slate-500 font-medium">
              すでにアカウントをお持ちの方は{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-bold transition-all">
                こちらからログイン
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      {/* Footer text */}
      <div className="absolute bottom-6 left-0 w-full text-center text-slate-500 text-xs z-10">
        &copy; {new Date().getFullYear()} Data Logic Co., Ltd. All rights reserved.
      </div>
    </div>
  );
}

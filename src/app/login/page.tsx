'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('メールアドレスまたはパスワードが間違っています。もしくはアカウントが停止されています。');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError('ログイン処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex justify-center mb-2">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DL Care Logo" width="48" height="48" className="object-contain" />
          <div>
            <div className="text-slate-800 font-black text-2xl tracking-tight leading-tight">DL Care</div>
            <div className="text-slate-400 text-[10px] leading-tight tracking-[0.2em] uppercase font-bold">Portal</div>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">ログイン</CardTitle>
          <CardDescription className="text-center">
            DLCare ポータルサイトへようこそ
          </CardDescription>
        </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {registered && (
            <div className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-md">
              登録が完了しました。ログインしてください。
            </div>
          )}
          {error && <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required placeholder="mail@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
          <div className="text-sm text-center text-muted-foreground space-y-3">
            <p>※ご担当者の方は管理者よりログイン情報をお受け取りください</p>
            <div className="pt-2 border-t border-slate-100">
              <p className="mb-2">マスター管理より登録IDを受け取られた方はこちら</p>
              <Link href="/register">
                <Button variant="outline" className="w-full text-primary hover:text-primary-foreground">
                  登録IDを使用して新規アカウント作成
                </Button>
              </Link>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>

    {/* プレゼン・開発用クイック入力（開発環境のみ表示） */}
    {process.env.NODE_ENV === 'development' && (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-sm space-y-3">
        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest text-center">Presentation Support (Dev Only)</div>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-[10px] h-8 bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
            onClick={() => {
              const emailInput = document.getElementById('email') as HTMLInputElement;
              if (emailInput) {
                emailInput.value = 'admin@example.com';
                const passwordInput = document.getElementById('password') as HTMLInputElement;
                if (passwordInput) passwordInput.focus();
              }
            }}
          >
            システム管理者
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-[10px] h-8 bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
            onClick={() => {
              const emailInput = document.getElementById('email') as HTMLInputElement;
              if (emailInput) {
                emailInput.value = 'test@datalogic.co.jp';
                const passwordInput = document.getElementById('password') as HTMLInputElement;
                if (passwordInput) passwordInput.focus();
              }
            }}
          >
            テストユーザー
          </Button>
        </div>
        <p className="text-[9px] text-amber-600 text-center italic">※クリックするとメールアドレスが自動入力されます。パスワードを入力してログインしてください。</p>
      </div>
    )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

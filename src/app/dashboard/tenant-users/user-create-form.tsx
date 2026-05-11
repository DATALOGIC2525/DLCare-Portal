'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, Loader2, Shield, User as UserIcon, AlertCircle } from 'lucide-react';
import { createGeneralUser } from './actions';

export function UserCreateForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    try {
      const result = await createGeneralUser(formData);
      // 成功時は自動的にサーバー側でrevalidatePathされるが、
      // フォームをクリアするためにリセットする
      const form = document.getElementById('user-create-form') as HTMLFormElement;
      form.reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <CardHeader className="pb-4 px-0">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
          <UserPlus className="h-5 w-5 text-blue-500" />
          アカウントの新規作成
        </CardTitle>
        <CardDescription className="text-xs">
          氏名・メール・初期パスワードを入力して作成します。
        </CardDescription>
      </CardHeader>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form id="user-create-form" action={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="contactName" className="text-xs font-bold text-slate-600 tracking-wider uppercase">ご担当者氏名 <span className="text-red-500">*</span></Label>
          <Input id="contactName" name="contactName" required placeholder="山田 太郎" className="h-10 bg-slate-50/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold text-slate-600 tracking-wider uppercase">メールアドレス <span className="text-red-500">*</span></Label>
          <Input id="email" name="email" type="email" required placeholder="taro@example.com" className="h-10 bg-slate-50/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-bold text-slate-600 tracking-wider uppercase">初期パスワード <span className="text-red-500">*</span></Label>
          <Input id="password" name="password" type="text" required placeholder="英数字8文字以上推奨" className="h-10 bg-slate-50/50" />
        </div>
        <div className="space-y-3 pt-1">
          <Label className="text-xs font-bold text-slate-600 tracking-wider uppercase">アカウント権限</Label>
          <div className="grid grid-cols-2 gap-4">
            <label className="relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-slate-100 hover:border-blue-100 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-all">
              <input type="radio" name="role" value="GENERAL_USER" defaultChecked className="sr-only peer" />
              <UserIcon className="h-5 w-5 text-slate-400 peer-checked:text-blue-600" />
              <span className="text-xs font-bold text-slate-600">担当者</span>
            </label>
            <label className="relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-slate-100 hover:border-blue-100 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-all">
              <input type="radio" name="role" value="TENANT_ADMIN" className="sr-only peer" />
              <Shield className="h-5 w-5 text-slate-400 peer-checked:text-blue-600" />
              <span className="text-xs font-bold text-slate-600">管理者</span>
            </label>
          </div>
        </div>
        <div className="pt-2">
          <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-bold shadow-md shadow-blue-100">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                作成中...
              </>
            ) : (
              'アカウントを作成'
            )}
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 text-center">
          ※作成後、ログイン情報を担当者に直接お伝えください。
        </p>
      </form>
    </div>
  );
}

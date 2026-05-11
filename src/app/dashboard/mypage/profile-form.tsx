'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile, updateAvatar } from './actions';
import { Loader2, CheckCircle2, AlertCircle, KeyRound, User, Mail, Phone, Camera } from 'lucide-react';

export function ProfileForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await updateAvatar(formData);
      if (res.success) {
        setAvatarUrl(res.avatarUrl);
        setMessage({ type: 'success', text: 'アイコンを更新しました' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setMessage(null);
    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'プロフィールを更新しました' });
      const form = document.getElementById('profile-form') as HTMLFormElement;
      form.reset();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
        <div className="relative group shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white" style={{ background: 'linear-gradient(135deg, #0BBFDF, #E4197A)' }}>
              {user.contactName.charAt(0)}
            </div>
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
          </label>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">プロフィール画像</h3>
          <p className="text-[10px] text-slate-500 mt-1">クリックして画像を変更できます。<br/>JPEG, PNG形式（最大5MBまで）</p>
        </div>
      </div>

      <form id="profile-form" action={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contactName" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <User className="h-3 w-3" /> 氏名
          </Label>
          <Input id="contactName" name="contactName" defaultValue={user.contactName} required className="bg-white border-slate-200 focus:ring-indigo-500" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Mail className="h-3 w-3" /> メールアドレス
          </Label>
          <Input id="email" name="email" type="email" defaultValue={user.email} required className="bg-white border-slate-200 focus:ring-indigo-500" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Phone className="h-3 w-3" /> 電話番号
          </Label>
          <Input id="phoneNumber" name="phoneNumber" defaultValue={user.phoneNumber || ''} placeholder="03-1234-5678" className="bg-white border-slate-200 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-indigo-500" /> パスワードの変更
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" title="現在のパスワード" className="text-[10px] font-bold text-slate-400 uppercase">現在のパスワード</Label>
            <Input id="currentPassword" name="currentPassword" type="password" placeholder="••••••••" className="bg-white border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword" title="新しいパスワード" className="text-[10px] font-bold text-slate-400 uppercase">新しいパスワード</Label>
            <Input id="newPassword" name="newPassword" type="password" placeholder="••••••••" className="bg-white border-slate-200" />
          </div>
          <div className="flex items-end">
            <p className="text-[10px] text-slate-400 leading-tight pb-2">
              ※パスワードを変更する場合のみ入力してください。
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={isPending} className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-11">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              更新中...
            </>
          ) : (
            '設定を保存する'
          )}
        </Button>
      </div>
    </form>
    </div>
  );
}

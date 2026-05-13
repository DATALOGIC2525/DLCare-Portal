'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, UserPlus, X, ShieldCheck } from 'lucide-react';
import { updateUserRole, deleteUserByAdmin, registerUserByAdmin } from './actions';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  contactName: string;
  email: string;
  department: string | null;
  role: string;
  createdAt: Date;
}

interface TenantUserTableProps {
  tenantId: string;
  users: User[];
}

function UserRow({ user }: { user: User }) {
  const router = useRouter();
  const [role, setRole] = useState(user.role);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    setRole(newRole);
    setIsUpdating(true);
    try {
      await updateUserRole(user.id, newRole);
      router.refresh();
    } catch {
      setRole(user.role);
      alert('権限の更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`${user.contactName}様を削除してよろしいですか？`)) return;
    setIsDeleting(true);
    try {
      await deleteUserByAdmin(user.id);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'ユーザーの削除に失敗しました');
      setIsDeleting(false);
    }
  };

  return (
    <TableRow className="hover:bg-slate-50 transition-colors group/row">
      <TableCell className="py-3">
        <div className="font-bold text-slate-800 text-xs">{user.contactName}</div>
        <div className="text-[10px] text-slate-400">
          {new Date(user.createdAt).toLocaleDateString('ja-JP')} 登録
        </div>
      </TableCell>
      <TableCell className="py-3">
        <div className="text-xs text-slate-600">{user.email}</div>
        <div className="text-[10px] text-slate-400">{user.department || '部署未設定'}</div>
      </TableCell>
      <TableCell className="py-3">
        <select
          value={role}
          disabled={isUpdating}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="text-[11px] h-7 w-full rounded border-slate-200 bg-slate-50 font-medium focus:ring-slate-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="GENERAL_USER">一般ユーザー</option>
          <option value="TENANT_ADMIN">テナント管理者</option>
          <option value="SYSTEM_ADMIN">システム管理者</option>
        </select>
      </TableCell>
      <TableCell className="py-3 text-right">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/row:opacity-100 transition-all"
          onClick={handleDelete}
          disabled={isDeleting}
          title="ユーザーを削除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function TenantUserTable({ tenantId, users }: TenantUserTableProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddUser(formData: FormData) {
    setIsSubmitting(true);
    try {
      await registerUserByAdmin(tenantId, formData);
      setShowAddForm(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">担当者一覧 ({users.length})</span>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-7 text-[10px] px-2 font-bold gap-1 bg-white border-slate-200"
        >
          {showAddForm ? <><X className="h-3 w-3" /> 閉じる</> : <><UserPlus className="h-3 w-3" /> 担当者を追加</>}
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <form action={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-600">氏名 <span className="text-red-500">*</span></Label>
                <Input name="contactName" required placeholder="山田 太郎" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-600">部署名</Label>
                <Input name="department" placeholder="営業部" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-600">メールアドレス <span className="text-red-500">*</span></Label>
                <Input name="email" type="email" required placeholder="name@company.co.jp" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-600">初期パスワード <span className="text-red-500">*</span></Label>
                <Input name="password" type="password" required className="h-8 text-xs" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px] font-bold text-slate-600">権限設定</Label>
                <select name="role" className="w-full h-8 rounded border-slate-200 bg-slate-50 text-xs font-medium">
                  <option value="GENERAL_USER">一般ユーザー</option>
                  <option value="TENANT_ADMIN">テナント管理者</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="h-8 text-xs">キャンセル</Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4">
                アカウントを作成
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[150px] text-[11px] font-bold">氏名</TableHead>
              <TableHead className="text-[11px] font-bold">メール/部署</TableHead>
              <TableHead className="w-[130px] text-[11px] font-bold">権限設定</TableHead>
              <TableHead className="w-[60px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-xs text-slate-400 italic">
                  登録されている担当者はいません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

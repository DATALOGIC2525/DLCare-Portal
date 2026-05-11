'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { updateUserRole, deleteUserByAdmin } from './actions';
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
      // ロールバック
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

export function TenantUserTable({ users }: TenantUserTableProps) {
  return (
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
                登録されているユーザーはいません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

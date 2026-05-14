'use client';

import { deleteService, deleteVariant } from './actions';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransition, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

export function DeleteServiceButton({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteService(serviceId);
        setOpen(false);
        window.location.reload();
      } catch (error: any) {
        console.error('Failed to delete service:', error);
        alert(`削除に失敗しました。\n理由: ${error.message || '不明なエラー'}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0" title="削除" />}>
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <AlertTriangle className="h-6 w-6" />
            <DialogTitle>サービスの削除確認</DialogTitle>
          </div>
          <DialogDescription>
            「<span className="font-bold text-slate-900">{serviceName}</span>」を削除しますか？<br />
            この操作は取り消せません。関連する認証情報やバリアント（ダウンロードファイル）もすべて削除されます。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? '削除中...' : '完全に削除する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteVariantButton({ variantId, label }: { variantId: string; label: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteVariant(variantId);
        setOpen(false);
        window.location.reload();
      } catch (error: any) {
        console.error('Failed to delete variant:', error);
        alert(`削除に失敗しました。\n理由: ${error.message || '不明なエラー'}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0" title="バリアント削除" />}>
        <Trash2 className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>バリアントの削除</DialogTitle>
          <DialogDescription>
            バリアント「<span className="font-bold text-slate-900">{label}</span>」を削除してもよろしいですか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending} className="h-9 text-xs">
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="h-9 text-xs">
            {isPending ? '削除中...' : '削除する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { deleteService, deleteVariant } from './actions';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';

export function DeleteServiceButton({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`「${serviceName}」を削除しますか？\n関連する認証情報・バリアントもすべて削除されます。`)) return;
    startTransition(async () => {
      await deleteService(serviceId);
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
      title="削除"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

export function DeleteVariantButton({ variantId, label }: { variantId: string; label: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`バリアント「${label}」を削除しますか？`)) return;
    startTransition(async () => {
      await deleteVariant(variantId);
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
      title="バリアント削除"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

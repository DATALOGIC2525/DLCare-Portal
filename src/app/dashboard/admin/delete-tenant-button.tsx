'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteTenant } from './actions';

export function DeleteTenantButton({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = async () => {
    if (confirm(`「${tenantName}」を完全に削除しますか？\nこの操作は取り消せません。所属する全ユーザーやデータも削除されます。`)) {
      try {
        await deleteTenant(tenantId);
      } catch (err) {
        alert('削除に失敗しました。');
      }
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
      title="テナントを削除"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

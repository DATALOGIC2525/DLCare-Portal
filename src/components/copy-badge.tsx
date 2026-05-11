'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';

export function CopyBadge({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Badge
      variant="outline"
      onClick={handleCopy}
      className="font-mono text-xs bg-white text-slate-600 border-slate-300 cursor-pointer hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm"
      title="クリックしてコピー"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3 text-slate-400" />
      )}
      {text}
    </Badge>
  );
}

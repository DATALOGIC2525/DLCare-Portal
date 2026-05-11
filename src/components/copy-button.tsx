'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text }: { text: string }) {
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
    <button
      onClick={handleCopy}
      className="shrink-0 ml-1 p-1 rounded-md transition-colors"
      style={{
        background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)',
      }}
      title={copied ? 'コピーしました' : 'コピーする'}
    >
      {copied
        ? <Check className="h-3 w-3 text-emerald-400" />
        : <Copy className="h-3 w-3 text-white/50" />
      }
    </button>
  );
}

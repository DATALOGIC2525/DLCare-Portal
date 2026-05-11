'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-markdown-preview/markdown.css';

const MarkdownPreviewDynamic = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false });

export function MarkdownPreview({ source }: { source: string }) {
  if (!source) return null;
  return (
    <div className="wmde-markdown-var" style={{ '--color-canvas-default': 'transparent' } as React.CSSProperties}>
      <MarkdownPreviewDynamic source={source} style={{ backgroundColor: 'transparent' }} />
    </div>
  );
}

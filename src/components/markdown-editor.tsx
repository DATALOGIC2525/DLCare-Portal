'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Edit3 } from 'lucide-react';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MarkdownEditorProps {
  name: string;
  initialValue?: string;
}

export function MarkdownEditor({ name, initialValue = '' }: MarkdownEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // カスタム画像アップロード処理
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadImage(files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      // 画像かどうかを判定
      const isImage = file.type.startsWith('image/');
      
      // 画像なら ![]()、それ以外（PDFなど）なら []() のリンク形式にする
      const markdownToInsert = isImage 
        ? `\n![${file.name}](${data.url})\n`
        : `\n[${file.name} を開く](${data.url})\n`;
        
      setValue(prev => prev + markdownToInsert);
    } catch (error) {
      console.error(error);
      alert('画像のアップロードに失敗しました。');
    }
  };

  if (!mounted) return <div className="h-10 bg-slate-50 animate-pulse rounded-md border border-slate-200"></div>;

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline" type="button" className="w-full justify-start text-slate-500 bg-white hover:bg-slate-50 border-slate-200" />}>
          <Edit3 className="mr-2 h-4 w-4" />
          {value ? '詳細説明を編集する (入力済み)' : '詳細説明を追加する'}
        </DialogTrigger>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>詳細説明の編集</DialogTitle>
            <DialogDescription>
              Markdown形式で入力してください。画像をドラッグ＆ドロップでアップロードできます。
            </DialogDescription>
          </DialogHeader>
          <div onDrop={handleDrop} className="wmde-markdown-var flex-1 overflow-hidden" style={{ '--color-canvas-default': '#fff' } as React.CSSProperties}>
            <MDEditor
              value={value}
              onChange={(val) => setValue(val || '')}
              height="100%"
              previewOptions={{
                rehypePlugins: [],
              }}
              style={{ minHeight: '100%' }}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="button" onClick={() => setOpen(false)}>
              完了して閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

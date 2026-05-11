'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Loader2, Download } from 'lucide-react';

export function CsvImportForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState(Date.now());
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (既存のロジックを維持)
    if (!e.isTrusted) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/import-tenants', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'インポートに失敗しました');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import_result_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      setUploadKey(Date.now());
    }
  };

  return (
    <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden bg-white group relative">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left focus:outline-none"
      >
        <CardHeader className="pb-4 transition-colors hover:bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                  <FileUp className="h-6 w-6" />
                </div>
                一括企業登録（CSVインポート）
                <div className={`ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                  <Download className="h-4 w-4 text-slate-400" /> {/* Chevronの代わり */}
                </div>
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                クリックして展開し、CSVによる一括登録・更新を行います。
              </CardDescription>
            </div>
            
            {isOpen && (
              <Button 
                variant="outline" 
                asChild 
                className="border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold transition-all h-10 px-5 shrink-0"
                onClick={(e) => e.stopPropagation()} // 親のクリックイベント（開閉）を阻止
              >
                <a href="/template_import_users.csv" download>
                  <Download className="h-4 w-4 mr-2" />
                  テンプレート取得
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
      </button>
      
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <CardContent className="pt-0 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">1</div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  <span className="font-bold text-slate-800 underline decoration-indigo-200 decoration-2">テンプレートをダウンロード</span>し、Excel等で企業情報を入力してください。
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">2</div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  保存時にファイル形式を<span className="font-bold text-slate-800">「CSV (コンマ区切り)」</span>に指定して保存してください。
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">3</div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  右側のエリアからファイルを選択すると、自動的に<span className="font-bold text-slate-800">インポートと結果のダウンロード</span>が開始されます。
                </p>
              </div>
            </div>

            <div className="relative group/upload">
              <label className={`
                flex flex-col items-center justify-center w-full min-h-[160px] 
                border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer shadow-inner
                ${isUploading ? 'bg-slate-100 border-slate-300' : 'bg-white border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/30'}
              `}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-3" />
                      <p className="text-sm font-bold text-slate-700">データを解析中...</p>
                      <p className="text-xs text-slate-400 mt-1">完了まで少々お待ちください</p>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-indigo-50 rounded-full mb-3 group-hover/upload:scale-110 transition-transform duration-500 shadow-sm">
                        <FileUp className="h-8 w-8 text-indigo-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">CSVファイルをアップロード</p>
                      <p className="text-xs text-slate-400 mt-2">クリックしてファイルを選択</p>
                    </>
                  )}
                </div>
                <input
                  key={uploadKey}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2 shadow-sm">
                  <div className="p-1 bg-red-100 rounded-lg">⚠️</div>
                  {error}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}



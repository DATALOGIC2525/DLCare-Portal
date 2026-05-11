import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/markdown-editor';
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from './actions';
import { Bell, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AnnouncementsAdminPage() {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') {
    redirect('/dashboard');
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Bell className="h-6 w-6 text-blue-600" />
          お知らせ管理
        </h1>
      </div>

      {/* 新規作成フォーム */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-sm font-bold text-slate-700">新規お知らせ作成</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={createAnnouncement} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">タイトル</label>
                <Input name="title" required placeholder="システムメンテナンスのお知らせ等" className="h-10 bg-white" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">公開ステータス</label>
                  <select name="isActive" className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm w-full">
                    <option value="true">公開する</option>
                    <option value="false">下書き保存（非公開）</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">公開日時（指定なしで即時）</label>
                  <Input name="publishedAt" type="datetime-local" className="h-10 bg-white" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">本文</label>
              <MarkdownEditor name="content" />
            </div>

            <Button type="submit" className="h-10 w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold tracking-wider">
              お知らせを追加
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 既存のお知らせ一覧 */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">配信済み・下書き一覧</h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">現在、お知らせはありません。</p>
        ) : (
          <div className="grid gap-4">
            {announcements.map((announcement) => {
              const isScheduled = announcement.publishedAt > new Date();
              return (
                <Card key={announcement.id} className="overflow-hidden border-slate-200 shadow-sm relative group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${announcement.isActive ? (isScheduled ? 'bg-amber-400' : 'bg-green-500') : 'bg-slate-300'}`} />
                  <CardContent className="p-0">
                    <form className="flex flex-col md:flex-row md:items-start p-5 gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            announcement.isActive 
                              ? (isScheduled ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700') 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {announcement.isActive 
                              ? (isScheduled ? '予約投稿' : '公開中') 
                              : '下書き'}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">表示予定: {new Date(announcement.publishedAt).toLocaleString('ja-JP')}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">タイトル</label>
                            <Input name="title" defaultValue={announcement.title} className="font-bold text-slate-800" required />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">公開ステータス</label>
                              <select name="isActive" defaultValue={announcement.isActive.toString()} className="h-9 px-3 py-1 rounded-md border border-input bg-background text-sm w-full">
                                <option value="true">公開する</option>
                                <option value="false">下書き保存（非公開）</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">公開予定日時</label>
                              <Input 
                                name="publishedAt" 
                                type="datetime-local" 
                                defaultValue={new Date(new Date(announcement.publishedAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} 
                                className="h-9 bg-white" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">本文の編集</label>
                          <MarkdownEditor name="content" initialValue={announcement.content} />
                        </div>
                      </div>

                    <div className="w-full md:w-48 flex flex-row md:flex-col gap-2 pt-6 md:pt-0 shrink-0">
                      <Button formAction={updateAnnouncement.bind(null, announcement.id)} type="submit" className="flex-1 h-9 bg-slate-800 hover:bg-slate-700 text-white shadow-sm">
                        変更を保存
                      </Button>
                      <Button formAction={deleteAnnouncement.bind(null, announcement.id)} type="submit" variant="destructive" className="flex-1 h-9">
                        <Trash2 className="h-4 w-4 mr-2" /> 削除
                      </Button>
                    </div>
                  </form>
                </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

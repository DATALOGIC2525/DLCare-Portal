'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownPreview } from '@/components/markdown-preview';
import { markAllAsRead } from './actions';
import { Megaphone, Calendar } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export function AnnouncementsList({ initialAnnouncements }: { initialAnnouncements: Announcement[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  useEffect(() => {
    // ページを開いたタイミングで未読をすべて既読にする（初回マウント時のみ）
    const hasUnread = initialAnnouncements.some(a => !a.isRead);
    if (hasUnread) {
      markAllAsRead().then(() => {
        setAnnouncements(prev => prev.map(a => ({ ...a, isRead: true })));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (announcements.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Megaphone className="h-12 w-12 mb-4 opacity-20" />
          <p>現在お知らせはありません</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {announcements.map((announcement) => (
        <Card
          key={announcement.id}
          className={`relative overflow-hidden border-slate-200 shadow-sm transition-colors w-full ${!announcement.isRead ? 'bg-blue-50/30 border-t-4 border-t-red-400' : 'bg-white'}`}
        >
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center gap-3 mb-1">
              {!announcement.isRead && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                  New
                </span>
              )}
              <div className="flex items-center text-[11px] text-slate-500 font-medium font-mono">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {new Date(announcement.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <CardTitle className="text-lg font-bold text-slate-800 leading-tight">
              {announcement.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none prose-slate">
              <MarkdownPreview source={announcement.content} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

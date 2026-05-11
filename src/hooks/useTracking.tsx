'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useTracking() {
  const pathname = usePathname();

  // ページ遷移のトラッキング
  useEffect(() => {
    if (pathname) {
      trackEvent('VIEW_PAGE', pathname);
    }
  }, [pathname]);

  const trackEvent = async (action: string, target?: string, metadata?: Record<string, any>) => {
    try {
      // ログ書き込みAPIを非同期で呼び出す
      fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          target,
          metadata,
        }),
      }).catch(console.error); // エラーはコンソールに出力するのみで処理をブロックしない
    } catch (err) {
      console.error('Tracking Error', err);
    }
  };

  return { trackEvent };
}

// どこにでも仕込めるようにするためのトラッキングコンポーネント
export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const { trackEvent } = useTracking();
  
  // クリックイベントの委譲によるグローバルトラッキング
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // ボタンやリンクのクリックをトラッキング
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const btn = target.closest('button');
        trackEvent('CLICK_BUTTON', btn?.textContent?.trim() || 'unknown_button');
      } else if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a');
        trackEvent('CLICK_LINK', link?.href || 'unknown_link', { text: link?.textContent?.trim() });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [trackEvent]);

  return <>{children}</>;
}

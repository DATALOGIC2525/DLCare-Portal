'use client';

import { SessionProvider } from 'next-auth/react';
import { TrackingProvider } from '@/hooks/useTracking';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TrackingProvider>
        {children}
      </TrackingProvider>
    </SessionProvider>
  );
}

import { BrandedFallback } from '@/components/BrandedFallback';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false },
};

/**
 * Standalone offline page. Reachable via /offline or served by a future
 * service worker as the fallback for navigation requests when the
 * network is dead. (We DON'T do that today — current /sw.js is the
 * self-destructing cleanup variant; we'd add a proper offline-first SW
 * separately if needed.)
 */
export default function OfflinePage() {
  return <BrandedFallback variant="offline" />;
}
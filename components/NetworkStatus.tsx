'use client';

import { useEffect, useState } from 'react';

/**
 * NetworkStatus — fixed banner that shows when the device goes offline.
 *
 * Why: cheap Android phones on 3G/EDGE drop connection constantly.
 * Without a visible signal, the user thinks the app is broken when
 * really the request never went out.
 *
 * The banner is non-blocking — content stays interactive, you just
 * see a colored stripe at the top so you know why nothing's loading.
 *
 * Mounted once at the root layout. Listens to the browser's online/
 * offline events (which fire on actual connectivity change, not just
 * Wi-Fi association — Chrome on Android is reliable about this).
 */
export function NetworkStatus() {
  const [online, setOnline] = useState(true);
  // Show a "back online!" flash for 2s after recovery, then hide.
  const [showRecovered, setShowRecovered] = useState(false);

  useEffect(() => {
    // Hydrate from the actual navigator state.
    setOnline(navigator.onLine);

    const handleOnline = () => {
      setOnline(true);
      setShowRecovered(true);
      const t = setTimeout(() => setShowRecovered(false), 2000);
      return () => clearTimeout(t);
    };
    const handleOffline = () => {
      setOnline(false);
      setShowRecovered(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online && !showRecovered) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed top-0 left-0 right-0 z-[60] safe-top',
        'text-center text-xs font-medium py-1.5 px-3',
        'transition-colors duration-300',
        online
          ? 'bg-green-600 text-white'
          : 'bg-yellow-500 text-yellow-950',
      ].join(' ')}
    >
      {online ? 'Back online' : 'You are offline — some features may not work'}
    </div>
  );
}
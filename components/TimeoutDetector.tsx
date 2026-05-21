'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * TimeoutDetector — wraps a Suspense boundary. After `delayMs` of still
 * being mounted, swaps its visible message to something more useful than
 * the bare skeleton.
 *
 * Use this on routes that fetch from the DB or a third-party API
 * (products list, orders, checkout). NOT for purely client-rendered
 * content — there's nothing to time out.
 *
 *   <Suspense fallback={<TimeoutDetector><ProductGridSkeleton /></TimeoutDetector>}>
 *     <ProductGridFromDB />
 *   </Suspense>
 *
 * After 15s (default), replaces children with "Taking longer than
 * expected" so the user knows it's not their phone.
 */
type Props = {
  children: ReactNode;
  delayMs?: number;
  longMessage?: string;
};

export function TimeoutDetector({
  children,
  delayMs = 15000,
  longMessage = 'Taking longer than expected. Hang on…',
}: Props) {
  const [tookTooLong, setTookTooLong] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTookTooLong(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  if (tookTooLong) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        <div className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-yellow-400 animate-pulse" />
          {longMessage}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}